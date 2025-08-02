#!/usr/bin/env python3
"""
FastAPI server for the AI agent backend.
Provides endpoints for the frontend to interact with the AI agents.
"""

import base64
from typing import Optional
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from state import create_initial_state, update_screenshot, AgentState
from orchestration_agent import orchestration_agent_node
from coordinate_agent import coordinate_agent_node

app = FastAPI(title="AI Agent Backend", version="1.0.0")

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state storage (in production, use proper state management)
current_state: Optional[AgentState] = None


class InitialRequest(BaseModel):
    user_query: str
    screenshot_base64: str


class CoordinateResponse(BaseModel):
    x: int
    y: int
    task: str
    task_description: str
    is_completed: bool


class UpdateScreenshotRequest(BaseModel):
    screenshot_base64: str


@app.post("/initialize", response_model=CoordinateResponse)
async def initialize_session(request: InitialRequest):
    """
    Initialize a new session with user query and screenshot.
    Returns the first task and coordinates.
    """
    global current_state
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.screenshot_base64)
        
        # Create initial state
        current_state = create_initial_state(image_data, request.user_query)
        
        # Run orchestration agent to get first task
        current_state = orchestration_agent_node(current_state)
        
        # Run coordinate agent to get coordinates
        current_state = coordinate_agent_node(current_state)
        
        return CoordinateResponse(
            x=current_state["coordinates"][0],
            y=current_state["coordinates"][1],
            task=current_state["current_task"],
            task_description=current_state["task_description"],
            is_completed=current_state["is_task_completed"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


@app.post("/update_screenshot", response_model=CoordinateResponse)
async def update_screenshot_and_continue(request: UpdateScreenshotRequest):
    """
    Update the screenshot and continue the workflow.
    Returns the next task and coordinates.
    """
    global current_state
    
    if current_state is None:
        raise HTTPException(status_code=400, detail="No active session. Please initialize first.")
    
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.screenshot_base64)
        
        # Update screenshot in state
        current_state = update_screenshot(current_state, image_data)
        
        # Run orchestration agent to get next task
        current_state = orchestration_agent_node(current_state)
        
        # Check if task is completed
        if current_state["is_task_completed"]:
            return CoordinateResponse(
                x=0,
                y=0,
                task="Task completed",
                task_description="All tasks have been completed successfully.",
                is_completed=True
            )
        
        # Run coordinate agent to get coordinates for new task
        current_state = coordinate_agent_node(current_state)
        
        return CoordinateResponse(
            x=current_state["coordinates"][0],
            y=current_state["coordinates"][1],
            task=current_state["current_task"],
            task_description=current_state["task_description"],
            is_completed=current_state["is_task_completed"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


@app.get("/status")
async def get_status():
    """
    Get the current status of the session.
    """
    global current_state
    
    if current_state is None:
        return {"status": "No active session"}
    
    return {
        "status": "Active session",
        "current_task": current_state.get("current_task"),
        "task_description": current_state.get("task_description"),
        "coordinates": current_state.get("coordinates"),
        "is_completed": current_state.get("is_task_completed", False),
        "task_history_count": len(current_state.get("task_history", []))
    }


@app.post("/reset")
async def reset_session():
    """
    Reset the current session.
    """
    global current_state
    current_state = None
    return {"message": "Session reset successfully"}


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)