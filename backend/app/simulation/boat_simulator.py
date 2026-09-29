import json
import math
import random
import datetime
from typing import Dict, List, Tuple
from app.simulation.navigation_simulator import NavigationSimulator
from app.simulation.ocean_simulator import OceanSimulator
from app.simulation.atmosphere_simulator import AtmosphereSimulator
from app.simulation.battery_simulator import BatterySimulator
from app.simulation.failure_simulator import FailureSimulator
from app.algorithms.coverage_path import generate_lawnmower_coverage
from app.algorithms.geofence import GeofenceManager
from app.algorithms.obstacle_avoidance import ObstacleAvoidanceEngine
from app.ai.anomaly_detector import SensorAnomalyDetector
from app.ai.adaptive_sampler import generate_adaptive_sampling_waypoints
from app.services.state_machine import SafetyStateMachine

class BoatSimulator:
    """
    BHARATH SENTINEL Vessel Simulator.
    Strictly categorizes telemetry into 5 domains:
    1. Oceanographic (Water ONLY)
    2. Atmospheric (Air ONLY)
    3. Navigation (GPS, IMU MPU6050, Compass)
    4. Obstacle/Environment (Ultrasonic, RGB, Thermal, Radar)
    5. System Health (Leak, INA219 Battery, Motors, Hull Strain)
    """
    def __init__(
        self,
        boat_id: str,
        name: str,
        initial_lat: float,
        initial_lon: float,
        mission_id: str = "MISSION-01",
        heading: float = 0.0
    ):
        self.boat_id = boat_id
        self.name = name
        self.center_lat = initial_lat
        self.center_lon = initial_lon
        self.mission_id = mission_id
        self.observation_radius_m = 2500.0  # Configured observation radius

        # Sub-simulators
        self.nav = NavigationSimulator(initial_lat, initial_lon, heading=heading)
        self.ocean = OceanSimulator(base_lat=initial_lat)
        self.atmo = AtmosphereSimulator()
        self.battery = BatterySimulator(capacity_ah=100.0, initial_soc=95.0)
        self.failure = FailureSimulator()
        self.geofence = GeofenceManager(center_lat=initial_lat, center_lon=initial_lon, radius_m=self.observation_radius_m)
        self.obstacle_engine = ObstacleAvoidanceEngine(warning_dist=100.0, critical_dist=50.0)
        self.anomaly_detector = SensorAnomalyDetector()
        self.state_machine = SafetyStateMachine(boat_id=boat_id)

        # Generate initial coverage route
        self.coverage_waypoints = generate_lawnmower_coverage(
            center_lat=initial_lat,
            center_lon=initial_lon,
            radius_m=self.observation_radius_m,
            track_spacing_m=400.0
        )
        self.nav.set_waypoints(self.coverage_waypoints)

        self.active_anomalies: List[Dict] = []
        self.manual_command_pending: str = None
        self.is_adaptive_active = False
        self.adaptive_waypoints: List[Tuple[float, float]] = []
        self.step_counter = 0

    def set_manual_command(self, command: str):
        self.manual_command_pending = command

    def step(self, global_obstacles: List[Dict], dt: float = 2.0) -> Tuple[Dict, List[Dict], List[Dict]]:
        self.step_counter += 1
        new_events = []
        new_anomalies = []

        # 1. Oceanographic Readings (Strictly Water ONLY)
        ocean_data = self.ocean.generate_readings(dt=dt)

        # 2. Atmospheric Readings (Strictly Air ONLY)
        atmo_data = self.atmo.generate_readings(dt=dt)

        # 3. AI Anomaly Detection on ocean sensors
        for sensor_name in ["turbidity", "dissolved_oxygen", "temperature", "salinity"]:
            val = ocean_data.get(sensor_name, 0.0)
            is_anom, baseline, score, severity = self.anomaly_detector.update_and_detect(sensor_name, val)
            if is_anom:
                anom_record = {
                    "boat_id": self.boat_id,
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "sensor": sensor_name,
                    "value": val,
                    "baseline": round(baseline, 3),
                    "anomaly_score": round(score, 3),
                    "severity": severity,
                    "latitude": round(self.nav.lat, 6),
                    "longitude": round(self.nav.lon, 6)
                }
                new_anomalies.append(anom_record)
                new_events.append({
                    "boat_id": self.boat_id,
                    "event_type": "ANOMALY",
                    "severity": severity,
                    "description": f"AI Anomaly: {sensor_name.upper()} = {val} (baseline {baseline:.2f}, score {score:.2f})"
                })

                if severity in ["HIGH", "CRITICAL"] and not self.is_adaptive_active:
                    self.is_adaptive_active = True
                    self.adaptive_waypoints = generate_adaptive_sampling_waypoints(self.nav.lat, self.nav.lon)
                    self.nav.set_waypoints(self.adaptive_waypoints)
                    new_events.append({
                        "boat_id": self.boat_id,
                        "event_type": "MISSION",
                        "severity": "WARNING",
                        "description": f"Adaptive dense sampling route activated around {sensor_name} anomaly!"
                    })

        # 4. Obstacle evaluation
        obs_risk, min_obs_dist, closest_obs, suggested_heading = self.obstacle_engine.evaluate_obstacles(
            self.nav.lat, self.nav.lon, self.nav.heading, global_obstacles
        )

        if obs_risk in ["WARNING", "CRITICAL"]:
            new_events.append({
                "boat_id": self.boat_id,
                "event_type": "OBSTACLE",
                "severity": "WARNING" if obs_risk == "WARNING" else "CRITICAL",
                "description": f"Obstacle ({closest_obs['type']}) detected at {min_obs_dist:.1f}m. Autonomous steering override."
            })

        # 5. Geofence check
        geo_status, geo_dist, geo_ratio = self.geofence.check_position(self.nav.lat, self.nav.lon)
        if geo_status in ["WARNING", "CRITICAL", "EMERGENCY"]:
            inward_head = self.geofence.get_inward_heading(self.nav.lat, self.nav.lon)
            self.nav.heading = inward_head

        speed_modifier = 1.0
        if self.state_machine.shutter_state in ["CLOSING", "CLOSED"] or obs_risk == "CRITICAL":
            speed_modifier = 0.0
        elif obs_risk == "WARNING":
            speed_modifier = 0.5

        # 6. Advance Kinematics
        lat, lon, heading, speed = self.nav.update_kinematics(dt=dt, speed_modifier=speed_modifier)

        if self.is_adaptive_active and self.nav.waypoint_index >= len(self.adaptive_waypoints) - 1:
            self.is_adaptive_active = False
            self.nav.set_waypoints(self.coverage_waypoints)

        # 7. Battery & Solar Energy Model (INA219 telemetry)
        battery_data = self.battery.update_energy(boat_speed=speed, dt_seconds=dt)

        # 8. Navigation & IMU simulation (MPU6050 wave-induced motion)
        t = self.step_counter * 0.1
        pitch = round(3.5 * math.sin(t), 2)
        roll = round(5.2 * math.cos(t * 0.8), 2)
        accel_z = round(9.81 + 0.8 * math.sin(t * 1.5), 2)
        wave_motion_index = round(abs(pitch) + abs(roll), 2)

        # 9. Motor & Health telemetry
        motor_temp = round(28.0 + (speed * 4.5) + random.gauss(0, 0.2), 1)
        motor_current = round(speed * 2.2 + 0.5, 2)
        hull_strain = round(0.02 + (wave_motion_index * 0.01), 3)

        health_readings = {**ocean_data, **atmo_data, "battery_bms": battery_data["percentage"]}
        overall_health, sensor_health_dict = self.failure.evaluate_sensor_health(health_readings)

        # 10. Safety State Machine transition
        cmd = self.manual_command_pending
        self.manual_command_pending = None

        m_state, s_state, boat_status, state_changed = self.state_machine.evaluate_triggers(
            obstacle_risk=obs_risk,
            battery_pct=battery_data["percentage"],
            leak_detected=self.failure.leak_detected,
            sensor_health_avg=overall_health,
            is_adaptive_active=self.is_adaptive_active,
            manual_command=cmd
        )

        if state_changed:
            new_events.append({
                "boat_id": self.boat_id,
                "event_type": "SAFETY",
                "severity": "INFO" if boat_status == "GREEN" else ("WARNING" if boat_status == "YELLOW" else "CRITICAL"),
                "description": f"State transition -> State: {m_state}, Shutter: {s_state}, Status: {boat_status}"
            })

        # Assemble full 5-domain telemetry schema
        telemetry = {
            "boat_id": self.boat_id,
            "name": self.name,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "location": {"latitude": round(lat, 6), "longitude": round(lon, 6)},
            "observation_radius_m": self.observation_radius_m,
            "center_location": {"latitude": round(self.center_lat, 6), "longitude": round(self.center_lon, 6)},
            "coverage_waypoints": self.coverage_waypoints,
            "adaptive_waypoints": self.adaptive_waypoints if self.is_adaptive_active else [],
            "navigation": {
                "heading": round(heading, 1),
                "speed": round(speed, 2),
                "mission_state": m_state,
                "waypoint_index": self.nav.waypoint_index,
                "total_waypoints": len(self.nav.waypoints),
                "pitch": pitch,
                "roll": roll,
                "accel_z": accel_z,
                "wave_motion_index": wave_motion_index
            },
            "ocean": ocean_data,
            "atmosphere": atmo_data,
            "obstacle_detection": {
                "ultrasonic_distance": round(min_obs_dist, 1),
                "rgb_camera_status": "ACTIVE_YOLO",
                "thermal_camera_status": "SIMULATED",
                "marine_radar_status": "FUTURE_INTEGRATION",
                "obstacle_type": closest_obs["type"] if closest_obs else "NONE"
            },
            "battery": battery_data,
            "health": {
                "overall": overall_health,
                "leak_detected": self.failure.leak_detected,
                "comm_status": self.failure.comm_status,
                "ina219_voltage": battery_data["voltage"],
                "ina219_current": battery_data["current"],
                "ina219_power": battery_data["power_consumption"],
                "battery_temperature": battery_data["temperature"],
                "motor_temperature": motor_temp,
                "motor_current": motor_current,
                "hull_strain_index": hull_strain,
                "gps_status": "HEALTHY",
                "sensors": sensor_health_dict
            },
            "safety": {
                "obstacle_distance": round(min_obs_dist, 1),
                "obstacle_type": closest_obs["type"] if closest_obs else "NONE",
                "leak": self.failure.leak_detected,
                "comm_status": self.failure.comm_status
            },
            "shutter": {"state": s_state},
            "status": boat_status
        }

        return telemetry, new_anomalies, new_events
