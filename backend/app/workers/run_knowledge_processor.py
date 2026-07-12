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

"""
Knowledge Processor Runner
This script runs the knowledge processor independently at regular intervals.
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the parent directory to Python path to allow imports
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.workers.knowledge_processor import run_processor
from app.core.logger import get_logger
from app.services.firebase import initialize_firebase

logger = get_logger(__name__)

# Configure polling interval
POLL_INTERVAL = int(os.environ.get('POLL_INTERVAL', '10'))  # Default to 10 seconds
WORKER_ID = os.environ.get('GUNICORN_WORKER_ID', 'standalone')

# Initialize Firebase on module load
try:
    logger.info(f"Initializing Firebase for worker {WORKER_ID}...")
    initialize_firebase()
    logger.info(f"Worker {WORKER_ID}: Firebase initialized successfully")
except Exception as e:
    logger.error(f"Worker {WORKER_ID}: Failed to initialize Firebase: {e}")

async def run_processor_loop():
    """Run the knowledge processor in a continuous loop with short poll interval"""
    logger.info(f"Worker {WORKER_ID}: Starting knowledge processor with {POLL_INTERVAL}s polling interval")
    
    try:
        logger.info(f"Worker {WORKER_ID}: Starting knowledge processor loop")
        iteration = 0
        
        while True:
            iteration += 1
            start_time = asyncio.get_event_loop().time()
            
            try:
                logger.info(f"Worker {WORKER_ID}: Iteration {iteration} - Checking for pending knowledge items...")
                await run_processor()
                logger.info(f"Worker {WORKER_ID}: Iteration {iteration} - Processing completed successfully")
            except Exception as e:
                logger.error(f"Worker {WORKER_ID}: Iteration {iteration} - Error in knowledge processor: {str(e)}")

            # FAQ generation jobs ride the same loop in this entrypoint too, so
            # both worker entrypoints drain the FAQ queue.
            try:
                from app.workers.faq_processor import run_faq_processor
                await run_faq_processor()
            except Exception as e:
                logger.error(f"Worker {WORKER_ID}: Iteration {iteration} - Error in FAQ processor: {str(e)}")
            
            # Calculate how long the processing took
            elapsed = asyncio.get_event_loop().time() - start_time
            logger.info(f"Worker {WORKER_ID}: Iteration {iteration} - Processing took {elapsed:.2f} seconds")
            
            # If the processing took less than the polling interval, sleep for the remainder
            sleep_time = max(0.1, POLL_INTERVAL - elapsed)
            logger.info(f"Worker {WORKER_ID}: Iteration {iteration} - Sleeping for {sleep_time:.2f} seconds before next check")
            await asyncio.sleep(sleep_time)
            
    except Exception as e:
        logger.error(f"Worker {WORKER_ID}: Fatal error in knowledge processor: {str(e)}")
        sys.exit(1)

def app(environ, start_response):
    """WSGI application for health checks"""
    status = '200 OK'
    headers = [('Content-type', 'application/json')]
    start_response(status, headers)
    return [b'{"status": "running"}']

# Set worker ID if running under Gunicorn
if 'GUNICORN_WORKER_ID' not in os.environ and 'GUNICORN_ARBITER' in os.environ:
    pid = os.getpid()
    os.environ['GUNICORN_WORKER_ID'] = f"worker-{pid}"
    WORKER_ID = f"worker-{pid}"

# Start the processor loop in the background when Gunicorn loads this module
logger.info(f"Worker {WORKER_ID}: Initializing knowledge processor worker")
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
task = loop.create_task(run_processor_loop())

if __name__ == "__main__":
    try:
        asyncio.run(run_processor_loop())
    except KeyboardInterrupt:
        logger.info("Knowledge processor stopped by user")
    except Exception as e:
        logger.error(f"Fatal error in knowledge processor: {str(e)}")
        sys.exit(1)

 