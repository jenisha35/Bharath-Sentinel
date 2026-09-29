import random
import math
from typing import Dict

class OceanSimulator:
    """
    Oceanographic Sensor Simulator:
    Simulates Water Temperature, Salinity, Dissolved Oxygen, pH, Turbidity, and Depth
    using smooth physical continuous functions with realistic correlations and Gaussian noise.
    """
    def __init__(self, base_lat: float = -69.0):
        # Base physical parameters for Southern Ocean / Polar waters
        self.base_temp = -1.2 if base_lat < -60 else 3.5
        self.base_salinity = 34.2
        self.base_ph = 8.12
        self.base_turbidity = 0.8
        self.base_depth = 320.0
        self.step_counter = 0

        # Anomaly override injects
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
        t = self.step_counter * 0.05

        # Diurnal slow variation
        temp_variation = 0.4 * math.sin(t / 20.0) + random.gauss(0, 0.03)
        salinity_variation = 0.15 * math.cos(t / 35.0) + random.gauss(0, 0.01)

        temp = self.base_temp + temp_variation + self.injected_anomaly.get("temperature", 0.0)
        salinity = self.base_salinity + salinity_variation + self.injected_anomaly.get("salinity", 0.0)

        # Dissolved Oxygen inversely correlated with temperature
        do_baseline = 12.5 - (temp * 0.35)
        dissolved_oxygen = do_baseline + random.gauss(0, 0.05) + self.injected_anomaly.get("dissolved_oxygen", 0.0)

        ph = self.base_ph + 0.03 * math.sin(t / 40.0) + random.gauss(0, 0.005) + self.injected_anomaly.get("ph", 0.0)

        # Turbidity with occasional natural spikes
        turbidity_spike = 15.0 if (self.step_counter % 120 > 115) else 0.0
        turbidity = max(0.1, self.base_turbidity + turbidity_spike + random.gauss(0, 0.08) + self.injected_anomaly.get("turbidity", 0.0))

        depth = self.base_depth + 1.2 * math.sin(t / 10.0) + random.gauss(0, 0.05)

        return {
            "temperature": round(temp, 3),
            "salinity": round(salinity, 3),
            "dissolved_oxygen": round(dissolved_oxygen, 3),
            "ph": round(ph, 3),
            "turbidity": round(turbidity, 3),
            "depth": round(depth, 2),
            "data_source": "SIMULATED"
        }
