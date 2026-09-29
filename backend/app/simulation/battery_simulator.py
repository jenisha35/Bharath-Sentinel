import random
import math
from typing import Dict

class BatterySimulator:
    """
    12V LiFePO4 Battery Energy & Solar Simulator:
    Computes energy balance:
    Remaining Energy = Energy + Solar Generation - (Propulsion + Electronics + Sensors + Comms)
    Provides realistic Open Circuit Voltage (OCV) vs State of Charge (SoC) curve.
    """
    def __init__(self, capacity_ah: float = 100.0, initial_soc: float = 95.0):
        self.capacity_wh = capacity_ah * 12.8  # ~1280 Wh
        self.soc = initial_soc  # State of Charge (0 - 100%)
        self.energy_wh = (self.soc / 100.0) * self.capacity_wh
        self.temp_c = 18.5
        self.sim_hour = 12.0  # Time of day (0-24h)

    def update_energy(self, boat_speed: float, dt_seconds: float = 2.0, force_soc: float = None) -> Dict[str, float]:
        if force_soc is not None:
            self.soc = max(0.0, min(100.0, force_soc))
            self.energy_wh = (self.soc / 100.0) * self.capacity_wh

        self.sim_hour = (self.sim_hour + (dt_seconds / 3600.0)) % 24.0

        # Power draws (Watts)
        propulsion_pwr = 15.0 * (boat_speed ** 2)  # Differential thrust power scaling
        electronics_pwr = 12.0
        sensor_pwr = 8.0
        comms_pwr = 5.0

        total_consumption_pwr = propulsion_pwr + electronics_pwr + sensor_pwr + comms_pwr

        # Solar generation model (Diurnal curve between 6:00 and 18:00)
        if 6.0 <= self.sim_hour <= 18.0:
            solar_peak_pwr = 45.0  # 45W polar solar array
            solar_angle = math.sin(math.pi * (self.sim_hour - 6.0) / 12.0)
            cloud_factor = 0.75 + random.gauss(0, 0.1)  # Cloud interference
            solar_pwr = max(0.0, solar_peak_pwr * solar_angle * cloud_factor)
        else:
            solar_pwr = 0.0

        # Net energy delta in Watt-hours
        net_pwr_w = solar_pwr - total_consumption_pwr
        delta_wh = (net_pwr_w * dt_seconds) / 3600.0

        self.energy_wh = max(0.0, min(self.capacity_wh, self.energy_wh + delta_wh))
        self.soc = (self.energy_wh / self.capacity_wh) * 100.0

        # LiFePO4 Voltage Curve (3.2V x 4 cells = 12.8V nominal)
        if self.soc > 90.0:
            voltage = 13.4 - (100.0 - self.soc) * 0.02
        elif self.soc > 20.0:
            voltage = 13.2 - (90.0 - self.soc) * 0.005
        else:
            voltage = 12.8 - (20.0 - self.soc) * 0.08

        voltage += random.gauss(0, 0.02)
        current = (total_consumption_pwr - solar_pwr) / max(10.0, voltage)

        # Temperature variation based on discharge rate
        self.temp_c = 18.0 + (total_consumption_pwr * 0.05) + random.gauss(0, 0.05)

        # Estimated runtime in hours
        est_runtime_h = (self.energy_wh / max(1.0, total_consumption_pwr)) if total_consumption_pwr > 0 else 99.0

        return {
            "percentage": round(self.soc, 1),
            "voltage": round(voltage, 2),
            "current": round(current, 2),
            "power_consumption": round(total_consumption_pwr, 2),
            "solar_power": round(solar_pwr, 2),
            "temperature": round(self.temp_c, 1),
            "estimated_runtime": round(est_runtime_h, 1)
        }
