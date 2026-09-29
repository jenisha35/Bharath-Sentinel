import math
from typing import List, Tuple

def generate_adaptive_sampling_waypoints(
    anomaly_lat: float,
    anomaly_lon: float,
    radius_m: float = 300.0,
    num_points: int = 8
) -> List[Tuple[float, float]]:
    """
    Generates a localized dense spiral pattern around an anomaly center.
    Used during ADAPTIVE_SAMPLING mission state.
    """
    lat_deg_per_m = 1.0 / 111000.0
    lon_deg_per_m = 1.0 / (111000.0 * math.cos(math.radians(anomaly_lat)))

    waypoints: List[Tuple[float, float]] = []

    for i in range(num_points):
        # Archimedean spiral radius expansion
        r_current = (radius_m * (i + 1)) / num_points
        angle = (2.0 * math.pi * i) / (num_points / 2.0)

        d_lat = r_current * math.sin(angle) * lat_deg_per_m
        d_lon = r_current * math.cos(angle) * lon_deg_per_m

        waypoints.append((anomaly_lat + d_lat, anomaly_lon + d_lon))

    # Add center final point
    waypoints.append((anomaly_lat, anomaly_lon))
    return waypoints
