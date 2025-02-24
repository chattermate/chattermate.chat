"""
ChatterMate - Analytics API
Copyright (C) 2024 ChatterMate
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user, require_permissions
from app.models import User
from datetime import datetime, timedelta
from sqlalchemy import func
from app.models.chat_history import ChatHistory
from app.models.knowledge import Knowledge
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.models.agent import Agent
from typing import Optional
from app.core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

def get_time_range_dates(time_range: str) -> tuple[datetime, datetime]:
    """Get start and end dates based on time range"""
    end_date = datetime.utcnow()
    
    if time_range == '24h':
        start_date = end_date - timedelta(days=1)
    elif time_range == '7d':
        start_date = end_date - timedelta(days=7)
    elif time_range == '30d':
        start_date = end_date - timedelta(days=30)
    else:  # 90d
        start_date = end_date - timedelta(days=90)
    
    return start_date, end_date

def get_interval(time_range: str) -> str:
    """Get SQL interval based on time range"""
    if time_range == '24h':
        return 'hour'
    elif time_range == '7d':
        return 'day'
    elif time_range == '30d':
        return 'day'
    else:  # 90d
        return 'week'

@router.get("")
async def get_analytics(
    time_range: str = Query('7d', regex='^(24h|7d|30d|90d)$'),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions("view_analytics"))
):
    """Get analytics data for the organization"""
    try:
        start_date, end_date = get_time_range_dates(time_range)
        interval = get_interval(time_range)
        org_id = current_user.organization_id

        # Get conversation metrics
        conversations_query = db.query(
            func.count(ChatHistory.id).label('total'),
            func.date_trunc(interval, ChatHistory.created_at).label('period')
        ).filter(
            ChatHistory.organization_id == org_id,
            ChatHistory.created_at.between(start_date, end_date)
        ).group_by('period').order_by('period')

        conversations = conversations_query.all()
        
        # Get previous period data for comparison
        prev_start = start_date - (end_date - start_date)
        prev_total = db.query(func.count(ChatHistory.id)).filter(
            ChatHistory.organization_id == org_id,
            ChatHistory.created_at.between(prev_start, start_date)
        ).scalar() or 0

        current_total = sum(c.total for c in conversations)
        conv_change = ((current_total - prev_total) / prev_total * 100) if prev_total > 0 else 0

        # Get user activity
        active_users_query = db.query(
            func.count(func.distinct(ChatHistory.user_id)).label('total'),
            func.date_trunc(interval, ChatHistory.created_at).label('period')
        ).filter(
            ChatHistory.organization_id == org_id,
            ChatHistory.created_at.between(start_date, end_date)
        ).group_by('period').order_by('period')

        active_users = active_users_query.all()
        
        current_active = sum(u.total for u in active_users)
        prev_active = db.query(
            func.count(func.distinct(ChatHistory.user_id))
        ).filter(
            ChatHistory.organization_id == org_id,
            ChatHistory.created_at.between(prev_start, start_date)
        ).scalar() or 0

        users_change = ((current_active - prev_active) / prev_active * 100) if prev_active > 0 else 0

        # Get active agents count
        active_agents = db.query(Agent).filter(
            Agent.organization_id == org_id,
            Agent.is_active == True
        ).count()

        return {
            "conversations": {
                "total": current_total,
                "change": conv_change,
                "trend": "up" if conv_change >= 0 else "down",
                "data": [r.total for r in conversations],
                "labels": [r.period.strftime("%Y-%m-%d") for r in conversations]
            },
            "users": {
                "active": current_active,
                "change": users_change,
                "trend": "up" if users_change >= 0 else "down",
                "data": [u.total for u in active_users],
                "labels": [u.period.strftime("%Y-%m-%d") for u in active_users]
            },
            "activeAgents": {
                "active": active_agents,
                "change": 0,
                "trend": "up",
                "data": [active_agents],
                "labels": [datetime.now().strftime("%Y-%m-%d")]
            }
        }
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        raise 