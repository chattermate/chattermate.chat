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

from sqlalchemy.orm import Session
from typing import Any, Dict, Iterable, List, Optional
from app.models.channels import ChannelConversation
from app.models.chat_history import ChatHistory
from app.models.customer import Customer
from uuid import UUID
from sqlalchemy import func, or_, select, text, and_
from sqlalchemy.sql import case
from app.models.agent import Agent
from app.models.session_to_agent import SessionToAgent
from app.repositories import inbox_views
from app.repositories.channels import ChannelConversationRepository
from app.core.logger import get_logger
from app.channels.constants import UNMETERED_SOURCES, is_widget_channel
from app.channels.sent_choices import SENT_CHOICES_ATTRIBUTE, decode_sent_choices
from app.models.user import User
from app.repositories.customer import CustomerRepository
from app.repositories.conversation_notes import ConversationNoteRepository
from sqlalchemy.orm import aliased, joinedload
from sqlalchemy.orm.attributes import set_committed_value
from datetime import datetime, timezone
from pydantic import BaseModel
from app.services.file_storage import resolve_public_url
from app.services.sentiment import analyze_sentiment, compute_session_sentiment

logger = get_logger(__name__)

def _utc_midnight() -> datetime:
    """The start of today in UTC: "today" when the caller sends no day start."""
    return datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)


def _readable_attributes(attributes: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """A message's attributes for the inbox: the encrypted record of the
    choices it was sent with, decrypted."""
    if not attributes or SENT_CHOICES_ATTRIBUTE not in attributes:
        return attributes
    return {**attributes,
            SENT_CHOICES_ATTRIBUTE: decode_sent_choices(attributes[SENT_CHOICES_ATTRIBUTE])}


class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def has_customer_messages(self, session_id: UUID | str) -> bool:
        """Whether the customer has said anything in this session yet.

        The widget opens its session on socket connect, before the visitor
        types, so this is what distinguishes a real new chat from someone
        merely opening the chat window.
        """
        if isinstance(session_id, str):
            session_id = UUID(session_id)
        return self.db.query(ChatHistory.id).filter(
            ChatHistory.session_id == session_id,
            ChatHistory.message_type == 'user'
        ).first() is not None

    def has_message_flag(self, session_id: str, flag: str) -> bool:
        """Whether any message in the session carries this attribute as true."""
        return self.db.query(ChatHistory.id).filter(
            ChatHistory.session_id == UUID(str(session_id)),
            ChatHistory.attributes[flag].as_boolean().is_(True),
        ).first() is not None

    def get_message_count_for_period(
        self,
        org_id: UUID | str,
        start_date: datetime,
        end_date: datetime
    ) -> int:
        """
        Get the total number of bot messages for an organization within a specific date range.
        Only counts messages with message_type='bot', and not ones that cost no
        AI (attributes.source in UNMETERED_SOURCES: an external app, the
        embedding page, a journey step).
        
        Args:
            org_id: Organization ID
            start_date: Start date of the period
            end_date: End date of the period
            
        Returns:
            int: Total number of bot messages in the period
        """
        if isinstance(org_id, str):
            org_id = UUID(org_id)
            
        try:
            # Build filter conditions
            source = ChatHistory.attributes['source'].as_string()
            conditions = [
                ChatHistory.organization_id == org_id,
                ChatHistory.message_type == 'bot',  # Only count bot messages
                # NULL-safe: nearly every row has no source at all
                or_(source.is_(None), source.notin_(UNMETERED_SOURCES)),
            ]
            
            # Add date range conditions if they are not None
            if start_date is not None:
                conditions.append(ChatHistory.created_at >= start_date)
            if end_date is not None:
                conditions.append(ChatHistory.created_at < end_date)
            
            count = self.db.query(func.count(ChatHistory.id))\
                .filter(and_(*conditions))\
                .scalar()
            return count or 0
        except Exception as e:
            logger.error(f"Error getting message count: {str(e)}")
            return 0

    def create_message(self, message_data: Dict[str, Any]) -> ChatHistory:
        """Create a new chat message."""
        try:
            # Convert any Pydantic models in attributes to dict
            if 'attributes' in message_data:
                attributes = message_data['attributes']
                if 'shopify_output' in attributes and attributes['shopify_output'] is not None:
                    if isinstance(attributes['shopify_output'], BaseModel):
                        attributes['shopify_output'] = attributes['shopify_output'].dict()
                    elif isinstance(attributes['shopify_output'], dict):
                        # If it's already a dict, ensure all nested objects are serialized
                        if 'products' in attributes['shopify_output']:
                            products = attributes['shopify_output']['products']
                            attributes['shopify_output']['products'] = [
                                p.dict() if isinstance(p, BaseModel) else p 
                                for p in products
                            ]
            
            # Convert string UUIDs to UUID objects
            for field in ['organization_id', 'user_id', 'customer_id', 'agent_id', 'session_id']:
                if field in message_data and message_data[field] is not None:
                    if isinstance(message_data[field], str):
                        message_data[field] = UUID(message_data[field])

            # Analyze sentiment for customer messages ('user' type)
            if message_data.get('message_type') == 'user' and message_data.get('message'):
                try:
                    label, score = analyze_sentiment(message_data['message'])
                    message_data['sentiment_label'] = label
                    message_data['sentiment_score'] = score
                except Exception as e:
                    logger.error(f"Error analyzing message sentiment: {str(e)}")

            message = ChatHistory(**message_data)
            self.db.add(message)
            self.db.commit()
            self.db.refresh(message)

            # Update session-level sentiment after saving a customer message
            if message_data.get('message_type') == 'user' and message_data.get('session_id'):
                try:
                    self._update_session_sentiment(message_data['session_id'])
                except Exception as e:
                    logger.error(f"Error updating session sentiment: {str(e)}")
                self._wake_snoozed(message_data['session_id'])

            return message
        except Exception as e:
            logger.error(f"Error creating message: {str(e)}")
            self.db.rollback()
            raise

    def update_message_attributes(self, message_id: int, attributes: Dict[str, Any]) -> None:
        """Merge keys into a message's attributes JSON (e.g. delivery_status)."""
        try:
            message = self.db.query(ChatHistory).filter(ChatHistory.id == message_id).first()
            if not message:
                return
            message.attributes = {**(message.attributes or {}), **attributes}
            self.db.commit()
        except Exception as e:
            logger.error(f"Error updating message attributes: {str(e)}")
            self.db.rollback()

    def mark_delivery_failed(self, message_id: int, reason: Optional[str]) -> None:
        """Flag a stored message as never delivered to the customer.

        Sole writer of delivery_status, which therefore only ever holds a
        failure reason — the inbox treats its presence as "not delivered".
        """
        self.update_message_attributes(message_id, {'delivery_status': reason or 'failed'})

    def set_external_message_id(self, message_id: int, external_message_id: str) -> Optional[ChatHistory]:
        """Record the platform's id for a message we sent, so its delivery
        receipts and taps on its choices can find it. Returns the row, or None
        if it is gone. Some platforms (Telegram) number messages per chat:
        look those up within the chat (in_channel_chat_by_external_message_id),
        never organization-wide."""
        try:
            message = self.db.query(ChatHistory).filter(ChatHistory.id == message_id).first()
            if message is None:
                return None
            message.external_message_id = external_message_id
            self.db.commit()
            return message
        except Exception as e:
            logger.error(f"Error setting external message id: {str(e)}")
            self.db.rollback()
            return None

    def get_by_external_message_id(self, organization_id: UUID | str,
                                   external_message_id: str) -> Optional[ChatHistory]:
        """The message a platform id belongs to, within one organization —
        a receipt can never touch another tenant's row."""
        if isinstance(organization_id, str):
            organization_id = UUID(organization_id)
        return (
            self.db.query(ChatHistory)
            .filter(
                ChatHistory.organization_id == organization_id,
                ChatHistory.external_message_id == external_message_id,
            )
            .first()
        )

    def in_channel_chat_by_external_message_id(self, channel_account_id: UUID, external_conversation_id: str,
                                               external_message_id: str) -> Optional[ChatHistory]:
        """The message a platform id belongs to, within one customer's chat on
        one channel account — across its sessions (a chat that closed and
        reopened is a new session), and never another chat's: some platforms
        number messages per chat, not globally."""
        return (
            self._in_channel_chat(channel_account_id, external_conversation_id)
            .filter(ChatHistory.external_message_id == external_message_id)
            .first()
        )

    def latest_replies_in_channel_chat(self, channel_account_id: UUID, external_conversation_id: str,
                                       limit: int) -> List[ChatHistory]:
        """That chat's most recent replies to the customer, the AI's or a
        person's, newest first."""
        return (
            self._in_channel_chat(channel_account_id, external_conversation_id)
            .filter(ChatHistory.message_type.in_(('bot', 'agent')))
            .order_by(ChatHistory.created_at.desc(), ChatHistory.id.desc())
            .limit(limit)
            .all()
        )

    def _in_channel_chat(self, channel_account_id: UUID, external_conversation_id: str):
        return (
            self.db.query(ChatHistory)
            .join(ChannelConversation, ChannelConversation.session_id == ChatHistory.session_id)
            .filter(ChannelConversation.channel_account_id == channel_account_id,
                    ChannelConversation.external_conversation_id == external_conversation_id)
        )

    def advance_channel_status(self, message_id: int, status: str, at: datetime,
                               replaceable: Iterable[str]) -> bool:
        """Set a message's delivery receipt only if it currently has none or
        one of `replaceable` — a single conditional UPDATE, so two receipts
        racing on different workers can't overwrite a newer one with an older.
        Returns whether the row changed."""
        try:
            changed = (
                self.db.query(ChatHistory)
                .filter(
                    ChatHistory.id == message_id,
                    or_(ChatHistory.channel_status.is_(None),
                        ChatHistory.channel_status.in_(list(replaceable))),
                )
                .update({ChatHistory.channel_status: status,
                         ChatHistory.channel_status_at: at},
                        synchronize_session=False)
            )
            self.db.commit()
            return changed > 0
        except Exception as e:
            logger.error(f"Error setting channel status: {str(e)}")
            self.db.rollback()
            return False

    def _channel_account_id(self, channel: Optional[str], session_id) -> Optional[str]:
        """Which connected account a channel conversation belongs to, so the
        inbox can call account-scoped endpoints (e.g. sending a template).

        Looked up separately rather than joined into the chat-detail query:
        session_id is not unique on channel_conversations, so an outer join
        would multiply that query's groups. Only fires for channel sessions,
        and get_chat_detail fetches one session at a time.
        """
        if is_widget_channel(channel):
            return None
        conversation = ChannelConversationRepository(self.db).get_by_session(session_id)
        return str(conversation.channel_account_id) if conversation else None

    def _wake_snoozed(self, session_id) -> None:
        """The customer wrote again: a snoozed conversation is back in the
        inbox now, not when its snooze runs out."""
        try:
            woken = self.db.query(SessionToAgent).filter(
                SessionToAgent.session_id == UUID(str(session_id)),
                SessionToAgent.snoozed_until.isnot(None),
            ).update({SessionToAgent.snoozed_until: None}, synchronize_session='fetch')
            if woken:
                self.db.commit()
        except Exception as e:
            logger.error(f"Error waking a snoozed session: {str(e)}")
            self.db.rollback()

    def _update_session_sentiment(self, session_id) -> None:
        """Recompute and update the overall session sentiment from customer messages."""
        try:
            if isinstance(session_id, str):
                session_id = UUID(session_id)

            # Get all customer message sentiments for this session
            messages = self.db.query(
                ChatHistory.sentiment_score,
                ChatHistory.sentiment_label
            ).filter(
                ChatHistory.session_id == session_id,
                ChatHistory.message_type == 'user',
                ChatHistory.sentiment_score.isnot(None)
            ).all()

            scores = [m.sentiment_score for m in messages]
            labels = [m.sentiment_label for m in messages]

            overall_label, overall_score = compute_session_sentiment(scores, labels)

            if overall_label is not None:
                session = self.db.query(SessionToAgent).filter(
                    SessionToAgent.session_id == session_id
                ).first()
                if session:
                    session.sentiment_label = overall_label
                    session.sentiment_score = overall_score
                    self.db.commit()
        except Exception as e:
            logger.error(f"Error updating session sentiment: {str(e)}")
            self.db.rollback()

    def get_customer_messages(self, session_id: str | UUID) -> List[str]:
        """What the customer wrote in this conversation, oldest first."""
        rows = (
            self.db.query(ChatHistory.message)
            .filter(ChatHistory.session_id == UUID(str(session_id)), ChatHistory.message_type == "user")
            .order_by(ChatHistory.created_at.asc(), ChatHistory.id.asc())
            .all()
        )
        return [row.message for row in rows]

    async def get_session_history(self, session_id: str | UUID) -> List[ChatHistory]:
        """Get chat history for a session with joined relationships"""
        if isinstance(session_id, str):
            session_id = UUID(session_id)
        
        messages = (
            self.db.query(ChatHistory)
            .options(
                joinedload(ChatHistory.user),
                joinedload(ChatHistory.agent),
                joinedload(ChatHistory.attachments)
            )
            .filter(ChatHistory.session_id == session_id)
            # id breaks ties — see get_last_messages.
            .order_by(ChatHistory.created_at.asc(), ChatHistory.id.asc())
            .all()
        )
        
        # Hand out signed URLs. set_committed_value, not assignment: a plain
        # assignment marks the row dirty, and the next commit on this session
        # would store a link that expires in place of the file's real path.
        for message in messages:
            for attachment in message.attachments or []:
                if attachment.file_url:
                    set_committed_value(
                        attachment, "file_url", await resolve_public_url(attachment.file_url)
                    )

        return messages

    def get_last_messages(self, session_ids: List[UUID]) -> Dict[UUID, str]:
        """Map each session to its most recent message, decrypted.

        One query for the whole page rather than one per session, and the single
        definition of "most recent" — created_at is transaction time, so messages
        written together share it exactly and id has to break the tie.
        """
        if not session_ids:
            return {}

        ranked = (
            select(
                ChatHistory.session_id,
                ChatHistory.message,
                func.row_number().over(
                    partition_by=ChatHistory.session_id,
                    order_by=(ChatHistory.created_at.desc(), ChatHistory.id.desc()),
                ).label('rank')
            )
            .where(ChatHistory.session_id.in_(session_ids))
            .subquery()
        )

        rows = self.db.execute(
            select(ranked.c.session_id, ranked.c.message).where(ranked.c.rank == 1)
        ).all()
        return {session_id: message for session_id, message in rows}

    def get_user_history(self, user_id: str | UUID) -> List[ChatHistory]:
        """Get chat history for a user"""
        if isinstance(user_id, str):
            user_id = UUID(user_id)
            
        return self.db.query(ChatHistory).filter(
            ChatHistory.user_id == user_id
        ).order_by(ChatHistory.created_at.desc()).all()

    @staticmethod
    def _visibility_clause(
        user_id: Optional[UUID],
        user_groups: Optional[List[UUID]],
        include_unassigned: bool,
    ):
        """What a scoped user may see, or None when nothing is scoped.

        Their own sessions, their groups' queue and, with view_unassigned_chats,
        the unclaimed AI queue. Callers who may see everything pass none of
        these. The inbox list and its counts both use it, so a badge can never
        count a chat the list would hide.
        """
        visibility = []
        if user_id:
            visibility.append(SessionToAgent.user_id == user_id)
        if user_groups:
            visibility.append(SessionToAgent.group_id.in_(user_groups))
        if include_unassigned:
            # Nobody has taken it yet — the AI is still handling it. group_id
            # is irrelevant: a chat transferred to another group is still
            # claimable, and it is exactly what "unassigned" means.
            visibility.append(SessionToAgent.user_id.is_(None))
        return or_(*visibility) if visibility else None

    @staticmethod
    def _has_listed_messages():
        """At least one message whose agent and customer still exist, the rows
        the list joins. The widget opens a session on page load, long before
        anyone writes, and a deleted agent's chats drop out of the list;
        counting either would leave a badge nobody can clear."""
        # Its own Agent alias: the outer query's Agent would otherwise be
        # correlated into the subquery
        message_agent = aliased(Agent)
        return (
            select(ChatHistory.id)
            .join(message_agent, ChatHistory.agent_id == message_agent.id)
            .join(Customer, ChatHistory.customer_id == Customer.id)
            .where(ChatHistory.session_id == SessionToAgent.session_id)
            .exists()
        )

    def get_inbox_counts(
        self,
        organization_id: str | UUID,
        current_user_id: Optional[str | UUID] = None,
        user_id: Optional[str | UUID] = None,
        user_groups: Optional[List[str]] = None,
        include_unassigned: bool = False,
        today_start: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Each inbox view's size, in the caller's scope.

        - open: every conversation not closed and not snoozed
        - waiting_for_human / assigned_to_me / mentions / ai_handling /
          negative: open ones in that view (see inbox_views)
        - snoozed: not closed, snoozed until later
        - resolved_by_ai_today: closed since `today_start` by the AI alone
        - channels: open conversations per channel

        Only sessions the list can show count (_has_listed_messages).
        """
        organization_id = UUID(str(organization_id))
        current_user_id = UUID(str(current_user_id)) if current_user_id else None
        user_id = UUID(str(user_id)) if user_id else None
        user_groups = [UUID(str(g)) for g in user_groups] if user_groups else None
        today_start = today_start or _utc_midnight()

        def scoped(query, *conditions):
            query = (
                query.outerjoin(Agent, SessionToAgent.agent_id == Agent.id)
                .filter(
                    SessionToAgent.organization_id == organization_id,
                    self._has_listed_messages(),
                    *conditions,
                )
            )
            visibility = self._visibility_clause(user_id, user_groups, include_unassigned)
            return query.filter(visibility) if visibility is not None else query

        now = datetime.now(timezone.utc)
        session_count = func.count(SessionToAgent.session_id)
        resolved = inbox_views.resolved_by_ai(today_start)
        open_ = inbox_views.active(now)
        counted = {
            'open': open_,
            'waiting_for_human': and_(open_, inbox_views.waiting_for_human()),
            'assigned_to_me': and_(open_, inbox_views.mine(current_user_id)),
            'mentions': and_(open_, inbox_views.mentions(current_user_id)),
            'ai_handling': and_(open_, inbox_views.ai_handling()),
            'negative': and_(open_, inbox_views.negative_sentiment()),
            'resolved_by_ai_today': resolved,
            'snoozed': and_(inbox_views.not_closed(), inbox_views.snoozed(now)),
        }
        # One pass, per channel: the totals are the channels' sums, so the
        # sessions are scanned once, not again for the channel split
        rows = scoped(
            self.db.query(
                SessionToAgent.channel,
                *(session_count.filter(condition).label(key) for key, condition in counted.items()),
            ),
            # Only the rows some count can use: open ones, and today's closes
            or_(inbox_views.not_closed(), resolved),
        ).group_by(SessionToAgent.channel).all()

        totals = {key: sum(getattr(row, key) for row in rows) for key in counted}
        return {
            **totals,
            'channels': {row.channel: row.open for row in rows if row.open},
        }

    @staticmethod
    def _inbox_order(sort: Optional[inbox_views.InboxSort]):
        """ORDER BY for the list. Without a sort, the original order: waiting
        conversations first, then the latest activity."""
        last_activity = func.max(ChatHistory.created_at)
        if sort == inbox_views.InboxSort.NEWEST:
            return (last_activity.desc(),)
        if sort == inbox_views.InboxSort.WAITING_LONGEST:
            # A chat that waited from the start (an agent with AI replies off,
            # or one handed over before handed_over_at existed) waits from its
            # first message.
            return (
                func.coalesce(SessionToAgent.handed_over_at, func.min(ChatHistory.created_at)).asc(),
                last_activity.desc(),
            )
        return (
            text("CASE WHEN session_to_agents.status = 'TRANSFERRED' THEN 0 "
                 "WHEN session_to_agents.status = 'OPEN' THEN 1 "
                 "ELSE 2 END"),
            last_activity.desc(),
        )

    def get_recent_chats(
        self,
        skip: int = 0,
        limit: int = 20,
        agent_id: Optional[str | UUID] = None,
        status: Optional[str] = None,
        user_id: Optional[str | UUID] = None,
        user_groups: Optional[List[str]] = None,
        include_unassigned: bool = False,
        organization_id: Optional[str | UUID] = None,
        user_name: Optional[str] = None,
        filter_user_id: Optional[str | UUID] = None,
        customer_email: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        view: Optional[inbox_views.InboxView] = None,
        channel: Optional[str] = None,
        search: Optional[str] = None,
        sort: Optional[inbox_views.InboxSort] = None,
        current_user_id: Optional[str | UUID] = None,
        today_start: Optional[datetime] = None,
    ) -> List[dict]:
        """Get recent chat overviews grouped by conversation"""
        # Convert string IDs to UUID if needed
        if agent_id and isinstance(agent_id, str):
            agent_id = UUID(agent_id)
        if user_id and isinstance(user_id, str):
            user_id = UUID(user_id)
        if organization_id and isinstance(organization_id, str):
            organization_id = UUID(organization_id)
        if user_groups:
            user_groups = [UUID(g) if isinstance(g, str) else g for g in user_groups]
        current_user_id = UUID(str(current_user_id)) if current_user_id else None

        query = self.db.query(
            Customer.id.label('customer_id'),
            Customer.email.label('customer_email'),
            Customer.full_name.label('customer_full_name'),
            Customer.phone.label('customer_phone'),
            Agent.id.label('agent_id'),
            Agent.name.label('agent_name'),
            Agent.display_name.label('agent_display_name'),
            Agent.ai_replies_enabled.label('agent_ai_replies_enabled'),
            SessionToAgent.status.label('status'),
            SessionToAgent.channel.label('channel'),
            SessionToAgent.group_id.label('group_id'),
            # Who is handling the chat. Without these the list cannot tell an
            # AI-handled conversation from one a human has taken over — the
            # detail view has always known, the overview never did.
            SessionToAgent.user_id.label('user_id'),
            User.full_name.label('user_name'),
            # Not grouped: session_id (the primary key) is, and Postgres lets
            # the rest of that row's columns follow it.
            SessionToAgent.handed_over_at.label('handed_over_at'),
            SessionToAgent.title.label('title'),
            SessionToAgent.sentiment_label.label('sentiment_label'),
            SessionToAgent.snoozed_until.label('snoozed_until'),
            func.max(ChatHistory.created_at).label('updated_at'),
            func.count(ChatHistory.id).label('message_count'),
            SessionToAgent.session_id.label('session_id')
        ).join(
            Agent, ChatHistory.agent_id == Agent.id
        ).join(
            Customer, ChatHistory.customer_id == Customer.id
        ).join(
            SessionToAgent, ChatHistory.session_id == SessionToAgent.session_id
        ).outerjoin(
            User, SessionToAgent.user_id == User.id
        )

        # Filter conditions
        if agent_id:
            query = query.filter(Agent.id == agent_id)
        
        # Filter by status if provided
        if status and status != 'all':
            # Handle comma-separated status values
            if ',' in status:
                status_values = [s.strip() for s in status.split(',')]
                query = query.filter(SessionToAgent.status.in_(status_values))
            else:
                query = query.filter(SessionToAgent.status == status)

        if view:
            query = query.filter(inbox_views.view_clause(
                view, current_user_id, today_start or _utc_midnight(), datetime.now(timezone.utc)))
        if channel:
            query = query.filter(SessionToAgent.channel == channel)
        if search:
            query = query.filter(inbox_views.search_clause(search))
        
        # Filter by organization
        if organization_id:
            query = query.filter(SessionToAgent.organization_id == organization_id)
        
        # Filter by user name
        if user_name:
            query = query.filter(User.full_name.ilike(f'%{user_name}%'))
        
        # Filter by specific user ID (for agent dropdown)
        if filter_user_id:
            if isinstance(filter_user_id, str):
                filter_user_id = UUID(filter_user_id)
            query = query.filter(SessionToAgent.user_id == filter_user_id)
        
        # Filter by customer email
        if customer_email:
            query = query.filter(Customer.email.ilike(f'%{customer_email}%'))
        
        # Filter by date range
        if date_from:
            query = query.filter(ChatHistory.created_at >= date_from)
        if date_to:
            query = query.filter(ChatHistory.created_at <= date_to)
        
        visibility = self._visibility_clause(user_id, user_groups, include_unassigned)
        if visibility is not None:
            query = query.filter(visibility)

        # Group by and order
        query = query.group_by(
            Customer.id,
            Customer.email,
            Customer.full_name,
            Agent.id,
            Agent.name,
            Agent.display_name,
            Agent.ai_replies_enabled,
            SessionToAgent.status,
            SessionToAgent.channel,
            SessionToAgent.group_id,
            SessionToAgent.user_id,
            User.full_name,
            SessionToAgent.session_id
        ).order_by(*self._inbox_order(sort)).offset(skip).limit(limit)

        results = query.all()
        # Previews are fetched for the returned page only. Inlining them as a
        # correlated subquery would evaluate once per session in the org, since the
        # LIMIT applies after grouping.
        last_messages = self.get_last_messages([r.session_id for r in results])

        return [{
            'customer': {
                'id': r.customer_id,
                'email': CustomerRepository.display_email(r.customer_email),
                'full_name': r.customer_full_name,
                'phone': r.customer_phone,
            },
            'agent': {
                'id': r.agent_id,
                'name': r.agent_name,
                'display_name': r.agent_display_name,
                'ai_replies_enabled': r.agent_ai_replies_enabled
            },
            'last_message': last_messages.get(r.session_id),
            'updated_at': r.updated_at,
            'message_count': r.message_count,
            'status': r.status,
            'channel': r.channel,
            'group_id': str(r.group_id) if r.group_id else None,
            'user_id': r.user_id,
            'user_name': r.user_name,
            'handed_over_at': r.handed_over_at,
            'title': r.title,
            'sentiment_label': r.sentiment_label,
            'snoozed_until': r.snoozed_until,
            'session_id': r.session_id
        } for r in results]

    async def check_session_access(
        self,
        session_id: str | UUID,
        user_id: Optional[str | UUID],
        user_groups: Optional[List[str]],
        include_unassigned: bool = False
    ) -> bool:
        """Check if user has access to a chat session.

        Mirrors the visibility filter in get_recent_chats — the two must agree,
        or a session shows in the list and 404s when opened. A None user_id
        means "this caller has no assigned-chat grant"; it must never be
        compared against session.user_id, since both being NULL would silently
        hand over every unclaimed session.
        """
        if isinstance(session_id, str):
            session_id = UUID(session_id)
        if isinstance(user_id, str):
            user_id = UUID(user_id)

        session = (
            self.db.query(SessionToAgent)
            .filter(SessionToAgent.session_id == session_id)
            .first()
        )

        if not session:
            return False

        if include_unassigned and session.user_id is None:
            return True

        if user_id is not None and session.user_id == user_id:
            return True

        return bool(
            session.group_id and user_groups and str(session.group_id) in user_groups
        )

    async def get_chat_detail(
        self,
        session_id: str | UUID,
        org_id: str | UUID
    ) -> Optional[dict]:
        """Get detailed chat information for a session"""
        # Here, not at the top: the service delivers through this repository
        from app.services.message_edits import edit_window_minutes

        if isinstance(session_id, str):
            session_id = UUID(session_id)
        if isinstance(org_id, str):
            org_id = UUID(org_id)

        result = (
            self.db.query(
                Customer.id.label('customer_id'),
                Customer.email.label('customer_email'),
                Customer.full_name.label('customer_full_name'),
                Customer.meta_data.label('customer_meta_data'),
                Customer.phone.label('customer_phone'),
                Agent.id.label('agent_id'),
                Agent.name.label('agent_name'),
                Agent.display_name.label('agent_display_name'),
                Agent.ai_replies_enabled.label('agent_ai_replies_enabled'),
                SessionToAgent.status.label('status'),
                SessionToAgent.channel.label('channel'),
                SessionToAgent.group_id.label('group_id'),
                SessionToAgent.session_id.label('session_id'),
                SessionToAgent.user_id.label('user_id'),
                User.full_name.label('user_name'),
                # Ungrouped, like meta_data below: they follow the grouped
                # primary key (session_id).
                SessionToAgent.handed_over_at.label('handed_over_at'),
                SessionToAgent.transfer_reason.label('transfer_reason'),
                SessionToAgent.transfer_description.label('transfer_description'),
                SessionToAgent.sentiment_label.label('sentiment_label'),
                SessionToAgent.title.label('title'),
                SessionToAgent.snoozed_until.label('snoozed_until'),
                func.min(ChatHistory.created_at).label('created_at'),
                func.max(ChatHistory.created_at).label('updated_at')
            )
            .join(Agent, ChatHistory.agent_id == Agent.id)
            .join(Customer, ChatHistory.customer_id == Customer.id)
            .join(SessionToAgent, ChatHistory.session_id == SessionToAgent.session_id)
            .outerjoin(User, SessionToAgent.user_id == User.id)
            .filter(
                ChatHistory.session_id == session_id,
                SessionToAgent.organization_id == org_id
            )
            .group_by(
                # Customer.meta_data is deliberately NOT grouped: Postgres' `json` type
                # has no equality operator, so grouping by it raises "could not identify
                # an equality operator for type json". Customer.id (the PK) is already
                # grouped, so Postgres' functional-dependency rule lets other columns of
                # the same table (email, full_name, meta_data) be selected ungrouped.
                Customer.id,
                Customer.email,
                Customer.full_name,
                Agent.id,
                Agent.name,
                Agent.display_name,
                Agent.ai_replies_enabled,
                SessionToAgent.status,
                SessionToAgent.channel,
                SessionToAgent.group_id,
                SessionToAgent.session_id,
                SessionToAgent.user_id,
                User.full_name
            )
            .first()
        )

        if not result:
            return None

        # Get messages for the session
        messages = await self.get_session_history(session_id)
        
        # Who on the team wrote each reply: one query for the whole thread
        writer_ids = {msg.user_id for msg in messages if msg.user_id}
        writer_names = dict(
            self.db.query(User.id, User.full_name).filter(User.id.in_(writer_ids)).all()
        ) if writer_ids else {}

        # Build messages list with attachments
        messages_list = []
        for msg in messages:
            msg_dict = {
                'id': msg.id,
                'message': msg.message,
                'message_type': msg.message_type,
                'created_at': msg.created_at,
                'user_id': msg.user_id,
                'user_name': writer_names.get(msg.user_id),
                'attributes': _readable_attributes(msg.attributes),
                # Live delivery receipts are matched to the message by either
                'external_message_id': msg.external_message_id,
                'channel_status': msg.channel_status,
            }
            
            # Add attachments with file info if they exist
            if msg.attachments:
                attachments = []
                for attachment in msg.attachments:
                    att_dict = {
                        'id': attachment.id,
                        'filename': attachment.filename,
                        'file_url': attachment.file_url,
                        'content_type': attachment.content_type,
                        'file_size': attachment.file_size
                    }
                    attachments.append(att_dict)
                msg_dict['attachments'] = attachments
            
            messages_list.append(msg_dict)
        
        # Convert result to dict
        return {
            'customer': {
                'id': result.customer_id,
                'email': CustomerRepository.display_email(result.customer_email),
                'full_name': result.customer_full_name,
                'meta_data': result.customer_meta_data,
                'phone': result.customer_phone,
            },
            'agent': {
                'id': result.agent_id,
                'name': result.agent_name,
                'display_name': result.agent_display_name,
                'ai_replies_enabled': result.agent_ai_replies_enabled
            },
            'status': result.status,
            'channel': result.channel,
            'channel_account_id': self._channel_account_id(result.channel, result.session_id),
            'group_id': str(result.group_id) if result.group_id else None,
            'session_id': result.session_id,
            'user_id': result.user_id,
            'user_name': result.user_name,
            'handed_over_at': result.handed_over_at,
            'transfer_reason': result.transfer_reason,
            'transfer_description': result.transfer_description,
            'sentiment_label': result.sentiment_label,
            'title': result.title,
            'snoozed_until': result.snoozed_until,
            # Minutes a person's sent reply stays editable here; None: never
            'message_edit_minutes': edit_window_minutes(result.channel),
            # The team's notes: never in `messages`, which is what the customer saw
            'notes': ConversationNoteRepository(self.db).for_session(result.session_id),
            'created_at': result.created_at,
            'updated_at': result.updated_at,
            'messages': messages_list
        }
