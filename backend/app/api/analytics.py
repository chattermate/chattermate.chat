"""
ChatterMate - Analytics API
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

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user, require_permissions
from app.models.user import User
from app.models.agent import Agent
from app.models.customer import Customer
from app.models.rating import Rating
from app.models.session_to_agent import SessionToAgent, SessionStatus
from app.models.chat_history import ChatHistory
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_, desc, distinct, case
from typing import Optional, List
from app.core.logger import get_logger
from uuid import UUID

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

@router.get("/agent-performance")
async def get_agent_performance(
    time_range: str = Query('7d', regex='^(24h|7d|30d|90d)$'),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions("view_analytics"))
):
    """Get agent performance analytics data for the organization"""
    try:
        start_date, end_date = get_time_range_dates(time_range)
        org_id = current_user.organization_id

        # Get bot agent performance
        bot_agents_query = db.query(
            Agent.id,
            Agent.name,
            func.count(SessionToAgent.session_id).label('total_chats'),
            func.sum(
                case((SessionToAgent.status == SessionStatus.CLOSED, 1), else_=0)
            ).label('closed_chats'),
            func.avg(Rating.rating).label('avg_rating'),
            func.count(Rating.id).label('rating_count')
        ).outerjoin(
            SessionToAgent, 
            and_(
                SessionToAgent.agent_id == Agent.id,
                SessionToAgent.assigned_at.between(start_date, end_date)
            )
        ).outerjoin(
            Rating,
            and_(
                Rating.session_id == SessionToAgent.session_id,
                Rating.created_at.between(start_date, end_date)
            )
        ).filter(
            Agent.organization_id == org_id
        ).group_by(
            Agent.id
        ).order_by(
            desc('total_chats')
        )

        bot_agents = bot_agents_query.all()

        # Get human agent performance
        human_agents_query = db.query(
            User.id,
            User.full_name.label('name'),
            func.count(SessionToAgent.session_id).label('total_chats'),
            func.sum(
                case((SessionToAgent.status == SessionStatus.CLOSED, 1), else_=0)
            ).label('closed_chats'),
            func.avg(Rating.rating).label('avg_rating'),
            func.count(Rating.id).label('rating_count')
        ).outerjoin(
            SessionToAgent, 
            and_(
                SessionToAgent.user_id == User.id,
                SessionToAgent.assigned_at.between(start_date, end_date)
            )
        ).outerjoin(
            Rating,
            and_(
                Rating.session_id == SessionToAgent.session_id,
                Rating.created_at.between(start_date, end_date)
            )
        ).filter(
            User.organization_id == org_id
        ).group_by(
            User.id
        ).order_by(
            desc('total_chats')
        )

        human_agents = human_agents_query.all()

        # Format the results
        bot_results = []
        for agent in bot_agents:
            bot_results.append({
                "id": str(agent.id),
                "name": agent.name,
                "total_chats": agent.total_chats,
                "closed_chats": agent.closed_chats,
                "avg_rating": float(agent.avg_rating) if agent.avg_rating else 0,
                "rating_count": agent.rating_count
            })

        human_results = []
        for agent in human_agents:
            human_results.append({
                "id": str(agent.id),
                "name": agent.name or "Unknown User",
                "total_chats": agent.total_chats,
                "closed_chats": agent.closed_chats,
                "avg_rating": float(agent.avg_rating) if agent.avg_rating else 0,
                "rating_count": agent.rating_count
            })

        return {
            "bot_agents": bot_results,
            "human_agents": human_results,
            "time_range": time_range
        }
    except Exception as e:
        logger.error(f"Error getting agent performance analytics: {str(e)}")
        raise

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
            func.count(SessionToAgent.session_id).label('total'),
            func.date_trunc(interval, SessionToAgent.assigned_at).label('period')
        ).filter(
            SessionToAgent.organization_id == org_id,
            SessionToAgent.assigned_at.between(start_date, end_date)
        ).group_by('period').order_by('period')

        conversations = conversations_query.all()
        
        # Get previous period data for comparison
        prev_start = start_date - (end_date - start_date)
        prev_total = db.query(func.count(SessionToAgent.session_id)).filter(
            SessionToAgent.organization_id == org_id,
            SessionToAgent.assigned_at.between(prev_start, start_date)
        ).scalar() or 0

        current_total = sum(c.total for c in conversations)
        conv_change = ((current_total - prev_total) / prev_total * 100) if prev_total > 0 else 0

        # Get AI chat closures
        ai_closures_query = db.query(
            func.count(SessionToAgent.session_id).label('total'),
            func.date_trunc(interval, SessionToAgent.updated_at).label('period')
        ).filter(
            SessionToAgent.organization_id == org_id,
            SessionToAgent.updated_at.between(start_date, end_date),
            SessionToAgent.status == SessionStatus.CLOSED,
            SessionToAgent.user_id == None  # AI closures have no user_id
        ).group_by('period').order_by('period')

        ai_closures = ai_closures_query.all()
        
        current_ai_closures = sum(c.total for c in ai_closures)
        prev_ai_closures = db.query(func.count(SessionToAgent.session_id)).filter(
            SessionToAgent.organization_id == org_id,
            SessionToAgent.updated_at.between(prev_start, start_date),
            SessionToAgent.status == SessionStatus.CLOSED,
            SessionToAgent.user_id == None
        ).scalar() or 0

        ai_closures_change = ((current_ai_closures - prev_ai_closures) / prev_ai_closures * 100) if prev_ai_closures > 0 else 0

        # Get human transfers
        transfers_query = db.query(
            func.count(SessionToAgent.session_id).label('total'),
            func.date_trunc(interval, SessionToAgent.updated_at).label('period')
        ).filter(
            SessionToAgent.organization_id == org_id,
            SessionToAgent.updated_at.between(start_date, end_date),
            SessionToAgent.user_id != None  # Human transfers have a user_id
        ).group_by('period').order_by('period')

        transfers = transfers_query.all()
        
        current_transfers = sum(t.total for t in transfers)
        prev_transfers = db.query(func.count(SessionToAgent.session_id)).filter(
            SessionToAgent.organization_id == org_id,
            SessionToAgent.updated_at.between(prev_start, start_date),
            SessionToAgent.user_id != None  # Human transfers have a user_id
        ).scalar() or 0

        transfers_change = ((current_transfers - prev_transfers) / prev_transfers * 100) if prev_transfers > 0 else 0

        # Get bot ratings
        bot_ratings_query = db.query(
            func.avg(Rating.rating).label('avg_rating'),
            func.count(Rating.id).label('total'),
            func.date_trunc(interval, Rating.created_at).label('period')
        ).join(
            SessionToAgent, Rating.session_id == SessionToAgent.session_id
        ).filter(
            Rating.organization_id == org_id,
            Rating.created_at.between(start_date, end_date),
            SessionToAgent.user_id == None  # Bot sessions have no user_id
        ).group_by('period').order_by('period')

        bot_ratings = bot_ratings_query.all()

        # Get human ratings
        human_ratings_query = db.query(
            func.avg(Rating.rating).label('avg_rating'),
            func.count(Rating.id).label('total'),
            func.date_trunc(interval, Rating.created_at).label('period')
        ).join(
            SessionToAgent, Rating.session_id == SessionToAgent.session_id
        ).filter(
            Rating.organization_id == org_id,
            Rating.created_at.between(start_date, end_date),
            SessionToAgent.user_id != None  # Human sessions have a user_id
        ).group_by('period').order_by('period')

        human_ratings = human_ratings_query.all()

        # Calculate rating averages and changes
        current_bot_avg = db.query(func.avg(Rating.rating)).join(
            SessionToAgent, Rating.session_id == SessionToAgent.session_id
        ).filter(
            Rating.organization_id == org_id,
            Rating.created_at.between(start_date, end_date),
            SessionToAgent.user_id == None
        ).scalar() or 0

        prev_bot_avg = db.query(func.avg(Rating.rating)).join(
            SessionToAgent, Rating.session_id == SessionToAgent.session_id
        ).filter(
            Rating.organization_id == org_id,
            Rating.created_at.between(prev_start, start_date),
            SessionToAgent.user_id == None
        ).scalar() or 0

        current_human_avg = db.query(func.avg(Rating.rating)).join(
            SessionToAgent, Rating.session_id == SessionToAgent.session_id
        ).filter(
            Rating.organization_id == org_id,
            Rating.created_at.between(start_date, end_date),
            SessionToAgent.user_id != None
        ).scalar() or 0

        prev_human_avg = db.query(func.avg(Rating.rating)).join(
            SessionToAgent, Rating.session_id == SessionToAgent.session_id
        ).filter(
            Rating.organization_id == org_id,
            Rating.created_at.between(prev_start, start_date),
            SessionToAgent.user_id != None
        ).scalar() or 0

        # Calculate rating counts
        bot_count = db.query(func.count(Rating.id)).join(
            SessionToAgent, Rating.session_id == SessionToAgent.session_id
        ).filter(
            Rating.organization_id == org_id,
            SessionToAgent.user_id == None
        ).scalar() or 0

        human_count = db.query(func.count(Rating.id)).join(
            SessionToAgent, Rating.session_id == SessionToAgent.session_id
        ).filter(
            Rating.organization_id == org_id,
            SessionToAgent.user_id != None
        ).scalar() or 0

        # Calculate rating changes
        bot_change = ((current_bot_avg - prev_bot_avg) / prev_bot_avg * 100) if prev_bot_avg > 0 else 0
        human_change = ((current_human_avg - prev_human_avg) / prev_human_avg * 100) if prev_human_avg > 0 else 0

        return {
            "conversations": {
                "total": current_total,
                "change": conv_change,
                "trend": "up" if conv_change >= 0 else "down",
                "data": [r.total for r in conversations],
                "labels": [r.period.strftime("%Y-%m-%d") for r in conversations]
            },
            "aiClosures": {
                "total": current_ai_closures,
                "change": ai_closures_change,
                "trend": "up" if ai_closures_change >= 0 else "down",
                "data": [r.total for r in ai_closures],
                "labels": [r.period.strftime("%Y-%m-%d") for r in ai_closures]
            },
            "transfers": {
                "total": current_transfers,
                "change": transfers_change,
                "trend": "up" if transfers_change >= 0 else "down",
                "data": [r.total for r in transfers],
                "labels": [r.period.strftime("%Y-%m-%d") for r in transfers]
            },
            "ratings": {
                "bot": {
                    "data": [float(r.avg_rating or 0) for r in bot_ratings],
                    "labels": [r.period.strftime("%Y-%m-%d") for r in bot_ratings],
                    "change": bot_change,
                    "trend": "up" if bot_change >= 0 else "down"
                },
                "human": {
                    "data": [float(r.avg_rating or 0) for r in human_ratings],
                    "labels": [r.period.strftime("%Y-%m-%d") for r in human_ratings],
                    "change": human_change,
                    "trend": "up" if human_change >= 0 else "down"
                },
                "bot_avg": float(current_bot_avg),
                "human_avg": float(current_human_avg),
                "bot_count": bot_count,
                "human_count": human_count,
                "bot_change": bot_change,
                "human_change": human_change,
                "bot_trend": "up" if bot_change >= 0 else "down",
                "human_trend": "up" if human_change >= 0 else "down"
            }
        }
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        raise 

@router.get("/customer-analytics")
async def get_customer_analytics(
    time_range: str = Query('7d', pattern='^(24h|7d|30d|90d)$'),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions("view_analytics"))
):
    """Get customer analytics data for the organization"""
    try:
        start_date, end_date = get_time_range_dates(time_range)
        org_id = current_user.organization_id

        # Get base customer query
        customer_query = db.query(
            Customer.id,
            Customer.email,
            Customer.full_name,
            func.count(func.distinct(SessionToAgent.session_id)).label('total_chats'),
            func.max(SessionToAgent.assigned_at).label('last_interaction'),
            func.avg(Rating.rating).label('avg_rating'),
            func.count(Rating.id).label('rating_count')
        ).outerjoin(
            SessionToAgent, 
            and_(
                Customer.id == SessionToAgent.customer_id,
                SessionToAgent.assigned_at.between(start_date, end_date)
            )
        ).outerjoin(
            Rating,
            and_(
                Rating.customer_id == Customer.id,
                Rating.organization_id == Customer.organization_id
            )
        ).filter(
            Customer.organization_id == org_id
        ).group_by(
            Customer.id
        ).order_by(
            Customer.created_at.desc()
        )

        # Get total count for pagination
        total_count = customer_query.count()
        
        # Apply pagination
        customers = customer_query.offset((page - 1) * page_size).limit(page_size).all()

        result = []
        for customer in customers:
            result.append({
                "id": str(customer.id),
                "email": customer.email,
                "full_name": customer.full_name,
                "total_chats": customer.total_chats,
                "last_interaction": customer.last_interaction.isoformat() if customer.last_interaction else None,
                "avg_rating": float(customer.avg_rating) if customer.avg_rating else 0,
                "rating_count": customer.rating_count
            })

        return {
            "customers": result,
            "time_range": time_range,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": (total_count + page_size - 1) // page_size
            }
        }
    except Exception as e:
        logger.error(f"Error getting customer analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting customer analytics: {str(e)}")

@router.get("/customer-details/{customer_id}")
async def get_customer_details(
    customer_id: UUID,
    time_range: str = Query('7d', regex='^(24h|7d|30d|90d)$'),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions("view_analytics"))
):
    """Get detailed information about a specific customer"""
    try:
        start_date, end_date = get_time_range_dates(time_range)
        org_id = current_user.organization_id

        # Verify customer belongs to organization
        customer = db.query(Customer).filter(
            Customer.id == customer_id,
            Customer.organization_id == org_id
        ).first()

        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        # Get customer feedback
        feedback_query = db.query(
            Rating.rating,
            Rating.feedback,
            Rating.created_at,
            Agent.name.label('agent_name'),
            User.full_name.label('user_name')
        ).join(
            SessionToAgent, Rating.session_id == SessionToAgent.session_id
        ).outerjoin(
            Agent, SessionToAgent.agent_id == Agent.id
        ).outerjoin(
            User, SessionToAgent.user_id == User.id
        ).filter(
            Rating.customer_id == customer_id,
            Rating.organization_id == org_id
        ).order_by(
            desc(Rating.created_at)
        )

        feedback = feedback_query.all()

        # Format the results
        feedback_results = []
        for item in feedback:
            agent_name = item.agent_name
            if item.user_name:  # If handled by a human agent
                agent_name = item.user_name
                
            feedback_results.append({
                "rating": item.rating,
                "feedback": item.feedback,
                "created_at": item.created_at.isoformat(),
                "agent_name": agent_name
            })

        return {
            "feedback": feedback_results
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting customer details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sentiment")
async def get_sentiment_analytics(
    time_range: str = Query('7d', regex='^(24h|7d|30d|90d)$'),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions("view_analytics"))
):
    """Get sentiment distribution and trends for the organization"""
    try:
        start_date, end_date = get_time_range_dates(time_range)
        interval = get_interval(time_range)
        org_id = current_user.organization_id

        # Sentiment distribution (counts of positive/neutral/negative)
        distribution = db.query(
            ChatHistory.sentiment_label,
            func.count(ChatHistory.id).label('count')
        ).filter(
            ChatHistory.organization_id == org_id,
            ChatHistory.created_at.between(start_date, end_date),
            ChatHistory.message_type == 'user',
            ChatHistory.sentiment_label.isnot(None)
        ).group_by(
            ChatHistory.sentiment_label
        ).all()

        dist_dict = {"positive": 0, "neutral": 0, "negative": 0}
        for row in distribution:
            if row.sentiment_label in dist_dict:
                dist_dict[row.sentiment_label] = row.count

        total_analyzed = sum(dist_dict.values())

        # Sentiment trend over time
        trend = db.query(
            func.date_trunc(interval, ChatHistory.created_at).label('period'),
            func.avg(ChatHistory.sentiment_score).label('avg_score'),
            func.count(ChatHistory.id).label('message_count')
        ).filter(
            ChatHistory.organization_id == org_id,
            ChatHistory.created_at.between(start_date, end_date),
            ChatHistory.message_type == 'user',
            ChatHistory.sentiment_score.isnot(None)
        ).group_by('period').order_by('period').all()

        # Average sentiment score
        avg_score = db.query(
            func.avg(ChatHistory.sentiment_score)
        ).filter(
            ChatHistory.organization_id == org_id,
            ChatHistory.created_at.between(start_date, end_date),
            ChatHistory.message_type == 'user',
            ChatHistory.sentiment_score.isnot(None)
        ).scalar() or 0.0

        # Previous period comparison
        prev_start = start_date - (end_date - start_date)
        prev_avg = db.query(
            func.avg(ChatHistory.sentiment_score)
        ).filter(
            ChatHistory.organization_id == org_id,
            ChatHistory.created_at.between(prev_start, start_date),
            ChatHistory.message_type == 'user',
            ChatHistory.sentiment_score.isnot(None)
        ).scalar() or 0.0

        score_change = ((float(avg_score) - float(prev_avg)) / abs(float(prev_avg)) * 100) if prev_avg else 0.0

        # Sessions with negative sentiment (for agent attention)
        negative_sessions = db.query(
            SessionToAgent.session_id,
            SessionToAgent.sentiment_label,
            SessionToAgent.sentiment_score,
            SessionToAgent.status
        ).filter(
            SessionToAgent.organization_id == org_id,
            SessionToAgent.assigned_at.between(start_date, end_date),
            SessionToAgent.sentiment_label == 'negative'
        ).order_by(
            SessionToAgent.sentiment_score.asc()
        ).limit(10).all()

        return {
            "distribution": dist_dict,
            "total_analyzed": total_analyzed,
            "avg_score": round(float(avg_score), 4),
            "score_change": round(score_change, 2),
            "score_trend": "up" if score_change >= 0 else "down",
            "trend": {
                "data": [round(float(r.avg_score or 0), 4) for r in trend],
                "labels": [r.period.strftime("%Y-%m-%d") for r in trend],
                "message_counts": [r.message_count for r in trend]
            },
            "negative_sessions": [
                {
                    "session_id": str(s.session_id),
                    "sentiment_label": s.sentiment_label,
                    "sentiment_score": round(float(s.sentiment_score), 4) if s.sentiment_score else None,
                    "status": s.status
                }
                for s in negative_sessions
            ],
            "time_range": time_range
        }
    except Exception as e:
        logger.error(f"Error getting sentiment analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting sentiment analytics: {str(e)}")


@router.get("/session-sentiment/{session_id}")
async def get_session_sentiment(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions("view_analytics"))
):
    """Get sentiment breakdown for a specific session"""
    try:
        org_id = current_user.organization_id

        # Verify session belongs to organization
        session = db.query(SessionToAgent).filter(
            SessionToAgent.session_id == session_id,
            SessionToAgent.organization_id == org_id
        ).first()

        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Get per-message sentiment for customer messages
        messages = db.query(
            ChatHistory.id,
            ChatHistory.message,
            ChatHistory.sentiment_label,
            ChatHistory.sentiment_score,
            ChatHistory.created_at
        ).filter(
            ChatHistory.session_id == session_id,
            ChatHistory.message_type == 'user',
            ChatHistory.sentiment_label.isnot(None)
        ).order_by(
            ChatHistory.created_at.asc()
        ).all()

        return {
            "session_id": str(session_id),
            "overall_sentiment": {
                "label": session.sentiment_label,
                "score": round(float(session.sentiment_score), 4) if session.sentiment_score else None
            },
            "messages": [
                {
                    "id": m.id,
                    "message": m.message[:200] if m.message else None,  # Truncate for privacy
                    "sentiment_label": m.sentiment_label,
                    "sentiment_score": round(float(m.sentiment_score), 4) if m.sentiment_score else None,
                    "created_at": m.created_at.isoformat()
                }
                for m in messages
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session sentiment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))