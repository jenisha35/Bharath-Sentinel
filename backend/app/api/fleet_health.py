from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.database.models import BoatModel
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/fleet-health", tags=["Fleet Health"])

@router.get("")
async def get_fleet_health(db: AsyncSession = Depends(get_db)):
    """Returns detailed health status breakdown across all vessels."""
    health_list = []
    for boat_id, sim in simulation_engine.boats.items():
        tel, _, _ = sim.step([], dt=0.0)
        health_list.append({
            "boat_id": boat_id,
            "name": sim.name,
            "overall_status": tel["status"],
            "overall_health_score": tel["health"]["overall"],
            "battery_pct": tel["battery"]["percentage"],
            "battery_status": "GREEN" if tel["battery"]["percentage"] > 25.0 else ("YELLOW" if tel["battery"]["percentage"] > 15.0 else "RED"),
            "sensors_status": "GREEN" if tel["health"]["overall"] > 75.0 else ("YELLOW" if tel["health"]["overall"] > 50.0 else "RED"),
            "gps_status": tel["health"]["gps_status"],
            "comm_status": tel["health"]["comm_status"],
            "leak_detected": tel["health"]["leak_detected"],
            "motor_temperature": tel["health"]["motor_temperature"],
            "motor_current": tel["health"]["motor_current"],
            "motor_status": "GREEN" if tel["health"]["motor_temperature"] < 45.0 else "YELLOW",
            "shutter_state": tel["shutter"]["state"]
        })
    return health_list
