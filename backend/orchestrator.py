"""
Orchestration layer for Ricky - handles tool calls and LLM coordination.
"""

import json
import re
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator, Tuple
import asyncio
from tools.api import execute_tool
from prompts.system_prompt import get_system_prompt, get_rag_enhanced_system_prompt
from services.model_manager import get_model_manager

logger = logging.getLogger(__name__)


class RickyOrchestrator:
    """
    Orchestrates interactions between the LLM, tools, and user.
    Handles tool call detection, execution, and response generation.
    """
    
    def __init__(self, model: str = "mistral:7b"):
        """Initialize the orchestrator with a model."""
        self.model = model
        self.model_provider = None
        self.system_prompt = get_system_prompt()
        self.knowledge_service = None
        
    async def _get_knowledge_service(self):
        """Get or initialize the knowledge service."""
        if self.knowledge_service is None:
            from services.knowledge_service import KnowledgeService
            self.knowledge_service = KnowledgeService()
        return self.knowledge_service
        
    async def _get_provider(self):
        """Get or initialize the model provider."""
        if self.model_provider is None:
            model_manager = await get_model_manager()
            self.model_provider = await model_manager.get_provider(self.model)
        return self.model_provider
        
    def _is_tool_call(self, response: str) -> bool:
        """
        Detect if the LLM response is a tool call (JSON format).
        
        Args:
            response: The LLM response string
            
        Returns:
            True if response appears to be a tool call JSON
        """
        # Clean the response - remove code blocks if present
        logger.info(f"CHECK IS A TOOL CALL : {response}")
        cleaned = response.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        # Look for JSON patterns in the response
        try:
            # Try to find JSON in the response
            lines = response.split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith('{') and line.endswith('}'):
                    data = json.loads(line)
                    # Check if it's a tool call (has action) or no-tool response (has tool_call: false)
                    if isinstance(data, dict):
                        # If it has "action" field, it's a tool call
                        if "action" in data and "parameters" in data:
                            return True
                        # If it has "tool_call": "false", it's not a tool call
                        if "tool_call" in data and str(data["tool_call"]).lower() == "false":
                            return False
            
            # Also try the cleaned version
            data = json.loads(cleaned)
            if isinstance(data, dict):
                # If it has "action" field, it's a tool call
                if "action" in data and "parameters" in data:
                    return True
                # If it has "tool_call": "false", it's not a tool call  
                if "tool_call" in data and str(data["tool_call"]).lower() == "false":
                    return False
                    
        except (json.JSONDecodeError, TypeError):
            pass
            
        return False
    
    def _is_no_tool_response(self, response: str) -> bool:
        """
        Check if the LLM explicitly said no tool is needed.
        
        Args:
            response: The LLM response string
            
        Returns:
            True if response indicates no tool is needed
        """
        cleaned = response.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        try:
            # Try to find JSON in the response
            lines = response.split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith('{') and line.endswith('}'):
                    data = json.loads(line)
                    if (isinstance(data, dict) and 
                        "tool_call" in data and 
                        str(data["tool_call"]).lower() == "false"):
                        return True
            
            # Also try the cleaned version
            data = json.loads(cleaned)
            return (
                isinstance(data, dict) and 
                "tool_call" in data and 
                str(data["tool_call"]).lower() == "false"
            )
        except (json.JSONDecodeError, TypeError):
            return False
    
    def _parse_tool_call(self, response: str) -> Optional[Dict[str, Any]]:
        """
        Parse a tool call from LLM response.
        
        Args:
            response: The LLM response containing tool call JSON
            
        Returns:
            Parsed tool call dict or None if parsing fails
        """
        try:
            # First try to find JSON in individual lines
            lines = response.split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith('{') and line.endswith('}'):
                    try:
                        tool_call = json.loads(line)
                        if ("action" in tool_call and 
                            "parameters" in tool_call and
                            isinstance(tool_call["parameters"], dict)):
                            return tool_call
                    except json.JSONDecodeError:
                        continue
            
            # Then try to clean and parse the whole response
            cleaned = response.strip()
            if cleaned.startswith('```json'):
                cleaned = cleaned[7:]
            if cleaned.endswith('```'):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            # Parse JSON
            tool_call = json.loads(cleaned)
            
            # Validate structure
            required_fields = ["action", "parameters"]
            if not all(field in tool_call for field in required_fields):
                logger.error(f"Tool call missing required fields: {tool_call}")
                return None
                
            return tool_call
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse tool call JSON: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error parsing tool call: {e}")
            return None
    
    def _validate_tool_call(self, tool_call: Dict[str, Any]) -> bool:
        """
        Validate that the tool call uses an existing/available tool.
        
        Args:
            tool_call: Parsed tool call dictionary
            
        Returns:
            True if tool exists and is valid
        """
        # List of available tools
        available_tools = {"google_calendar_events"}
        
        action = tool_call.get("action", "")
        
        # Check if the action is in our available tools
        if action not in available_tools:
            logger.warning(f"❌ Invalid tool call: '{action}' is not available. Available tools: {available_tools}")
            return False
            
        # Additional validation can be added here
        parameters = tool_call.get("parameters", {})
        if not isinstance(parameters, dict):
            logger.warning(f"❌ Invalid parameters format for tool '{action}'")
            return False
            
        logger.info(f"✅ Tool call validated: {action}")
        return True
    
    def _build_messages(self, user_message: str, history: List[Dict[str, str]], knowledge_context: Optional[str] = None) -> List[Dict[str, str]]:
        """
        Build message list for LLM including system prompt and history.
        
        Args:
            user_message: Current user message
            history: Previous conversation history
            knowledge_context: Optional knowledge context from RAG
            
        Returns:
            List of messages in chat format
        """
        # Use RAG-enhanced system prompt if knowledge context is available
        if knowledge_context:
            system_prompt = get_rag_enhanced_system_prompt(knowledge_context)
        else:
            system_prompt = get_system_prompt()
            
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in history:
            if msg["role"] in ["user", "assistant"]:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        print("MESSAGE : ", messages)
        return messages
    
    async def _execute_tool_call(self, tool_call: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a tool call and return results.
        
        Args:
            tool_call: Parsed tool call dictionary
            
        Returns:
            Tool execution results
        """
        action = tool_call["action"]
        parameters = tool_call["parameters"]
        reasoning = tool_call.get("reasoning", "No reasoning provided")
        
        logger.info(f"🔧 Executing tool: {action} with reasoning: {reasoning}")
        
        try:
            result = await execute_tool(action, parameters)
            return result
        except Exception as e:
            logger.error(f"Tool execution failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "tool": action
            }
    
    async def _generate_final_response(
        self, 
        user_message: str, 
        history: List[Dict[str, str]], 
        tool_call: Optional[Dict[str, Any]] = None, 
        tool_result: Optional[Dict[str, Any]] = None,
        knowledge_sources: Optional[List[Dict[str, Any]]] = None,
        knowledge_context: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Generate final response incorporating tool results or handling no-tool responses.
        
        Args:
            user_message: Original user message
            history: Conversation history
            tool_call: The tool call that was executed (if any)
            tool_result: Results from tool execution (if any)
            knowledge_sources: Knowledge sources used for context (if any)
            knowledge_context: Knowledge context string for RAG
            
        Yields:
            Response chunks
        """
        # Create appropriate context based on whether tools were used
        if tool_call and tool_result:
            # Tool was executed - create context with tool results
            tool_context = (
                f"The user asked: '{user_message}'\n\n"
                f"I executed the {tool_call['action']} tool and got this result:\n"
                f"{json.dumps(tool_result, indent=2)}\n\n"
                f"IMPORTANT: Respond using the context(tool and other history) provided. "
                f"Be creative while responding."
            )
        else:
            # No tool needed - create context for direct response
            tool_context = f"This wasn't a tool call. Question: {user_message} \n\n IMPORTANT : Do not include the result of tool call in the final response."
        
        # Use RAG-enhanced system prompt if knowledge context is available
        if knowledge_context:
            system_prompt = get_rag_enhanced_system_prompt(knowledge_context)
        else:
            system_prompt = get_system_prompt()
        
        # Create messages for the final response with proper knowledge context
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": tool_context}
        ]
        
        # Get provider and stream the final response
        provider = await self._get_provider()
        
        # If knowledge sources were used, we might want to add source citations at the end
        response_chunks = []
        async for chunk in provider.generate_stream(messages):
            response_chunks.append(chunk)
            yield chunk
            await asyncio.sleep(0)
        
        # Add source citations if knowledge was used (optional enhancement)
        if knowledge_sources and len(knowledge_sources) > 0:
            full_response = ''.join(response_chunks)
            # Only add citations if the response seems to use the knowledge
            if len(full_response.strip()) > 50:  # Basic check for substantial response
                citations = self._format_knowledge_citations(knowledge_sources)
                if citations:
                    yield f"\n\n{citations}"
    
    def _format_knowledge_citations(self, knowledge_sources: List[Dict[str, Any]]) -> str:
        """
        Format knowledge sources into citation text.
        
        Args:
            knowledge_sources: List of knowledge source metadata
            
        Returns:
            Formatted citation string
        """
        if not knowledge_sources:
            return ""
        
        # Group sources by source name to avoid duplicates
        unique_sources = {}
        for source in knowledge_sources:
            source_key = f"{source['source_name']}"
            if source_key not in unique_sources:
                unique_sources[source_key] = source
        
        if len(unique_sources) == 1:
            source = list(unique_sources.values())[0]
            return f"*Source: {source['file_name']} from {source['source_name']}*"
        else:
            source_list = [f"{s['file_name']} from {s['source_name']}" for s in unique_sources.values()]
            return f"*Sources: {', '.join(source_list)}*"

    
    async def process_message(
        self, 
        user_message: str, 
        history: List[Dict[str, str]]
    ) -> AsyncGenerator[str, None]:
        """
        Process a user message through the orchestration pipeline with RAG support.
        
        This is the main entry point that:
        1. Searches knowledge base for relevant context
        2. Gets initial LLM response with knowledge context
        3. Detects if it's a tool call
        4. Executes tools if needed
        5. Generates final response
        
        Args:
            user_message: The user's message
            history: Previous conversation history
            
        Yields:
            Response chunks (streaming)
        """
        logger.info(f"🎭 Processing message with RAG: {user_message[:100]}...")
        
        # Step 1: Search knowledge base for relevant context
        knowledge_context = None
        knowledge_sources = []
        
        try:
            knowledge_service = await self._get_knowledge_service()
            rag_result = knowledge_service.search_for_chat_context(user_message)
            
            if rag_result['has_knowledge']:
                knowledge_context = rag_result['context']
                knowledge_sources = rag_result['sources']
                logger.info(f"🧠 Found {rag_result['chunk_count']} relevant knowledge chunks (avg similarity: {rag_result.get('avg_similarity', 0):.3f})")
            else:
                logger.info("🧠 No relevant knowledge found, proceeding with general knowledge")
                
        except Exception as e:
            logger.warning(f"⚠️ Knowledge search failed: {e}, proceeding without RAG")
        
        # Step 2: Build messages with knowledge context for initial LLM call
        messages = self._build_messages(user_message, history, knowledge_context)
        
        # Get provider and initial response from LLM
        logger.info("🤖 Getting initial LLM response...")
        provider = await self._get_provider()
        
        initial_response = ""
        async for chunk in provider.generate_stream(messages):
            if chunk:
                initial_response += chunk
        
        logger.info(f"📝 Initial response: {initial_response[:200]}...")
        logger.info(f"🔍 Is tool call: {self._is_tool_call(initial_response)}")
        logger.info(f"🚫 Is no-tool response: {self._is_no_tool_response(initial_response)}")
        
        # Check if response is a tool call
        if self._is_tool_call(initial_response):
            logger.info("🔧 Detected tool call, parsing and executing...")
            
            # Parse the tool call
            tool_call = self._parse_tool_call(initial_response)
            if not tool_call:
                logger.error("❌ Failed to parse tool call")
                yield "I tried to use a tool but there was an error parsing the request. Let me try a different approach."
                return
            
            logger.info(f"🎯 Parsed tool call: {tool_call}")
            
            # Validate the tool call
            if not self._validate_tool_call(tool_call):
                logger.error(f"❌ Invalid tool call: {tool_call}")
                # Treat as a no-tool response instead
                async for chunk in self._generate_final_response(
                    user_message, history, None, None, knowledge_sources, knowledge_context
                ):
                    yield chunk
                    await asyncio.sleep(0)
                return
            
            # Execute the tool
            tool_result = await self._execute_tool_call(tool_call)
            logger.info(f"📊 Tool result: {tool_result}")
            
            # Generate final response with tool results
            logger.info("🎯 Generating final response with tool results...")
            async for chunk in self._generate_final_response(
                user_message, history, tool_call, tool_result, knowledge_sources, knowledge_context
            ):
                yield chunk
                await asyncio.sleep(0)
                
        elif self._is_no_tool_response(initial_response):
            logger.info("💬 No tool needed, generating direct response...")
            # Generate response without tool execution but with knowledge context
            async for chunk in self._generate_final_response(
                user_message, history, None, None, knowledge_sources, knowledge_context
            ):
                yield chunk
                await asyncio.sleep(0)
        else:
            # Fallback: treat as direct response if we can't parse the JSON properly
            logger.info("🤷 Couldn't determine response type, treating as direct response...")
            async for chunk in self._generate_final_response(
                user_message, history, None, None, knowledge_sources, knowledge_context
            ):
                yield chunk
                await asyncio.sleep(0)


async def create_orchestrator(model: str = "mistral:7b") -> RickyOrchestrator:
    """
    Factory function to create and initialize an orchestrator.
    
    Args:
        model: The LLM model to use
        
    Returns:
        Initialized RickyOrchestrator instance
    """
    return RickyOrchestrator(model=model)