from fastapi import FastAPI, Response, Query
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from FetchBunkers import FetchBunkers
from SvvRouter import FetchRoute
import httpx
import os
import time

from SupaClient import supabase

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

        headers = {
            "X-Client": "Vegkart",
            # optionally forward content-type
            "Content-Type": r.headers.get("content-type", "application/octet-stream"),
        }

        return Response(
            content=r.content,
            status_code=r.status_code,
            headers=headers,
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


@app.get("/kommune-geojson")
async def kommune_geojson(lat: float = Query(...), lon: float = Query(...)):
    """
    Returns the GeoJSON of the municipality containing the given lat/lon.
    """
    try:
        response = supabase.rpc(
            "get_municipality_geojson",
            {"p_lat": float(lat), "p_lon": float(lon)}
        ).execute()

        # Debug print
        print("Supabase response:", response.data)

        return response.data

    except Exception as e:
        return {"status": "error", "message": str(e)}
    
@app.get("/health")
async def health_check():
    """
    Simple health check endpoint to test DB connectivity without calling any function.
    """
    try:
        # Run a minimal query to check DB connectivity
        response = supabase.table("kommune").select("id").limit(1).execute()
        
        if response.data is not None:
            return {"status": "ok", "db": "connected"}
        else:
            return {"status": "warning", "db": "no data returned"}
    except Exception as e:
        return {"status": "error", "db": "disconnected", "error": str(e)}