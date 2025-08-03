import base64
import os
import re
from typing import Tuple
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage
from state import AgentState
from pydantic import BaseModel, Field

class Coordinates(BaseModel):
    x: int = Field(..., description="The x coordinate to click/interact with. Must be an integer.")
    y: int = Field(..., description="The y coordinate to click/interact with. Must be an integer.")

# Load environment variables from .env file
load_dotenv()


class CoordinateAgent:
    """
    Agent responsible for analyzing the current task and screenshot to generate
    precise coordinates for UI interaction.
    """
    
    def __init__(self, model_name: str = "claude-sonnet-4-20250514"):
        # Verify Anthropic API key is available
        if not os.getenv("ANTHROPIC_API_KEY"):
            raise ValueError("ANTHROPIC_API_KEY environment variable is required. Please add it to your .env file.")
        
        self.llm = ChatAnthropic(model=model_name).with_structured_output(Coordinates, include_raw=True)

    def _parse_coordinates_from_text(self, text: str) -> Tuple[int, int]:
        """
        Parse coordinates from text content when structured output fails.
        Handles formats like "1198, 252" or "x=1198, y=252" or "(1198, 252)"
        """
        # Try different regex patterns to extract coordinates
        patterns = [
            r"(\d+),\s*(\d+)",  # "1198, 252"
            r"x[=:]\s*(\d+).*?y[=:]\s*(\d+)",  # "x=1198, y=252"
            r"\((\d+),\s*(\d+)\)",  # "(1198, 252)"
            r"(\d+)\s+(\d+)",  # "1198 252"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    x, y = int(match.group(1)), int(match.group(2))
                    return (x, y)
                except (ValueError, IndexError):
                    continue
        
        # If no pattern matches, return center of screen as fallback
        return (640, 360)

    def generate_coordinates(self, state: AgentState) -> Tuple[int, int]:
        """
        Generate coordinates based on the current task and screenshot.
        
        Args:
            state: Current agent state containing task and screenshot
            
        Returns:
            Tuple[int, int]: (x, y) coordinates for the action
        """
        if not state["screenshot_image"] or not state["current_task"]:
            return (0, 0)
        
        # Convert image bytes to base64 for the LLM
        image_base64 = base64.b64encode(state["screenshot_image"]).decode('utf-8')
        
        # Create the message with multimodal content
        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": f"""You are an AI coordinate generation agent that analyzes screenshots and specific tasks to determine precise coordinates for UI interactions.

Your job is to:
1. Analyze the provided screenshot to identify UI elements
2. Understand the specific task: "{state["current_task"]}"
3. Locate the exact UI element that needs to be interacted with for this task
4. Provide the precise x and y coordinates for the center of that UI element

Task Context: {state.get("task_description", "No additional context")}

Guidelines:
- Look for the specific UI element mentioned in the task (button, field, link, etc.)
- Return coordinates for the CENTER of the target element
- Coordinates should be precise enough for a mouse click or touch interaction
- If multiple similar elements exist, choose the most logical one based on the task context
- Consider typical UI patterns and user expectations

Current task to locate: "{state["current_task"]}"

IMPORTANT: You must return the x and y coordinates as separate integer fields. Example format:
x: 1198
y: 252"""
                },
                {
                    "type": "image",
                    "source_type": "base64",
                    "data": image_base64,
                    "mime_type": "image/png"
                }
            ]
        )
        
        # Generate response with error handling
        try:
            response = self.llm.invoke([message])
            
            # Check if we got a parsing error
            if response.get("parsing_error"):
                print(f"Parsing error occurred: {response['parsing_error']}")
                # Try to parse coordinates from raw content
                raw_content = str(response["raw"].content) if response.get("raw") else ""
                return self._parse_coordinates_from_text(raw_content)
            
            # Check if we got parsed coordinates
            if response.get("parsed"):
                parsed = response["parsed"]
                return (parsed.x, parsed.y)
            
            # If no parsed result, try to extract from raw content
            if response.get("raw"):
                raw_content = str(response["raw"].content)
                return self._parse_coordinates_from_text(raw_content)
                
            # Fallback - shouldn't reach here with include_raw=True
            return (640, 360)
            
        except Exception as e:
            print(f"Error generating coordinates: {e}")
            # Try to extract coordinates from error message if it contains them
            error_str = str(e)
            if "1198, 252" in error_str or "x=" in error_str.lower():
                return self._parse_coordinates_from_text(error_str)
            return (640, 360)


def coordinate_agent_node(state: AgentState) -> AgentState:
    """
    LangGraph node that runs the coordinate agent to generate coordinates.
    
    Args:
        state: Current agent state
        
    Returns:
        AgentState: Updated state with generated coordinates
    """
    agent = CoordinateAgent()
    x, y = agent.generate_coordinates(state)
    
    # Update state with generated coordinates
    updated_state = state.copy()
    updated_state["coordinates"] = (x, y)
    
    # Add to chat history
    updated_state["chat_history"].append({
        "role": "coordinate_agent",
        "content": f"Generated coordinates ({x}, {y}) for task: {state['current_task']}"
    })
    
    return updated_state