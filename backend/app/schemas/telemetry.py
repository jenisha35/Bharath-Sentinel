import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class LocationSchema(BaseModel):
    latitude: float
    longitude: float

class NavigationSchema(BaseModel):
    heading: float
    speed: float
    mission_state: str = "NORMAL_OPERATION"
    waypoint_index: int = 0
    total_waypoints: int = 0
    # MPU6050 IMU & Magnetometer
    pitch: float = 0.0
    roll: float = 0.0
    accel_z: float = 9.81
    wave_motion_index: float = 0.2

class OceanSchema(BaseModel):
    """Strictly 6 Oceanographic Sensors measuring water properties ONLY"""
    temperature: float = Field(..., description="Water Temperature (°C)")
    salinity: float = Field(..., description="Salinity / Conductivity (PSU)")
    dissolved_oxygen: float = Field(..., description="Dissolved Oxygen (mg/L)")
    ph: float = Field(..., description="Ocean pH Level")
    turbidity: float = Field(..., description="Water Turbidity (NTU)")
    depth: float = Field(..., description="Water Depth / Pressure (m)")
    data_source: str = "SIMULATED"

class AtmosphereSchema(BaseModel):
    """Strictly 5 Atmospheric Sensors measuring air properties ONLY"""
    air_temperature: float = Field(..., description="Air Temperature (°C)")
    humidity: float = Field(..., description="Relative Humidity (%)")
    pressure: float = Field(..., description="Barometric Pressure (hPa)")
    wind_speed: float = Field(..., description="Wind Speed / Anemometer (kts)")
    wind_direction: float = Field(..., description="Wind Direction / Vane (°)")
    data_source: str = "SIMULATED"

class ObstacleDetectionSchema(BaseModel):
    """Obstacle & Environmental Sensors"""
    ultrasonic_distance: float = 999.0
    rgb_camera_status: str = "ACTIVE_YOLO"
    thermal_camera_status: str = "SIMULATED"
    marine_radar_status: str = "FUTURE_INTEGRATION"
    obstacle_type: str = "NONE"

class SystemHealthSchema(BaseModel):
    """System Health & INA219 Battery / Motor Telemetry"""
    overall: float = 100.0
    leak_detected: bool = False
    comm_status: str = "HEALTHY"
    ina219_voltage: float = 13.2
    ina219_current: float = 2.4
    ina219_power: float = 31.68
    battery_temperature: float = 18.5
    motor_temperature: float = 28.0
    motor_current: float = 1.8
    hull_strain_index: float = 0.05
    gps_status: str = "HEALTHY"
    sensors: Dict[str, Dict[str, float | str]] = {}

class BatterySchema(BaseModel):
    percentage: float
    voltage: float
    current: float
    power_consumption: float
    solar_power: float
    temperature: float
    estimated_runtime: float

class ShutterSchema(BaseModel):
    state: str = "OPEN"  # OPEN, OPENING, CLOSING, CLOSED, FAULT

class FullTelemetrySchema(BaseModel):
    boat_id: str
    name: str
    timestamp: str
    location: LocationSchema
    navigation: NavigationSchema
    ocean: OceanSchema
    atmosphere: AtmosphereSchema
    obstacle_detection: ObstacleDetectionSchema
    battery: BatterySchema
    health: SystemHealthSchema
    shutter: ShutterSchema
    status: str = "GREEN"  # GREEN, YELLOW, RED
