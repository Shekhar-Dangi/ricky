"""
Orchestration layer for Ricky - handles tool calls and LLM coordination.
"""

import json
import re
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator, Tuple
import asyncio
from tools.api import execute_tool
from prompts.system_prompt import get_system_prompt
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
                    if (isinstance(data, dict) and 
                        "action" in data and 
                        "parameters" in data and
                        isinstance(data["parameters"], dict)):
                        return True
            
            # Also try the cleaned version
            data = json.loads(cleaned)
            return (
                isinstance(data, dict) and 
                "action" in data and 
                "parameters" in data and
                isinstance(data["parameters"], dict)
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
    
    def _build_messages(self, user_message: str, history: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """
        Build message list for LLM including system prompt and history.
        
        Args:
            user_message: Current user message
            history: Previous conversation history
            
        Returns:
            List of messages in chat format
        """
        messages = [{"role": "system", "content": self.system_prompt}]
        
        # Add conversation history
        for msg in history:
            if msg["role"] in ["user", "assistant"]:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
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
        tool_call: Dict[str, Any], 
        tool_result: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """
        Generate final response incorporating tool results.
        
        Args:
            user_message: Original user message
            history: Conversation history
            tool_call: The tool call that was executed
            tool_result: Results from tool execution
            
        Yields:
            Response chunks
        """
        # Create a focused prompt for tool result presentation
        tool_context = (
            f"The user asked: '{user_message}'\n\n"
            f"I executed the {tool_call['action']} tool and got this result:\n"
            f"{json.dumps(tool_result, indent=2)}\n\n"
            f"IMPORTANT: Present ONLY the information from the tool result above. "
            f"Do NOT add topics about technology, computing, clouds, or anything else. "
            f"Just answer the user's question with the calendar data provided. "
            f"Be friendly but stay focused on their calendar question only."
        )
        
        # Create a minimal system prompt for tool response
        focused_system_prompt = (
            "You are Ricky, a helpful assistant. When given tool results, present them clearly "
            "and stay focused ONLY on the data provided. Do not add unrelated topics or explanations "
            "about technology. Just answer the user's question with the information given."
        )
        
        # Create a simple message chain focused on tool result presentation
        messages = [
            {"role": "system", "content": focused_system_prompt},
            {"role": "user", "content": tool_context}
        ]
        
        # Get provider and stream the final response
        provider = await self._get_provider()
        async for chunk in provider.generate_stream(messages):
            yield chunk
            await asyncio.sleep(0)

    
    async def process_message(
        self, 
        user_message: str, 
        history: List[Dict[str, str]]
    ) -> AsyncGenerator[str, None]:
        """
        Process a user message through the orchestration pipeline.
        
        This is the main entry point that:
        1. Gets initial LLM response
        2. Detects if it's a tool call
        3. Executes tools if needed
        4. Generates final response
        
        Args:
            user_message: The user's message
            history: Previous conversation history
            
        Yields:
            Response chunks (streaming)
        """
        logger.info(f"🎭 Processing message: {user_message[:100]}...")
        
        # Build messages for initial LLM call
        messages = self._build_messages(user_message, history)
        
        # Get provider and initial response from LLM
        logger.info("🤖 Getting initial LLM response...")
        provider = await self._get_provider()
        
        initial_response = ""
        async for chunk in provider.generate_stream(messages):
            if chunk:
                initial_response += chunk
        
        logger.info(f"📝 Initial response: {initial_response[:200]}...")
        logger.info(f"🔍 Is tool call: {self._is_tool_call(initial_response)}")
        
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
            
            # Execute the tool
            tool_result = await self._execute_tool_call(tool_call)
            logger.info(f"📊 Tool result: {tool_result}")
            
            # Generate final response with tool results
            logger.info("🎯 Generating final response with tool results...")
            async for chunk in self._generate_final_response(
                user_message, history, tool_call, tool_result
            ):
                yield chunk
                await asyncio.sleep(0)
        else:
            # Direct response, stream it back chunk by chunk
            logger.info("💬 Direct response, streaming back...")
            # Stream the initial response character by character or word by word
            words = initial_response.split()
            for i, word in enumerate(words):
                if i == 0:
                    yield word
                else:
                    yield " " + word
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