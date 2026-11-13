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

"""Editing and deleting a knowledge source's chunks and pages.

Chunk and page ids are usually URLs ("https://site.com/pricing::1"). Sent as a
path segment they break behind reverse proxies that decode %2F and merge "//"
(nginx does both by default), so the id arrives mangled and nothing matches.
The query-string routes carry the id safely; the path routes stay for ids
without slashes and for existing API callers.
"""

from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import require_permissions
from app.core.logger import get_logger
from app.core.params import DbIntId
from app.database import get_db
from app.knowledge import page_editor
from app.models.knowledge import Knowledge
from app.models.user import User
from app.repositories.knowledge import KnowledgeRepository

router = APIRouter()
logger = get_logger(__name__)

_CHUNK_ID_QUERY = Query(..., min_length=1, description="Chunk id, e.g. https://site.com/pricing::1")
_PAGE_ID_QUERY = Query(..., min_length=1, description="Page id, e.g. https://site.com/pricing")


def _require_text(content: str, what: str) -> None:
    """Refuse blank content: an empty chunk or page answers nothing."""
    if not (content or "").strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{what} content cannot be empty"
        )


def _require_editable_knowledge(
    db: Session, knowledge_id: int, current_user: User
) -> Knowledge:
    """Load a knowledge source, enforcing ownership and a usable vector table.

    Raises 404 if missing, 403 if it belongs to another org, 400 if it has no
    vector table yet (e.g. a crawl that has not produced any rows).
    """
    knowledge = KnowledgeRepository(db).get_by_id(knowledge_id)
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
    return knowledge


def _update_chunk(
    db: Session, knowledge_id: int, chunk_id: str, content: str, current_user: User
) -> dict:
    """Re-embed one chunk of a source with new content."""
    _require_text(content, "Chunk")
    knowledge = _require_editable_knowledge(db, knowledge_id, current_user)
    try:
        # Checked before embedding so a wrong id costs no embedder call; the
        # update's own row count covers a chunk deleted while embedding.
        if not page_editor.chunk_exists(db, knowledge, chunk_id) or \
                page_editor.reembed_chunk(db, knowledge, chunk_id, content) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chunk not found"
            )
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating chunk {chunk_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating chunk"
        )
    logger.info(f"Updated chunk {chunk_id} for knowledge {knowledge_id}")
    return {"message": "Chunk updated successfully"}


def _delete_chunk(
    db: Session, knowledge_id: int, chunk_id: str, current_user: User
) -> dict:
    """Delete one chunk of a source."""
    knowledge = _require_editable_knowledge(db, knowledge_id, current_user)
    try:
        removed = page_editor.delete_chunk(db, knowledge, chunk_id)
        if removed == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chunk not found"
            )
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting chunk {chunk_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting chunk"
        )
    logger.info(f"Deleted chunk {chunk_id} from knowledge {knowledge_id}")
    return {"message": "Chunk deleted successfully"}


@router.put("/{knowledge_id}/chunk")
def update_chunk_by_query(
    knowledge_id: DbIntId,
    chunk_id: str = _CHUNK_ID_QUERY,
    content: str = Body(..., embed=True),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Update a single chunk's content; the id travels in the query string."""
    return _update_chunk(db, knowledge_id, chunk_id, content, current_user)


@router.delete("/{knowledge_id}/chunk")
def delete_chunk_by_query(
    knowledge_id: DbIntId,
    chunk_id: str = _CHUNK_ID_QUERY,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Delete a single chunk; the id travels in the query string."""
    return _delete_chunk(db, knowledge_id, chunk_id, current_user)


@router.put("/{knowledge_id}/chunk/{chunk_id:path}")
def update_chunk_content(
    knowledge_id: DbIntId,
    chunk_id: str,
    content: str = Body(..., embed=True),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Update a single chunk's content (path form; ids without slashes only)."""
    return _update_chunk(db, knowledge_id, chunk_id, content, current_user)


@router.delete("/{knowledge_id}/chunk/{chunk_id:path}")
def delete_chunk(
    knowledge_id: DbIntId,
    chunk_id: str,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Delete a single chunk (path form; ids without slashes only)."""
    return _delete_chunk(db, knowledge_id, chunk_id, current_user)




def _update_page(
    db: Session,
    knowledge_id: int,
    page_id: str,
    content: str,
    title: Optional[str],
    current_user: User,
) -> dict:
    """Replace a sub-page's content and re-embed it.

    A page may span several chunks; this re-chunks the new content under the
    page id, keeping the source's answers current.
    """
    _require_text(content, "Page")

    knowledge = _require_editable_knowledge(db, knowledge_id, current_user)
    try:
        replaced = page_editor.replace_page(db, knowledge, page_id, content, title)
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating page '{page_id}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating page"
        )
    if replaced == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found"
        )
    logger.info(f"Updated page '{page_id}' for knowledge {knowledge_id}")
    return {"message": "Page updated successfully", "page_id": page_id}


def _delete_page(
    db: Session, knowledge_id: int, page_id: str, current_user: User
) -> dict:
    """Delete a whole sub-page (all of its chunks) from a knowledge source."""
    knowledge = _require_editable_knowledge(db, knowledge_id, current_user)
    try:
        removed = page_editor.delete_page_chunks(db, knowledge, page_id)
        if removed == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Page not found"
            )
        db.commit()
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting page '{page_id}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting page"
        )
    logger.info(
        f"Deleted page '{page_id}' ({removed} chunk(s)) from knowledge {knowledge_id}"
    )
    return {"message": "Page deleted successfully", "removed_chunks": removed}


@router.put("/{knowledge_id}/page")
def update_page_by_query(
    knowledge_id: DbIntId,
    page_id: str = _PAGE_ID_QUERY,
    content: str = Body(..., embed=True),
    title: Optional[str] = Body(None, embed=True),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Replace a sub-page's content; the id travels in the query string."""
    return _update_page(db, knowledge_id, page_id, content, title, current_user)


@router.delete("/{knowledge_id}/page")
def delete_page_by_query(
    knowledge_id: DbIntId,
    page_id: str = _PAGE_ID_QUERY,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Delete a whole sub-page; the id travels in the query string."""
    return _delete_page(db, knowledge_id, page_id, current_user)


@router.put("/{knowledge_id}/page/{page_id:path}")
def update_page_content(
    knowledge_id: DbIntId,
    page_id: str,
    content: str = Body(..., embed=True),
    title: Optional[str] = Body(None, embed=True),
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Replace a sub-page's content (path form; ids without slashes only)."""
    return _update_page(db, knowledge_id, page_id, content, title, current_user)


@router.delete("/{knowledge_id}/page/{page_id:path}")
def delete_page(
    knowledge_id: DbIntId,
    page_id: str,
    current_user: User = Depends(require_permissions("manage_knowledge")),
    db: Session = Depends(get_db)
):
    """Delete a whole sub-page (path form; ids without slashes only)."""
    return _delete_page(db, knowledge_id, page_id, current_user)
