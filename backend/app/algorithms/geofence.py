from typing import Tuple
from app.algorithms.pid_controller import haversine_distance, calculate_bearing

class GeofenceManager:
    """
    Geofence enforcement engine.
    Checks distance from center vs allowed radius.
    < 80% radius: SAFE
    80–95%: WARNING
    95–100%: CRITICAL
    > 100%: EMERGENCY
    """
    def __init__(self, center_lat: float, center_lon: float, radius_m: float = 2500.0):
        self.center_lat = center_lat
        self.center_lon = center_lon
        self.radius_m = radius_m

    def check_position(self, current_lat: float, current_lon: float) -> Tuple[str, float, float]:
        """
        Returns (status_level, distance_m, fill_ratio).
        """
        dist_m = haversine_distance(self.center_lat, self.center_lon, current_lat, current_lon)
        ratio = dist_m / self.radius_m if self.radius_m > 0 else 0.0

        if ratio < 0.80:
            status = "SAFE"
        elif ratio < 0.95:
            status = "WARNING"
        elif ratio <= 1.00:
            status = "CRITICAL"
        else:
            status = "EMERGENCY"

        return status, dist_m, ratio

    def get_inward_heading(self, current_lat: float, current_lon: float) -> float:
        """Calculates compass heading pointing back toward geofence center."""
        return calculate_bearing(current_lat, current_lon, self.center_lat, self.center_lon)
