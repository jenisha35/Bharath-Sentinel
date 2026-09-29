import json
import datetime
from sqlalchemy import select
from app.database.session import engine, AsyncSessionLocal
from app.database.models import Base, BoatModel, MissionModel, EventModel

INITIAL_BOATS = [
    {
        "boat_id": "BHARATH-SENTINEL-01",
        "name": "Central Indian Ocean Rover",
        "latitude": -52.500,
        "longitude": 78.000,
        "heading": 45.0,
        "speed": 1.2,
        "mission_id": "MISSION-01",
        "status": "GREEN",
        "mission_state": "NORMAL_OPERATION",
        "shutter_state": "OPEN",
        "health_score": 98.5,
        "leak_detected": False,
        "comm_status": "HEALTHY",
    },
    {
        "boat_id": "BHARATH-SENTINEL-02",
        "name": "West Indian Ocean Sentinel",
        "latitude": -48.500,
        "longitude": 68.500,
        "heading": 120.0,
        "speed": 1.5,
        "mission_id": "MISSION-02",
        "status": "GREEN",
        "mission_state": "NORMAL_OPERATION",
        "shutter_state": "OPEN",
        "health_score": 96.0,
        "leak_detected": False,
        "comm_status": "HEALTHY",
    },
    {
        "boat_id": "BHARATH-SENTINEL-03",
        "name": "East Indian Ocean Voyager",
        "latitude": -50.000,
        "longitude": 88.500,
        "heading": 270.0,
        "speed": 1.0,
        "mission_id": "MISSION-03",
        "status": "GREEN",
        "mission_state": "NORMAL_OPERATION",
        "shutter_state": "OPEN",
        "health_score": 94.2,
        "leak_detected": False,
        "comm_status": "HEALTHY",
    },
    {
        "boat_id": "BHARATH-SENTINEL-04",
        "name": "Deep Southern Ocean Scout",
        "latitude": -58.000,
        "longitude": 76.500,
        "heading": 90.0,
        "speed": 1.8,
        "mission_id": "MISSION-04",
        "status": "YELLOW",
        "mission_state": "WARNING",
        "shutter_state": "OPEN",
        "health_score": 82.0,
        "leak_detected": False,
        "comm_status": "HEALTHY",
    },
    {
        "boat_id": "BHARATH-SENTINEL-05",
        "name": "Kerguelen Basin Explorer",
        "latitude": -54.500,
        "longitude": 82.000,
        "heading": 180.0,
        "speed": 1.1,
        "mission_id": "MISSION-05",
        "status": "GREEN",
        "mission_state": "NORMAL_OPERATION",
        "shutter_state": "OPEN",
        "health_score": 99.0,
        "leak_detected": False,
        "comm_status": "HEALTHY",
    },
]

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        for bdata in INITIAL_BOATS:
            res = await session.execute(select(BoatModel).where(BoatModel.boat_id == bdata["boat_id"]))
            existing_boat = res.scalar_one_or_none()
            if not existing_boat:
                boat = BoatModel(**bdata)
                session.add(boat)

                # Add initial mission
                mission = MissionModel(
                    mission_id=bdata["mission_id"],
                    boat_id=bdata["boat_id"],
                    center_latitude=bdata["latitude"],
                    center_longitude=bdata["longitude"],
                    radius=2500.0,
                    sampling_interval=30.0,
                    duration=24.0,
                    status="ACTIVE",
                    waypoints_json=json.dumps([])
                )
                session.add(mission)

                # Add initial event
                event = EventModel(
                    boat_id=bdata["boat_id"],
                    event_type="MISSION",
                    severity="INFO",
                    description=f"Initial autonomous mission {bdata['mission_id']} assigned to {bdata['name']}"
                )
                session.add(event)
            else:
                # Update coordinates and names to match updated Southern Ocean deployment
                existing_boat.latitude = bdata["latitude"]
                existing_boat.longitude = bdata["longitude"]
                existing_boat.name = bdata["name"]

        await session.commit()
