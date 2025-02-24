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

async def run_processor_loop():
    """Run the knowledge processor in a continuous loop or once"""
    logger.info("Starting knowledge processor")
    initialize_firebase()
    
    try:
        # Check if we should run once or continuously
        run_once = os.environ.get('RUN_ONCE', 'false').lower() == 'true'
        
        if run_once:
            logger.info("Running knowledge processor once")
            await run_processor()
            logger.info("Knowledge processor completed successfully")
        else:
            logger.info("Starting knowledge processor loop")
            while True:
                try:
                    await run_processor()
                    logger.debug("Knowledge processor iteration completed")
                except Exception as e:
                    logger.error(f"Error in knowledge processor: {str(e)}")
                
                # Wait for 5 minutes before next run
                await asyncio.sleep(300)
    except Exception as e:
        logger.error(f"Fatal error in knowledge processor: {str(e)}")
        sys.exit(1)

def main():
    """Main entry point for the knowledge processor"""
    try:
        asyncio.run(run_processor_loop())
    except KeyboardInterrupt:
        logger.info("Knowledge processor stopped by user")
    except Exception as e:
        logger.error(f"Fatal error in knowledge processor: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()

 