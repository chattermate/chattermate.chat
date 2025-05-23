"""
ChatterMate - Knowledge Base
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
from app.models.knowledge import Knowledge, SourceType
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.repositories.ai_config import AIConfigRepository
from app.database import get_db
from app.repositories.knowledge_to_agent import KnowledgeToAgentRepository
from app.repositories.knowledge import KnowledgeRepository
from typing import List, Optional, Dict, Union
import os
import tempfile
import requests
from urllib.parse import urlparse
from uuid import UUID
from agno.embedder.sentence_transformer import SentenceTransformerEmbedder

logger = get_logger(__name__)


class KnowledgeManager:
    def __init__(self, org_id: UUID, agent_id: Optional[str] = None):
        self.org_id = org_id
        self.agent_id = agent_id
        self.db = next(get_db())

        # Get API key from AI config
        ai_config_repo = AIConfigRepository(self.db)
        ai_config = ai_config_repo.get_active_config(org_id)
        
        # Default to SentenceTransformer embedder if no AI config is found
        embedder = None
        table_name = f"d_{org_id}"
        
        # Use a more powerful embedding model optimized for semantic search
        embedder = SentenceTransformerEmbedder(
            id="sentence-transformers/all-mpnet-base-v2"  # More powerful model for better search results
        )

        # Update dimensions for the new model
        embedder.dimensions = 768  # Increased from 384 for better semantic understanding

        self.vector_db = OptimizedPgVector(
            table_name=table_name,
            db_url=settings.DATABASE_URL,
            schema="ai",
            search_type=SearchType.vector,
            embedder=embedder
        )
        self.knowledge_repo = KnowledgeRepository(self.db)
        self.link_repo = KnowledgeToAgentRepository(self.db)

    def _add_knowledge_source(self, source: str, source_type: SourceType):
        """Track knowledge source in database"""
        # Create or get knowledge source
        knowledge = Knowledge(
            organization_id=self.org_id,
            source=source,
            source_type=source_type,
            table_name=self.vector_db.table_name,
            schema=self.vector_db.schema
        )
        logger.debug(f"Adding knowledge source: {knowledge}")
        knowledge = self.knowledge_repo.create(knowledge)
        logger.debug(f"Knowledge source added: {knowledge}")
        # Link to agent if specified
        if self.agent_id:
            link = KnowledgeToAgent(
                knowledge_id=knowledge.id,
                agent_id=self.agent_id
            )
            self.link_repo.create(link)

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
                    # Use PDFUrlKnowledgeBase for direct PDF URLs
                    knowledge_base = PDFUrlKnowledgeBase(
                        urls=[url],  # Pass single URL in a list
                        vector_db=self.vector_db
                    )
                    # Extract filename from URL and remove extension
                    filename = os.path.splitext(os.path.basename(url))[0]
                    knowledge_base.load(recreate=False, upsert=True, filters={
                        "name": filename,
                        "agent_id": agent_id_filter,
                        "org_id": str(self.org_id)
                    })
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
                        temp_dir = tempfile.gettempdir()
                        temp_path = os.path.join(temp_dir, temp_filename)
                        temp_file = open(temp_path, 'wb')
                        temp_file.close()
                        
                        # Download content
                        response = requests.get(url, stream=True)
                        response.raise_for_status()
                        
                        # Write content to the temporary file
                        with open(temp_path, 'wb') as f:
                            for chunk in response.iter_content(chunk_size=8192):
                                f.write(chunk)
                        
                        logger.info(f"Downloaded URL to temporary file: {temp_path}, will process as: {filename}")
                        
                        # Process the downloaded file
                        await self.add_pdf_files([temp_path], filename=filename)
                        
                        # Delete the S3 URL from storage if it's an S3 URL
                        if "s3.amazonaws.com" in url:
                            try:
                                # Delete the file from S3
                                # Parse the S3 bucket and key from the URL
                                s3_parts = urlparse(url)
                                bucket_name = s3_parts.netloc.split('.')[0]
                                key = s3_parts.path.lstrip('/')
                                
                                # Initialize boto3 S3 client
                                import boto3
                                s3_client = boto3.client('s3')
                                
                                # Delete the object
                                s3_client.delete_object(Bucket=bucket_name, Key=key)
                                logger.info(f"Deleted S3 object: {url}")
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
                # Use enhanced website knowledge base for better content extraction
                knowledge_base = EnhancedWebsiteKnowledgeBase(
                    urls=[url],  # Pass single URL in a list
                    max_links=max_links,
                    max_depth=3,  # Default depth
                    min_content_length=100,  # Minimum content length to consider
                    timeout=30,  # Request timeout
                    max_retries=3,  # Maximum retries for failed requests
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
                
                
                try:
                    # First try with regular PDFReader
                    try:
                        knowledge_base = PDFKnowledgeBase(
                            path=path_to_use,
                            vector_db=self.vector_db,
                            reader=PDFReader(chunk=chunk) if not reader else reader
                        )
                        if filename is None:
                            filename = os.path.splitext(os.path.basename(file_path))[0]
                            
                        # Convert agent_id to string if it exists
                        agent_id_filter = [str(self.agent_id)] if self.agent_id else []
                        logger.info(f"Adding knowledge source: {filename}")
                        knowledge_base.load(recreate=False, upsert=True, filters={
                            "name": filename,
                            "agent_id": agent_id_filter,
                            "org_id": str(self.org_id)
                        })
                    except Exception as e:
                        logger.warning(f"Regular PDFReader failed for {path_to_use}, trying PDFImageReader: {str(e)}")
                        # Fallback to PDFImageReader if PDFReader fails
                        knowledge_base = PDFKnowledgeBase(
                            path=path_to_use,
                            vector_db=self.vector_db,
                            reader=PDFImageReader(chunk=chunk)
                        )
                        if filename is None:
                            filename = os.path.splitext(os.path.basename(file_path))[0]
                        
                        # Convert agent_id to string if it exists
                        agent_id_filter = [str(self.agent_id)] if self.agent_id else []
                        knowledge_base.load(recreate=False, upsert=True, filters={
                            "name": filename,
                            "agent_id": agent_id_filter,
                            "org_id": str(self.org_id)
                        })
                    
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
            if self.agent_id:
                sources = self.knowledge_repo.get_by_agent(self.agent_id)
            else:
                sources = self.knowledge_repo.get_by_org(self.org_id)

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
            # Process based on source type
            if queue_item.source_type == 'pdf_file':
                success = await self.add_pdf_files([queue_item.source])
                # Clean up temp file after processing if it's a local file
                if not queue_item.source.startswith('http') and os.path.exists(queue_item.source):
                    os.remove(queue_item.source)

            elif queue_item.source_type == 'pdf_url':
                success = await self.add_pdf_urls([queue_item.source])

            elif queue_item.source_type == 'website':
                max_links = queue_item.queue_metadata.get(
                    'max_links', 10) if queue_item.queue_metadata else 10
                success = await self.add_websites([queue_item.source], max_links=max_links)
            else:
                raise ValueError(f"Unsupported source type: {
                                 queue_item.source_type}")

            if not success:
                raise Exception("Failed to process knowledge source")

            return success

        except Exception as e:
            logger.error(f"Error processing knowledge: {str(e)}")
            raise
