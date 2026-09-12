"""FastAPI entry point for the FloodGuard LangChain agent."""

import os

import uvicorn
from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import LangGraphAGUIAgent
from dotenv import load_dotenv
from fastapi import FastAPI
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

load_dotenv()


@tool
def get_flood_alerts(area: str) -> str:
    """Look up current flood alerts for an area.

    This starter returns sample data. Replace it with a call to your flood or
    hydrology provider before using it for operational decisions.
    """
    return (
        f"Sample alert data for {area}: Riverside is high risk; Canal district "
        "is elevated; North quay is on watch. Data was last refreshed at 09:30 UTC."
    )


SYSTEM_PROMPT = """You are FloodGuard, a concise flood-operations assistant.
Use get_flood_alerts whenever the user asks for conditions by location. Clearly
label sample data as sample data, do not invent emergency instructions, and
recommend users follow local authorities for life-safety decisions."""

model = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
    temperature=0.2,
)
graph = create_agent(
    model=model,
    tools=[get_flood_alerts],
    system_prompt=SYSTEM_PROMPT,
    checkpointer=MemorySaver(),
)

app = FastAPI(title="FloodGuard agent")

add_langgraph_fastapi_endpoint(
    app=app,
    agent=LangGraphAGUIAgent(
        name="floodguard_agent",
        description="A LangChain agent for flood monitoring and response support.",
        graph=graph,
    ),
    path="/",
)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8123, reload=True)
