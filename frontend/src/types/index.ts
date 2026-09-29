export interface Location {
  latitude: number;
  longitude: number;
}

export interface Navigation {
  heading: number;
  speed: number;
  mission_state: string;
  waypoint_index: number;
  total_waypoints: number;
  pitch?: number;
  roll?: number;
  accel_z?: number;
  wave_motion_index?: number;
}

export interface OceanData {
  temperature: number;
  salinity: number;
  dissolved_oxygen: number;
  ph: number;
  turbidity: number;
  depth: number;
  data_source: string;
}

export interface AtmosphereData {
  air_temperature: number;
  humidity: number;
  atmospheric_pressure: number;
  wind_speed: number;
  wind_direction: number;
  data_source: string;
}

export interface ObstacleDetectionData {
  ultrasonic_distance: number;
  rgb_camera_status: string;
  thermal_camera_status: string;
  marine_radar_status: string;
  obstacle_type: string;
}

export interface BatteryData {
  percentage: number;
  voltage: number;
  current: number;
  power_consumption: number;
  solar_power: number;
  temperature: number;
  estimated_runtime: number;
}

export interface HealthData {
  overall: number;
  leak_detected: boolean;
  comm_status: string;
  ina219_voltage: number;
  ina219_current: number;
  ina219_power: number;
  battery_temperature: number;
  motor_temperature: number;
  motor_current: number;
  hull_strain_index: number;
  gps_status: string;
  sensors: Record<string, { score: number; status: string; last_value?: number }>;
}

export interface SafetyData {
  obstacle_distance: number;
  obstacle_type: string;
  leak: boolean;
  comm_status: string;
}

export interface ShutterData {
  state: 'OPEN' | 'OPENING' | 'CLOSING' | 'CLOSED' | 'FAULT';
}

export interface Telemetry {
  boat_id: string;
  name: string;
  timestamp: string;
  location: Location;
  observation_radius_m?: number;
  center_location?: Location;
  coverage_waypoints?: [number, number][];
  adaptive_waypoints?: [number, number][];
  navigation: Navigation;
  ocean: OceanData;
  atmosphere: AtmosphereData;
  obstacle_detection?: ObstacleDetectionData;
  battery: BatteryData;
  health: HealthData;
  safety: SafetyData;
  shutter: ShutterData;
  status: 'GREEN' | 'YELLOW' | 'RED';
}

export interface Obstacle {
  id: string;
  latitude: number;
  longitude: number;
  size_m: number;
  type: string;
  drift_speed: number;
  drift_heading: number;
}

export interface Anomaly {
  id?: number;
  boat_id: string;
  timestamp: string;
  sensor: string;
  value: number;
  baseline: number;
  anomaly_score: number;
  severity: string;
  latitude: number;
  longitude: number;
}

export interface EventItem {
  id?: number;
  timestamp: string;
  boat_id: string;
  event_type: string;
  severity: string;
  description: string;
}

export interface FleetHealthItem {
  boat_id: string;
  name: string;
  overall_status: 'GREEN' | 'YELLOW' | 'RED';
  overall_health_score: number;
  battery_pct: number;
  battery_status: 'GREEN' | 'YELLOW' | 'RED';
  sensors_status: 'GREEN' | 'YELLOW' | 'RED';
  gps_status: string;
  comm_status: string;
  leak_detected: boolean;
  motor_temperature: number;
  motor_current: number;
  motor_status: 'GREEN' | 'YELLOW' | 'RED';
  shutter_state: string;
}
