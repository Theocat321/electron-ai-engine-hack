from pydantic import BaseModel, Field

class Coordinates(BaseModel):
    x: int = Field(..., description="The x coordinate of the element")
    y: int = Field(..., description="The y coordinate of the element")

# prompt gemini to find the coordinates of the element
prompt = """
You are a helpful assistant that can find the coordinates of an element on a page.

"""

