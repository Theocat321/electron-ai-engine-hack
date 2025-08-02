
# SPEC.md

## 1. Frameworks/Libraries Used

*   **LangChain:** The core framework for building the agents and tools.
*   **LangGraph:** For orchestrating the workflow and managing the state between the different components.
*   **Claude (Anthropic):** Multimodal LLM for vision and reasoning capabilities of the agents.
*   **python-dotenv:** For environment variable management (.env file support).

## 2. LangChain & LangGraph Components

*   **StateGraph:** The fundamental class from LangGraph used to define the structure of the workflow as a state machine.
*   **State Object:** A Python `TypedDict` that will contain:
    *   `screenshot_image`: The raw image data of the screenshot.
    *   `user_query`: The user's request.
    *   `chat_history`: A log of the conversation.
    *   `current_task`: A single task string representing the current step to accomplish.
    *   `task_description`: Contextual description of the current state and progress toward the goal.
    *   `task_history`: A log of previous tasks
    *   `coordinates`: Tuple of (x, y) coordinates for the current task.
    *   `is_task_completed`: Boolean indicating if the user's overall goal is accomplished.
*   **Nodes:** Each agent and tool will be represented as a node in the graph.
    *   `OrchestrationAgentNode`: This node will take the `user_query`, `screenshot_image`, and `task_description` (for context) to generate a **single** `current_task` and updated `task_description`.
    *   `CoordinateAgentNode`: This node will take the current task and the `screenshot_image` to generate the coordinates.
    *   `SendCoordinatesNode`: This node will call the `SendCoordinates` tool.
*   **Edges:** To connect the nodes and control the flow of the graph.
    *   **Conditional Edges:** We'll use conditional edges to decide the next step in the workflow. After the `OrchestrationAgentNode` runs, it proceeds to the `CoordinateAgentNode`. After coordinates are sent and a new screenshot is received, the flow returns to `OrchestrationAgentNode` to generate the next task until the user's goal is accomplished.
*   **Tools:**
    *   `@tool` decorator: To define the `SendCoordinates` function as a LangChain tool.
*   **Prompt Templates:**
    *   `HumanMessage` with multimodal content (text + base64 image) will be used to structure the prompts for the LLMs in the agents.

## 3. Updated Single-Task Workflow Architecture

### LangGraph Flow
```
+-----------------+
|      User       |
+-----------------+
        |
        | 1. Screenshot + Query
        v
+--------------------------------------------------------------------------------------------------+
|                                       LangGraph State                                            |
|--------------------------------------------------------------------------------------------------|
| {                                                                                                |
|   "screenshot_image": <image_data>,                                                              |
|   "user_query": "How can I send an email on gmail",                                             |
|   "chat_history": [...],                                                                         |
|   "current_task": "Click on the search bar",                                                    |
|   "task_description": "User wants to email someone on gmail, currently on Firefox home page,   |
|                        first task is to click on the search bar",                               |
|   "task_history": [...]
|   "coordinates": (150, 200),                                                                    |
|   "is_task_completed": false                                                                    |
| }                                                                                                |
+--------------------------------------------------------------------------------------------------+
        |
        |
+-------v---------+      +-------------------------+      +-----------------------+
| START           +------> OrchestrationAgentNode  +------> CoordinateAgentNode   |
+-----------------+      | (Generates task +       |      | (Gets coordinates     |
                         | description)            |      | for current task)     |
                         +-------------------------+      +-----------+-----------+
                                    ^                                 |
                                    |                                 |
                                    |                       +---------v---------+
                                    |                       | SendCoordinatesNode |
                                    |                       | (Sends coordinates  |
                                    |                       | to frontend)        |
                                    |                       +---------+---------+
                                    |                                 |
                                    |                                 | 2. New Screenshot
                                    |                                 v
                                    |                       +-------------------+
                                    |                       | Update Screenshot |
                                    |                       | in State,Add previous task to task history          |
                                    |                       +-------------------+
                                    |                                 |
                                    |                                 |
                                    |                       +---------v-----------+
                                    |                       | ConditionalEdge     |
                                    +<----------------------+ (Goal completed?)   |
                                            No              +---------+-----------+
                                    (with context)                    |
                                                                      | Yes
                                                                      v
                                                            +-------+-------+
                                                            |      END      |
                                                            +---------------+
```

### Example Flow with Context
```
Initial State:
User Query: "How can I email someone on gmail?"
Screenshot: Firefox home page
task_description: ""

Step 1 - OrchestrationAgent Output:
┌─────────────────────────────────────────────────────────────────────────────────┐
│ current_task: "Click on the search bar"                                        │
│ task_description: "User wants to email someone on gmail, currently on Firefox  │
│                   home page, first task is to click on the search bar"        │
└─────────────────────────────────────────────────────────────────────────────────┘

After user clicks search bar and new screenshot received:

Step 2 - OrchestrationAgent Input (with context):
┌─────────────────────────────────────────────────────────────────────────────────┐
│ user_query: "How can I email someone on gmail?"                                │
│ screenshot_image: <new_image_of_search_bar_focused>                            │
│ task_description: "User wants to email someone on gmail, currently on Firefox  │
│                   home page, first task is to click on the search bar"        │
└─────────────────────────────────────────────────────────────────────────────────┘

Step 2 - OrchestrationAgent Output:
┌─────────────────────────────────────────────────────────────────────────────────┐
│ current_task: "Type 'gmail.com' in the search bar"                             │
│ task_description: "User wants to email someone on gmail, clicked on search bar │
│                   successfully, now need to type 'gmail.com' to navigate"     │
└─────────────────────────────────────────────────────────────────────────────────┘
```
