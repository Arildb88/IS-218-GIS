from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR / "web"

# serve /static/*
app.mount("/static", StaticFiles(directory=WEB_DIR / "static"), name="static")

@app.get("/")
def root():
    return FileResponse(WEB_DIR / "html" / "index.html")
