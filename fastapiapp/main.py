from fastapi import FastAPI, Response
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from FetchBunkers import FetchBunkers
from SvvRouter import FetchRoute
import httpx
import os
import time

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

@app.get("/api/groot")
def groot(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    start_coords = [start_lon,start_lat] # KORT, LANG
    end_coords = [end_lon,end_lat]
    return FetchRoute(start_coords,end_coords)


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