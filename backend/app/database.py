"""
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

import asyncio
import logging
import os
import weakref
from concurrent.futures import ThreadPoolExecutor

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker
from app.core.config import settings
from app.core.loop_safe_pool import LoopSafeQueuePool

# Create SQLAlchemy engine with Unicode support
# Every process (each backend worker and worker container) has its own pool:
# keep processes x (pool_size + max_overflow + loop_overflow) under Postgres
# max_connections, with some left for admin
POOL_SIZE = 5  # Conservative pool size for t3.micro
MAX_OVERFLOW = 10  # Allow up to 15 total connections from this pool
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    # Never makes the event loop wait for a connection (see LoopSafeQueuePool)
    poolclass=LoopSafeQueuePool,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    loop_overflow=5,  # Opened past that only for the event loop, which never waits
    pool_timeout=30,  # Timeout waiting for connection
    pool_recycle=1800,  # Recycle connections after 30 minutes
    # Unicode, and UTC: naive timestamp columns default to now(), which is the
    # session's local time. The code reads them as UTC, so pin the session.
    connect_args={"options": "-c client_encoding=utf8 -c timezone=UTC"} if "postgresql" in settings.DATABASE_URL else {},
    json_serializer=lambda obj: __import__('json').dumps(obj, ensure_ascii=False),
    json_deserializer=lambda s: __import__('json').loads(s)
)



def _fresh_pool_after_fork() -> None:
    """gunicorn --preload (scripts/start.sh) imports the app, which opens pooled
    connections, before it forks the workers. A worker must never reuse its
    parent's sockets: two workers talking over one connection corrupt each
    other's transactions. So each child starts with an empty pool, leaving the
    parent's connections open for the parent - and its own checkout threads,
    since a child can't use threads it inherited."""
    global _checkout_threads
    engine.dispose(close=False)
    _checkout_threads = _new_checkout_threads()


os.register_at_fork(after_in_child=_fresh_pool_after_fork)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Sessions from get_db and session_off_loop hold their connection across
# awaits. At most this many at once, leaving the rest of the pool to code that
# opens its own SessionLocal() (agent tools, services) where it runs.
# Background tasks (channel webhooks) share these slots with requests, so they
# release_connection() before waiting on anything outside
OTHER_SESSIONS_HEADROOM = 5
OFF_LOOP_SESSIONS = POOL_SIZE + MAX_OVERFLOW - OTHER_SESSIONS_HEADROOM


def _new_checkout_threads() -> ThreadPoolExecutor:
    return ThreadPoolExecutor(max_workers=OFF_LOOP_SESSIONS, thread_name_prefix="db-checkout")


# Their checkouts wait on these threads, never on the event loop, and never
# hold up the loop's shared executor (DNS lookups, other to_thread work)
_checkout_threads = _new_checkout_threads()
_slots_per_loop: "weakref.WeakKeyDictionary[asyncio.AbstractEventLoop, asyncio.Semaphore]" = weakref.WeakKeyDictionary()
_OWN_CONNECTION = "session_off_loop.connection"
_SLOT = "session_off_loop.slot"


def _slots() -> asyncio.Semaphore:
    loop = asyncio.get_running_loop()
    slots = _slots_per_loop.get(loop)
    if slots is None:
        slots = _slots_per_loop[loop] = asyncio.Semaphore(OFF_LOOP_SESSIONS)
    return slots


def _close_unwanted(checkout) -> None:
    if not checkout.cancelled() and checkout.exception() is None:
        checkout.result().close()


async def session_off_loop() -> Session:
    """A session whose one connection is taken in a worker thread: when the
    pool is full the caller waits its turn there while the event loop serves
    everyone else, rather than freezing it or being refused. The session keeps
    that connection, through the commits repositories make, until
    close_session(). Never open a second one while holding one: with every
    slot taken, that would wait forever."""
    slots = _slots()
    await slots.acquire()
    try:
        checkout = _checkout_threads.submit(engine.connect)
        try:
            connection = await asyncio.wrap_future(checkout)
        except asyncio.CancelledError:
            # The caller is gone: hand the connection back once the thread has it
            checkout.add_done_callback(_close_unwanted)
            raise
    except BaseException:
        slots.release()
        raise
    return SessionLocal(bind=connection, info={_OWN_CONNECTION: connection, _SLOT: slots})


def _give_back(db) -> None:
    """Return the connection and slot session_off_loop took for this session."""
    connection = db.info.pop(_OWN_CONNECTION, None)
    slot = db.info.pop(_SLOT, None)
    try:
        if connection is not None:
            connection.close()
    finally:
        if slot is not None:
            slot.release()


def close_session(db) -> None:
    """Close a session, and give back what session_off_loop took for it."""
    try:
        db.close()
    finally:
        _give_back(db)


def release_connection(db) -> None:
    """Give a session's connection back to the pool before a slow await (a
    model call), instead of holding it idle for the whole wait: a few
    concurrent chats would otherwise use up the pool and stall every other
    request. Commits what the session holds, so the objects it loaded stay
    usable and reload on next access - from a fresh checkout of the engine."""
    if db is None:
        return
    if db.new or db.dirty or db.deleted:
        # Expected to be reads only: say so if not, rather than save it early unnoticed
        logging.getLogger(__name__).warning(
            "release_connection is committing unsaved changes before a slow call")
    if db.in_transaction():
        db.commit()
    if db.info.get(_OWN_CONNECTION) is not None:
        _give_back(db)
        db.bind = engine


async def get_db():
    """A request's session. Async so that waiting for a connection happens off
    the event loop (see session_off_loop), for async and sync routes alike."""
    db = await session_off_loop()
    try:
        yield db
    finally:
        close_session(db)
