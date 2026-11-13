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

from agno.knowledge.pdf import PDFImageReader, PDFReader
from agno.vectordb.pgvector import SearchType
from app.knowledge.optimized_pgvector import OptimizedPgVector
from app.core.config import settings
from app.core.logger import get_logger
from app.knowledge.crawl_scope import DEFAULT_CRAWL_SCOPE
from app.knowledge.enhanced_website_kb import EnhancedWebsiteKnowledgeBase
from app.knowledge.enhanced_website_reader import EnhancedWebsiteReader
from app.knowledge.sitemap_reader import SitemapReader
from app.knowledge.chunking import PageChunking
from app.knowledge.enhanced_pdf_kb import EnhancedPDFKnowledgeBase
from app.knowledge.page_sink import SourceRemoved
from app.knowledge.source_learning import SourceLearning
from app.core.s3 import delete_file_from_s3, owned_s3_key
from app.knowledge.pdf_download import download_pdf
from app.knowledge.pdf_limits import PdfRefused, check_page_count
from app.knowledge.failure_advice import SourceUnreadable
from app.models.knowledge import Knowledge, SourceType
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.models.knowledge_queue import ProcessingStage, QueueStatus
from app.database import SessionLocal
from app.repositories.knowledge_to_agent import KnowledgeToAgentRepository
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.knowledge_queue import KnowledgeQueueRepository
from typing import List, Optional, Dict, Union
import os
import shutil
import tempfile
import asyncio
from urllib.parse import unquote, urlparse
from uuid import UUID
from app.knowledge.embedder import get_embedder

# Try to import enterprise modules
try:
    from app.enterprise.repositories.subscription import SubscriptionRepository  # noqa: F401  (only probes for the enterprise module)
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False

logger = get_logger(__name__)

# Downloaded PDFs land under backend/temp rather than the system temp dir so
# they stay reachable inside the Docker image.
PDF_TEMP_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "temp")
_MAX_PDF_NAME_CHARS = 200


def _pdf_name_from_url(url: str) -> str:
    """Knowledge-source name for a PDF URL: the decoded last path segment
    without its extension, falling back to the host. basename() after decoding
    strips any separator an encoded "..%2F" smuggled in."""
    parsed = urlparse(url)
    name = os.path.basename(unquote(parsed.path.rstrip("/").split("/")[-1]))
    name = os.path.splitext(name)[0].strip(". ")
    return (name or parsed.hostname or "document")[:_MAX_PDF_NAME_CHARS]


def _raise_unless(success: bool) -> None:
    """Fail the source before anything marks it completed."""
    if not success:
        raise Exception("Failed to process knowledge source")


class KnowledgeManager:
    def __init__(self, org_id: UUID, agent_id: Optional[str] = None):
        self.org_id = org_id
        self.agent_id = agent_id

        table_name = f"d_{org_id}"

        # One loaded model per process; agno's embedder reloads it per call.
        embedder = get_embedder()
        
        # Dimensions will be automatically set by the model

        # Import the shared engine to avoid creating separate connection pools
        from app.database import engine as shared_engine

        self.vector_db = OptimizedPgVector(
            table_name=table_name,
            db_engine=shared_engine,
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
        """Add knowledge from PDF URLs: user-supplied links, and the presigned
        S3 links of PDFs uploaded through the dashboard. Every fetch goes
        through download_pdf, which refuses internal hosts on each redirect hop
        and caps the size."""
        try:
            for url in urls:
                logger.info(f"Adding PDF URL: {url}")
                filename = _pdf_name_from_url(url)
                os.makedirs(PDF_TEMP_ROOT, exist_ok=True)
                # A private directory per download: the readable file name
                # comes from the URL, and must not collide or escape.
                temp_dir = tempfile.mkdtemp(dir=PDF_TEMP_ROOT)
                try:
                    temp_path = os.path.join(temp_dir, f"{filename}.pdf")
                    await asyncio.to_thread(download_pdf, url, temp_path)
                    logger.info(f"Downloaded {url} to {temp_path}, processing as: {filename}")
                    await self.add_pdf_files([temp_path], filename=filename)
                    await self._delete_uploaded_pdf(url)
                finally:
                    shutil.rmtree(temp_dir, ignore_errors=True)
            return True
        except PdfRefused:
            raise  # its message is the reason shown on the source
        except Exception as e:
            logger.error(f"Error adding PDF URLs: {str(e)}")
            return False

    async def _delete_uploaded_pdf(self, url: str) -> None:
        """Remove a dashboard-uploaded PDF from S3 once it is indexed. Only this
        org's own knowledge uploads qualify: the URL is user-supplied, and any
        other S3 object it names is not ours to delete."""
        key = owned_s3_key(url)
        if not key or not key.startswith(f"knowledge/{self.org_id}/"):
            return
        if await delete_file_from_s3(url):
            logger.info(f"Deleted S3 object: {key}")
        else:
            logger.warning(f"Failed to delete S3 file: {key}")

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
                # Before any page is read: past the limit, reading is the cost
                check_page_count(path_to_use)

                try:
                    # First try with regular PDFReader
                    try:
                        knowledge_base = EnhancedPDFKnowledgeBase(
                            path=path_to_use,
                            vector_db=self.vector_db,
                            reader=PDFReader(chunk=chunk, chunking_strategy=PageChunking()) if not reader else reader
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
                            reader=PDFImageReader(chunk=chunk, chunking_strategy=PageChunking())
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
        except PdfRefused:
            raise  # its message is the reason shown on the source
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

    async def _learn_site(
        self,
        queue_item,
        queue_repo: KnowledgeQueueRepository,
        reader: EnhancedWebsiteReader,
        max_links: int,
        crawl_scope: str = DEFAULT_CRAWL_SCOPE,
    ) -> None:
        """Read a website or sitemap into the org's vector table, page by page.

        The source becomes searchable with its first stored page (see
        SourceLearning). A site already learned is skipped and just linked,
        unless its last run stopped partway: then it is read again.
        """
        learning = SourceLearning(
            queue_item.id,
            self.org_id,
            self.agent_id,
            queue_item.source,
            self.vector_db.table_name,
            self.vector_db.schema,
        )
        knowledge_base = EnhancedWebsiteKnowledgeBase(
            urls=[queue_item.source],
            max_links=max_links,
            crawl_scope=crawl_scope,
            vector_db=self.vector_db,
            reader=reader,
        )
        knowledge_base.queue_item = queue_item
        knowledge_base.queue_repo = queue_repo
        knowledge_base.learning = learning
        skip_existing = not queue_repo.last_run_left_partial(
            self.org_id, queue_item.source, queue_item.id
        )
        filters = {
            "name": queue_item.source,
            "agent_id": [str(self.agent_id)] if self.agent_id else [],
            "org_id": str(self.org_id),
        }

        # The crawl is synchronous: run it off the event loop
        logger.info(f"Starting website processing in background thread for {queue_item.source}")
        try:
            await asyncio.to_thread(
                knowledge_base.load,
                recreate=False,
                upsert=True,
                skip_existing=skip_existing,
                filters=filters,
            )
        except SourceRemoved:
            learning.discard()
            raise

        await asyncio.to_thread(learning.ensure_source)
        if knowledge_base.stopped_at_time_limit:
            queue_repo.note_stopped_at_time_limit(queue_item.id)

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
                    try:
                        success = await self.add_pdf_files([queue_item.source])
                        _raise_unless(success)
                    finally:
                        # The uploaded copy goes either way, refused PDFs too
                        if not queue_item.source.startswith('http') and os.path.exists(queue_item.source):
                            os.remove(queue_item.source)

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
                    _raise_unless(success)
                    
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
                    
                    metadata = queue_item.queue_metadata or {}
                    max_links = metadata.get('max_links', settings.KB_MAX_LINKS)
                    # How far link-following may wander from the seed URL; older
                    # queue items carry no scope and get the default (seed host).
                    crawl_scope = metadata.get('crawl_scope') or DEFAULT_CRAWL_SCOPE

                    # Use EnhancedWebsiteReader for all website crawling
                    logger.info(f"Using EnhancedWebsiteReader for queue item: {queue_item.source}")
                    reader = EnhancedWebsiteReader(
                        max_depth=settings.KB_MAX_DEPTH,
                        max_links=max_links,
                        min_content_length=settings.KB_MIN_CONTENT_LENGTH,
                        timeout=settings.KB_TIMEOUT,
                        max_retries=settings.KB_MAX_RETRIES,
                        max_workers=settings.KB_MAX_WORKERS,
                        crawl_scope=crawl_scope,
                        verify_ssl=False  # Disable SSL verification to support websites with invalid/self-signed certificates
                    )

                    await self._learn_site(queue_item, queue_repo, reader, max_links, crawl_scope)
                    logger.info(f"Completed website processing for {queue_item.source}")
                    success = True

                elif queue_item.source_type == 'sitemap':
                    # Crawl exactly the pages listed in the sitemap.xml (parsed
                    # from <loc> entries, incl. sitemap-index recursion) — no BFS.
                    queue_repo.update_progress(queue_item.id, ProcessingStage.CRAWLING)

                    max_links = queue_item.queue_metadata.get(
                        'max_links', settings.KB_MAX_LINKS) if queue_item.queue_metadata else settings.KB_MAX_LINKS

                    logger.info(f"Using SitemapReader for queue item: {queue_item.source}")
                    reader = SitemapReader(
                        max_depth=1,  # never follow <a href>; pages come from the sitemap
                        max_links=max_links,
                        min_content_length=settings.KB_MIN_CONTENT_LENGTH,
                        timeout=settings.KB_TIMEOUT,
                        max_retries=settings.KB_MAX_RETRIES,
                        max_workers=settings.KB_MAX_WORKERS,
                        verify_ssl=False
                    )

                    # One source (the sitemap URL); its listed pages are the sub-pages.
                    await self._learn_site(queue_item, queue_repo, reader, max_links)

                    # Fail clearly if the sitemap listed no pages (wrong URL / not a
                    # sitemap) rather than creating an empty knowledge source. A
                    # sitemap already learned is not read again, so has no count.
                    if getattr(reader, '_sitemap_page_count', None) == 0:
                        raise ValueError(
                            "No pages found in the sitemap. Make sure the URL points "
                            "to a valid sitemap.xml."
                        )

                    logger.info(f"Completed sitemap processing for {queue_item.source}")
                    success = True

                else:
                    raise ValueError(f"Unsupported source type: {
                                     queue_item.source_type}")

                _raise_unless(success)

                return success

        except (SourceUnreadable, SourceRemoved):
            raise  # the user's advice, or a deliberate stop: the worker handles both
        except Exception as e:
            logger.error(f"Error processing knowledge: {str(e)}")
            raise
