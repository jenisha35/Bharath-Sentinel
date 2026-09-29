from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple

class SensorInterface(ABC):
    @abstractmethod
    def read_ocean_sensors(self) -> Dict[str, float]:
        """Returns oceanographic sensor readings."""
        pass

    @abstractmethod
    def read_atmospheric_sensors(self) -> Dict[str, float]:
        """Returns atmospheric sensor readings."""
        pass

class NavigationInterface(ABC):
    @abstractmethod
    def get_location(self) -> Tuple[float, float]:
        """Returns (latitude, longitude)."""
        pass

    @abstractmethod
    def get_kinematics(self) -> Tuple[float, float]:
        """Returns (heading, speed)."""
        pass

    @abstractmethod
    def set_differential_thrust(self, left_thrust: float, right_thrust: float):
        """Sets motor thrust outputs."""
        pass

class BatteryInterface(ABC):
    @abstractmethod
    def read_bms(self) -> Dict[str, float]:
        """Returns battery percentage, voltage, current, power, solar power, temp."""
        pass

class ShutterInterface(ABC):
    @abstractmethod
    def set_shutter_command(self, command: str) -> str:
        """Sends open/close command to actuator (OPEN, CLOSE)."""
        pass

    @abstractmethod
    def get_shutter_state(self) -> str:
        """Returns current shutter state (OPEN, OPENING, CLOSING, CLOSED, FAULT)."""
        pass
