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

from typing import Any, Dict, Iterator, List, Optional, Union
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from queue import Queue, Empty
import threading

from agno.document import Document
from agno.knowledge.agent import AgentKnowledge
from agno.embedder import Embedder
from agno.document.reader.website_reader import WebsiteReader
from app.core.logger import get_logger
from app.core.config import settings
from app.models.knowledge_queue import ProcessingStage, QueueStatus
from pydantic import model_validator

from app.knowledge.enhanced_website_reader import EnhancedWebsiteReader

# Initialize logger for this module
logger = get_logger(__name__)


class EnhancedWebsiteKnowledgeBase(AgentKnowledge):
    """Enhanced knowledge base for websites with robust content extraction using EnhancedWebsiteReader"""
    
    urls: List[str] = []
    reader: Optional[WebsiteReader] = None

    # Reader parameters - using settings from config
    max_depth: int = settings.KB_MAX_DEPTH
    max_links: int = settings.KB_MAX_LINKS 
    min_content_length: int = settings.KB_MIN_CONTENT_LENGTH
    timeout: int = settings.KB_TIMEOUT
    max_retries: int = settings.KB_MAX_RETRIES
    max_workers: int = settings.KB_MAX_WORKERS
    batch_size: int = settings.KB_BATCH_SIZE
    optimize_on: Optional[int] = settings.KB_OPTIMIZE_ON
    
    # These are not part of the model schema, but added as instance attributes
    _queue_item = None
    _queue_repo = None
    _embedding_queue = None
    _embedding_executor = None
    _embedding_results = None
    _embedding_lock = None
    
    @property
    def queue_item(self):
        return self._queue_item
        
    @queue_item.setter
    def queue_item(self, value):
        self._queue_item = value
        
    @property
    def queue_repo(self):
        return self._queue_repo
        
    @queue_repo.setter
    def queue_repo(self, value):
        self._queue_repo = value

    @model_validator(mode="after")
    def set_reader(self) -> "EnhancedWebsiteKnowledgeBase":
        """Set the reader if not provided"""
        if self.reader is None:
            logger.info(f"Initializing default EnhancedWebsiteReader with max_depth={self.max_depth}, max_links={self.max_links}, max_workers={self.max_workers}")
            self.reader = EnhancedWebsiteReader(
                max_depth=self.max_depth,
                max_links=self.max_links,
                min_content_length=self.min_content_length,
                timeout=self.timeout,
                max_retries=self.max_retries,
                max_workers=self.max_workers,
                verify_ssl=False  # Disable SSL verification to handle self-signed/invalid certificates
            )
        else:
            logger.info(f"Using custom reader: {type(self.reader).__name__}")
        return self

    def _init_embedding_system(self):
        """Initialize the embedding queue and thread pool system"""
        if (settings.ENABLE_IMMEDIATE_EMBEDDING and 
            self.vector_db and 
            hasattr(self.vector_db, 'embedder') and 
            self.vector_db.embedder is not None):
            
            self._embedding_queue = Queue()
            self._embedding_results = []
            self._embedding_lock = threading.Lock()
            self._embedding_executor = ThreadPoolExecutor(
                max_workers=settings.EMBEDDING_MAX_WORKERS,
                thread_name_prefix="EmbeddingWorker"
            )


    def _shutdown_embedding_system(self):
        """Shutdown the embedding system and wait for completion"""
        if not self._embedding_executor:
            return
            
        try:
            # Signal workers to stop by adding sentinel values
            if self._embedding_queue:
                for i in range(settings.EMBEDDING_MAX_WORKERS):
                    self._embedding_queue.put(None)
            
            # Shutdown executor with timeout to prevent hanging
            self._embedding_executor.shutdown(wait=True)
            
            # Clean up resources
            self._embedding_queue = None
            self._embedding_executor = None
            self._embedding_results = None
            self._embedding_lock = None
            
        except Exception as e:
            logger.error(f"Error during embedding system shutdown: {type(e).__name__}: {str(e)}")
            # Force shutdown if graceful shutdown fails
            if self._embedding_executor:
                self._embedding_executor.shutdown(wait=False)

    def _embedding_worker(self):
        """Worker function that processes documents from the embedding queue"""
        worker_id = threading.current_thread().name
        
        while True:
            document = None
            try:
                document = self._embedding_queue.get(timeout=2.0)
                
                if document is None:  # Sentinel value to stop worker
                    self._embedding_queue.task_done()
                    break
                
                # Process the document
                if hasattr(document, 'embedding') and document.embedding is None:
                    document.embed(embedder=self.vector_db.embedder)
                    with self._embedding_lock:
                        self._embedding_results.append(document.id)
                
                self._embedding_queue.task_done()
                
            except Empty:
                # Queue is empty - this is expected when waiting for work
                # Continue looping without logging
                continue
            except Exception as e:
                # Log actual errors with full details
                logger.error(f"Error in embedding worker {worker_id}: {type(e).__name__}: {str(e)}")
                if document and hasattr(document, 'id'):
                    logger.error(f"Failed to embed document: {document.id}")
                
                # Mark task as done even if failed to prevent queue blocking
                if document is not None:
                    try:
                        self._embedding_queue.task_done()
                    except ValueError:
                        # task_done called too many times - ignore
                        pass
        


    def _process_url(self, url: str) -> List[Document]:
        """Process a single URL and return its documents with immediate embedding"""
        try:
            url_start_time = time.time()
            logger.info(f"Crawling URL: {url}")
            
            # Create a callback for URL crawling progress tracking
            def on_url_crawled_callback(crawled_url: str):
                """Callback to track each URL as it's crawled"""
                try:
                    if self.queue_item and self.queue_repo:
                        logger.debug(f"🌐 Tracking crawled URL: {crawled_url}")
                        # Only add the crawled URL, don't update the processing stage
                        success = self.queue_repo.update_progress(
                            self.queue_item.id,
                            crawled_url=crawled_url
                        )
                        if success:
                            logger.debug(f"✅ Successfully tracked crawled URL: {crawled_url}")
                        else:
                            logger.warning(f"❌ Failed to track crawled URL: {crawled_url}")
                except Exception as e:
                    logger.error(f"Error tracking crawled URL {crawled_url}: {str(e)}")
            
            # Create a callback for immediate document processing
            def on_document_callback(document: Document):
                """Callback to queue documents for embedding"""
                try:
                    # Queue document for embedding if immediate embedding is enabled
                    if (settings.ENABLE_IMMEDIATE_EMBEDDING and 
                        self._embedding_queue is not None and 
                        document.embedding is None):
                        self._embedding_queue.put(document)
                        
                except Exception as e:
                    logger.error(f"Error in document callback for {document.id}: {str(e)}")
            
            # Get documents from the reader with both callbacks
            documents = self.reader.read(
                url=url, 
                vector_db_callback=on_document_callback,
                url_crawled_callback=on_url_crawled_callback
            )
            
            url_end_time = time.time()
            url_duration = url_end_time - url_start_time
            
            # Log document details
            page_count = len(set(doc.meta_data.get('url', '') for doc in documents))
            embedded_count = sum(1 for doc in documents if doc.embedding is not None)
            logger.info(f"Completed {url} - Extracted {len(documents)} documents ({embedded_count} embedded) from {page_count} pages ({url_duration:.2f}s)")
            
            return documents
        except Exception as e:
            logger.error(f"Error reading URL {url}: {str(e)}")
            return []
    
    def _embed_document(self, document: Document, embedder: Embedder) -> None:
        """Embed a single document (for parallel processing)"""
        try:
            if document.embedding is None:
                document.embed(embedder=embedder)
        except Exception as e:
            logger.error(f"Error embedding document '{document.id}': {str(e)}")
            raise

    def _process_document_batch(self, documents: List[Document], filters: Optional[Dict[str, Any]] = None) -> None:
        """Process a batch of documents by inserting them into the vector database"""
        if not documents or not self.vector_db:
            return

        try:
            batch_start_time = time.time()
            
            # Use the most efficient upsert method available
            self.vector_db.upsert(documents=documents, filters=filters)
            
            batch_end_time = time.time()
            batch_duration = batch_end_time - batch_start_time
        except Exception as e:
            logger.error(f"Error processing document batch: {str(e)}")

    @property
    def document_lists(self) -> Iterator[List[Document]]:
        """
        Iterate over urls and yield lists of documents with queue-based parallel embedding.
        Each object yielded by the iterator is a list of documents that are embedded via
        a dedicated embedding thread pool for optimal performance.

        Returns:
            Iterator[List[Document]]: Iterator yielding list of documents
        """
        if self.reader is not None:
            total_start_time = time.time()
            logger.info(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting to process {len(self.urls)} URLs with queue-based parallel embedding")
            
            # Process URLs in parallel using ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                # Submit all URLs for processing
                future_to_url = {executor.submit(self._process_url, url): url for url in self.urls}
                
                # Process completed futures as they finish
                for future in as_completed(future_to_url):
                    url = future_to_url[future]
                    try:
                        documents = future.result()
                        if documents:
                            # Documents should already be embedded from immediate processing
                            embedded_count = sum(1 for doc in documents if doc.embedding is not None)
                            logger.debug(f"Yielding {len(documents)} documents ({embedded_count} embedded) from {url}")
                            yield documents
                    except Exception as e:
                        logger.error(f"Error processing URL {url}: {str(e)}")
                        yield []
            
            total_end_time = time.time()
            total_duration = total_end_time - total_start_time
            logger.info(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Completed processing all {len(self.urls)} URLs with immediate embedding (Total time: {total_duration:.2f}s)")

    def load(
        self,
        recreate: bool = False,
        upsert: bool = True,
        skip_existing: bool = True,
        filters: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Load the website contents to the vector db with parallel processing and batch insertion
        
        Args:
            recreate (bool, optional): Whether to recreate the collection. Defaults to False.
            upsert (bool, optional): Whether to upsert documents. Defaults to True.
            skip_existing (bool, optional): Whether to skip existing documents. Defaults to True.
            filters (Optional[Dict[str, Any]], optional): Filters to apply to the documents. Defaults to None.
        """
        total_start_time = time.time()
        
        if self.vector_db is None:
            logger.warning("No vector db provided")
            return

        if self.reader is None:
            logger.warning("No reader provided")
            return

        if recreate:
            self.vector_db.drop()
            self.vector_db.create()
        elif not self.vector_db.exists():
            self.vector_db.create()

        logger.info(f"Starting knowledge base loading - {len(self.urls)} URLs")

        # Initialize the embedding system
        self._init_embedding_system()
        
        # Start embedding workers after initialization
        if self._embedding_executor and self._embedding_queue is not None:
            for i in range(settings.EMBEDDING_MAX_WORKERS):
                self._embedding_executor.submit(self._embedding_worker)

        # Check if URLs exist in vector db
        urls_to_read = self.urls.copy()
        if not recreate and skip_existing:
            try:
                urls_to_read = [url for url in self.urls if not self.vector_db.name_exists(name=url)]
                skipped = len(self.urls) - len(urls_to_read)
                if skipped > 0:
                    logger.info(f"Skipping {skipped} already loaded URLs")
            except Exception as e:
                logger.error(f"Error checking existing URLs: {str(e)}")
                urls_to_read = self.urls.copy()

        # Process URLs in parallel with batched vector DB insertion
        total_documents = 0
        completed_urls = 0
        total_urls = len(urls_to_read)
        
        # Initialize progress tracking if we have queue context
        if self.queue_item and self.queue_repo:
            self.queue_repo.update_progress(
                self.queue_item.id,
                ProcessingStage.CRAWLING,
                progress_percentage=10.0,
                total_items=total_urls,
                processed_items=0,
                force_stage_update=True
            )
        
        # Keep track of crawling vs upsert timing
        crawl_start_time = time.time()

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all URLs for processing
            future_to_url = {executor.submit(self._process_url, url): url for url in urls_to_read}
            all_documents = []
            
            # Process completed futures as they finish
            for future in as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    documents = future.result()
                    total_documents += len(documents)
                    completed_urls += 1
                    
                    # Update progress after each URL completes
                    if self.queue_item and self.queue_repo and total_urls > 0:
                        # Calculate crawling progress (10% to 60% of total)
                        crawling_progress = 10.0 + (completed_urls / total_urls) * 50.0
                        self.queue_repo.update_progress(
                            self.queue_item.id,
                            ProcessingStage.CRAWLING,
                            progress_percentage=min(crawling_progress, 60.0),
                            total_items=total_urls,
                            processed_items=completed_urls,
                            force_stage_update=True
                        )
                        logger.debug(f"Crawling progress: {completed_urls}/{total_urls} URLs ({crawling_progress:.1f}%)")
                    
                    # Collect documents for batch processing
                    all_documents.extend(documents)
                        
                except Exception as e:
                    logger.error(f"Error processing URL {url}: {str(e)}")
                    completed_urls += 1  # Count failed URLs too
        
        crawl_end_time = time.time()
        crawl_duration = crawl_end_time - crawl_start_time
        logger.info(f"Crawling completed - {len(urls_to_read)} URLs, {total_documents} documents, {crawl_duration:.2f}s")
        
        # Update progress to embedding stage
        if self.queue_item and self.queue_repo:
            self.queue_repo.update_progress(
                self.queue_item.id,
                ProcessingStage.EMBEDDING,
                progress_percentage=60.0,
                force_stage_update=True
            )
        
        # Get embedding results count before shutdown
        embedded_count = 0
        if self._embedding_results:
            with self._embedding_lock:
                embedded_count = len(self._embedding_results)
        
        # Shutdown the embedding system (includes waiting for completion)
        self._shutdown_embedding_system()
        
        logger.info(f"Embedding completed - {embedded_count} documents embedded")
        
        # Update embedding progress
        if self.queue_item and self.queue_repo:
            self.queue_repo.update_progress(
                self.queue_item.id,
                ProcessingStage.EMBEDDING,
                total_items=total_documents,
                processed_items=embedded_count
            )
        
        # Check if any documents missed embedding (should be rare with queue-based embedding)
        unembedded_count = sum(1 for doc in all_documents if doc.embedding is None)
        if unembedded_count > 0:
            logger.warning(f"Found {unembedded_count} unembedded documents, embedding them now")
            if self.vector_db and hasattr(self.vector_db, 'embedder'):
                # Embed remaining documents immediately without parallel processing
                # to avoid multiple model loading
                for doc in all_documents:
                    if doc.embedding is None:
                        try:
                            doc.embed(embedder=self.vector_db.embedder)
                        except Exception as e:
                            logger.error(f"Error embedding document {doc.id}: {str(e)}")
            else:
                logger.error(f"Cannot embed {unembedded_count} documents - no embedder available")
        
        # Process all documents in optimally sized batches
        if all_documents and upsert:
            logger.info(f"Inserting {len(all_documents)} documents into vector database")
            
            # Update progress for DB operations
            if self.queue_item and self.queue_repo:
                self.queue_repo.update_progress(
                    self.queue_item.id,
                    ProcessingStage.EMBEDDING,
                    total_items=total_documents,
                    processed_items=min(total_documents, embedded_count)
                )
            
            # Process in larger batches for better DB performance
            total_batches = (len(all_documents) + self.batch_size - 1) // self.batch_size
            for i, batch_start in enumerate(range(0, len(all_documents), self.batch_size)):
                batch = all_documents[batch_start:batch_start + self.batch_size]
                self._process_document_batch(batch, filters)
                
                # Update progress during DB operations
                if self.queue_item and self.queue_repo and total_batches > 1:
                    processed_docs = min(total_documents, (i + 1) * self.batch_size)
                    self.queue_repo.update_progress(
                        self.queue_item.id,
                        ProcessingStage.EMBEDDING,
                        total_items=total_documents,
                        processed_items=processed_docs
                    )
            
        # Optimize vector db if needed
        if self.optimize_on is not None and total_documents > self.optimize_on and hasattr(self.vector_db, 'optimize'):
            logger.info("Optimizing vector database...")
            try:
                self.vector_db.optimize()
            except Exception as e:
                logger.error(f"Vector DB optimization failed: {str(e)}")

        total_end_time = time.time()
        total_duration = total_end_time - total_start_time
        db_duration = total_duration - crawl_duration
        
        # Calculate embedding statistics
        final_embedded_count = sum(1 for doc in all_documents if doc.embedding is not None)
        embedding_rate = (final_embedded_count / len(all_documents) * 100) if all_documents else 0
        
        # Mark as completed after all processing is done
        if self.queue_item and self.queue_repo:
            self.queue_repo.update_status(
                self.queue_item.id,
                QueueStatus.COMPLETED
            )
            logger.info(f"✓ Marked queue item {self.queue_item.id} as completed")
        
        logger.info(f"✓ Completed loading {total_documents} documents from {len(urls_to_read)} URLs")
        logger.info(f"✓ Embedding approach: {'Queue-based parallel' if settings.ENABLE_IMMEDIATE_EMBEDDING else 'Sequential batch'}")
        logger.info(f"✓ Embedding success rate: {final_embedded_count}/{len(all_documents)} ({embedding_rate:.1f}%)")
        logger.info(f"✓ Total processing time: {total_duration:.2f}s (Crawling+Embedding: {crawl_duration:.2f}s, DB operations: {db_duration:.2f}s)") 