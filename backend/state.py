from typing import TypedDict, List, Optional, Any, Tuple
from langgraph.graph import StateGraph


class AgentState(TypedDict):
    """
    State object for the LangGraph workflow containing all necessary data
    for orchestrating the multimodal AI agents.
    """
    screenshot_image: Optional[bytes]
    user_query: str
    chat_history: List[dict]
    current_task: Optional[str]
    task_description: Optional[str]
    task_history: List[str]
    coordinates: Optional[Tuple[int, int]]
    is_task_completed: bool


def create_initial_state(image_data: bytes, user_query: str) -> AgentState:
    """
    Initialize the AgentState with image data and user query.
    
    Args:
        image_data: Raw image data of the screenshot
        user_query: The user's request/instruction
        
    Returns:
        AgentState: Initialized state object
    """
    return AgentState(
        screenshot_image=image_data,
        user_query=user_query,
        chat_history=[],
        current_task=None,
        task_description=None,
        task_history=[],
        coordinates=None,
        is_task_completed=False
    )


def update_screenshot(state: AgentState, new_image_data: bytes) -> AgentState:
    """
    Update the state with a new screenshot after user completes a task.
    Also adds the previous task to task history.
    
    Args:
        state: Current agent state
        new_image_data: New screenshot data
        
    Returns:
        AgentState: Updated state with new screenshot and task history
    """
    updated_state = state.copy()
    updated_state["screenshot_image"] = new_image_data
    updated_state["coordinates"] = None  # Reset coordinates for next task
    
    # Add previous task to task history if it exists
    if state["current_task"]:
        updated_state["task_history"] = state["task_history"] + [state["current_task"]]
    
    return updated_state