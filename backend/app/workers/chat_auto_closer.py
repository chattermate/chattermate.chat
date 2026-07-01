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
import sys
import os
from pathlib import Path

# Add the parent directory to Python path to allow imports
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.repositories.session_to_agent import SessionToAgentRepository
from app.core.logger import get_logger

logger = get_logger(__name__)

# Configure check interval (default to 24 hours - once a day)
CHECK_INTERVAL = int(os.environ.get('CHAT_AUTO_CLOSE_INTERVAL', '86400'))  # 24 hours in seconds
WORKER_ID = os.environ.get('GUNICORN_WORKER_ID', 'standalone')

async def run_auto_closer():
    """Single run of the auto closer"""
    db = None
    try:
        logger.info(f"Worker {WORKER_ID}: Running chat auto-closer")
        
        db = SessionLocal()
        session_repo = SessionToAgentRepository(db)
        
        # Auto-close inactive agent chats
        closed_count = session_repo.auto_close_inactive_agent_chats()
        
        if closed_count > 0:
            logger.info(f"Worker {WORKER_ID}: Auto-closed {closed_count} inactive agent chats")
        else:
            logger.info(f"Worker {WORKER_ID}: No inactive agent chats found to close")
            
    except Exception as e:
        logger.error(f"Worker {WORKER_ID}: Error in chat auto-closer: {str(e)}")
        raise
    finally:
        if db:
            db.close()

async def run_auto_closer_loop():
    """Run the chat auto-closer in a continuous loop"""
    logger.info(f"Worker {WORKER_ID}: Starting chat auto-closer with {CHECK_INTERVAL}s check interval (once per day)")
    
    try:
        iteration = 0
        
        while True:
            iteration += 1
            start_time = asyncio.get_event_loop().time()
            
            try:
                logger.info(f"Worker {WORKER_ID}: Iteration {iteration} - Checking for inactive agent chats...")
                await run_auto_closer()
                logger.info(f"Worker {WORKER_ID}: Iteration {iteration} - Auto-closer completed successfully")
            except Exception as e:
                logger.error(f"Worker {WORKER_ID}: Iteration {iteration} - Error in auto-closer: {str(e)}")
            
            # Calculate how long the processing took
            elapsed = asyncio.get_event_loop().time() - start_time
            logger.info(f"Worker {WORKER_ID}: Iteration {iteration} - Processing took {elapsed:.2f} seconds")
            
            # Sleep for the configured interval (24 hours)
            logger.info(f"Worker {WORKER_ID}: Iteration {iteration} - Sleeping for {CHECK_INTERVAL} seconds (24 hours) before next check")
            await asyncio.sleep(CHECK_INTERVAL)
            
    except Exception as e:
        logger.error(f"Worker {WORKER_ID}: Fatal error in chat auto-closer: {str(e)}")
        sys.exit(1)

def app(environ, start_response):
    """WSGI application for health checks"""
    status = '200 OK'
    headers = [('Content-type', 'text/plain')]
    start_response(status, headers)
    return [b'Chat Auto-Closer Worker is running']

# Main entry point for running as a standalone service
if __name__ == "__main__":
    logger.info("Starting chat auto-closer service")
    
    # Run the auto-closer loop
    asyncio.run(run_auto_closer_loop())
