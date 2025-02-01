from typing import List
from phi.tools import Toolkit
from phi.utils.log import logger
from app.database import get_db
from app.core.config import settings
from app.repositories.knowledge_to_agent import KnowledgeToAgentRepository
from app.repositories.knowledge import KnowledgeRepository
from phi.knowledge.agent import AgentKnowledge
from phi.vectordb.pgvector import PgVector, SearchType
from uuid import UUID

class KnowledgeSearchByAgent(Toolkit):
    def __init__(self, agent_id: str, org_id: UUID):
        super().__init__(name="knowledge_search_by_agent")
        self.name = "knowledge_search_by_agent"
        self.description = "Search the knowledge base for information about a query"
        self.function = self.search_knowledge_base
        self.agent_id = agent_id
        self.org_id = org_id
        self.db = next(get_db())
        self.knowledge_repo = KnowledgeRepository(self.db)
        self.link_repo = KnowledgeToAgentRepository(self.db)
        self.agent_knowledge = None
        self.register(self.search_knowledge_base)

    def search_knowledge_base(self, query: str) -> str:
        """Use this function to search the knowledge base for information about a query.

        Args:
            query: The query to search for.
        """
        try:
            logger.debug(f"Searching knowledge base for query: {query}")
            # Get knowledge sources linked to this agent
            knowledge_sources = self.knowledge_repo.get_by_agent(self.agent_id)

            if not knowledge_sources:
                return "No knowledge sources available for this agent."

            # Use the first knowledge source's table and schema since they should all be in the same table
            source = knowledge_sources[0]
            
            # Initialize vector db
            vector_db = PgVector(
                table_name=source.table_name,
                db_url=settings.DATABASE_URL,
                schema=source.schema,
                search_type=SearchType.hybrid
            )
            logger.debug(f"Vector db initialized: {source.table_name}")

            # Create AgentKnowledge instance
            self.agent_knowledge = AgentKnowledge(vector_db=vector_db)

            # Convert UUID to string in filters
            filters = {"agent_id": [str(self.agent_id)]}
            logger.debug(f"Search filters: {filters}")

            # Search with agent_id filter
            documents = self.agent_knowledge.search(
                query=query,
                num_documents=5,
                filters=filters
            )
            logger.debug(f"Documents: {documents}")

            search_results = []
            for doc in documents:
                if doc.content:
                    # Find the source type from knowledge sources
                    source_type = next(
                        (source.source_type.value.lower() for source in knowledge_sources if source.source == doc.name),
                        'unknown'
                    )
                    search_results.append({
                        'content': doc.content,
                        'source_type': source_type,
                        'name': doc.name or 'Untitled',
                        'similarity': doc.score if hasattr(doc, 'score') else 0.0
                    })

            if not search_results:
                return "No relevant information found in the knowledge base."

            # Sort by similarity and format results
            search_results.sort(key=lambda x: x['similarity'], reverse=True)

            # Return top 3 most relevant results
            formatted_results = []
            for result in search_results[:3]:
                formatted_results.append(
                    f"[{result['source_type'].upper()} - {result['name']}] {result['content']}")
            logger.debug(f"Formatted results: {formatted_results}")
            return "\n\n".join(formatted_results)

        except Exception as e:
            logger.error(f"Error searching knowledge base: {str(e)}")
            return "Error searching knowledge base."
