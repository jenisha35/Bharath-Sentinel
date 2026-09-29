import random
import math
from typing import Dict

class AtmosphereSimulator:
    """
    Atmospheric Sensor Simulator:
    Simulates Air Temperature, Humidity, Atmospheric Pressure, Wind Speed, and Wind Direction
    with correlated weather fronts (low pressure systems cause wind spikes).
    """
    def __init__(self):
        self.base_air_temp = -7.5
        self.base_humidity = 82.0
        self.base_pressure = 988.0
        self.base_wind_speed = 12.5
        self.base_wind_dir = 135.0
        self.step_counter = 0
        self.injected_anomaly: Dict[str, float] = {}

    def inject_anomaly(self, sensor: str, delta: float):
        self.injected_anomaly[sensor] = delta

    def clear_anomaly(self, sensor: str = None):
        if sensor:
            self.injected_anomaly.pop(sensor, None)
        else:
            self.injected_anomaly.clear()

    def generate_readings(self, dt: float = 2.0) -> Dict[str, float]:
        self.step_counter += 1
        t = self.step_counter * 0.03

        # Weather front cycle (barometric pressure wave)
        pressure_wave = 12.0 * math.sin(t / 15.0)
        pressure = self.base_pressure + pressure_wave + random.gauss(0, 0.2) + self.injected_anomaly.get("pressure", 0.0)

        # Wind speed inversely proportional to barometric pressure change
        wind_spike = max(0.0, -pressure_wave * 1.2)
        wind_speed = max(0.5, self.base_wind_speed + wind_spike + random.gauss(0, 0.8) + self.injected_anomaly.get("wind_speed", 0.0))

        wind_dir = (self.base_wind_dir + 15.0 * math.cos(t / 20.0) + random.gauss(0, 3.0)) % 360.0

        air_temp = self.base_air_temp + 1.5 * math.sin(t / 30.0) + random.gauss(0, 0.1) + self.injected_anomaly.get("air_temperature", 0.0)

        humidity = min(100.0, max(40.0, self.base_humidity + (wind_spike * 0.8) + random.gauss(0, 0.5) + self.injected_anomaly.get("humidity", 0.0)))

        return {
            "air_temperature": round(air_temp, 2),
            "humidity": round(humidity, 1),
            "atmospheric_pressure": round(pressure, 1),
            "wind_speed": round(wind_speed, 1),
            "wind_direction": round(wind_dir, 1),
            "data_source": "SIMULATED"
        }
