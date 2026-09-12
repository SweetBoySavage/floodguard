"""FastAPI entry point for the FloodGuard LangChain agent."""

import os
from json import JSONDecodeError, loads
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import uvicorn
from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import CopilotKitMiddleware, LangGraphAGUIAgent
from dotenv import load_dotenv
from fastapi import FastAPI
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

load_dotenv()

ELEVATION_API_URL = "https://api.open-meteo.com/v1/elevation"
GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search"


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


@tool
def get_location_coordinates(location: str) -> str:
    """Resolve a place name to WGS84 latitude and longitude coordinates.

    Use this before get_elevation when a user gives a named place instead of
    coordinates. Include a country, region, or city context when the place name
    is ambiguous. Returns the best matching result from the public geocoder.
    """
    location = location.strip()
    if not location:
        return "Please provide a location name."

    # Open-Meteo's `name` parameter is a place-name search rather than a full
    # postal-style address. Keep the primary name for queries such as
    # "Amsterdam, Netherlands"; returned matches retain their country context.
    place_name = location.split(",", maxsplit=1)[0].strip()
    query = urlencode({"name": place_name, "count": 3, "language": "en", "format": "json"})
    request = Request(
        f"{GEOCODING_API_URL}?{query}",
        headers={"Accept": "application/json", "User-Agent": "FloodGuard/0.1"},
    )
    try:
        with urlopen(request, timeout=10) as response:  # noqa: S310 -- fixed public API URL
            payload = loads(response.read().decode("utf-8"))
        results = payload.get("results", [])
    except (HTTPError, URLError, TimeoutError, JSONDecodeError, TypeError) as error:
        return f"Unable to retrieve coordinates right now: {error}."

    if not results:
        return f"No location found for '{location}'. Try adding a country or region."

    matches = []
    for result in results:
        name = result.get("name", "Unnamed location")
        admin1 = result.get("admin1")
        country = result.get("country")
        context = ", ".join(part for part in (admin1, country) if part)
        label = f"{name} ({context})" if context else name
        matches.append(
            f"{label}: {result['latitude']:.5f}, {result['longitude']:.5f}"
        )

    return "Coordinates (WGS84), from Open-Meteo Geocoding API:\n" + "\n".join(matches)


@tool
def get_elevation(latitude: float, longitude: float) -> str:
    """Get terrain elevation in metres above mean sea level for WGS84 coordinates.

    Use this when the user supplies a latitude and longitude or asks about the
    terrain height of a known coordinate. The result is a 90 m DEM estimate,
    not a surveyed elevation or a live water-level measurement.
    """
    if not -90 <= latitude <= 90:
        return "Invalid latitude. It must be between -90 and 90 degrees."
    if not -180 <= longitude <= 180:
        return "Invalid longitude. It must be between -180 and 180 degrees."

    query = urlencode({"latitude": latitude, "longitude": longitude})
    request = Request(
        f"{ELEVATION_API_URL}?{query}",
        headers={"Accept": "application/json", "User-Agent": "FloodGuard/0.1"},
    )
    try:
        with urlopen(request, timeout=10) as response:
            payload = loads(response.read().decode("utf-8"))
        elevation = payload["elevation"][0]
    except (
        HTTPError,
        URLError,
        TimeoutError,
        JSONDecodeError,
        KeyError,
        IndexError,
        TypeError,
    ) as error:
        return f"Unable to retrieve elevation data right now: {error}."

    return (
        f"Terrain elevation at {latitude:.5f}, {longitude:.5f} is approximately "
        f"{elevation:.0f} m above mean sea level. Source: Open-Meteo's 90 m "
        "Copernicus DEM elevation API."
    )


SYSTEM_PROMPT = """You are FloodGuard, a concise flood-operations assistant.
Use get_flood_alerts whenever the user asks for conditions by location. Use
get_location_coordinates to resolve a named place into WGS84 coordinates; call
it before get_elevation if a user asks about terrain height for a place but has
not supplied coordinates. When a user asks about any location, call the
focus_map frontend tool with the selected latitude, longitude, and location
label, so the map moves to that place. Clearly label sample flood data as sample
data, do not invent emergency instructions, and recommend users follow local
authorities for life-safety decisions."""

model = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
    temperature=0.2,
)
graph = create_agent(
    model=model,
    tools=[get_flood_alerts, get_location_coordinates, get_elevation],
    middleware=[CopilotKitMiddleware()],
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
