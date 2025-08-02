import base64
import os
from typing import Tuple
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage
from state import AgentState
from pydantic import BaseModel, Field

class Coordinates(BaseModel):
    x: int = Field(..., description="The x coordinate to click/interact with")
    y: int = Field(..., description="The y coordinate to click/interact with")

# Load environment variables from .env file
load_dotenv()


class CoordinateAgent:
    """
    Agent responsible for analyzing the current task and screenshot to generate
    precise coordinates for UI interaction.
    """
    
    def __init__(self, model_name: str = "claude-3-5-sonnet-20241022"):
        # Verify Anthropic API key is available
        if not os.getenv("ANTHROPIC_API_KEY"):
            raise ValueError("ANTHROPIC_API_KEY environment variable is required. Please add it to your .env file.")
        
        self.llm = ChatAnthropic(model=model_name).with_structured_output(Coordinates)

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
4. Provide the precise x,y coordinates for the center of that UI element

Task Context: {state.get("task_description", "No additional context")}

Guidelines:
- Look for the specific UI element mentioned in the task (button, field, link, etc.)
- Return coordinates for the CENTER of the target element
- Coordinates should be precise enough for a mouse click or touch interaction
- If multiple similar elements exist, choose the most logical one based on the task context
- Consider typical UI patterns and user expectations

Current task to locate: "{state["current_task"]}"

Return the x and y coordinates as integers representing pixel positions on the screen."""
                },
                {
                    "type": "image",
                    "source_type": "base64",
                    "data": image_base64,
                    "mime_type": "image/png"
                }
            ]
        )
        
        # Generate response
        response = self.llm.invoke([message])
        
        return (response.x, response.y)


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