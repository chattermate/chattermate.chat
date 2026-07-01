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

from typing import Any, Dict, List, Optional, Union
from hashlib import md5

from agno.document import Document
from agno.embedder import Embedder
from agno.reranker.base import Reranker
from agno.utils.log import log_debug, log_info, logger
from agno.vectordb.pgvector.pgvector import PgVector
from agno.vectordb.distance import Distance
from agno.vectordb.pgvector.index import HNSW, Ivfflat
from agno.vectordb.search import SearchType
from sqlalchemy.engine import Engine


class OptimizedPgVector(PgVector):
    """
    OptimizedPgVector class that extends the standard PgVector implementation 
    to avoid re-embedding documents that already have embeddings.
    
    This class optimizes the workflow for web crawling by allowing embeddings
    to be generated during the crawling phase, and then preserved during insertion
    into the database.
    """

    def __init__(
        self,
        table_name: str,
        schema: str = "ai",
        db_url: Optional[str] = None,
        db_engine: Optional[Engine] = None,
        embedder: Optional[Embedder] = None,
        search_type: SearchType = SearchType.vector,
        vector_index: Union[Ivfflat, HNSW] = HNSW(),
        distance: Distance = Distance.cosine,
        prefix_match: bool = False,
        vector_score_weight: float = 0.5,
        content_language: str = "english",
        schema_version: int = 1,
        auto_upgrade_schema: bool = False,
        reranker: Optional[Reranker] = None,
    ):
        """Initialize the OptimizedPgVector with the same parameters as PgVector."""
        super().__init__(
            table_name=table_name,
            schema=schema,
            db_url=db_url,
            db_engine=db_engine,
            embedder=embedder,
            search_type=search_type,
            vector_index=vector_index,
            distance=distance,
            prefix_match=prefix_match,
            vector_score_weight=vector_score_weight,
            content_language=content_language,
            schema_version=schema_version,
            auto_upgrade_schema=auto_upgrade_schema,
            reranker=reranker,
        )

    def insert(
        self,
        documents: List[Document],
        filters: Optional[Dict[str, Any]] = None,
        batch_size: int = 100,
    ) -> None:
        """
        Insert documents into the database, preserving existing embeddings.

        Args:
            documents (List[Document]): List of documents to insert.
            filters (Optional[Dict[str, Any]]): Filters to apply to the documents.
            batch_size (int): Number of documents to insert in each batch.
        """
        try:
            with self.Session() as sess:
                for i in range(0, len(documents), batch_size):
                    batch_docs = documents[i : i + batch_size]
                    try:
                        # Prepare documents for insertion
                        batch_records = []
                        for doc in batch_docs:
                            try:
                                # Embed document only if not already embedded (should be rare)
                                if doc.embedding is None:
                                    if self.embedder is not None:
                                        doc.embed(embedder=self.embedder)
                                        logger.debug(f"Document embedding done for {doc.name}")
                                    else:
                                        logger.warning(f"Document '{doc.name}' has no embedding and no embedder available - skipping")
                                        continue
                                
                                # Merge filters into document metadata for searchability
                                merged_meta_data = doc.meta_data.copy() if doc.meta_data else {}
                                if filters:
                                    merged_meta_data.update(filters)
                                    logger.debug(f"Merged filters into meta_data: {filters}")
                                
                                cleaned_content = self._clean_content(doc.content)
                                content_hash = md5(cleaned_content.encode()).hexdigest()
                                _id = doc.id or content_hash
                                record = {
                                    "id": _id,
                                    "name": doc.name,
                                    "meta_data": merged_meta_data,  # Use merged metadata
                                    "filters": filters,
                                    "content": cleaned_content,
                                    "embedding": doc.embedding,
                                    "usage": doc.usage,
                                    "content_hash": content_hash,
                                }
                                batch_records.append(record)
                            except Exception as e:
                                logger.error(f"Error processing document '{doc.name}': {e}")

                        # Insert the batch of records
                        from sqlalchemy.dialects import postgresql
                        insert_stmt = postgresql.insert(self.table)
                        sess.execute(insert_stmt, batch_records)
                        sess.commit()  # Commit batch independently
                    except Exception as e:
                        logger.error(f"Error with batch starting at index {i}: {e}")
                        sess.rollback()  # Rollback the current batch if there's an error
                        raise
        except Exception as e:
            logger.error(f"Error inserting documents: {e}")
            raise

    def upsert(
        self,
        documents: List[Document],
        filters: Optional[Dict[str, Any]] = None,
        batch_size: int = 100,
    ) -> None:
        """
        Upsert (insert or update) documents in the database, preserving existing embeddings.

        Args:
            documents (List[Document]): List of documents to upsert.
            filters (Optional[Dict[str, Any]]): Filters to apply to the documents.
            batch_size (int): Number of documents to upsert in each batch.
        """
        try:
            with self.Session() as sess:
                for i in range(0, len(documents), batch_size):
                    batch_docs = documents[i : i + batch_size]
                    try:
                        # Prepare documents for upserting
                        batch_records = []
                        for doc in batch_docs:
                            try:
                                # Skip embedding if the document already has an embedding
                                if doc.embedding is None:
                                    doc.embed(embedder=self.embedder)
                                
                                # Merge filters into document metadata for searchability
                                merged_meta_data = doc.meta_data.copy() if doc.meta_data else {}
                                if filters:
                                    merged_meta_data.update(filters)
                                    logger.debug(f"Merged filters into meta_data: {filters}")
                                    
                                cleaned_content = self._clean_content(doc.content)
                                content_hash = md5(cleaned_content.encode()).hexdigest()
                                _id = doc.id or content_hash
                                record = {
                                    "id": _id,
                                    "name": doc.name,
                                    "meta_data": merged_meta_data,  # Use merged metadata
                                    "filters": filters,
                                    "content": cleaned_content,
                                    "embedding": doc.embedding,
                                    "usage": doc.usage,
                                    "content_hash": content_hash,
                                }
                                batch_records.append(record)
                            except Exception as e:
                                logger.error(f"Error processing document '{doc.name}': {e}")

                        # Upsert the batch of records
                        from sqlalchemy.dialects import postgresql
                        insert_stmt = postgresql.insert(self.table).values(batch_records)
                        upsert_stmt = insert_stmt.on_conflict_do_update(
                            index_elements=["id"],
                            set_=dict(
                                name=insert_stmt.excluded.name,
                                meta_data=insert_stmt.excluded.meta_data,
                                filters=insert_stmt.excluded.filters,
                                content=insert_stmt.excluded.content,
                                embedding=insert_stmt.excluded.embedding,
                                usage=insert_stmt.excluded.usage,
                                content_hash=insert_stmt.excluded.content_hash,
                            ),
                        )
                        sess.execute(upsert_stmt)
                        sess.commit()  # Commit batch independently
                    except Exception as e:
                        logger.error(f"Error with batch starting at index {i}: {e}")
                        sess.rollback()  # Rollback the current batch if there's an error
                        raise
        except Exception as e:
            logger.error(f"Error upserting documents: {e}")
            raise 