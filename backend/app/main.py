import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.init_db import init_db
from app.api.router import api_router
from app.simulation.engine import simulation_engine
from app.services.websocket_manager import ws_manager

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("BHARATH_SENTINEL.Main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing BHARATH SENTINEL Database & Physics Engine...")
    await init_db()
    await simulation_engine.initialize()
    simulation_engine.start()
    logger.info("BHARATH SENTINEL Full-Stack Simulation Service Online.")
    yield
    logger.info("Shutting down BHARATH SENTINEL Physics Engine...")
    simulation_engine.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware for React Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "mode": "SIMULATION",
        "docs": "/docs"
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive & handle incoming commands if any
            data = await websocket.receive_text()
            logger.info(f"WebSocket incoming message: {data}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
