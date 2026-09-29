import random
import math
from typing import List, Dict

class ObstacleSimulator:
    """
    Simulates dynamic marine obstacles: ice floes, floating debris, vessels, and rocks.
    Each obstacle has lat, lon, size, type, and drift vector.
    """
    def __init__(self, base_lat: float, base_lon: float):
        self.obstacles: List[Dict] = []
        self.spawn_initial_obstacles(base_lat, base_lon)

    def spawn_initial_obstacles(self, base_lat: float, base_lon: float):
        lat_deg_per_m = 1.0 / 111000.0
        lon_deg_per_m = 1.0 / (111000.0 * math.cos(math.radians(base_lat)))

        types = ["ice_floe", "floating_debris", "vessel", "submerged_rock"]

        # Spawn 3 obstacles around base center
        for i in range(3):
            angle = random.uniform(0, 2 * math.pi)
            dist_m = random.uniform(300, 1500)
            self.obstacles.append({
                "id": f"OBS-{i+1:02d}",
                "latitude": base_lat + (dist_m * math.sin(angle) * lat_deg_per_m),
                "longitude": base_lon + (dist_m * math.cos(angle) * lon_deg_per_m),
                "size_m": round(random.uniform(5, 30), 1),
                "type": random.choice(types),
                "drift_speed": random.uniform(0.05, 0.3),
                "drift_heading": random.uniform(0, 360)
            })

    def spawn_near_boat(self, boat_lat: float, boat_lon: float, boat_heading: float, distance_m: float = 80.0):
        """Used in Demo Mode to trigger an approaching ice floe event."""
        lat_deg_per_m = 1.0 / 111000.0
        lon_deg_per_m = 1.0 / (111000.0 * math.cos(math.radians(boat_lat)))

        head_rad = math.radians(boat_heading)
        obs_lat = boat_lat + (distance_m * math.cos(head_rad) * lat_deg_per_m)
        obs_lon = boat_lon + (distance_m * math.sin(head_rad) * lon_deg_per_m)

        obs = {
            "id": f"OBS-DEMO-{len(self.obstacles)+1}",
            "latitude": obs_lat,
            "longitude": obs_lon,
            "size_m": 15.0,
            "type": "ice_floe",
            "drift_speed": 0.1,
            "drift_heading": (boat_heading + 180) % 360
        }
        self.obstacles.append(obs)
        return obs

    def update_positions(self, dt: float = 2.0) -> List[Dict]:
        lat_deg_per_m = 1.0 / 111000.0

        for obs in self.obstacles:
            if obs["type"] != "submerged_rock":
                dist_moved = obs["drift_speed"] * dt
                rad = math.radians(obs["drift_heading"])
                lon_deg_per_m = 1.0 / (111000.0 * math.cos(math.radians(obs["latitude"])))

                obs["latitude"] += (dist_moved * math.cos(rad)) * lat_deg_per_m
                obs["longitude"] += (dist_moved * math.sin(rad)) * lon_deg_per_m

        return self.obstacles
