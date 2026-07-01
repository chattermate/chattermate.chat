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

from typing import Any, Dict, Optional
from agno.knowledge.pdf_url import PDFUrlKnowledgeBase
from app.core.logger import get_logger

logger = get_logger(__name__)


class EnhancedPDFUrlKnowledgeBase(PDFUrlKnowledgeBase):
    """Enhanced PDF URL knowledge base that supports metadata filters"""
    
    def load(
        self,
        recreate: bool = False,
        upsert: bool = True,
        skip_existing: bool = True,
        filters: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Load the PDF URL contents to the vector db with metadata filters
        
        Args:
            recreate (bool, optional): Whether to recreate the collection. Defaults to False.
            upsert (bool, optional): Whether to upsert documents. Defaults to True.
            skip_existing (bool, optional): Whether to skip existing documents. Defaults to True.
            filters (Optional[Dict[str, Any]], optional): Metadata filters to apply to the documents. Defaults to None.
        """
        if self.vector_db is None:
            logger.warning("No vector db provided")
            return

        if recreate:
            self.vector_db.drop()
            self.vector_db.create()
        elif not self.vector_db.exists():
            self.vector_db.create()

        if not self.urls:
            logger.warning("No URLs provided")
            return

        logger.info(f"Loading PDF URL knowledge base: {len(self.urls)} URLs")

        # Read documents from PDF URLs
        for document_list in self.document_lists:
            # Embed documents if embedder is available
            if self.vector_db and hasattr(self.vector_db, 'embedder'):
                for document in document_list:
                    if document.embedding is None:
                        try:
                            document.embed(embedder=self.vector_db.embedder)
                        except Exception as e:
                            logger.error(f"Error embedding document {document.id}: {str(e)}")
            
            # Upsert documents with filters
            if upsert and self.vector_db:
                try:
                    logger.debug(f"Upserting {len(document_list)} documents with filters: {filters}")
                    self.vector_db.upsert(documents=document_list, filters=filters)
                except Exception as e:
                    logger.error(f"Error upserting documents: {str(e)}")
        
        logger.info(f"Completed loading PDF URL knowledge base")

