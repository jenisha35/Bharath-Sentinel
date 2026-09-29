import pytest
from app.algorithms.pid_controller import PIDController, calculate_bearing, haversine_distance
from app.simulation.battery_simulator import BatterySimulator
from app.algorithms.coverage_path import generate_lawnmower_coverage
from app.algorithms.geofence import GeofenceManager
from app.ai.anomaly_detector import SensorAnomalyDetector

def test_haversine_distance():
    # Distance between two points ~111km apart
    dist = haversine_distance(-69.0, 76.0, -68.0, 76.0)
    assert 110000 < dist < 112000

def test_pid_controller():
    pid = PIDController(kp=1.0, ki=0.0, kd=0.0)
    correction = pid.compute(current_heading=0.0, target_heading=90.0)
    assert correction > 0.0  # Turn right

def test_battery_simulator():
    bat = BatterySimulator(capacity_ah=100.0, initial_soc=100.0)
    res = bat.update_energy(boat_speed=1.5, dt_seconds=10.0)
    assert res["percentage"] <= 100.0
    assert res["voltage"] > 12.0

def test_coverage_path():
    waypoints = generate_lawnmower_coverage(-69.375, 76.380, radius_m=1000.0, track_spacing_m=300.0)
    assert len(waypoints) > 2

def test_geofence_manager():
    geo = GeofenceManager(-69.375, 76.380, radius_m=2000.0)
    status, dist, ratio = geo.check_position(-69.375, 76.380)
    assert status == "SAFE"

def test_anomaly_detector():
    detector = SensorAnomalyDetector(history_size=20)
    for _ in range(15):
        detector.update_and_detect("turbidity", 0.5)
    
    # Inject massive spike
    is_anom, baseline, score, severity = detector.update_and_detect("turbidity", 25.0)
    assert is_anom is True
    assert severity in ["HIGH", "CRITICAL"]
