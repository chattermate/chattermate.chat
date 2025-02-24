"""
ChatterMate - Knowledge
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

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Body, Query, status
from typing import List, Optional, Dict, Any
from app.models.user import User
from app.core.auth import get_current_user, require_permissions
from app.knowledge.knowledge_base import KnowledgeManager
from app.core.logger import get_logger
import json
import os
from pydantic import BaseModel
from sqlalchemy import text
from datetime import datetime
from uuid import UUID
from app.database import get_db
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.knowledge_to_agent import KnowledgeToAgentRepository
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus
from app.repositories.knowledge_queue import KnowledgeQueueRepository
from app.core.config import settings
from phi.vectordb.pgvector import PgVector, SearchType
from sqlalchemy.orm import Session

# Try to import enterprise modules
try:
    from app.enterprise.repositories.subscription import SubscriptionRepository
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False

router = APIRouter()
logger = get_logger(__name__)

# Add this near the top of the file with other constants
TEMP_DIR = "temp"

# Add these variables at the top of the file
PROCESSOR_STATUS = {
    "last_run": None,
    "is_running": False,
    "error": None
}


class UrlsRequest(BaseModel):
    org_id: UUID
    pdf_urls: List[str] = []
    websites: List[str] = []
    agent_id: Optional[str] = None


@router.post("/upload/pdf")
async def upload_pdf_files(
    files: List[UploadFile] = File(...),
    org_id: str = Form(...),
    agent_id: Optional[str] = Form(None),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Upload PDF files to knowledge base"""
    saved_files = []

    try:
        # Convert org_id string to UUID for comparison
        org_uuid = UUID(org_id)
        logger.debug(f"current_user.organization_id: {current_user.organization_id}, org_id: {org_uuid}")
        if current_user.organization_id != org_uuid:
            raise HTTPException(status_code=403, detail="Unauthorized access to organization")

        # Check enterprise subscription limits if enterprise module is available
        if HAS_ENTERPRISE:
            subscription_repo = SubscriptionRepository(db)
            knowledge_repo = KnowledgeRepository(db)

            # Get current subscription
            subscription = subscription_repo.get_by_organization(str(org_uuid))
            if not subscription:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No active subscription found"
                )

            # Check subscription status
            if not subscription.is_active() and not subscription.is_trial():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Subscription is not active"
                )

            # Get current knowledge sources count
            current_count = knowledge_repo.count_by_organization(org_uuid)

            # Check if adding these files would exceed the limit
            new_count = current_count + len(files)
            if subscription.plan.max_knowledge_sources is not None and new_count > subscription.plan.max_knowledge_sources:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Cannot add files: Maximum number of knowledge sources ({subscription.plan.max_knowledge_sources}) would be exceeded"
                )

        # Create temp directory if it doesn't exist
        os.makedirs(TEMP_DIR, exist_ok=True)

        queue_repo = KnowledgeQueueRepository(db)
        queued_items = []

        # Save files temporarily and create queue items
        for file in files:
            file_path = os.path.join(TEMP_DIR, file.filename)
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            saved_files.append(file_path)

            # Create queue item with user_id
            queue_item = KnowledgeQueue(
                organization_id=org_uuid,
                agent_id=UUID(agent_id) if agent_id else None,
                user_id=current_user.id,
                source_type='pdf_file',
                source=file_path,
                status=QueueStatus.PENDING,
                queue_metadata={
                    "max_links": subscription.plan.max_sub_pages if HAS_ENTERPRISE and subscription else 10
                }
            )
            queued_items.append(queue_repo.create(queue_item))

        return {
            "message": "PDFs queued for processing,it will take a while to process, we will notify you when it is done",
            "queue_items": [{"id": item.id, "status": item.status} for item in queued_items]
        }

    except Exception as e:
        logger.error(f"Error uploading PDFs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/add/urls")
async def add_urls(
    request: UrlsRequest = Body(...),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Add URLs to knowledge base"""
    try:
        # Verify organization access
        if current_user.organization_id != request.org_id:
            raise HTTPException(status_code=403, detail="Unauthorized access to organization")

        # Check enterprise subscription limits if enterprise module is available
        if HAS_ENTERPRISE:
            subscription_repo = SubscriptionRepository(db)
            knowledge_repo = KnowledgeRepository(db)

            # Get current subscription
            subscription = subscription_repo.get_by_organization(str(request.org_id))
            if not subscription:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No active subscription found"
                )

            # Check subscription status
            if not subscription.is_active() and not subscription.is_trial():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Subscription is not active"
                )

            # Get current knowledge sources count
            current_count = knowledge_repo.count_by_organization(request.org_id)

            # Calculate total new URLs to be added
            total_new_urls = len(request.pdf_urls) + len(request.websites)

            # Check if adding these URLs would exceed the limit
            new_count = current_count + total_new_urls
            if subscription.plan.max_knowledge_sources is not None and new_count > subscription.plan.max_knowledge_sources:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Cannot add URLs: Maximum number of knowledge sources ({subscription.plan.max_knowledge_sources}) would be exceeded"
                )

        queue_repo = KnowledgeQueueRepository(db)
        knowledge_repo = KnowledgeRepository(db)
        queued_items = []

        # Check for duplicate URLs
        all_urls = request.pdf_urls + request.websites
        existing_sources = knowledge_repo.get_by_sources(request.org_id, all_urls)

        if existing_sources:
            duplicate_urls = [source.source for source in existing_sources]
            return {
                "error": "Some URLs already exist in your knowledge base",
                "duplicate_urls": duplicate_urls
            }

        # Queue PDF URLs with user_id
        for url in request.pdf_urls:
            queue_item = KnowledgeQueue(
                organization_id=request.org_id,
                agent_id=UUID(request.agent_id) if request.agent_id else None,
                user_id=current_user.id,
                source_type='pdf_url',
                source=url,
                status=QueueStatus.PENDING,
                queue_metadata={
                    "max_links": subscription.plan.max_sub_pages if HAS_ENTERPRISE and subscription else 10
                }
            )
            queued_items.append(queue_repo.create(queue_item))

        # Queue websites with user_id
        for url in request.websites:
            queue_item = KnowledgeQueue(
                organization_id=request.org_id,
                agent_id=UUID(request.agent_id) if request.agent_id else None,
                user_id=current_user.id,
                source_type='website',
                source=url,
                status=QueueStatus.PENDING,
                queue_metadata={
                    "max_links": subscription.plan.max_sub_pages if HAS_ENTERPRISE and subscription else 10
                }
            )
            queued_items.append(queue_repo.create(queue_item))

        return {
            "message": "URLs queued for processing, it will take a while to process, we will notify you when it is done",
            "queue_items": [{"id": item.id, "status": item.status} for item in queued_items]
        }

    except Exception as e:
        logger.error(f"Error adding URLs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/link")
async def link_knowledge_to_agent(
    knowledge_id: int,
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Link existing knowledge to an agent"""
    try:
        knowledge_repo = KnowledgeRepository(db)
        link_repo = KnowledgeToAgentRepository(db)

        # Verify knowledge exists and belongs to user's org
        knowledge = knowledge_repo.get_by_id(knowledge_id)
        if not knowledge or knowledge.organization_id != current_user.organization_id:
            raise HTTPException(status_code=404, detail="Knowledge source not found or unauthorized access")

        # Convert agent_id to UUID
        try:
            agent_uuid = UUID(agent_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid agent ID format")

        # Check if link already exists
        existing_link = link_repo.get_by_ids(knowledge_id, agent_uuid)
        if existing_link:
            raise HTTPException(status_code=400, detail="Knowledge is already linked to this agent")

        # Create link
        link = link_repo.create(KnowledgeToAgent(
            knowledge_id=knowledge_id,
            agent_id=agent_uuid
        ))

        # Update vector database filters to include the new agent_id
        if knowledge.table_name and knowledge.schema:
            # Get existing records for this knowledge source
            query = text(f"""
                SELECT DISTINCT name, filters 
                FROM {knowledge.schema}."{knowledge.table_name}"
                WHERE name = :source
            """)

            result = db.execute(query, {"source": knowledge.source}).first()

            if result:
                # Get current filters and update agent_ids
                filters = result.filters if result.filters else {}
                agent_ids = filters.get('agent_id', [])
                if isinstance(agent_ids, list) and str(agent_uuid) not in agent_ids:
                    agent_ids.append(str(agent_uuid))
                else:
                    agent_ids = [str(agent_uuid)]
                
                # Create new filters object with updated agent_ids
                new_filters = {
                    'name': knowledge.source,
                    'org_id': str(knowledge.organization_id),
                    'agent_id': agent_ids
                }
                
                # Update the filters in the vector database using string concatenation for JSONB
                update_query = text(f"""
                    UPDATE {knowledge.schema}."{knowledge.table_name}"
                    SET filters = '{json.dumps(new_filters)}'::jsonb
                    WHERE name = :source
                """)

                db.execute(update_query, {
                    "source": knowledge.source
                })
                db.commit()

        return {"message": "Knowledge linked to agent successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking knowledge: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/unlink")
async def unlink_knowledge_from_agent(
    knowledge_id: int,
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlink knowledge from an agent"""
    try:
        # Convert agent_id to UUID
        try:
            agent_uuid = UUID(agent_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid agent ID format")

        knowledge_repo = KnowledgeRepository(db)
        link_repo = KnowledgeToAgentRepository(db)

        # Verify knowledge exists and belongs to user's org
        knowledge = knowledge_repo.get_by_id(knowledge_id)
        if not knowledge or knowledge.organization_id != current_user.organization_id:
            raise HTTPException(status_code=404, detail="Knowledge source not found or unauthorized access")

        # Delete the link
        success = link_repo.delete_by_ids(knowledge_id, agent_uuid)
        if not success:
            raise HTTPException(status_code=404, detail="Link not found")

        # Update vector database filters to remove the agent_id
        if knowledge.table_name and knowledge.schema:
            # Get existing records for this knowledge source
            query = text(f"""
                SELECT DISTINCT name, filters 
                FROM {knowledge.schema}."{knowledge.table_name}"
                WHERE name = :source
            """)

            result = db.execute(query, {"source": knowledge.source}).first()

            if result:
                # Get current filters and remove agent_id
                filters = result.filters if result.filters else {}
                agent_ids = filters.get('agent_id', [])
                if str(agent_uuid) in agent_ids:
                    agent_ids.remove(str(agent_uuid))
                
                # Create new filters object with updated agent_ids
                new_filters = {
                    'name': knowledge.source,
                    'org_id': str(knowledge.organization_id),
                    'agent_id': agent_ids
                }
                
                # Update the filters in the vector database using string concatenation for JSONB
                update_query = text(f"""
                    UPDATE {knowledge.schema}."{knowledge.table_name}"
                    SET filters = '{json.dumps(new_filters)}'::jsonb
                    WHERE name = :source
                """)

                db.execute(update_query, {
                    "source": knowledge.source
                })
                db.commit()

        return {"message": "Knowledge unlinked from agent successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unlinking knowledge: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/agent/{agent_id}")
async def get_knowledge_by_agent(
    agent_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get knowledge sources and their data for an agent with pagination"""
    try:
        # Convert agent_id to UUID
        try:
            agent_uuid = UUID(agent_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid agent ID format")

        logger.debug(f"Getting knowledge for agent {agent_uuid}")
        knowledge_repo = KnowledgeRepository(db)

        # Get total count and paginated knowledge items
        total_count = knowledge_repo.count_by_agent(agent_uuid)
        logger.debug(f"Total count for agent {agent_uuid}: {total_count}")

        knowledge_items = knowledge_repo.get_by_agent(
            agent_uuid,
            skip=(page - 1) * page_size,
            limit=page_size
        )
        logger.debug(f"Knowledge items for agent {agent_uuid}: {knowledge_items}")

        result = []
        for k in knowledge_items:
            # Base knowledge data
            knowledge_data = {
                "id": k.id,
                "name": k.source,
                "type": k.source_type.value,
                "pages": []
            }

            # Query the actual data if table_name is specified
            if k.table_name and k.schema:
                try:
                    # Create a safe query to get unique records with cleaned source
                    query = text(f"""
                        SELECT DISTINCT
                            CASE
                                WHEN id LIKE '%\\_%%' ESCAPE '\\'
                                THEN substring(id, 1, length(id) - position('_' in reverse(id)))
                                ELSE id
                            END as subpage,
                            id,
                            created_at,
                            updated_at
                        FROM {k.schema}."{k.table_name}"
                        WHERE name = :source
                    """)

                    # Execute query with parameters
                    rows = db.execute(query, {"source": k.source})

                    # Group pages by subpage
                    pages_dict = {}
                    for row in rows:
                        subpage = row.subpage
                        if subpage not in pages_dict:
                            pages_dict[subpage] = {
                                "subpage": subpage,
                                "created_at": row.created_at.isoformat() if row.created_at else None,
                                "updated_at": row.updated_at.isoformat() if row.updated_at else None
                            }

                    knowledge_data["pages"] = list(pages_dict.values())

                except Exception as e:
                    logger.error(f"Error querying table {k.table_name}: {str(e)}")
                    knowledge_data["error"] = f"Error accessing data: {str(e)}"

            result.append(knowledge_data)

        logger.debug(f"Final result for agent {agent_uuid}: {result}")
        return {
            "knowledge": result,
            "pagination": {
                "total": total_count,
                "page": page,
                "page_size": page_size,
                "total_pages": (total_count + page_size - 1) // page_size
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting knowledge by agent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/organization/{org_id}")
async def get_knowledge_by_organization(
    org_id: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Get knowledge sources and their data for an organization with pagination"""
    try:
        # Convert org_id to UUID
        try:
            org_uuid = UUID(org_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid organization ID format")

        logger.debug(f"Getting knowledge for organization {org_uuid}")

        # Verify organization access
        if current_user.organization_id != org_uuid:
            raise HTTPException(status_code=403, detail="Unauthorized access to organization")

        knowledge_repo = KnowledgeRepository(db)

        # Get total count and paginated knowledge items
        total_count = knowledge_repo.count_by_organization(org_uuid)
        logger.debug(f"Total count for organization {org_uuid}: {total_count}")

        knowledge_items = knowledge_repo.get_by_organization(
            org_uuid,
            skip=(page - 1) * page_size,
            limit=page_size
        )
        logger.debug(f"Knowledge items for organization {org_uuid}: {knowledge_items}")

        result = []
        for k in knowledge_items:
            # Base knowledge data
            knowledge_data = {
                "id": k.id,
                "name": k.source,
                "type": k.source_type.value,
                "pages": []
            }

            # Query the actual data if table_name is specified
            if k.table_name and k.schema:
                try:
                    # Create a safe query to get unique records with cleaned source
                    query = text(f"""
                        SELECT DISTINCT
                            CASE
                                WHEN id LIKE '%\\_%%' ESCAPE '\\'
                                THEN substring(id, 1, length(id) - position('_' in reverse(id)))
                                ELSE id
                            END as subpage,
                            id,
                            created_at,
                            updated_at
                        FROM {k.schema}."{k.table_name}"
                        WHERE name = :source
                    """)

                    # Execute query with parameters
                    rows = db.execute(query, {"source": k.source})

                    # Group pages by subpage
                    pages_dict = {}
                    for row in rows:
                        subpage = row.subpage
                        if subpage not in pages_dict:
                            pages_dict[subpage] = {
                                "subpage": subpage,
                                "created_at": row.created_at.isoformat() if row.created_at else None,
                                "updated_at": row.updated_at.isoformat() if row.updated_at else None
                            }

                    knowledge_data["pages"] = list(pages_dict.values())

                except Exception as e:
                    logger.error(f"Error querying table {k.table_name}: {str(e)}")
                    knowledge_data["error"] = f"Error accessing data: {str(e)}"

            result.append(knowledge_data)

        logger.debug(f"Final result for organization {org_uuid}: {result}")
        return {
            "knowledge": result,
            "pagination": {
                "total": total_count,
                "page": page,
                "page_size": page_size,
                "total_pages": (total_count + page_size - 1) // page_size
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting knowledge by organization: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/queue/{queue_id}")
async def get_queue_status(
    queue_id: int,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Get status of a queued knowledge item"""
    try:
        queue_repo = KnowledgeQueueRepository(db)
        item = db.query(KnowledgeQueue).filter(
            KnowledgeQueue.id == queue_id).first()

        if not item:
            return {"error": "Queue item not found"}

        if item.organization_id != current_user.organization_id:
            return {"error": "Unauthorized access to queue item"}

        return {
            "id": item.id,
            "status": item.status,
            "error": item.error,
            "created_at": item.created_at,
            "updated_at": item.updated_at
        }

    except Exception as e:
        logger.error(f"Error getting queue status: {str(e)}")
        return {"error": str(e)}


@router.get("/processor/status")
async def get_processor_status(
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Get status of the knowledge processor for user's organization"""
    try:
        # Get counts of items in different states for user's items
        base_query = db.query(KnowledgeQueue)\
            .filter(
                KnowledgeQueue.organization_id == current_user.organization_id,
                KnowledgeQueue.user_id == current_user.id  # Add user filter
        )

        pending_count = base_query.filter(
            KnowledgeQueue.status == QueueStatus.PENDING
        ).count()

        processing_count = base_query.filter(
            KnowledgeQueue.status == QueueStatus.PROCESSING
        ).count()

        completed_count = base_query.filter(
            KnowledgeQueue.status == QueueStatus.COMPLETED
        ).count()

        failed_count = base_query.filter(
            KnowledgeQueue.status == QueueStatus.FAILED
        ).count()

        return {
            "last_run": PROCESSOR_STATUS["last_run"],
            "is_running": PROCESSOR_STATUS["is_running"],
            "error": PROCESSOR_STATUS["error"],
            "queue_status": {
                "pending": pending_count,
                "processing": processing_count,
                "completed": completed_count,
                "failed": failed_count
            }
        }

    except Exception as e:
        logger.error(f"Error getting processor status: {str(e)}")
        return {"error": str(e)}


@router.delete("/{knowledge_id}")
async def delete_knowledge(
    knowledge_id: int,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Delete a knowledge source and its associated data"""
    try:
        knowledge_repo = KnowledgeRepository(db)

        # Verify knowledge exists and belongs to user's org
        knowledge = knowledge_repo.get_by_id(knowledge_id)
        if not knowledge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Knowledge source not found"
            )

        if knowledge.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized access to knowledge source"
            )

        # Delete knowledge and associated data
        success = knowledge_repo.delete_with_data(knowledge_id)

        if success:
            return {"message": "Knowledge source deleted successfully"}
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete knowledge source"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting knowledge: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
