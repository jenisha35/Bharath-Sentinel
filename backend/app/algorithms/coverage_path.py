import math
from typing import List, Tuple
from shapely.geometry import Point, Polygon, LineString

def generate_lawnmower_coverage(
    center_lat: float,
    center_lon: float,
    radius_m: float = 2500.0,
    track_spacing_m: float = 400.0
) -> List[Tuple[float, float]]:
    """
    Generates a Boustrophedon / Lawnmower coverage path inside a circular observation geofence.
    Returns list of (lat, lon) waypoints.
    """
    # 1 deg lat ~ 111,000 meters
    lat_deg_per_m = 1.0 / 111000.0
    lon_deg_per_m = 1.0 / (111000.0 * math.cos(math.radians(center_lat)))

    # Circle in local deg units
    r_lat = radius_m * lat_deg_per_m
    r_lon = radius_m * lon_deg_per_m

    num_pts = 64
    circle_pts = [
        (
            center_lon + r_lon * math.cos(2 * math.pi * i / num_pts),
            center_lat + r_lat * math.sin(2 * math.pi * i / num_pts)
        )
        for i in range(num_pts)
    ]
    geofence_poly = Polygon(circle_pts)

    num_sweeps = max(3, int((radius_m * 2) / track_spacing_m))
    sweep_step_m = (radius_m * 2) / num_sweeps

    waypoints: List[Tuple[float, float]] = []

    for i in range(num_sweeps + 1):
        offset_m = -radius_m + i * sweep_step_m
        lat_line = center_lat + (offset_m * lat_deg_per_m)
        line = LineString([
            (center_lon - r_lon * 1.5, lat_line),
            (center_lon + r_lon * 1.5, lat_line)
        ])

        intersection = geofence_poly.intersection(line)
        if not intersection.is_empty:
            if intersection.geom_type == 'LineString':
                coords = list(intersection.coords)
                if len(coords) >= 2:
                    start_pt = (coords[0][1], coords[0][0])
                    end_pt = (coords[-1][1], coords[-1][0])
                    if i % 2 == 0:
                        waypoints.extend([start_pt, end_pt])
                    else:
                        waypoints.extend([end_pt, start_pt])
            elif intersection.geom_type == 'MultiLineString':
                for geom in intersection.geoms:
                    coords = list(geom.coords)
                    if len(coords) >= 2:
                        waypoints.extend([(coords[0][1], coords[0][0]), (coords[-1][1], coords[-1][0])])

    if not waypoints:
        # Fallback to simple circle perimeter waypoints if intersection failed
        waypoints = [(p[1], p[0]) for p in circle_pts[::8]]

    return waypoints
