from fastapi import FastAPI, Response
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
import httpx
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/proxy/wfs")
async def proxy_wfs(url: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
        return Response(
            content=r.content,
            media_type="application/json",
            headers={
                
            }
        )



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",      # filename:FastAPI_instance
        host="127.0.0.1",
        port=8000,
        reload=True
    )