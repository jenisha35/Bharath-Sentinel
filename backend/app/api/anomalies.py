from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database.session import get_db
from app.database.models import AnomalyModel, EventModel

router = APIRouter(prefix="/anomalies", tags=["Anomalies & Events"])

@router.get("")
async def get_recent_anomalies(limit: int = 50, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(AnomalyModel).order_by(desc(AnomalyModel.timestamp)).limit(limit))
    return res.scalars().all()

@router.get("/events")
async def get_recent_events(limit: int = 100, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(EventModel).order_by(desc(EventModel.timestamp)).limit(limit))
    return res.scalars().all()
