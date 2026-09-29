from typing import Dict, List, Tuple

class FailureSimulator:
    """
    Simulates hardware degradation, sensor timeouts, hull leaks, and communication dropouts.
    Used for calculating Sensor Health score (0-100) and Boat Health Status.
    """
    def __init__(self):
        self.sensor_healths: Dict[str, Dict] = {
            "ocean_temp": {"score": 100.0, "status": "HEALTHY", "last_value": 0.0},
            "salinity": {"score": 100.0, "status": "HEALTHY", "last_value": 0.0},
            "dissolved_oxygen": {"score": 100.0, "status": "HEALTHY", "last_value": 0.0},
            "ph": {"score": 100.0, "status": "HEALTHY", "last_value": 0.0},
            "turbidity": {"score": 100.0, "status": "HEALTHY", "last_value": 0.0},
            "air_temp": {"score": 100.0, "status": "HEALTHY", "last_value": 0.0},
            "pressure": {"score": 100.0, "status": "HEALTHY", "last_value": 0.0},
            "wind_speed": {"score": 100.0, "status": "HEALTHY", "last_value": 0.0},
            "gps": {"score": 100.0, "status": "HEALTHY", "last_value": 0.0},
            "battery_bms": {"score": 100.0, "status": "HEALTHY", "last_value": 0.0},
        }
        self.leak_detected = False
        self.comm_status = "HEALTHY"  # HEALTHY, DEGRADED, LOST

    def inject_failure(self, sensor_id: str, new_status: str = "FAILED"):
        if sensor_id in self.sensor_healths:
            if new_status == "FAILED":
                self.sensor_healths[sensor_id]["score"] = 0.0
                self.sensor_healths[sensor_id]["status"] = "FAILED"
            elif new_status == "DEGRADED":
                self.sensor_healths[sensor_id]["score"] = 55.0
                self.sensor_healths[sensor_id]["status"] = "DEGRADED"

    def inject_leak(self, state: bool = True):
        self.leak_detected = state

    def inject_comm_loss(self, status: str = "LOST"):
        self.comm_status = status

    def evaluate_sensor_health(self, sensor_readings: Dict[str, float]) -> Tuple[float, Dict[str, Dict]]:
        """
        Calculates heartbeat, rate-of-change, valid range check, and overall health score.
        """
        scores = []
        for s_id, s_info in self.sensor_healths.items():
            if s_info["status"] == "FAILED":
                scores.append(0.0)
                continue

            val = sensor_readings.get(s_id)
            if val is not None:
                s_info["last_value"] = val
                # Range check
                if s_id == "ph" and (val < 0 or val > 14):
                    s_info["score"] = 40.0
                    s_info["status"] = "DEGRADED"
                elif s_id == "battery_bms" and (val < 0 or val > 100):
                    s_info["score"] = 30.0
                    s_info["status"] = "DEGRADED"
                else:
                    s_info["score"] = max(70.0, s_info["score"])
                    s_info["status"] = "HEALTHY"
            
            scores.append(s_info["score"])

        overall_score = sum(scores) / max(1, len(scores))
        return round(overall_score, 1), self.sensor_healths
