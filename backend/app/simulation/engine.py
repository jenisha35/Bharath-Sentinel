import asyncio
import datetime
import logging
from typing import Dict, List, Optional
from sqlalchemy import select

from app.config import settings
from app.database.session import AsyncSessionLocal
from app.database.models import BoatModel, TelemetryModel, OceanObservationModel, AtmosphericObservationModel, BatteryModel, AnomalyModel, EventModel
from app.simulation.boat_simulator import BoatSimulator
from app.simulation.obstacle_simulator import ObstacleSimulator
from app.services.websocket_manager import ws_manager

logger = logging.getLogger("BHARATH_SENTINEL.SimulationEngine")

class FleetSimulationEngine:
    """
    Fleet-wide simulation orchestrator:
    Runs background tick loop, manages 5 BHARATH SENTINEL boats, persists telemetry to database,
    broadcasts updates via WebSockets, and controls demo scenarios.
    """
    def __init__(self):
        self.boats: Dict[str, BoatSimulator] = {}
        self.obstacle_sim: Optional[ObstacleSimulator] = None
        self.is_running = False
        self.task: Optional[asyncio.Task] = None
        self.demo_task: Optional[asyncio.Task] = None
        self.demo_active = False
        self.current_fleet_telemetry: List[Dict] = []
        self.current_obstacles: List[Dict] = []

    def get_current_telemetry(self) -> Dict:
        return {
            "fleet": self.current_fleet_telemetry,
            "obstacles": self.current_obstacles
        }

    async def initialize(self):
        """Loads initial vessels from DB and initializes simulators."""
        async with AsyncSessionLocal() as session:
            res = await session.execute(select(BoatModel))
            boat_models = res.scalars().all()

            if not boat_models:
                logger.warning("No boats found in DB to initialize simulation.")
                return

            base_lat = boat_models[0].latitude
            base_lon = boat_models[0].longitude
            self.obstacle_sim = ObstacleSimulator(base_lat, base_lon)

            for b in boat_models:
                sim = BoatSimulator(
                    boat_id=b.boat_id,
                    name=b.name,
                    initial_lat=b.latitude,
                    initial_lon=b.longitude,
                    mission_id=b.mission_id or "MISSION-01",
                    heading=b.heading
                )
                self.boats[b.boat_id] = sim

        logger.info(f"Initialized Simulation Engine with {len(self.boats)} vessels.")

    def start(self):
        if not self.is_running:
            self.is_running = True
            self.task = asyncio.create_task(self._simulation_loop())
            logger.info("Fleet Simulation Engine started.")

    def stop(self):
        self.is_running = False
        if self.task:
            self.task.cancel()

    async def _simulation_loop(self):
        while self.is_running:
            try:
                dt = settings.SIMULATION_TICK_SECONDS
                obstacles = self.obstacle_sim.update_positions(dt=dt) if self.obstacle_sim else []

                fleet_telemetry = []

                async with AsyncSessionLocal() as session:
                    for boat_id, sim in self.boats.items():
                        telemetry, anomalies, events = sim.step(obstacles, dt=dt)
                        fleet_telemetry.append(telemetry)

                        # Update DB Boat table
                        res = await session.execute(select(BoatModel).where(BoatModel.boat_id == boat_id))
                        boat_db = res.scalar_one_or_none()
                        if boat_db:
                            boat_db.latitude = telemetry["location"]["latitude"]
                            boat_db.longitude = telemetry["location"]["longitude"]
                            boat_db.heading = telemetry["navigation"]["heading"]
                            boat_db.speed = telemetry["navigation"]["speed"]
                            boat_db.status = telemetry["status"]
                            boat_db.mission_state = telemetry["navigation"]["mission_state"]
                            boat_db.shutter_state = telemetry["shutter"]["state"]
                            boat_db.health_score = telemetry["health"]["overall"]
                            boat_db.leak_detected = telemetry["safety"]["leak"]
                            boat_db.comm_status = telemetry["safety"]["comm_status"]

                        # Persist Telemetry
                        tel_db = TelemetryModel(
                            boat_id=boat_id,
                            latitude=telemetry["location"]["latitude"],
                            longitude=telemetry["location"]["longitude"],
                            heading=telemetry["navigation"]["heading"],
                            speed=telemetry["navigation"]["speed"],
                            battery=telemetry["battery"]["percentage"],
                            solar_power=telemetry["battery"]["solar_power"],
                            status=telemetry["status"],
                            shutter_state=telemetry["shutter"]["state"],
                            obstacle_distance=telemetry["safety"]["obstacle_distance"],
                            leak_status=telemetry["safety"]["leak"],
                            health_score=telemetry["health"]["overall"]
                        )
                        session.add(tel_db)

                        # Persist Ocean Obs
                        ocean_db = OceanObservationModel(
                            boat_id=boat_id,
                            temperature=telemetry["ocean"]["temperature"],
                            salinity=telemetry["ocean"]["salinity"],
                            dissolved_oxygen=telemetry["ocean"]["dissolved_oxygen"],
                            ph=telemetry["ocean"]["ph"],
                            turbidity=telemetry["ocean"]["turbidity"],
                            depth=telemetry["ocean"]["depth"]
                        )
                        session.add(ocean_db)

                        # Persist Atmospheric Obs
                        atmo_db = AtmosphericObservationModel(
                            boat_id=boat_id,
                            air_temperature=telemetry["atmosphere"]["air_temperature"],
                            humidity=telemetry["atmosphere"]["humidity"],
                            atmospheric_pressure=telemetry["atmosphere"]["atmospheric_pressure"],
                            wind_speed=telemetry["atmosphere"]["wind_speed"],
                            wind_direction=telemetry["atmosphere"]["wind_direction"]
                        )
                        session.add(atmo_db)

                        # Persist Battery
                        bat_db = BatteryModel(
                            boat_id=boat_id,
                            battery_percentage=telemetry["battery"]["percentage"],
                            voltage=telemetry["battery"]["voltage"],
                            current=telemetry["battery"]["current"],
                            power_consumption=telemetry["battery"]["power_consumption"],
                            solar_power=telemetry["battery"]["solar_power"],
                            battery_temperature=telemetry["battery"]["temperature"],
                            estimated_runtime=telemetry["battery"]["estimated_runtime"]
                        )
                        session.add(bat_db)

                        # Persist Anomalies
                        for a in anomalies:
                            anom_db = AnomalyModel(
                                boat_id=a["boat_id"],
                                sensor=a["sensor"],
                                value=a["value"],
                                baseline=a["baseline"],
                                anomaly_score=a["anomaly_score"],
                                severity=a["severity"],
                                latitude=a["latitude"],
                                longitude=a["longitude"]
                            )
                            session.add(anom_db)

                        # Persist Events
                        for e in events:
                            evt_db = EventModel(
                                boat_id=e["boat_id"],
                                event_type=e["event_type"],
                                severity=e["severity"],
                                description=e["description"]
                            )
                            session.add(evt_db)

                    await session.commit()

                self.current_fleet_telemetry = fleet_telemetry
                self.current_obstacles = obstacles

                # Broadcast live telemetry & obstacles over WebSocket
                broadcast_payload = {
                    "type": "TELEMETRY_UPDATE",
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "fleet": fleet_telemetry,
                    "obstacles": obstacles
                }
                await ws_manager.broadcast(broadcast_payload)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in simulation loop: {e}", exc_info=True)

            await asyncio.sleep(settings.SIMULATION_TICK_SECONDS)

    async def run_demo_scenario(self):
        """
        Executes the built-in automated 4-event demonstration scenario:
        EVENT 1: Ice Floe approaches BHARATH-SENTINEL-03 -> GREEN -> YELLOW -> RED -> Avoidance.
        EVENT 2: Turbidity anomaly injected -> Adaptive dense sampling activated.
        EVENT 3: Battery drop alert -> Warning.
        EVENT 4: Severe condition -> Protective electronics hub shutter closes autonomously.
        """
        if self.demo_active:
            return
        self.demo_active = True
        logger.info("=== Starting Master Demo Scenario ===")

        target_boat = self.boats.get("BHARATH-SENTINEL-03") or list(self.boats.values())[0]

        try:
            # Stage 1: Spawn approaching ice floe
            logger.info("Demo Stage 1: Spawning approaching obstacle...")
            if self.obstacle_sim:
                self.obstacle_sim.spawn_near_boat(target_boat.nav.lat, target_boat.nav.lon, target_boat.nav.heading, distance_m=75.0)
            await asyncio.sleep(8.0)

            # Stage 2: Inject ocean anomaly (Turbidity spike)
            logger.info("Demo Stage 2: Injecting turbidity anomaly...")
            target_boat.ocean.inject_anomaly("turbidity", 18.5)
            await asyncio.sleep(10.0)

            # Stage 3: Low battery simulation
            logger.info("Demo Stage 3: Simulating low battery warning...")
            target_boat.battery.soc = 18.0
            await asyncio.sleep(8.0)

            # Stage 4: Severe condition & Shutter Closure
            logger.info("Demo Stage 4: Severe condition -> Closing shutter hub...")
            target_boat.set_manual_command("CLOSE_HUB")
            await asyncio.sleep(12.0)

            # Recovery
            logger.info("Demo Stage 5: System recovery...")
            target_boat.ocean.clear_anomaly()
            target_boat.battery.soc = 90.0
            target_boat.set_manual_command("OPEN_HUB")

        except Exception as e:
            logger.error(f"Demo scenario error: {e}")
        finally:
            self.demo_active = False
            logger.info("=== Master Demo Scenario Complete ===")

# Singleton Engine Instance
simulation_engine = FleetSimulationEngine()
