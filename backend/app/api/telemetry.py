from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database.session import get_db
from app.database.models import TelemetryModel, OceanObservationModel, AtmosphericObservationModel, BatteryModel
from app.ai.forecaster import TimeSeriesForecaster
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.get("/fleet")
async def get_fleet_telemetry():
    return simulation_engine.get_current_telemetry()

@router.get("/ocean/{boat_id}")
async def get_ocean_history(
    boat_id: str,
    limit: int = Query(60, ge=5, le=500),
    forecast: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(OceanObservationModel)
        .where(OceanObservationModel.boat_id == boat_id)
        .order_by(desc(OceanObservationModel.timestamp))
        .limit(limit)
    )
    records = list(reversed(res.scalars().all()))

    if not records:
        return {"historical": [], "forecast": {}}

    history_dicts = [
        {
            "timestamp": r.timestamp.isoformat(),
            "temperature": r.temperature,
            "salinity": r.salinity,
            "dissolved_oxygen": r.dissolved_oxygen,
            "ph": r.ph,
            "turbidity": r.turbidity,
            "depth": r.depth,
            "data_source": r.data_source
        }
        for r in records
    ]

    forecasts = {}
    if forecast:
        for param in ["temperature", "salinity", "dissolved_oxygen", "ph", "turbidity"]:
            forecasts[param] = TimeSeriesForecaster.forecast(history_dicts, value_key=param)

    return {
        "boat_id": boat_id,
        "history": history_dicts,
        "forecasts": forecasts
    }


@router.get("/atmosphere/{boat_id}")
async def get_atmospheric_history(
    boat_id: str,
    limit: int = Query(60, ge=5, le=500),
    forecast: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(AtmosphericObservationModel)
        .where(AtmosphericObservationModel.boat_id == boat_id)
        .order_by(desc(AtmosphericObservationModel.timestamp))
        .limit(limit)
    )
    records = list(reversed(res.scalars().all()))

    history_dicts = [
        {
            "timestamp": r.timestamp.isoformat(),
            "air_temperature": r.air_temperature,
            "humidity": r.humidity,
            "atmospheric_pressure": r.atmospheric_pressure,
            "wind_speed": r.wind_speed,
            "wind_direction": r.wind_direction,
            "data_source": r.data_source
        }
        for r in records
    ]

    forecasts = {}
    if forecast and history_dicts:
        for param in ["air_temperature", "humidity", "atmospheric_pressure", "wind_speed"]:
            forecasts[param] = TimeSeriesForecaster.forecast(history_dicts, value_key=param)

    return {
        "boat_id": boat_id,
        "history": history_dicts,
        "forecasts": forecasts
    }


@router.get("/battery/{boat_id}")
async def get_battery_history(
    boat_id: str,
    limit: int = Query(60, ge=5, le=500),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(BatteryModel)
        .where(BatteryModel.boat_id == boat_id)
        .order_by(desc(BatteryModel.timestamp))
        .limit(limit)
    )
    records = list(reversed(res.scalars().all()))

    history_dicts = [
        {
            "timestamp": r.timestamp.isoformat(),
            "battery_percentage": r.battery_percentage,
            "voltage": r.voltage,
            "current": r.current,
            "power_consumption": r.power_consumption,
            "solar_power": r.solar_power,
            "battery_temperature": r.battery_temperature,
            "estimated_runtime": r.estimated_runtime
        }
        for r in records
    ]

    endurance_forecast = TimeSeriesForecaster.forecast(history_dicts, value_key="battery_percentage") if history_dicts else {}

    return {
        "boat_id": boat_id,
        "history": history_dicts,
        "endurance_forecast": endurance_forecast
    }
