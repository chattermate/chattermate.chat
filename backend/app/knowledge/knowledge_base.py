"""
ChatterMate - Knowledge Base Management
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

from agno.knowledge.pdf import PDFKnowledgeBase, PDFImageReader, PDFReader
from agno.knowledge.pdf_url import PDFUrlKnowledgeBase
from agno.vectordb.pgvector import PgVector, SearchType
from app.knowledge.optimized_pgvector import OptimizedPgVector
from app.core.config import settings
from app.core.logger import get_logger
from app.knowledge.enhanced_website_kb import EnhancedWebsiteKnowledgeBase
from app.knowledge.enhanced_website_reader import EnhancedWebsiteReader
from app.knowledge.enhanced_pdf_kb import EnhancedPDFKnowledgeBase
from app.knowledge.enhanced_pdf_url_kb import EnhancedPDFUrlKnowledgeBase
from app.core.s3 import delete_file_from_s3
from app.models.knowledge import Knowledge, SourceType
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.models.knowledge_queue import ProcessingStage, QueueStatus
from app.repositories.ai_config import AIConfigRepository
from app.database import SessionLocal
from app.repositories.knowledge_to_agent import KnowledgeToAgentRepository
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.knowledge_queue import KnowledgeQueueRepository
from typing import List, Optional, Dict, Union
import os
import requests
import asyncio
from urllib.parse import urlparse
from uuid import UUID
from agno.embedder.fastembed import FastEmbedEmbedder

# Try to import enterprise modules
try:
    from app.enterprise.repositories.subscription import SubscriptionRepository
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False

logger = get_logger(__name__)


class KnowledgeManager:
    def __init__(self, org_id: UUID, agent_id: Optional[str] = None):
        self.org_id = org_id
        self.agent_id = agent_id

        # Get API key from AI config using context manager
        with SessionLocal() as db:
            ai_config_repo = AIConfigRepository(db)
            ai_config = ai_config_repo.get_active_config(org_id)
        
        # Default to SentenceTransformer embedder if no AI config is found
        embedder = None
        table_name = f"d_{org_id}"
        
        # Use FastEmbedEmbedder instead of SentenceTransformerEmbedder
        embedder = FastEmbedEmbedder(
            id=settings.FASTEMBED_MODEL
        )
        
        # Dimensions will be automatically set by the model

        self.vector_db = OptimizedPgVector(
            table_name=table_name,
            db_url=settings.DATABASE_URL,
            schema="ai",
            search_type=SearchType.vector,
            embedder=embedder,
            auto_upgrade_schema=True
        )

    def _add_knowledge_source(self, source: str, source_type: SourceType):
        """Track knowledge source in database"""
        with SessionLocal() as db:
            knowledge_repo = KnowledgeRepository(db)
            link_repo = KnowledgeToAgentRepository(db)
            
            # Create or get knowledge source
            knowledge = Knowledge(
                organization_id=self.org_id,
                source=source,
                source_type=source_type,
                table_name=self.vector_db.table_name,
                schema=self.vector_db.schema
            )
            logger.debug(f"Adding knowledge source: {knowledge}")
            knowledge = knowledge_repo.create(knowledge)
            logger.debug(f"Knowledge source added: {knowledge}")
            # Link to agent if specified
            if self.agent_id:
                link = KnowledgeToAgent(
                    knowledge_id=knowledge.id,
                    agent_id=self.agent_id
                )
                link_repo.create(link)

            return knowledge

    async def add_pdf_urls(self, urls: List[str]) -> bool:
        """Add knowledge from PDF URLs"""
        try:
            # Convert agent_id to string if it exists
            agent_id_filter = [str(self.agent_id)] if self.agent_id else []
            
            for url in urls:
                logger.info(f"Adding PDF URL: {url}")
                # Check if the URL ends with .pdf
                if url.lower().endswith('.pdf'):
                    logger.info(f"PDF URL detected, adding to knowledge base: {url}")
                    # Use EnhancedPDFUrlKnowledgeBase for direct PDF URLs
                    knowledge_base = EnhancedPDFUrlKnowledgeBase(
                        urls=[url],  # Pass single URL in a list
                        vector_db=self.vector_db
                    )
                    # Extract filename from URL and remove extension
                    filename = os.path.splitext(os.path.basename(url))[0]
                    filters = {
                        "name": filename,
                        "agent_id": agent_id_filter,
                        "org_id": str(self.org_id)
                    }
                    # Run PDF URL processing in thread pool to avoid blocking other APIs
                    await asyncio.to_thread(
                        knowledge_base.load,
                        recreate=False,
                        upsert=True,
                        filters=filters
                    )
                    self._add_knowledge_source(filename, SourceType.FILE)
                else:
                    # For non-PDF URLs, download to temp file and process with add_pdf_files
                    logger.info(f"Non-PDF URL detected, downloading from: {url}")
                    temp_file = None
                    try:
                        # Extract filename from URL for metadata
                        parsed_url = urlparse(url)
                        
                        # Parse filename from URL, handling S3 URLs specially
                        if "s3.amazonaws.com" in url:
                            # Extract the actual filename from S3 URL path
                            path_parts = parsed_url.path.split('/')
                            # Get the last part of the path and decode URL encoded characters
                            s3_filename = path_parts[-1].split('?')[0]  # Remove query parameters
                            import urllib.parse
                            decoded_filename = urllib.parse.unquote(s3_filename)
                            # Use the decoded filename without removing extension
                            temp_filename = decoded_filename
                            # Remove extension for the knowledge base name
                            filename = os.path.splitext(decoded_filename)[0]
                        else:
                            # For non-S3 URLs
                            filename = os.path.basename(parsed_url.path)
                            if not filename:
                                filename = parsed_url.netloc
                            temp_filename = filename + ".pdf"  # Add extension for the temp file
                            filename = os.path.splitext(filename)[0]  # Remove extension for knowledge base name

                        # Create a temporary file with a meaningful name
                        # Use /app/temp instead of system temp to ensure it's accessible in Docker
                        temp_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "temp")
                        os.makedirs(temp_dir, exist_ok=True)
                        temp_path = os.path.join(temp_dir, temp_filename)
                        temp_file = open(temp_path, 'wb')
                        temp_file.close()
                        
                        # Download content in thread pool to avoid blocking other APIs
                        def download_file():
                            response = requests.get(url, stream=True)
                            response.raise_for_status()
                            
                            # Write content to the temporary file
                            with open(temp_path, 'wb') as f:
                                for chunk in response.iter_content(chunk_size=8192):
                                    f.write(chunk)
                            return temp_path
                        
                        downloaded_path = await asyncio.to_thread(download_file)
                        
                        logger.info(f"Downloaded URL to temporary file: {temp_path}, will process as: {filename}")
                        
                        # Process the downloaded file
                        await self.add_pdf_files([temp_path], filename=filename)
                        
                        # Delete the S3 URL from storage if it's an S3 URL
                        if "s3.amazonaws.com" in url:
                            try:
                                # Delete the file from S3 using the centralized utility function
                                success = await delete_file_from_s3(url)
                                if success:
                                    logger.info(f"Deleted S3 object: {url}")
                                else:
                                    logger.warning(f"Failed to delete S3 file: {url}")
                            except Exception as s3_err:
                                # Ignore errors when deleting S3 file
                                logger.warning(f"Failed to delete S3 file, ignoring: {str(s3_err)}")
                        
                    except Exception as download_err:
                        logger.error(f"Error downloading from URL: {str(download_err)}")
                        raise
                    finally:
                        # Clean up temp file
                        if temp_file and os.path.exists(temp_path):
                            os.unlink(temp_path)
                            logger.info(f"Deleted temporary file: {temp_path}")
                
            return True
        except Exception as e:
            logger.error(f"Error adding PDF URLs: {str(e)}")
            return False

    async def add_websites(self, urls: List[str], max_links: int = 10) -> bool:
        """Add knowledge from websites using the enhanced website reader"""
        try:
            # Convert agent_id to string if it exists
            agent_id_filter = [str(self.agent_id)] if self.agent_id else []
            
            for url in urls:
                logger.debug(f"Adding website: {url}")
                
                # Use config values when not in enterprise mode
                if not HAS_ENTERPRISE:
                    knowledge_base = EnhancedWebsiteKnowledgeBase(
                        urls=[url],  # Pass single URL in a list
                        max_links=settings.KB_MAX_LINKS,
                        max_depth=settings.KB_MAX_DEPTH,
                        min_content_length=settings.KB_MIN_CONTENT_LENGTH,
                        timeout=settings.KB_TIMEOUT,
                        max_retries=settings.KB_MAX_RETRIES,
                        max_workers=min(settings.KB_MAX_WORKERS, settings.EMBEDDING_MAX_WORKERS),  # Use the smaller of the two
                        vector_db=self.vector_db
                    )
                else:
                    # Use enterprise-provided values where available, config defaults otherwise
                    knowledge_base = EnhancedWebsiteKnowledgeBase(
                        urls=[url],  # Pass single URL in a list
                        max_links=max_links,  # Use enterprise subscription limit
                        max_depth=settings.KB_MAX_DEPTH,  # Use config for depth
                        min_content_length=settings.KB_MIN_CONTENT_LENGTH,  # Use config
                        timeout=settings.KB_TIMEOUT,  # Use config for timeout
                        max_retries=settings.KB_MAX_RETRIES,  # Use config for retries
                        max_workers=min(settings.KB_MAX_WORKERS, settings.EMBEDDING_MAX_WORKERS),  # Use the smaller of the two
                        vector_db=self.vector_db
                    )
                    
                logger.debug(f"Enhanced knowledge base created for: {url}")
                
                knowledge_base.load(recreate=False, upsert=True, filters={
                    "name": url,
                    "agent_id": agent_id_filter,
                    "org_id": str(self.org_id)
                })
                logger.debug(f"Enhanced knowledge base loaded for: {url}")
                self._add_knowledge_source(url, SourceType.WEBSITE)
            return True
        except Exception as e:
            logger.error(f"Error adding websites: {str(e)}")
            return False

    async def add_pdf_files(self, files: List[str], chunk: bool = True, reader: Optional[Union[PDFReader, PDFImageReader]] = None, filename: Optional[str] = None) -> bool:
        """Add knowledge from PDF files"""
        try:
            # Process each file individually since PDFKnowledgeBase expects a single path
            for file_path in files:
                temp_file = None
                path_to_use = file_path

                # Check if file exists before processing
                if not os.path.exists(path_to_use):
                    logger.error(f"PDF file not found: {path_to_use}")
                    raise FileNotFoundError(f"PDF file not found: {path_to_use}")

                logger.info(f"Processing PDF file: {path_to_use} (size: {os.path.getsize(path_to_use)} bytes)")

                try:
                    # First try with regular PDFReader
                    try:
                        knowledge_base = EnhancedPDFKnowledgeBase(
                            path=path_to_use,
                            vector_db=self.vector_db,
                            reader=PDFReader(chunk=chunk) if not reader else reader
                        )
                        if filename is None:
                            filename = os.path.splitext(os.path.basename(file_path))[0]
                            
                        # Convert agent_id to string if it exists
                        agent_id_filter = [str(self.agent_id)] if self.agent_id else []
                        logger.info(f"Adding PDF knowledge source: {filename}")
                        filters = {
                            "name": filename,
                            "agent_id": agent_id_filter,
                            "org_id": str(self.org_id)
                        }
                        # Run PDF processing in thread pool to avoid blocking other APIs
                        await asyncio.to_thread(
                            knowledge_base.load,
                            recreate=False,
                            upsert=True,
                            filters=filters
                        )
                    except Exception as e:
                        logger.warning(f"Regular PDFReader failed for {path_to_use}, trying PDFImageReader: {str(e)}")
                        # Fallback to PDFImageReader if PDFReader fails
                        knowledge_base = EnhancedPDFKnowledgeBase(
                            path=path_to_use,
                            vector_db=self.vector_db,
                            reader=PDFImageReader(chunk=chunk)
                        )
                        if filename is None:
                            filename = os.path.splitext(os.path.basename(file_path))[0]
                        
                        # Convert agent_id to string if it exists
                        agent_id_filter = [str(self.agent_id)] if self.agent_id else []
                        filters = {
                            "name": filename,
                            "agent_id": agent_id_filter,
                            "org_id": str(self.org_id)
                        }
                        # Run PDF processing in thread pool to avoid blocking other APIs
                        await asyncio.to_thread(
                            knowledge_base.load,
                            recreate=False,
                            upsert=True,
                            filters=filters
                        )
                    
                    self._add_knowledge_source(filename, SourceType.FILE)
                finally:
                    # Clean up temp file if we created one
                    if temp_file and os.path.exists(temp_file.name):
                        os.unlink(temp_file.name)
                        
            return True
        except Exception as e:
            logger.error(f"Error adding PDF files: {str(e)}")
            return False

    def get_knowledge_base(self) -> List[Dict]:
        """Get all knowledge sources for the organization or specific agent"""
        try:
            with SessionLocal() as db:
                knowledge_repo = KnowledgeRepository(db)
                if self.agent_id:
                    sources = knowledge_repo.get_by_agent(self.agent_id)
                else:
                    sources = knowledge_repo.get_by_org(self.org_id)

            return [{
                'id': source.id,
                'source': source.source,
                'source_type': source.source_type,
                'table_name': source.table_name,
                'schema': source.schema,
                'agent_ids': [link.agent_id for link in source.agent_links]
            } for source in sources]
        except Exception as e:
            logger.error(f"Error getting knowledge base: {str(e)}")
            return []

    async def process_knowledge(self, queue_item):
        """Process knowledge based on source type"""
        try:
            # Get DB session for progress updates
            with SessionLocal() as db:
                queue_repo = KnowledgeQueueRepository(db)
                
                # Process based on source type
                if queue_item.source_type == 'pdf_file':
                    # Update to crawling stage (PDF extraction)
                    queue_repo.update_progress(
                        queue_item.id, 
                        ProcessingStage.CRAWLING, 
                        total_items=1,
                        processed_items=0,
                        force_stage_update=True
                    )
                    
                    # Process the PDF (already async, but contains blocking operations)
                    success = await self.add_pdf_files([queue_item.source])
                    
                    # Update to embedding/training stage
                    queue_repo.update_progress(
                        queue_item.id, 
                        ProcessingStage.EMBEDDING, 
                        total_items=1,
                        processed_items=1,
                        force_stage_update=True
                    )
                    
                    # Clean up temp file after processing if it's a local file
                    if not queue_item.source.startswith('http') and os.path.exists(queue_item.source):
                        os.remove(queue_item.source)
                    
                    # Mark as completed
                    queue_repo.update_status(
                        queue_item.id, 
                        QueueStatus.COMPLETED
                    )

                elif queue_item.source_type == 'pdf_url':
                    # Update to crawling stage (downloading PDF)
                    queue_repo.update_progress(
                        queue_item.id, 
                        ProcessingStage.CRAWLING, 
                        total_items=1,
                        processed_items=0,
                        force_stage_update=True
                    )
                    
                    # Process the PDF URL (already async, but contains blocking operations)
                    success = await self.add_pdf_urls([queue_item.source])
                    
                    # Update to embedding/training stage
                    queue_repo.update_progress(
                        queue_item.id, 
                        ProcessingStage.EMBEDDING, 
                        total_items=1,
                        processed_items=1,
                        force_stage_update=True
                    )
                    
                    # Mark as completed
                    queue_repo.update_status(
                        queue_item.id, 
                        QueueStatus.COMPLETED
                    )

                elif queue_item.source_type == 'website':
                    # Update to crawling stage (don't add main URL here, let the crawler handle it)
                    queue_repo.update_progress(
                        queue_item.id, 
                        ProcessingStage.CRAWLING
                    )
                    
                    max_links = queue_item.queue_metadata.get(
                        'max_links', 10) if queue_item.queue_metadata else 10
                    
                    # Use EnhancedWebsiteReader for all website crawling
                    logger.info(f"Using EnhancedWebsiteReader for queue item: {queue_item.source}")
                    reader = EnhancedWebsiteReader(
                        max_depth=settings.KB_MAX_DEPTH,
                        max_links=max_links,
                        min_content_length=settings.KB_MIN_CONTENT_LENGTH,
                        timeout=settings.KB_TIMEOUT,
                        max_retries=settings.KB_MAX_RETRIES,
                        max_workers=settings.KB_MAX_WORKERS,
                        verify_ssl=False  # Disable SSL verification to support websites with invalid/self-signed certificates
                    )
                    
                    # Process the website - pass queue item and repo for URL tracking
                    knowledge_base = EnhancedWebsiteKnowledgeBase(
                        urls=[queue_item.source],
                        max_links=max_links,
                        vector_db=self.vector_db,
                        reader=reader
                    )
                    # Add queue_item and repo for URL tracking
                    knowledge_base.queue_item = queue_item
                    knowledge_base.queue_repo = queue_repo
                    
                    # Process the website in a thread pool to avoid blocking other APIs
                    logger.info(f"Starting website processing in background thread for {queue_item.source}")
                    agent_id_filter = [str(self.agent_id)] if self.agent_id else []
                    filters = {
                        "name": queue_item.source,
                        "agent_id": agent_id_filter,
                        "org_id": str(self.org_id)
                    }
                    
                    # Run the heavy synchronous operation in a thread pool
                    await asyncio.to_thread(
                        knowledge_base.load,
                        recreate=False,
                        upsert=True,
                        filters=filters
                    )
                    
                    logger.info(f"Completed website processing for {queue_item.source}")
                    self._add_knowledge_source(queue_item.source, SourceType.WEBSITE)
                    success = True
                    
                    # Completion status is handled internally by EnhancedWebsiteKnowledgeBase
                else:
                    raise ValueError(f"Unsupported source type: {
                                     queue_item.source_type}")

                if not success:
                    raise Exception("Failed to process knowledge source")

                return success

        except Exception as e:
            logger.error(f"Error processing knowledge: {str(e)}")
            raise
