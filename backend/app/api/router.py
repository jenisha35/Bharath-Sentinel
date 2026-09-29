from fastapi import APIRouter
from app.api import boats, telemetry, shutter, anomalies, simulation_control, fleet_health, predictions

api_router = APIRouter()
api_router.include_router(boats.router)
api_router.include_router(telemetry.router)
api_router.include_router(shutter.router)
api_router.include_router(anomalies.router)
api_router.include_router(simulation_control.router)
api_router.include_router(fleet_health.router)
api_router.include_router(predictions.router)
