import base64
import os
from typing import List
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from state import AgentState
from pydantic import BaseModel, Field

class Task_and_Description(BaseModel):
    task: str = Field(..., description="The task to be executed")
    description: str = Field(..., description="Detailed description of the current state of the interface")

# Load environment variables from .env file
load_dotenv()


class OrchestrationAgent:
    """
    Agent responsible for analyzing the user query and screenshot to generate
    a sequence of tasks that need to be executed to fulfill the user's request.
    """
    
    def __init__(self, model_name: str = "claude-sonnet-4-20250514"):
        # Verify Anthropic API key is available
        if not os.getenv("ANTHROPIC_API_KEY"):
            raise ValueError("ANTHROPIC_API_KEY environment variable is required. Please add it to your .env file.")
        
        self.llm = ChatAnthropic(model=model_name).with_structured_output(Task_and_Description)

    def generate_tasks(self, state: AgentState) -> List[str]:
        """
        Generate a list of tasks based on the user query and screenshot.
        
        Args:
            state: Current agent state containing screenshot and user query
            
        Returns:
            List[str]: List of task strings
        """
        if not state["screenshot_image"] or not state["user_query"]:
            return []
        
        # Convert image bytes to base64 for the LLM
        image_base64 = base64.b64encode(state["screenshot_image"]).decode('utf-8')
        
        # Create the message with multimodal content
        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": f"""You are an AI orchestration agent that analyzes screenshots and user requests to break them down into specific, actionable tasks.

Your job is to:
1. Analyze the provided screenshot to understand the current state of the interface, and provide a detailed description of the current state of the interface.
2. Understand what the user wants to accomplish: "{state["user_query"]}"
3. Break down the user's request into a specific, actionable task from the user's current state. You MUST generate **ONE** task from the current state.
4. Each task should be a clear action that can be performed on the interface.

Guidelines:
- Be specific about UI elements (buttons, fields, menus, etc.)
- task should be atomic and actionable
- Focus on what needs to be clicked, typed, or interacted with
- Consider the current state shown in the screenshot

Example:
User query: "I want to send an email to someone on gmail, how can i do this?"
Screeenshot: [screenshot of a browser window]

Task: "Click on the search bar and type 'gmail.com' and press enter"
Description: "The user is currently on the home page of the browser, they want to send an email to someone on gmail.com"



Return your response as a simple list of task strings, one per line, without numbering or bullet points."""
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
        

        
        return (response.task, response.description)


def orchestration_agent_node(state: AgentState) -> AgentState:
    """
    LangGraph node that runs the orchestration agent to generate tasks.
    
    Args:
        state: Current agent state
        
    Returns:
        AgentState: Updated state with generated task and description
    """
    agent = OrchestrationAgent()
    task, description = agent.generate_tasks(state)
    
    # Update state with generated task and description
    updated_state = state.copy()
    updated_state["current_task"] = task
    updated_state["task_description"] = description
    
    # Add to chat history
    updated_state["chat_history"].append({
        "role": "orchestration_agent",
        "content": f"Generated task: {task} with description: {description}"
    })
    
    return updated_state