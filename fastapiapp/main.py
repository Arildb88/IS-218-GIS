from fastapi import FastAPI, Response
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from FetchBunkers import FetchBunkers
from MapRoutingation import get_road_graph, closest_bunker_route, route_to_geojson
import httpx
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


url = "https://wfs.geonorge.no/skwms1/wfs.tilfluktsrom_offentlige?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=app:Tilfluktsrom"
_bunkers = FetchBunkers(url)
app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/proxy")
async def proxy(url: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
        return Response(
            content=r.content,
            media_type="application/json",
            headers={
                
            }
        )

@app.get("/api/getroute")
def getroute(lat: float,lon: float):
    G = get_road_graph(lat = lat, lon = lon)
    res = closest_bunker_route(G,lat,lon,_bunkers)
    geojsonRoute = route_to_geojson(G,res["route"]);

    return geojsonRoute

@app.get("/api/bunkers")
def bunkers():
    return _bunkers;

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",      # filename:FastAPI_instance
        host="127.0.0.1",
        port=8000,
        reload=True
    )