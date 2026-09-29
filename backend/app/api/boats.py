from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.database.models import BoatModel
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/boats", tags=["Boats"])

@router.get("")
async def get_all_boats(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(BoatModel))
    boats = res.scalars().all()
    return boats

@router.get("/{boat_id}")
async def get_boat_by_id(boat_id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(BoatModel).where(BoatModel.boat_id == boat_id))
    boat = res.scalar_one_or_none()
    if not boat:
        raise HTTPException(status_code=404, detail=f"Boat {boat_id} not found")
    return boat
