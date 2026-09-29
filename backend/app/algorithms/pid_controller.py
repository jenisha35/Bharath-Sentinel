import math

class PIDController:
    """
    PID controller for Twin-Hull Catamaran Heading Control using Differential Thrust.
    """
    def __init__(self, kp: float = 1.2, ki: float = 0.05, kd: float = 0.3):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.integral = 0.0
        self.previous_error = 0.0

    def compute(self, current_heading: float, target_heading: float, dt: float = 2.0) -> float:
        """
        Calculates steering correction (-1.0 to 1.0) based on heading error (-180 to 180 deg).
        Positive output turns right, negative turns left.
        """
        error = target_heading - current_heading
        # Normalize error to [-180, 180]
        while error > 180.0:
            error -= 360.0
        while error < -180.0:
            error += 360.0

        self.integral += error * dt
        # Anti-windup
        self.integral = max(min(self.integral, 50.0), -50.0)

        derivative = (error - self.previous_error) / dt if dt > 0 else 0.0
        self.previous_error = error

        output = (self.kp * error) + (self.ki * self.integral) + (self.kd * derivative)
        # Normalize output to [-1.0, 1.0]
        return max(min(output / 180.0, 1.0), -1.0)

def normalize_heading(heading: float) -> float:
    while heading < 0.0:
        heading += 360.0
    while heading >= 360.0:
        heading -= 360.0
    return heading

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates initial compass bearing from (lat1, lon1) to (lat2, lon2) in degrees."""
    d_lon = math.radians(lon2 - lon1)
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)

    y = math.sin(d_lon) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(d_lon)

    initial_bearing = math.atan2(y, x)
    initial_bearing = math.degrees(initial_bearing)
    return normalize_heading(initial_bearing)

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Returns distance in meters between two lat/lon coordinates on Earth."""
    R = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = math.sin(d_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c
