import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "BHARATH SENTINEL — Autonomous Resilient Ocean Observation Robot"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./bharath_sentinel.db")
    
    # Simulation settings
    SIMULATION_TICK_SECONDS: float = 2.0
    DEFAULT_BOAT_COUNT: int = 5
    
    # Coordinates default to Southern Ocean (South of India)
    BASE_LATITUDE: float = -53.0
    BASE_LONGITUDE: float = 78.0
    DEFAULT_MISSION_RADIUS_M: float = 2500.0  # 2.5 km
    
    # Safety thresholds
    OBSTACLE_WARNING_M: float = 100.0
    OBSTACLE_CRITICAL_M: float = 50.0
    
    BATTERY_WARNING_PERCENT: float = 25.0
    BATTERY_CRITICAL_PERCENT: float = 15.0
    
    # Geofence threshold ratios
    GEOFENCE_SAFE_RATIO: float = 0.80
    GEOFENCE_WARNING_RATIO: float = 0.95
    GEOFENCE_CRITICAL_RATIO: float = 1.00

    class Config:
        case_sensitive = True

settings = Settings()
