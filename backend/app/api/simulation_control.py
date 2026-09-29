import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/sim", tags=["Simulation Control"])

class InjectRequest(BaseModel):
    boat_id: str
    event_type: str  # ocean_anomaly, atmo_anomaly, spawn_obstacle, sensor_failure, low_battery, leak, comm_loss, reset
    sensor_name: Optional[str] = "turbidity"
    value: Optional[float] = 20.0

@router.post("/inject")
async def inject_sim_event(req: InjectRequest):
    boat_sim = simulation_engine.boats.get(req.boat_id)
    if not boat_sim:
        raise HTTPException(status_code=404, detail=f"Vessel {req.boat_id} not found")

    if req.event_type == "ocean_anomaly":
        boat_sim.ocean.inject_anomaly(req.sensor_name or "turbidity", req.value or 15.0)
    elif req.event_type == "atmo_anomaly":
        boat_sim.atmo.inject_anomaly(req.sensor_name or "wind_speed", req.value or 30.0)
    elif req.event_type == "spawn_obstacle":
        if simulation_engine.obstacle_sim:
            simulation_engine.obstacle_sim.spawn_near_boat(boat_sim.nav.lat, boat_sim.nav.lon, boat_sim.nav.heading, distance_m=70.0)
    elif req.event_type == "sensor_failure":
        boat_sim.failure.inject_failure(req.sensor_name or "turbidity", "FAILED")
    elif req.event_type == "low_battery":
        boat_sim.battery.soc = 15.0
    elif req.event_type == "leak":
        boat_sim.failure.inject_leak(True)
    elif req.event_type == "comm_loss":
        boat_sim.failure.inject_comm_loss("LOST")
    elif req.event_type == "reset":
        boat_sim.ocean.clear_anomaly()
        boat_sim.atmo.clear_anomaly()
        boat_sim.battery.soc = 95.0
        boat_sim.failure.inject_leak(False)
        boat_sim.failure.inject_comm_loss("HEALTHY")
        boat_sim.set_manual_command("OPEN_HUB")
    else:
        raise HTTPException(status_code=400, detail=f"Unknown event type {req.event_type}")

    return {"status": "SUCCESS", "boat_id": req.boat_id, "event_type": req.event_type}


@router.post("/demo")
async def trigger_demo_mode(background_tasks: BackgroundTasks):
    """Triggers the automated 4-event demonstration sequence."""
    background_tasks.add_task(simulation_engine.run_demo_scenario)
    return {"status": "DEMO_STARTED", "message": "Master Demo Scenario started in background."}
