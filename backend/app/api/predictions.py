from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database.session import get_db
from app.database.models import OceanObservationModel, AtmosphericObservationModel
from app.ai.climate_engine import ClimatePredictionEngine

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.get("/climate/{boat_id}")
async def get_climate_predictions(
    boat_id: str,
    limit: int = Query(60, ge=10, le=500),
    db: AsyncSession = Depends(get_db)
):
    # Fetch Ocean History
    ocean_res = await db.execute(
        select(OceanObservationModel)
        .where(OceanObservationModel.boat_id == boat_id)
        .order_by(desc(OceanObservationModel.timestamp))
        .limit(limit)
    )
    ocean_records = list(reversed(ocean_res.scalars().all()))

    # Fetch Atmospheric History
    atmo_res = await db.execute(
        select(AtmosphericObservationModel)
        .where(AtmosphericObservationModel.boat_id == boat_id)
        .order_by(desc(AtmosphericObservationModel.timestamp))
        .limit(limit)
    )
    atmo_records = list(reversed(atmo_res.scalars().all()))

    ocean_dicts = [
        {
            "timestamp": r.timestamp.isoformat(),
            "temperature": r.temperature,
            "salinity": r.salinity,
            "dissolved_oxygen": r.dissolved_oxygen,
            "ph": r.ph,
            "turbidity": r.turbidity,
            "depth": r.depth,
        }
        for r in ocean_records
    ]

    atmo_dicts = [
        {
            "timestamp": r.timestamp.isoformat(),
            "air_temperature": r.air_temperature,
            "humidity": r.humidity,
            "atmospheric_pressure": r.atmospheric_pressure,
            "wind_speed": r.wind_speed,
            "wind_direction": r.wind_direction,
        }
        for r in atmo_records
    ]

    predictions = ClimatePredictionEngine.generate_predictions(ocean_dicts, atmo_dicts)

    return {
        "boat_id": boat_id,
        "predictions": predictions
    }
