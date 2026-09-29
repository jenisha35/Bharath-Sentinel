import math
from typing import List, Dict, Tuple, Optional
from app.algorithms.pid_controller import haversine_distance, calculate_bearing, normalize_heading

class ObstacleAvoidanceEngine:
    """
    Simulated obstacle risk evaluation and dynamic path replanning.
    SAFE: > 100m
    WARNING: 50 - 100m (slow down & adjust heading)
    CRITICAL: < 50m (stop / turn away sharply / replan)
    """
    def __init__(self, warning_dist: float = 100.0, critical_dist: float = 50.0):
        self.warning_dist = warning_dist
        self.critical_dist = critical_dist

    def evaluate_obstacles(
        self,
        boat_lat: float,
        boat_lon: float,
        boat_heading: float,
        obstacles: List[Dict]
    ) -> Tuple[str, float, Optional[Dict], Optional[float]]:
        """
        Returns (highest_risk_level, min_distance_m, closest_obstacle, suggested_heading).
        """
        if not obstacles:
            return "SAFE", 9999.0, None, None

        min_dist = 9999.0
        closest_obs = None

        for obs in obstacles:
            dist = haversine_distance(boat_lat, boat_lon, obs["latitude"], obs["longitude"])
            if dist < min_dist:
                min_dist = dist
                closest_obs = obs

        if closest_obs is None or min_dist > self.warning_dist:
            return "SAFE", min_dist, closest_obs, None

        bearing_to_obs = calculate_bearing(boat_lat, boat_lon, closest_obs["latitude"], closest_obs["longitude"])
        
        # Turn away by +90 or -90 deg from obstacle bearing
        turn_right = normalize_heading(bearing_to_obs + 90.0)
        turn_left = normalize_heading(bearing_to_obs - 90.0)

        # Pick the turn closest to current heading
        diff_right = abs((turn_right - boat_heading + 180) % 360 - 180)
        diff_left = abs((turn_left - boat_heading + 180) % 360 - 180)

        suggested_heading = turn_right if diff_right < diff_left else turn_left

        if min_dist < self.critical_dist:
            return "CRITICAL", min_dist, closest_obs, suggested_heading
        else:
            return "WARNING", min_dist, closest_obs, suggested_heading
