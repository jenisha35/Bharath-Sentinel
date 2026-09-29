import math
from typing import List, Tuple
from app.algorithms.pid_controller import PIDController, calculate_bearing, haversine_distance, normalize_heading

class NavigationSimulator:
    """
    Kinematic simulator for twin-hull catamaran platform.
    Uses differential thrust PID control to steer toward active waypoints.
    """
    def __init__(self, lat: float, lon: float, heading: float = 0.0, target_speed: float = 1.5):
        self.lat = lat
        self.lon = lon
        self.heading = heading
        self.speed = target_speed
        self.target_speed = target_speed
        self.pid = PIDController(kp=1.5, ki=0.02, kd=0.4)
        self.waypoints: List[Tuple[float, float]] = []
        self.waypoint_index = 0

    def set_waypoints(self, waypoints: List[Tuple[float, float]]):
        self.waypoints = waypoints
        self.waypoint_index = 0

    def update_kinematics(self, dt: float = 2.0, speed_modifier: float = 1.0) -> Tuple[float, float, float, float]:
        """
        Advances boat location using differential thrust PID steering.
        Returns (new_lat, new_lon, new_heading, current_speed).
        """
        if not self.waypoints:
            return self.lat, self.lon, self.heading, 0.0

        current_target = self.waypoints[self.waypoint_index]
        dist_to_target = haversine_distance(self.lat, self.lon, current_target[0], current_target[1])

        # Waypoint arrival check (within 15 meters)
        if dist_to_target < 15.0:
            self.waypoint_index = (self.waypoint_index + 1) % len(self.waypoints)
            current_target = self.waypoints[self.waypoint_index]

        desired_heading = calculate_bearing(self.lat, self.lon, current_target[0], current_target[1])
        steering = self.pid.compute(self.heading, desired_heading, dt=dt)

        # Differential thrust turn rate (~30 deg/sec max)
        turn_rate = steering * 25.0 * dt
        self.heading = normalize_heading(self.heading + turn_rate)

        # Speed adjustment based on steering tightness and modifier
        effective_speed = self.target_speed * speed_modifier * max(0.2, (1.0 - abs(steering) * 0.5))
        self.speed = effective_speed

        # Displacement in meters
        distance_moved = effective_speed * dt

        # Convert to lat/lon delta (including slight ocean drift)
        lat_deg_per_m = 1.0 / 111000.0
        lon_deg_per_m = 1.0 / (111000.0 * math.cos(math.radians(self.lat)))

        heading_rad = math.radians(self.heading)
        # Ocean current drift vector (0.1 m/s east)
        drift_east = 0.05 * dt

        d_lat = (distance_moved * math.cos(heading_rad)) * lat_deg_per_m
        d_lon = (distance_moved * math.sin(heading_rad) + drift_east) * lon_deg_per_m

        self.lat += d_lat
        self.lon += d_lon

        return self.lat, self.lon, self.heading, self.speed
