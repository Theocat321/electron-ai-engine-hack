# app.py

import os
from fastapi import FastAPI, Form, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from state import create_initial_state
from orchestration_agent import OrchestrationAgent
from coordinate_agent import CoordinateAgent

load_dotenv()
app = FastAPI(title="Agent Runner API")

@app.post("/run")
async def run_agents(
    image_path: str = Form(...),
    query: str = Form(...)
):
    """
    Demo endpoint that reads a local image file path instead of handling uploads.
    """
    # load image bytes from given file path
    try:
        with open(image_path, "rb") as f:
            image_data = f.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not open image_path: {e}")

    # initialize state
    state = create_initial_state(image_data, query)

    # 1) orchestration agent
    try:
        orch = OrchestrationAgent()
        task, description = orch.generate_tasks(state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration error: {e}")
    state["current_task"] = task
    state["task_description"] = description

    # 2) coordinate agent
    try:
        coord = CoordinateAgent()
        x, y = coord.generate_coordinates(state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Coordinate error: {e}")

    return JSONResponse({
        "task": task,
        "description": description,
        "coordinates": {"x": x, "y": y}
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
