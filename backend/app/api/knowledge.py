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

import traceback
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Body, Query, status
from typing import List, Optional
from app.models.user import User
from app.core.auth import get_current_user, require_permissions
from app.core.logger import get_logger
import json
import os
import asyncio
from pydantic import BaseModel, field_validator
from sqlalchemy import text
from uuid import UUID
from app.database import get_db
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.knowledge_to_agent import KnowledgeToAgentRepository
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus
from app.repositories.knowledge_queue import KnowledgeQueueRepository
from app.core.config import settings
from sqlalchemy.orm import Session
from app.core.s3 import upload_file_to_s3, get_s3_signed_url
from app.repositories.user import UserRepository
from app.models.notification import Notification, NotificationType
from app.services.user import send_fcm_notification
from app.workers.knowledge_processor import process_queue_item, run_processor

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

# Import processor status from shared module
from app.core.processor import PROCESSOR_STATUS


class UrlsRequest(BaseModel):
    org_id: UUID
    pdf_urls: List[str] = []
    websites: List[str] = []
    agent_id: Optional[str] = None
    
    @field_validator('websites')
    @classmethod
    def validate_website_url_format(cls, v):
        """Validate that each website URL is in https://domainname format"""
        import re
        validated_urls = []
        
        for url in v:
            if not url:
                raise ValueError('URL cannot be empty')
            
            # Remove trailing slashes and whitespace
            url = url.strip().rstrip('/')
            
            # Check if URL starts with https://
            if not url.startswith('https://'):
                raise ValueError('URL must start with https://')
            
            # Extract domain part after https://
            domain_part = url[8:]  # Remove 'https://'
            
            # Check if domain part is not empty
            if not domain_part:
                raise ValueError('URL must contain a domain name')
            
            # Allow alphanumeric, dots, hyphens, and forward slashes for paths
            if not re.match(r'^[a-zA-Z0-9.-]+(/.*)?$', domain_part):
                raise ValueError('Invalid URL format')
            
            # Ensure domain has at least one dot (for TLD)
            domain_only = domain_part.split('/')[0]  # Get just the domain part before any path
            if '.' not in domain_only:
                raise ValueError('URL must contain a valid domain with TLD')
            
            validated_urls.append(url)
        
        return validated_urls
    
    @field_validator('pdf_urls')
    @classmethod
    def validate_pdf_url_format(cls, v):
        """Validate that each PDF URL is in https://domainname format"""
        import re
        validated_urls = []
        
        for url in v:
            if not url:
                raise ValueError('URL cannot be empty')
            
            # Remove trailing slashes and whitespace
            url = url.strip().rstrip('/')
            
            # Check if URL starts with https://
            if not url.startswith('https://'):
                raise ValueError('URL must start with https://')
            
            # Extract domain part after https://
            domain_part = url[8:]  # Remove 'https://'
            
            # Check if domain part is not empty
            if not domain_part:
                raise ValueError('URL must contain a domain name')
            
            # Allow alphanumeric, dots, hyphens, and forward slashes for paths
            if not re.match(r'^[a-zA-Z0-9.-]+(/.*)?$', domain_part):
                raise ValueError('Invalid URL format')
            
            # Ensure domain has at least one dot (for TLD)
            domain_only = domain_part.split('/')[0]  # Get just the domain part before any path
            if '.' not in domain_only:
                raise ValueError('URL must contain a valid domain with TLD')
            
            validated_urls.append(url)
        
        return validated_urls
    
class ExploreUrlRequest(BaseModel):
    url: str
    
    @field_validator('url')
    @classmethod
    def validate_url_format(cls, v):
        """Validate that URL is in https://domainname format"""
        if not v:
            raise ValueError('URL cannot be empty')
        
        # Remove trailing slashes and whitespace
        v = v.strip().rstrip('/')
        
        # Check if URL starts with https://
        if not v.startswith('https://'):
            raise ValueError('URL must start with https://')
        
        # Extract domain part after https://
        domain_part = v[8:]  # Remove 'https://'
        
        # Check if domain part is not empty
        if not domain_part:
            raise ValueError('URL must contain a domain name')
        
        # Check if domain contains only valid characters and has at least one dot
        import re
        # Allow alphanumeric, dots, hyphens, and forward slashes for paths
        if not re.match(r'^[a-zA-Z0-9.-]+(/.*)?$', domain_part):
            raise ValueError('Invalid URL format')
        
        # Ensure domain has at least one dot (for TLD)
        domain_only = domain_part.split('/')[0]  # Get just the domain part before any path
        if '.' not in domain_only:
            raise ValueError('URL must contain a valid domain with TLD')
        
        return v


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

        queue_repo = KnowledgeQueueRepository(db)
        queued_items = []

        # Process each file
        for file in files:
            file_path = ""
            source_type = "pdf_file"
            # Check if S3 storage is enabled
            if settings.S3_FILE_STORAGE:
                # Upload to S3
                folder = f"knowledge/{org_uuid}"
                file_content = await file.read()
                file_url = await upload_file_to_s3(file_content, folder, file.filename, content_type="application/pdf")
                logger.debug(f"Uploaded PDF to S3: {file_url}")
                file_path = await get_s3_signed_url(file_url)
                source_type = "pdf_url"
            else:
                # Save file locally
                os.makedirs(TEMP_DIR, exist_ok=True)
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
                source_type=source_type,
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


@router.post("/explore/add-url")
async def add_explore_url(
    request: ExploreUrlRequest = Body(...),
    db: Session = Depends(get_db)
):
    """Add URL from explore view without authentication, using environment variables"""
    try:
        # Get values from environment
        agent_id = settings.EXPLORE_AGENT_ID
        org_id = settings.EXPLORE_SOURCE_ORG_ID
        user_id = settings.EXPLORE_USER_ID
        
        
        # Check if URL already exists in knowledge base
        knowledge_repo = KnowledgeRepository(db)
        existing_sources = knowledge_repo.get_by_sources(UUID(org_id), [request.url])
        
        if existing_sources:
            return {
                "status": "exists",
                "message": "URL already exists in knowledge base"
            }
        
        # Create queue item with HIGH priority for explore URLs
        queue_repo = KnowledgeQueueRepository(db)
        queue_item = KnowledgeQueue(
            organization_id=UUID(org_id),
            agent_id=UUID(agent_id),
            user_id=user_id,
            source_type='website',
            source=request.url,
            status=QueueStatus.PENDING,
            priority=10,  # High priority for explore URLs (default is 0)
            queue_metadata={
                "max_links": 20  # Default to 10 links
            }
        )
        
        # Add to queue
        queue_item = queue_repo.create(queue_item)
        
        # DON'T process immediately in API - let the knowledge processor service handle it
        # The knowledge processor runs as a separate service and polls the queue
        
        return {
            "status": "success",
            "message": "URL added to knowledge base queue. Processing will start shortly.",
            "queue_id": queue_item.id
        }
        
    except Exception as e:
        logger.error(f"Error adding explore URL: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



def _get_crawled_urls_info(crawled_urls):
    """Get comprehensive information about crawled URLs"""
    if not crawled_urls or not isinstance(crawled_urls, list):
        return {
            "latest_url": None,
            "all_urls": [],
            "count": 0
        }
    
    all_urls = []
    latest_url = None
    
    try:
        for item in crawled_urls:
            if isinstance(item, str):
                # New format: just URL strings
                all_urls.append(item)
                latest_url = item  # Keep updating to get the last one
            elif isinstance(item, dict) and "url" in item:
                # Legacy format: objects with url, timestamp, status
                all_urls.append(item["url"])
                latest_url = item["url"]
    except (KeyError, TypeError) as e:
        logger.warning(f"Error processing crawled URLs: {str(e)}")
    
    return {
        "latest_url": latest_url,
        "all_urls": all_urls,
        "count": len(all_urls)
    }


@router.get("/explore/progress/{queue_id}")
async def get_explore_progress(
    queue_id: int,
    db: Session = Depends(get_db)
):
    """Get progress status for knowledge base processing"""
    try:
        queue_repo = KnowledgeQueueRepository(db)
        queue_item = queue_repo.get_by_id(queue_id)
        
        # Refresh the item to get the latest data from the database
        if queue_item:
            db.refresh(queue_item)
        
        if not queue_item:
            raise HTTPException(status_code=404, detail="Queue item not found")
        
        # Get processing stage information
        stage_info = {
            "not_started": {"label": "Initializing", "step": 1, "total": 4},
            "NOT_STARTED": {"label": "Initializing", "step": 1, "total": 4},
            "crawling": {"label": "Crawling Website", "step": 2, "total": 4},
            "CRAWLING": {"label": "Crawling Website", "step": 2, "total": 4},
            "embedding": {"label": "Processing Content", "step": 3, "total": 4},
            "EMBEDDING": {"label": "Processing Content", "step": 3, "total": 4},
            "completed": {"label": "Completed", "step": 4, "total": 4},
            "COMPLETED": {"label": "Completed", "step": 4, "total": 4}
        }
        
        # Safely get enum values
        def get_enum_value(enum_field):
            if enum_field is None:
                return None
            return enum_field.value if hasattr(enum_field, 'value') else str(enum_field)
        
        # Get processing stage as string
        processing_stage_str = get_enum_value(queue_item.processing_stage) or "NOT_STARTED"
        status_str = get_enum_value(queue_item.status) or "PENDING"
        
        # Override stage to "COMPLETED" if status is COMPLETED
        if status_str.upper() == "COMPLETED":
            processing_stage_str = "COMPLETED"
        
        logger.debug(f"Queue {queue_id}: status='{status_str}', stage='{processing_stage_str}', progress={queue_item.progress_percentage}, is_complete={status_str.upper() in ['COMPLETED', 'FAILED']}")
        logger.debug(f"Queue {queue_id}: crawled_urls count={len(queue_item.crawled_urls) if queue_item.crawled_urls else 0}")
        logger.debug(f"Queue {queue_id}: crawled_urls raw value: {queue_item.crawled_urls}")
        
        current_stage = stage_info.get(processing_stage_str, 
                                     {"label": "Processing", "step": 1, "total": 4})
        
        # Calculate overall progress based on stage and percentage
        if status_str.upper() == "COMPLETED":
            overall_progress = 100.0
        else:
            stage_weight = (current_stage["step"] - 1) / current_stage["total"] * 100
            stage_progress = (queue_item.progress_percentage or 0) / current_stage["total"]
            overall_progress = min(100, stage_weight + stage_progress)
        
        # Get crawled URLs information
        crawled_urls_info = _get_crawled_urls_info(queue_item.crawled_urls)
        
        return {
            "queue_id": queue_item.id,
            "status": status_str,
            "processing_stage": processing_stage_str,
            "progress_percentage": queue_item.progress_percentage or 0,
            "overall_progress": round(overall_progress, 1),
            "current_stage": current_stage,
            "source": queue_item.source,
            "total_items": queue_item.total_items or 0,
            "processed_items": queue_item.processed_items or 0,
            "created_at": queue_item.created_at.isoformat() if queue_item.created_at else None,
            "updated_at": queue_item.updated_at.isoformat() if queue_item.updated_at else None,
            "crawled_url": crawled_urls_info["latest_url"],
            "crawled_urls": crawled_urls_info["all_urls"],
            "crawled_count": crawled_urls_info["count"],
            "is_complete": status_str.upper() in ["COMPLETED", "FAILED"],
            "error_message": getattr(queue_item, 'error_message', None)
        }
        
    except Exception as e:
        logger.error(f"Error getting progress for queue {queue_id}: {str(e)}")
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

        # Update vector database filters and meta_data to include the new agent_id
        if knowledge.table_name and knowledge.schema:
            # Get existing records for this knowledge source
            query = text(f"""
                SELECT DISTINCT name, filters, meta_data 
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
                
                # Update meta_data for all records of this knowledge source
                # We need to update each record individually since meta_data can vary per chunk
                agent_ids_json = json.dumps(agent_ids)
                new_filters_json = json.dumps(new_filters)
                
                # Use direct string substitution for JSON values (safe because they're JSON-serialized)
                # and parameterized query for the source name
                update_meta_query = text(f"""
                    UPDATE {knowledge.schema}."{knowledge.table_name}"
                    SET 
                        filters = '{new_filters_json}'::jsonb,
                        meta_data = CASE 
                            WHEN meta_data IS NULL THEN 
                                jsonb_build_object('agent_id', '{agent_ids_json}'::jsonb)
                            WHEN meta_data ? 'agent_id' THEN
                                jsonb_set(
                                    meta_data, 
                                    '{{agent_id}}', 
                                    '{agent_ids_json}'::jsonb
                                )
                            ELSE 
                                meta_data || jsonb_build_object('agent_id', '{agent_ids_json}'::jsonb)
                        END
                    WHERE name = :source
                """)

                db.execute(update_meta_query, {
                    "source": knowledge.source
                })
                db.commit()
                
                logger.info(f"Updated vector database filters and meta_data for knowledge source: {knowledge.source}, added agent_id: {agent_uuid}")

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

        # Update vector database filters and meta_data to remove the agent_id
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
                
                # Update both filters and meta_data in the vector database
                agent_ids_json = json.dumps(agent_ids)
                new_filters_json = json.dumps(new_filters)
                
                # Use direct string substitution for JSON values (safe because they're JSON-serialized)
                # and parameterized query for the source name
                update_query = text(f"""
                    UPDATE {knowledge.schema}."{knowledge.table_name}"
                    SET 
                        filters = '{new_filters_json}'::jsonb,
                        meta_data = CASE 
                            WHEN meta_data IS NULL THEN 
                                NULL
                            WHEN meta_data ? 'agent_id' THEN
                                jsonb_set(
                                    meta_data, 
                                    '{{agent_id}}', 
                                    '{agent_ids_json}'::jsonb
                                )
                            ELSE 
                                meta_data
                        END
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


@router.get("/queue/agent/{agent_id}")
async def get_agent_queue_items(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all queue items (pending, processing, failed) for an agent"""
    try:
        # Convert agent_id to UUID
        try:
            agent_uuid = UUID(agent_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid agent ID format")

        logger.debug(f"Getting queue items for agent {agent_uuid}")
        queue_repo = KnowledgeQueueRepository(db)

        # Get queue items for this agent (excluding completed ones)
        queue_items = db.query(KnowledgeQueue).filter(
            KnowledgeQueue.agent_id == agent_uuid,
            KnowledgeQueue.organization_id == current_user.organization_id,
            KnowledgeQueue.status.in_([QueueStatus.PENDING, QueueStatus.PROCESSING, QueueStatus.FAILED])
        ).order_by(KnowledgeQueue.created_at.desc()).all()

        result = []
        for item in queue_items:
            # Safely get enum values
            def get_enum_value(enum_field):
                if enum_field is None:
                    return None
                return enum_field.value if hasattr(enum_field, 'value') else str(enum_field)

            result.append({
                "id": item.id,
                "source": item.source,
                "source_type": item.source_type,
                "status": get_enum_value(item.status),
                "error": item.error,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None,
                "processing_stage": get_enum_value(item.processing_stage),
                "progress_percentage": item.progress_percentage or 0
            })

        return {"queue_items": result}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting queue items for agent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/queue/{queue_id}")
async def delete_queue_item(
    queue_id: int,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Delete a queue item (only if failed or pending)"""
    try:
        queue_repo = KnowledgeQueueRepository(db)
        item = queue_repo.get_by_id(queue_id)
        
        if not item:
            raise HTTPException(status_code=404, detail="Queue item not found")
            
        if item.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        # Only allow deleting failed or pending items
        # We might want to allow deleting processing items if they are stuck, but let's be safe for now
        if item.status not in [QueueStatus.FAILED, QueueStatus.PENDING]:
            raise HTTPException(
                status_code=400, 
                detail="Only failed or pending items can be removed from queue"
            )
            
        db.delete(item)
        db.commit()
        
        return {"message": "Queue item deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting queue item: {str(e)}")
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


@router.get("/{knowledge_id}/content")
async def get_knowledge_content(
    knowledge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get knowledge content chunks from vector database"""
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
        
        # Query the vector database for content chunks
        if not knowledge.table_name or not knowledge.schema:
            return {
                "knowledge_id": knowledge_id,
                "source": knowledge.source,
                "chunks": []
            }
        
        try:
            # Get all chunks for this knowledge source
            query = text(f"""
                SELECT 
                    id,
                    content,
                    meta_data,
                    created_at
                FROM {knowledge.schema}."{knowledge.table_name}"
                WHERE name = :source
                ORDER BY created_at ASC
            """)

            
            rows = db.execute(query, {"source": knowledge.source}).fetchall()
            
            chunks = []
            for row in rows:
                chunks.append({
                    "id": row.id,
                    "content": row.content,
                    "metadata": row.meta_data,
                    "created_at": row.created_at.isoformat() if row.created_at else None
                })
            
            return {
                "knowledge_id": knowledge_id,
                "source": knowledge.source,
                "source_type": knowledge.source_type.value,
                "chunks": chunks
            }
            
        except Exception as e:
            logger.error(f"Error querying content for knowledge {knowledge_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error accessing content: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting knowledge content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{knowledge_id}/chunk/{chunk_id:path}")
async def update_chunk_content(
    knowledge_id: int,
    chunk_id: str,
    content: str = Body(..., embed=True),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Update a single chunk's content in vector database"""
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
        
        if not knowledge.table_name or not knowledge.schema:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Knowledge source has no vector database table"
            )
        
        try:
            # Get existing chunk to preserve metadata
            query = text(f"""
                SELECT meta_data
                FROM {knowledge.schema}."{knowledge.table_name}"
                WHERE id = :chunk_id
            """)
            row = db.execute(query, {"chunk_id": chunk_id}).fetchone()
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Chunk not found"
                )
            
            # Re-embed the updated content
            from app.knowledge.knowledge_base import KnowledgeManager
            from agno.document import Document
            
            # Initialize KnowledgeManager for re-embedding
            manager = KnowledgeManager(
                org_id=knowledge.organization_id,
                agent_id=None
            )
            
            # Create document with new content
            doc = Document(
                name=knowledge.source,
                id=chunk_id,
                content=content,
                meta_data=row.meta_data
            )
            
            # Embed the document using the vector_db's embedder
            doc.embed(embedder=manager.vector_db.embedder)
            
            # Update the chunk in the database
            update_query = text(f"""
                UPDATE {knowledge.schema}."{knowledge.table_name}"
                SET content = :content,
                    embedding = :embedding
                WHERE id = :chunk_id
            """)
            
            db.execute(update_query, {
                "content": content,
                "embedding": doc.embedding,
                "chunk_id": chunk_id
            })
            db.commit()
            
            logger.info(f"Updated chunk {chunk_id} for knowledge {knowledge_id}")
            
            return {"message": "Chunk updated successfully"}
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating chunk {chunk_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating chunk: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating chunk: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{knowledge_id}/chunk/{chunk_id:path}")
async def delete_chunk(
    knowledge_id: int,
    chunk_id: str,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Delete a single chunk from vector database"""
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
        
        if not knowledge.table_name or not knowledge.schema:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Knowledge source has no vector database table"
            )
        
        try:
            # Delete the chunk from the database
            delete_query = text(f"""
                DELETE FROM {knowledge.schema}."{knowledge.table_name}"
                WHERE id = :chunk_id
            """)
            
            result = db.execute(delete_query, {"chunk_id": chunk_id})
            db.commit()
            
            if result.rowcount == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Chunk not found"
                )
            
            logger.info(f"Deleted chunk {chunk_id} from knowledge {knowledge_id}")
            
            return {"message": "Chunk deleted successfully"}
            
        except HTTPException:
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting chunk {chunk_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting chunk: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chunk: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{knowledge_id}/subpage")
async def add_subpage(
    knowledge_id: int,
    subpage_name: str = Body(..., embed=True),
    content: str = Body(..., embed=True),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Add a new subpage to existing knowledge"""
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
        
        if not knowledge.table_name or not knowledge.schema:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Knowledge source has no vector database table"
            )
        
        # Check subscription limits if enterprise module is available
        if HAS_ENTERPRISE:
            try:
                from app.enterprise.repositories.subscription import SubscriptionRepository

                subscription_repo = SubscriptionRepository(db)
                subscription = subscription_repo.get_active_subscription(str(knowledge.organization_id))

                if subscription and subscription.plan:
                    # Count existing subpages for this knowledge source
                    count_query = text(f"""
                        SELECT COUNT(*) as count
                        FROM {knowledge.schema}."{knowledge.table_name}"
                        WHERE name = :source
                    """)
                    result = db.execute(count_query, {"source": knowledge.source}).fetchone()
                    current_count = result.count if result else 0

                    # Check against max_sub_pages limit from the plan
                    subpages_limit = subscription.plan.max_sub_pages

                    if current_count >= subpages_limit:
                        raise HTTPException(
                            status_code=status.HTTP_402_PAYMENT_REQUIRED,
                            detail=f"Subpage limit reached. Your plan allows {subpages_limit} subpages per knowledge source. Please upgrade your plan."
                        )
            except ImportError:
                # Enterprise module not available, skip limit check
                pass
        
        try:
            # Check if subpage name already exists
            check_query = text(f"""
                SELECT id FROM {knowledge.schema}."{knowledge.table_name}"
                WHERE id = :subpage_name
            """)
            existing = db.execute(check_query, {"subpage_name": subpage_name}).fetchone()
            
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Subpage name already exists. Please use a unique name."
                )
            
            # Create and embed the new subpage
            from app.knowledge.knowledge_base import KnowledgeManager
            from agno.document import Document
            
            # Initialize KnowledgeManager for embedding
            manager = KnowledgeManager(
                org_id=knowledge.organization_id,
                agent_id=None
            )
            
            # Get agent_ids for metadata
            agent_ids = [str(link.agent_id) for link in knowledge.agent_links]
            
            # Create document with new content
            doc = Document(
                name=knowledge.source,
                id=subpage_name,
                content=content,
                meta_data={"agent_id": agent_ids}
            )
            
            # Embed the document using the vector_db's embedder
            doc.embed(embedder=manager.vector_db.embedder)
            
            # Insert into vector database
            filters = {
                "name": knowledge.source,
                "agent_id": agent_ids,
                "org_id": str(knowledge.organization_id)
            }
            
            manager.vector_db.insert([doc], filters=filters)
            
            logger.info(f"Added new subpage '{subpage_name}' to knowledge {knowledge_id}")
            
            return {"message": "Subpage added successfully", "subpage_id": subpage_name}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error adding subpage: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error adding subpage: {str(e)}"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding subpage: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


