import datetime
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class BoatModel(Base):
    __tablename__ = "boats"

    boat_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    heading = Column(Float, default=0.0)
    speed = Column(Float, default=0.0)
    mission_id = Column(String, nullable=True)
    status = Column(String, default="GREEN")  # GREEN, YELLOW, RED
    mission_state = Column(String, default="NORMAL_OPERATION")
    shutter_state = Column(String, default="OPEN")  # OPEN, OPENING, CLOSING, CLOSED, FAULT
    health_score = Column(Float, default=100.0)
    leak_detected = Column(Boolean, default=False)
    comm_status = Column(String, default="HEALTHY")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    telemetries = relationship("TelemetryModel", back_populates="boat", cascade="all, delete-orphan")
    ocean_obs = relationship("OceanObservationModel", back_populates="boat", cascade="all, delete-orphan")
    atmo_obs = relationship("AtmosphericObservationModel", back_populates="boat", cascade="all, delete-orphan")
    sensor_healths = relationship("SensorHealthModel", back_populates="boat", cascade="all, delete-orphan")
    anomalies = relationship("AnomalyModel", back_populates="boat", cascade="all, delete-orphan")
    battery_records = relationship("BatteryModel", back_populates="boat", cascade="all, delete-orphan")
    events = relationship("EventModel", back_populates="boat", cascade="all, delete-orphan")


class TelemetryModel(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    boat_id = Column(String, ForeignKey("boats.boat_id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    heading = Column(Float, default=0.0)
    speed = Column(Float, default=0.0)
    battery = Column(Float, default=100.0)
    solar_power = Column(Float, default=0.0)
    status = Column(String, default="GREEN")
    shutter_state = Column(String, default="OPEN")
    obstacle_distance = Column(Float, default=999.0)
    leak_status = Column(Boolean, default=False)
    health_score = Column(Float, default=100.0)

    boat = relationship("BoatModel", back_populates="telemetries")


class OceanObservationModel(Base):
    __tablename__ = "ocean_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    boat_id = Column(String, ForeignKey("boats.boat_id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    temperature = Column(Float, nullable=False)
    salinity = Column(Float, nullable=False)
    dissolved_oxygen = Column(Float, nullable=False)
    ph = Column(Float, nullable=False)
    turbidity = Column(Float, nullable=False)
    depth = Column(Float, nullable=False)
    data_source = Column(String, default="SIMULATED")

    boat = relationship("BoatModel", back_populates="ocean_obs")


class AtmosphericObservationModel(Base):
    __tablename__ = "atmospheric_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    boat_id = Column(String, ForeignKey("boats.boat_id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    air_temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    atmospheric_pressure = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    wind_direction = Column(Float, nullable=False)
    data_source = Column(String, default="SIMULATED")

    boat = relationship("BoatModel", back_populates="atmo_obs")


class SensorHealthModel(Base):
    __tablename__ = "sensor_health"

    id = Column(Integer, primary_key=True, autoincrement=True)
    boat_id = Column(String, ForeignKey("boats.boat_id"), index=True, nullable=False)
    sensor_id = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    health_score = Column(Float, default=100.0)
    status = Column(String, default="HEALTHY")
    last_reading = Column(Float, nullable=True)

    boat = relationship("BoatModel", back_populates="sensor_healths")


class AnomalyModel(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    boat_id = Column(String, ForeignKey("boats.boat_id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    sensor = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    baseline = Column(Float, nullable=False)
    anomaly_score = Column(Float, nullable=False)
    severity = Column(String, default="WARNING")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    boat = relationship("BoatModel", back_populates="anomalies")


class BatteryModel(Base):
    __tablename__ = "battery"

    id = Column(Integer, primary_key=True, autoincrement=True)
    boat_id = Column(String, ForeignKey("boats.boat_id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    battery_percentage = Column(Float, nullable=False)
    voltage = Column(Float, nullable=False)
    current = Column(Float, nullable=False)
    power_consumption = Column(Float, nullable=False)
    solar_power = Column(Float, nullable=False)
    battery_temperature = Column(Float, nullable=False)
    estimated_runtime = Column(Float, nullable=False)

    boat = relationship("BoatModel", back_populates="battery_records")


class MissionModel(Base):
    __tablename__ = "missions"

    mission_id = Column(String, primary_key=True, index=True)
    boat_id = Column(String, ForeignKey("boats.boat_id"), index=True, nullable=False)
    center_latitude = Column(Float, nullable=False)
    center_longitude = Column(Float, nullable=False)
    radius = Column(Float, default=2500.0)
    sampling_interval = Column(Float, default=30.0)
    duration = Column(Float, default=24.0)
    status = Column(String, default="ACTIVE")
    waypoints_json = Column(Text, default="[]")


class EventModel(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    boat_id = Column(String, ForeignKey("boats.boat_id"), index=True, nullable=False)
    event_type = Column(String, nullable=False)
    severity = Column(String, default="INFO")
    description = Column(String, nullable=False)

    boat = relationship("BoatModel", back_populates="events")
