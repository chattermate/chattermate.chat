"""
ChatterMate - Chat Agent
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
from agno.agent import Agent
from app.utils.agno_utils import create_model
from app.core.logger import get_logger
from app.tools.knowledge_search_byagent import KnowledgeSearchByAgent
from app.tools.mcp_manager import ChatAgentMCPMixin
from app.database import get_db, SessionLocal
from agno.storage.agent.postgres import PostgresAgentStorage
from app.repositories.chat import ChatRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.models.session_to_agent import SessionStatus
from app.models.schemas.chat import ChatResponse,TransferReasonType, EndChatReasonType
from app.core.config import settings
from app.agents.transfer_agent import get_agent_availability_response
from app.models.notification import Notification
from app.services.user import send_fcm_notification
from app.models.user import User, user_groups
from datetime import datetime
from app.repositories.jira import JiraRepository
from app.tools.jira_toolkit import JiraTools
from app.tools.shopify_toolkit import ShopifyTools
from app.utils.response_parser import parse_response_content
from app.repositories.agent_shopify_config_repository import AgentShopifyConfigRepository
import re
import asyncio

logger = get_logger(__name__)

# Add a function to remove URLs from message content
def remove_urls_from_message(message: str) -> str:
    """Remove URLs from message text, but preserve markdown image URLs"""
    if not message:
        return message
    
    # Don't remove URLs from markdown images: ![alt](url)
    # We'll replace other URLs but skip those in image markdown
    
    # Pattern to match markdown images: ![...](url)
    image_pattern = r'!\[[^\]]*\]\(([^)]+)\)'
    
    # Find all markdown images and temporarily replace them with placeholders
    images = []
    def save_image(match):
        images.append(match.group(0))
        return f'__IMAGE_PLACEHOLDER_{len(images)-1}__'
    
    message = re.sub(image_pattern, save_image, message)
    
    # Now remove other URLs
    url_pattern = r'https?://[^\s\)\]"]+'
    message = re.sub(url_pattern, '[link removed]', message)
    
    # Restore markdown images
    for i, image in enumerate(images):
        message = message.replace(f'__IMAGE_PLACEHOLDER_{i}__', image)
    
    return message

class ChatAgent(ChatAgentMCPMixin):
    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini", model_type: str = "OPENAI", org_id: str = None, agent_id: str = None, customer_id: str = None, session_id: str = None, custom_system_prompt: str = None, transfer_to_human: bool | None = None, mcp_tools: list = None, source: str = None):
        # Initialize knowledge search tool if org_id and agent_id provided
        logger.debug(f"Initializing chat agent for agent_id: {agent_id} and org_id: {org_id} and source: {source}")
        tools = []
        knowledge_tool_prompt = ""  # Initialize to empty string
        
        if org_id and agent_id:
            logger.debug(f"Initializing knowledge search tool for agent_id: {agent_id} and org_id: {org_id} and source: {source}")
            knowledge_tool = KnowledgeSearchByAgent(
                agent_id=agent_id, org_id=org_id, source=source)
            tools.append(knowledge_tool)
            
            # Base knowledge tool prompt
            knowledge_tool_prompt = """
            You have access to the knowledge search tool. You can use this tool to search for information about the customer's query on product, services, policies, etc. Only use the tool if required, dont use it for general greeting. Dont hallucinate information. For all other queries other than general always search tools before answering."""
            
            # For non-Groq models, add the search limit instruction
            # For Groq, skip this to avoid discouraging tool usage
            if model_type.upper() != 'GROQ':
                knowledge_tool_prompt += """
            
            IMPORTANT: If you attempt to search for information but cannot find relevant results after a few tries, or if you've already searched multiple times without success, respond with a helpful message like "I apologize, but I don't have specific information about that in our knowledge base at the moment. Is there anything else I can help you with?" Do not keep searching indefinitely."""
            

        # Get template instructions and Jira config in a single optimized query
        # Use context manager for database operations
        with SessionLocal() as db:
            jira_repo = JiraRepository(db)
            if agent_id:
                self.agent_data = jira_repo.get_agent_with_jira_config(agent_id)
            else:
                self.agent_data = None
            
            # Check if Shopify is enabled for this agent while we have the db session
            shopify_config = None
            if agent_id and org_id and session_id:
                try:
                    shopify_config_repo = AgentShopifyConfigRepository(db)
                    shopify_config = shopify_config_repo.get_agent_shopify_config(agent_id)
                except Exception as e:
                    logger.error(f"Failed to get Shopify config: {e}")
                    shopify_config = None
        
        self.api_key = api_key
        self.model_name = model_name
        self.model_type = model_type
        self.jira_instructions_added = False
        self.shopify_instructions_added = False
        self.mcp_instructions_added = False
        self.org_id = org_id
        self.agent_id = agent_id
        self.customer_id = customer_id
        self.session_id = session_id
        self.mcp_tools = mcp_tools or []
        
        # Determine transfer_to_human setting - use parameter if provided, otherwise use agent data
        if transfer_to_human is not None:
            self.transfer_to_human = transfer_to_human
        else:
            self.transfer_to_human = self.agent_data.transfer_to_human if self.agent_data else False

        # Initialize tools
        self.tools = []
        
        # Add Jira tools if agent_id, org_id, and session_id are provided
        if self.agent_id and self.org_id and self.session_id and not self.transfer_to_human and self.agent_data and self.agent_data.jira_enabled:
            try:
                self.jira_tools = JiraTools(
                    agent_id=self.agent_id,
                    org_id=self.org_id,
                    session_id=self.session_id
                )
                self.tools.append(self.jira_tools)
            except Exception as e:
                logger.error(f"Failed to initialize Jira tools: {e}")
        
        # Add Shopify tools if agent has Shopify enabled
        if self.agent_id and self.org_id and self.session_id and not self.transfer_to_human and shopify_config and shopify_config.enabled:
            try:
                self.shopify_tools = ShopifyTools(
                    agent_id=self.agent_id,
                    org_id=self.org_id,
                    session_id=self.session_id
                )
                self.tools.append(self.shopify_tools)
            except Exception as e:
                logger.error(f"Failed to initialize Shopify tools: {e}")

        # Add MCP tools if provided
        if self.mcp_tools:
            self.tools.extend(self.mcp_tools)
            logger.debug(f"Added {len(self.mcp_tools)} MCP tools to agent")

        if self.agent_data:
            # Define end chat instructions to avoid long lines
            end_chat_with_rating = (
                "You should end the chat and request a rating ONLY when you are confident that: "
                "1) The customer's issue has been fully resolved and they have confirmed this, "
                "2) The customer explicitly requests to end the chat, "
                "3) There's a clear confirmation or acknowledgment from the customer that their needs have been met, "
                "4) The conversation has reached a natural conclusion after resolving the customer's query, or "
                "5) The requested task has been completed and confirmed by the customer. "
                "DO NOT end the chat just because the customer says \"thank you\" or \"thanks\" - "
                "this is often just politeness and not an indication that they want to end the conversation. "
                "Always check the conversation history to confirm the issue has been properly addressed before ending the chat."
            )
            
            end_chat_without_rating = (
                "You should end the chat ONLY when: "
                "1) The customer's issue has been fully resolved and they have confirmed this, "
                "2) The customer explicitly requests to end the chat, "
                "3) There's a clear confirmation or acknowledgment from the customer that their needs have been met, "
                "4) The conversation has reached a natural conclusion after resolving the customer's query, or "
                "5) The requested task has been completed and confirmed by the customer. "
                "DO NOT end the chat just because the customer says \"thank you\" or \"thanks\" - "
                "this is often just politeness and not an indication that they want to end the conversation. "
                "Always check the conversation history to confirm the issue has been properly addressed before ending the chat. Also generate a response in message field for end chat. e.g: Thank you for your time. Have a great day!"
            )
            
            # Build system message
            system_message = ""
            if custom_system_prompt:
                # Use custom system prompt from workflow
                system_message = custom_system_prompt
            elif self.agent_data.instructions:
                system_message = "\n".join(self.agent_data.instructions) +  knowledge_tool_prompt
            
            # Add concise response instruction for better performance
            system_message += """
            
Keep your responses concise and focused. Provide clear, actionable information in 2-4 sentences unless a detailed explanation is specifically requested. Avoid unnecessary elaboration.

**CRITICAL: Tool Usage Guidelines:**
- If you need information from the user to complete a task, ASK them directly. DO NOT repeatedly call tools hoping to find the information.
- If a tool returns an error or indicates missing information, STOP calling tools and respond to the user.
- DO NOT call the same tool multiple times with the same parameters if it failed the first time.
- DO NOT call tools in a loop. If you've tried a few tools and haven't found what you need, ask the user for help."""


            
            # Add transfer instructions if enabled
            if self.transfer_to_human:
                system_message += """
                You have the ability to transfer this conversation to a human agent if needed. You should transfer the conversation if:
                1. You are unable to answer the customer's question or solve their problem
                2. The customer explicitly asks to speak to a human
                3. The customer is expressing frustration with your responses
                4. The customer's request requires human judgment or decision-making
                5. The customer's issue is complex and would benefit from human expertise
                6. The customer needs to perform an action that you cannot assist with
                
                To transfer to a human, set transfer_to_human to true in your response and provide a transfer_reason and transfer_description.
                """
            else:
                system_message += """
                Transfer to human is disabled for this agent. You should not transfer the conversation to a human.
                """
            # Add end chat instructions
            if self.agent_data.ask_for_rating:
                system_message += f"\n{end_chat_with_rating}"
            else:
                system_message += f"\n{end_chat_without_rating}"
            
            # Add Jira instructions if Jira is enabled
            if self.agent_data and self.agent_data.jira_enabled and not self.transfer_to_human:
                jira_instructions = """
                You have access to Jira integration tools. You can use these tools to:
                1. Create a Jira ticket for issues that need further attention
                2. Check if a ticket already exists for the current conversation
                3. Get the status of an existing ticket

                To create a ticket, you can either:
                - Use the create_jira_ticket function directly
                - Include the following fields in your response:
                - create_ticket: Set to true to create a ticket
                - ticket_summary: A brief summary of the issue (required if create_ticket is true)
                - ticket_description: A detailed description of the issue (required if create_ticket is true)
                - ticket_priority: The priority level of the ticket (optional, defaults to "Medium")

                Only create a ticket if:
                - The issue is complex and requires human intervention
                - The user explicitly requests to create a ticket
                - You've tried to resolve the issue but were unable to do so
                - No ticket already exists for this conversation
                """
                system_message += "\n\n" + jira_instructions
                self.jira_instructions_added = True
            
            # Add Shopify instructions if Shopify is enabled
            if shopify_config and shopify_config.enabled and not self.transfer_to_human:
                # UPDATED Shopify Instructions (v3)
                shopify_instructions = """
                You have access to Shopify tools (`search_products`, `get_product`, `recommend_products`, `search_orders`, `get_order_status`, etc.). 
                When using `search_products` or `recommend_products`, use a `limit` of 5 unless the user specifies otherwise.
                
                **Order Status & Tracking - User-Friendly Communication:**
                - **BEFORE using order tools (`search_orders`, `get_order_status`):**
                  * Check if you have the required information (order number OR email address) from the current user message
                  * If the user asks about order status but doesn't provide order number or email, **IMMEDIATELY respond** (don't call any tools): "To check your order status, could you please provide your order number or the email address you used for the order?"
                  * **DO NOT** call order tools with empty parameters
                  * **DO NOT** call `get_chat_history` to look for order information - just ask the user directly
                  * **DO NOT** repeatedly call any tools when user information is missing
                  * If a tool returns an error saying "requires_user_input", stop calling tools and ask the user directly
                
                - Use natural, conversational language when providing order status.
                - Translate technical statuses into customer-friendly terms:
                  * FULFILLED = "Your order has been shipped" or "Your order is on its way"
                  * PAID = Order is confirmed (no need to mention this separately if shipped)
                  * IN_TRANSIT = "Your order is on its way"
                  * DELIVERED = "Your order has been delivered"
                  * PENDING = "We're preparing your order for shipment"
                
                - **Format tracking information naturally:**
                  * Good: "Your order has been shipped! Track it here: [tracking_number](tracking_url)"
                  * Bad: "The status of order #1002 remains PAID and it is FULFILLED"
                
                - **Be concise and helpful:**
                  * Focus on what matters to the customer: shipment status and tracking
                  * Include shipping address only if relevant to the query
                  * Always make tracking numbers clickable links
                  
                - **Example good responses:**
                  * "Great news! Your order has been shipped. Track your package: [123456](url)"
                  * "Your order is on its way! Track it here: [123456](url). Expected delivery to Bengaluru by [date]."
                  * "Your order has been delivered to your address in Bengaluru on [date]."
                
                **Search Query Construction (`search_products`):**
                - When the user mentions multiple characteristics (e.g., "kids snowboard"), construct the `searchTerm` to combine them using `OR` and wildcards.
                - Example: If the user asks "recommend a snowboard for my son", a good `searchTerm` would be `(title:*kids snowboard*) OR (title:*snowboard*)`. Always use OR conditions and wrap terms in wildcards (`*term*`) for broader matching.
                - When the user specifies price constraints (e.g., "snowboard below 500 rs"), add a price range condition:
                  - Example: For "snowboard below 500", use `(title:*snowboard*) AND price:<=500`
                  - Example: For "snowboard between 200 and 500", use `(title:*snowboard*) AND price:>200 AND price:<=500`
                - Following Shopify's search syntax, you can combine multiple conditions using AND/OR operators and parentheses for grouping.

                **❗❗ CRITICAL DISPLAY RULES - STRICTLY ENFORCED ❗❗:**
                - 🚫 **ABSOLUTELY NEVER** include product images, image URLs, or hyperlinks in the message field
                - 🚫 **ABSOLUTELY NEVER** include product details like prices, vendor names, dimensions, or specifications in the message field
                - 🚫 **ABSOLUTELY NEVER** use numbered lists or bullet points to display products with details in the message field
                - 🚫 **ABSOLUTELY NEVER** include HTML tags, markdown image syntax, or any form of image embedding in the message field
                
                - ✅ The message field must ONLY contain simple conversational text such as:
                  - "Here are some snowboard options that might work for your son."
                  - "I found several products matching your search. What do you think?"
                  - "Would you like more information about any of these options?"
                
                - ✅ ALL product information, without exception, must ONLY be included in the `shopify_output` field structure
                - ✅ The system has a dedicated display component that will automatically render all products from the `shopify_output` field
                
                This is critically important: The UI automatically displays all product details and images from the `shopify_output` field separately from your message. Your message should ONLY contain simple conversational text like you're referring to products that are being shown separately.

                **Pagination:**
                - These tools support pagination. The output will include `pageInfo` containing `hasNextPage` (boolean) and `endCursor` (string).
                - If `hasNextPage` is true, it means there are more results available.
                - You should inform the user if more results are available (e.g., "I found 5 products matching your search. There might be more available. Would you like to see the next set?").
                - **Do not** automatically fetch the next page unless the user asks for it.
                - If the user asks for more results, call the *same* tool again, passing the `endCursor` value from the previous response as the `cursor` argument in the new tool call.

                **Output Formatting:**
                - When a Shopify tool returns product data, you MUST populate the `shopify_output` field in your final JSON response.
                - The `shopify_output` field expects a specific JSON structure containing a list of products and optionally pageInfo.
                - Copy the **entire relevant JSON output** from the tool directly into the `shopify_output` field. 
                  - If the tool output contains a `shopify_output` key with a nested `products` list like `{"shopify_output": {"products": [...], "pageInfo": {...}}}` , copy that entire inner `shopify_output` object.
                  - If the tool output contains just `shopify_product` for a single item (e.g., from `get_product`), structure it as `{"products": [ ...the_single_product... ]}` within your response's `shopify_output` field.
                  - **CRITICAL**: If the tool returns `shop_domain` in its response, you MUST include it in the `shopify_output` field as well.
                
                - **When displaying order information with products (from `search_orders` or `get_order_status`):**
                  - If you want to show products from order line items, transform them into the products array
                  - **ALWAYS** include `shop_domain` from the tool response in your `shopify_output`
                  - Example: If tool returns `{"orders": [...], "shop_domain": "store.myshopify.com"}`, your `shopify_output` must include `"shop_domain": "store.myshopify.com"`
                
                - Example Structure for your `shopify_output` field (when multiple products with pagination info):
                  ```json
                  "shopify_output": {
                    "products": [
                      { "id": "...", "title": "Product A", "price": "...", "image": {"src": "..."}, ... },
                      { "id": "...", "title": "Product B", "price": "...", "image": {"src": "..."}, ... }
                    ],
                    "search_query": "optional search term",
                    "total_count": 5, // Example count from the first page
                    "shop_domain": "store.myshopify.com", // ALWAYS include this from tool response
                    "pageInfo": {
                        "hasNextPage": true,
                        "endCursor": "CURSOR_STRING_FROM_TOOL" 
                    }
                  }
                  ```
                """
                system_message += "\n\n" + shopify_instructions
                self.shopify_instructions_added = True

            # Add MCP tools instructions if MCP tools are available
            if self.mcp_tools:
                mcp_instructions = """
                You have access to MCP (Model Context Protocol) tools that provide additional capabilities.
                These tools allow you to interact with external systems and perform various operations.
                Use these tools when they can help answer the customer's questions or solve their problems.
                Always use the appropriate tool for the specific task at hand.
                """
                system_message += "\n\n" + mcp_instructions
                self.mcp_instructions_added = True
        else:
            system_message = [
                "You are a helpful customer service agent.",
            ]

        # Initialize model with utility function
        model = create_model(
            model_type=model_type,
            api_key=api_key,
            model_name=model_name,
            max_tokens=2000 if (self.shopify_instructions_added or self.mcp_instructions_added) else 1000,
            # response_format={"type": "json_object"} if model_type.upper() != 'GROQ' else {"type": "text"}
        )

        storage = PostgresAgentStorage(table_name="agent_sessions", db_url=settings.DATABASE_URL)
        
       
        # Combine all tools
        all_tools = tools.copy()
        if hasattr(self, 'tools') and self.tools:
           all_tools.extend(self.tools)

        # Enable structured outputs for all models including Groq
        # The PatchedGroq class handles the response_format conflict when tools are present
        self.agent = Agent(
           name=self.agent_data.name if self.agent_data else "Default Agent",
           session_id=session_id,
           model=model,
           tools=all_tools,
           instructions=system_message,
           agent_id=str(agent_id),
           storage=storage,
           add_history_to_messages=True,
           tool_call_limit=5,  # Allow up to 5 tool calls - balance between functionality and performance
           num_history_responses=5,  # Reduced from 10 to 5 to minimize context size and improve speed
           read_chat_history=True,
           markdown=False,
           debug_mode=settings.ENVIRONMENT == "development",
           user_id=str(customer_id),
           session_state={"status": "active"},
           response_model=ChatResponse,
           structured_outputs=True,
           system_message_role="system",
           user_message_role="user",
           show_tool_calls=settings.ENVIRONMENT == "development"
          )

    async def _get_llm_response_only(self, message: str, session_id: str = None, org_id: str = None, agent_id: str = None, customer_id: str = None) -> ChatResponse:
        """
        Get LLM response without storing messages in chat history.
        Used by workflow execution to avoid duplicate message storage.
        """
        try:
            # Update session and IDs if provided
            if session_id:
                self.session_id = session_id
            if org_id:
                self.org_id = org_id
            if agent_id:
                self.agent_id = agent_id
            if customer_id:
                self.customer_id = customer_id
                
            self.agent.session_id = session_id

            # Get AI response WITHOUT storing user message
            response = await self.agent.arun(
                message=message,
                session_id=session_id,
                stream=False
            )

            # Use the utility function to parse the response
            response_content = parse_response_content(response)

            logger.debug(f"Response content: {response_content}")
            
            # If shopify_output has products, remove URLs from message
            # (URLs should only be removed when products are being displayed separately)
            if response_content.shopify_output and response_content.shopify_output.products:
                response_content.message = remove_urls_from_message(response_content.message)
                logger.debug(f"Cleaned message for Shopify output: {response_content.message}")
            
            # Don't handle end chat or transfer here - let workflow handle it
            # Don't store any messages - let workflow handle storage
            
            return response_content

        except Exception as e:
            traceback.print_exc()
            logger.error(f"Chat agent error: {str(e)}")
            error_message = f"I apologize, but I encountered an error, please try again later."
            
            # Create error response without storing
            error_response = ChatResponse(
                message=error_message,
                transfer_to_human=False,
                transfer_reason=None,
                transfer_description=None,
                end_chat=False,
                end_chat_reason=None,
                end_chat_description=None,
                request_rating=False,
                create_ticket=False,
                shopify_output=None
            )
            
            return error_response

    async def _handle_end_chat(self, response_content: ChatResponse, session_id: str, db, force_rating: bool | None = None) -> ChatResponse:
        """
        Handle end chat logic including session updates and rating requests.
        
        Args:
            response_content: The chat response content
            session_id: The session ID
            db: Database session
            force_rating: Optional parameter to override agent's ask_for_rating setting.
                         If None, uses agent's default setting.
                         If True, forces rating request.
                         If False, disables rating request.
            
        Returns:
            Updated ChatResponse object
        """
        session_repo = SessionToAgentRepository(db)
        
        # Determine if rating should be requested
        if force_rating is not None:
            # Use the forced setting from workflow configuration
            should_request_rating = force_rating
        else:
            # Use agent's default setting
            should_request_rating = self.agent_data and self.agent_data.ask_for_rating
            
        response_content.request_rating = should_request_rating

        session_repo.update_session(
            session_id,
            {
                "status": SessionStatus.CLOSED,
                "end_chat_reason": response_content.end_chat_reason.value if response_content.end_chat_reason else None,
                "end_chat_description": response_content.end_chat_description,
                "closed_at": datetime.now()
            }
        )

        # Add rating request to the message if enabled
        if should_request_rating:
            rating_message = "\n\nThank you for chatting with us! Would you please take a moment to rate your experience? Your feedback helps us improve our service."
            response_content.message += rating_message
            
        return response_content

    async def _handle_transfer(self, response_content: ChatResponse, session_id: str, org_id: str, agent_id: str, customer_id: str, db, chat_repo: ChatRepository, transfer_group_id: str = None) -> ChatResponse:
        """
        Handle transfer to human logic including session updates, notifications, and availability checks.
        
        Args:
            response_content: The chat response content (can be None for workflow transfers)
            session_id: The session ID
            org_id: Organization ID
            agent_id: Agent ID
            customer_id: Customer ID
            db: Database session
            chat_repo: Chat repository instance
            transfer_group_id: Optional specific group ID to transfer to (for workflow transfers)
            
        Returns:
            Updated ChatResponse object
        """
        from app.models.schemas.chat import TransferReasonType
        
        # Determine transfer source and group
        if transfer_group_id:
            logger.debug(f"Transfer group ID: {transfer_group_id}")
            # Workflow transfer - use provided group ID and transfer details from LLM response
            group_id = transfer_group_id
            # Use transfer reason/description from LLM response if available, otherwise fallback
            if response_content and response_content.transfer_reason:
                transfer_reason = response_content.transfer_reason.value
                transfer_description = response_content.transfer_description or "Transfer requested by workflow"
            else:
                transfer_reason = TransferReasonType.KNOWLEDGE_GAP.value
                transfer_description = "Transfer requested by workflow"
            notification_message = "A chat has been transferred to your group via workflow."
            is_workflow_transfer = True
        else:
            # Agent transfer - use agent's default group
            if not (self.agent_data and hasattr(self.agent_data, 'groups') and self.agent_data.groups):
                raise ValueError("No groups available for transfer")
            group_id = self.agent_data.groups[0].id
            transfer_reason = response_content.transfer_reason.value if response_content.transfer_reason else None
            transfer_description = response_content.transfer_description
            notification_message = f"A chat has been transferred to your group. Reason: {transfer_reason or 'Not specified'}"
            is_workflow_transfer = False
        
        # Get chat history
        chat_history = await chat_repo.get_session_history(session_id)
        
        # Update session with transfer details
        session_repo = SessionToAgentRepository(db)
        session_repo.update_session(
            session_id, 
            {
                "status": "TRANSFERRED",
                "transfer_reason": transfer_reason,
                "transfer_description": transfer_description,
                "group_id": group_id
            }
        )
        
        # Get all users in the target group and send notifications
        users = db.query(User).join(user_groups).filter(user_groups.c.group_id == group_id).all()
        
        for user in users:
            # Create notification record
            notification = Notification(
                user_id=user.id,
                title="New Chat Transfer",
                message=notification_message,
                type="SYSTEM",
                notification_metadata={
                    "session_id": session_id,
                    "transfer_reason": transfer_reason,
                    "transfer_description": transfer_description
                }
            )
            db.add(notification)
            db.commit()
            
            # Send FCM notification
            await send_fcm_notification(str(user.id), notification, db)
        
        # Get availability-based response
        availability_response = await get_agent_availability_response(
            agent=self.agent_data,
            customer_id=customer_id,
            chat_history=chat_history,
            db=db,
            api_key=self.api_key,
            model_name=self.model_name,
            model_type=self.model_type,
            session_id=session_id,
            transfer_group_id=transfer_group_id if is_workflow_transfer else None
        )
        
        # Create ChatResponse object
        updated_response = ChatResponse(
            message=availability_response["message"],
            transfer_to_human=availability_response["transfer_to_human"],
            transfer_reason=availability_response.get("transfer_reason"),
            transfer_description=availability_response.get("transfer_description"),
            end_chat=False,
            end_chat_reason=None,
            end_chat_description=None,
            request_rating=False,
            create_ticket=False,
            shopify_output=None
        )
        
        # Prepare message attributes
        attributes = {
            "transfer_to_human": updated_response.transfer_to_human,
            "transfer_reason": updated_response.transfer_reason.value if updated_response.transfer_reason else None,
            "transfer_description": updated_response.transfer_description,
            "end_chat": updated_response.end_chat,
            "end_chat_reason": updated_response.end_chat_reason.value if updated_response.end_chat_reason else None,
            "end_chat_description": updated_response.end_chat_description,
            "request_rating": updated_response.request_rating,
            "shopify_output": updated_response.shopify_output
        }
        
        # Add workflow-specific attributes
        if is_workflow_transfer:
            attributes["workflow_transfer"] = True
            attributes["transfer_group_id"] = transfer_group_id
        
        # Store transfer response
        chat_repo.create_message({
            "message": updated_response.message,
            "message_type": "bot",
            "session_id": session_id,
            "organization_id": org_id,
            "agent_id": agent_id,
            "customer_id": customer_id,
            "attributes": attributes
        })

        return updated_response

    async def handle_workflow_transfer(self, session_id: str, org_id: str, agent_id: str, customer_id: str, transfer_group_id: str, db, chat_repo: ChatRepository, llm_response: ChatResponse = None) -> ChatResponse:
        """
        Handle transfer to human from workflow with specific group ID.
        This is a convenience wrapper around _handle_transfer for workflow transfers.
        
        Args:
            session_id: The session ID
            org_id: Organization ID
            agent_id: Agent ID
            customer_id: Customer ID
            transfer_group_id: The specific group ID to transfer to
            db: Database session
            chat_repo: Chat repository instance
            llm_response: The LLM response containing transfer reason and description
            
        Returns:
            ChatResponse object with transfer response
        """
        return await self._handle_transfer(
            response_content=llm_response,  # Pass the LLM response to get transfer reason/description
            session_id=session_id,
            org_id=org_id,
            agent_id=agent_id,
            customer_id=customer_id,
            db=db,
            chat_repo=chat_repo,
            transfer_group_id=transfer_group_id
        )

    async def get_response(self, message: str, session_id: str = None, org_id: str = None, agent_id: str = None, customer_id: str = None) -> ChatResponse:
        """
        Get a response from the agent.
        """
        try:
            # Update session and IDs if provided
            if session_id:
                self.session_id = session_id
            if org_id:
                self.org_id = org_id
            if agent_id:
                self.agent_id = agent_id
            if customer_id:
                self.customer_id = customer_id
                
            # Use context manager for database operations
            with SessionLocal() as db:
                chat_repo = ChatRepository(db)
                
                self.agent.session_id = session_id

                # Create user message
                chat_repo.create_message({
                    "message": message,
                    "message_type": "user",
                    "session_id": session_id,
                    "organization_id": org_id,
                    "agent_id": agent_id,
                    "customer_id": customer_id,
                    "attributes": {}
                })

                
                # Get AI response
                response = await self.agent.arun(
                    message=message,
                    session_id=session_id,
                    stream=False
                )

                # Use the utility function to parse the response
                response_content = parse_response_content(response)

                logger.debug(f"Response content: {response_content}")
                
                # If shopify_output has products, remove URLs from message
                # (URLs should only be removed when products are being displayed separately)
                if response_content.shopify_output and response_content.shopify_output.products:
                    response_content.message = remove_urls_from_message(response_content.message)
                    logger.debug(f"Cleaned message for Shopify output: {response_content.message}")
                
                # Handle end chat and rating request
                if response_content.end_chat:
                    response_content = await self._handle_end_chat(response_content, session_id, db)

                # Handle transfer 
                if self.agent_data and self.transfer_to_human and response_content.transfer_to_human and hasattr(self.agent_data, 'groups') and self.agent_data.groups:
                    response_content = await self._handle_transfer(
                        response_content=response_content,
                        session_id=session_id,
                        org_id=org_id,
                        agent_id=agent_id,
                        customer_id=customer_id,
                        db=db,
                        chat_repo=chat_repo,
                        transfer_group_id=None  # Use agent's default group for regular transfers
                    )
                    return response_content

                # Store AI response with all attributes
                attributes = {
                    "transfer_to_human": response_content.transfer_to_human,
                    "transfer_reason": response_content.transfer_reason.value if response_content.transfer_reason else None,
                    "transfer_description": response_content.transfer_description,
                    "end_chat": response_content.end_chat,
                    "end_chat_reason": response_content.end_chat_reason.value if response_content.end_chat_reason else None,
                    "end_chat_description": response_content.end_chat_description,
                    "request_rating": response_content.request_rating,
                    "shopify_output": response_content.shopify_output
                }
                
                # Add ticket attributes if present
                if response_content.create_ticket:
                    attributes.update({
                        "create_ticket": response_content.create_ticket,
                        "ticket_summary": response_content.ticket_summary,
                        "ticket_description": response_content.ticket_description,
                        "integration_type": response_content.integration_type,
                        "ticket_id": response_content.ticket_id,
                        "ticket_status": response_content.ticket_status,
                        "ticket_priority": response_content.ticket_priority
                    })
                
                
                chat_repo.create_message({
                    "message": response_content.message,
                    "message_type": "bot",
                    "session_id": session_id,
                    "organization_id": org_id,
                    "agent_id": agent_id,
                    "customer_id": customer_id,
                    "attributes": attributes
                })
                
                return response_content

        except Exception as e:
            traceback.print_exc()
            logger.error(f"Chat agent error: {str(e)}")
            error_message = f"I apologize, but I encountered an error, please try again later."
            
            # Create error response
            error_response = ChatResponse(
                message=error_message,
                transfer_to_human=False,
                transfer_reason=None,
                transfer_description=None,
                end_chat=False,
                end_chat_reason=None,
                end_chat_description=None,
                request_rating=False,
                create_ticket=False,
                shopify_output=None
            )
            
            # Store error message
            try:
                with SessionLocal() as db:
                    chat_repo = ChatRepository(db)
                    chat_repo.create_message({
                        "message": error_message,
                        "message_type": "bot",
                        "session_id": session_id,
                        "organization_id": org_id,
                        "agent_id": agent_id,
                        "customer_id": customer_id,
                        "attributes": {"error": str(e)}
                    })
            except Exception as store_error:
                logger.error(f"Failed to store error message: {str(store_error)}")
            
            return error_response

    @staticmethod
    async def test_api_key(api_key: str, model_type: str, model_name: str) -> bool:
        """Test if the API key is valid for the given model type.
        
        Args:
            api_key: The API key to test
            model_type: The type of model (OPENAI, ANTHROPIC, etc.)
            model_name: The name of the model
            
        Returns:
            bool: True if the API key is valid
            
        Raises:
            ValueError: If the model type is not supported
        """
        try:
            from app.utils.agno_utils import test_model_api_key
            return await test_model_api_key(api_key, model_type, model_name)
        except Exception as e:
            traceback.print_exc()
            logger.error(f"Error testing API key: {str(e)}")
            return False
