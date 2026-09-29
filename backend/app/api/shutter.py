from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/shutter", tags=["Protective Hub Shutter"])

class ShutterCommand(BaseModel):
    boat_id: str
    command: str  # OPEN_HUB, CLOSE_HUB

@router.post("/command")
async def send_shutter_command(cmd: ShutterCommand):
    boat_sim = simulation_engine.boats.get(cmd.boat_id)
    if not boat_sim:
        raise HTTPException(status_code=404, detail=f"Vessel {cmd.boat_id} not found in simulation engine.")

    if cmd.command not in ["OPEN_HUB", "CLOSE_HUB"]:
        raise HTTPException(status_code=400, detail="Invalid command. Must be 'OPEN_HUB' or 'CLOSE_HUB'")

    boat_sim.set_manual_command(cmd.command)
    return {
        "status": "ACCEPTED",
        "boat_id": cmd.boat_id,
        "command": cmd.command,
        "current_shutter_state": boat_sim.state_machine.shutter_state
    }
