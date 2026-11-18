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

One-off: shrink agent photos and profile pictures stored before uploads were
re-encoded.

New uploads are stored as a WebP of at most 256 px (app/services/avatar_image.py);
older ones are the original file, often a few hundred KB for a 40 px avatar.
This rewrites each stored file the same way, points the row at the new file
and then deletes the old one.

Safe to re-run: a file that already is a small WebP is left alone. A picture
someone replaces while this runs is not overwritten (the update only lands if
the row still holds the old URL), and only files in the row's own folder
(agents/<organization>/ for an agent photo, the user's own folder for a profile
picture) are touched.

Importing the app package costs ~450 MB (the FastAPI app, no embedding models)
for the minute this runs. On a Docker deploy run it in a one-off container,
never inside the running backend:

    docker compose run --rm --no-deps -T backend python -m scripts.shrink_avatars --dry-run
    docker compose run --rm --no-deps -T backend python -m scripts.shrink_avatars
"""

import argparse
import asyncio
import sys
from collections import defaultdict
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.sql.elements import TextClause

from app.core.config import settings
from app.services.avatar_image import (
    AvatarRejected,
    delete_replaced_avatar,
    is_shrunk,
    owned_key_in,
    shrink_avatar,
    store_shrunk_avatar,
)
from app.services.file_storage import agent_photo_folder, load_upload, profile_pic_folder

_NOT_INLINE = "{column} IS NOT NULL AND {column} <> '' AND {column} NOT LIKE 'data:%'"


@dataclass(frozen=True)
class Source:
    """A column holding avatar URLs. ``select`` yields (id, url, organization_id);
    ``update`` is a compare-and-swap on (id, old_url), so a picture replaced
    while the script ran keeps the new upload."""
    label: str
    select: TextClause
    update: TextClause
    folder: Callable[[Any], str]


AGENT_PHOTOS = Source(
    label="agent photo",
    select=text(f"""
        SELECT c.id, c.photo_url AS url, a.organization_id
        FROM agent_customizations c
        JOIN agents a ON a.id = c.agent_id
        WHERE {_NOT_INLINE.format(column='c.photo_url')}
        ORDER BY c.id
    """),
    update=text("UPDATE agent_customizations SET photo_url = :new_url WHERE id = :id AND photo_url = :old_url"),
    folder=lambda row: agent_photo_folder(row.organization_id),
)

PROFILE_PICTURES = Source(
    label="profile picture",
    select=text(f"""
        SELECT id, profile_pic AS url, organization_id
        FROM users
        WHERE organization_id IS NOT NULL AND {_NOT_INLINE.format(column='profile_pic')}
        ORDER BY id
    """),
    update=text("UPDATE users SET profile_pic = :new_url WHERE id = :id AND profile_pic = :old_url"),
    folder=lambda row: profile_pic_folder(row.organization_id, row.id),
)

SOURCES = (AGENT_PHOTOS, PROFILE_PICTURES)


@dataclass
class Report:
    shrunk: int = 0
    already_small: int = 0
    skipped: int = 0
    failed: int = 0
    bytes_before: int = 0
    bytes_after: int = 0


def say(line: str) -> None:
    print(line, flush=True)


@dataclass
class Avatar:
    """One stored file and every row of one source that points at it."""
    source: Source
    url: str
    folder: str
    row_ids: List[Any]

    @property
    def label(self) -> str:
        return f"{self.source.label} {','.join(map(str, self.row_ids))}"


def load_avatars(engine: Engine, source: Source) -> List[Avatar]:
    grouped: Dict[tuple, List[Any]] = defaultdict(list)
    with engine.connect() as conn:
        for row in conn.execute(source.select):
            grouped[(row.url, source.folder(row))].append(row.id)
    return [Avatar(source, url, folder, ids) for (url, folder), ids in grouped.items()]


def repoint(engine: Engine, avatar: Avatar, new_url: str) -> int:
    """Point every row still holding the old URL at the new file; returns how many moved."""
    moved = 0
    with engine.begin() as conn:
        for row_id in avatar.row_ids:
            moved += conn.execute(
                avatar.source.update, {"id": row_id, "old_url": avatar.url, "new_url": new_url}).rowcount
    return moved


async def shrink_one(engine: Engine, avatar: Avatar, dry_run: bool, report: Report) -> None:
    if not owned_key_in(avatar.url, avatar.folder):
        report.skipped += 1
        say(f"skip   {avatar.label}: not in its own folder ({avatar.url})")
        return

    original = await load_upload(avatar.url)
    if is_shrunk(original):
        report.already_small += 1
        return

    shrunk = await asyncio.to_thread(shrink_avatar, original)
    if dry_run:
        _count(report, avatar, len(original), len(shrunk), "would ")
        return

    new_url = await store_shrunk_avatar(shrunk, avatar.folder)
    moved = repoint(engine, avatar, new_url)
    if moved == 0:
        # Every row changed picture meanwhile: nothing uses the new file.
        await delete_replaced_avatar(new_url, avatar.folder)
        say(f"       {avatar.label}: picture changed while running, left as is")
        return
    _count(report, avatar, len(original), len(shrunk), "")
    if moved < len(avatar.row_ids):
        # Some rows changed picture meanwhile. Keep the old file rather than
        # risk deleting one that is still in use.
        say(f"       {avatar.label}: only {moved} of {len(avatar.row_ids)} rows moved, old file kept")
        return
    await delete_replaced_avatar(avatar.url, avatar.folder)


def _count(report: Report, avatar: Avatar, before: int, after: int, prefix: str) -> None:
    report.shrunk += 1
    report.bytes_before += before
    report.bytes_after += after
    say(f"{prefix}shrink {avatar.label}: {before:,} -> {after:,} bytes")


async def run(engine: Engine, dry_run: bool, sources=SOURCES) -> Report:
    report = Report()
    for source in sources:
        for avatar in load_avatars(engine, source):
            try:
                await shrink_one(engine, avatar, dry_run, report)
            except AvatarRejected as e:
                report.failed += 1
                say(f"fail   {avatar.label}: {e}")
            except Exception as e:
                report.failed += 1
                say(f"fail   {avatar.label}: {type(e).__name__}: {e}")
    return report


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Shrink stored agent photos and profile pictures to small WebP files")
    parser.add_argument("--dry-run", action="store_true",
                        help="report what would change; write and delete nothing")
    args = parser.parse_args(argv)

    engine = create_engine(settings.DATABASE_URL)
    try:
        report = asyncio.run(run(engine, args.dry_run))
    finally:
        engine.dispose()
    print(
        f"\n{'Would shrink' if args.dry_run else 'Shrunk'} {report.shrunk} file(s), "
        f"{report.bytes_before:,} -> {report.bytes_after:,} bytes; "
        f"{report.already_small} already small, {report.skipped} skipped, {report.failed} failed."
    )
    return 1 if report.failed else 0


if __name__ == "__main__":
    sys.exit(main())
