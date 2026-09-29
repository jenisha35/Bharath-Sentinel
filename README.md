
````markdown
# 🇮🇳 BHARATH SENTINEL
## Autonomous Resilient Ocean Observation Robot

**SIH 2026 — Problem Statement 26065**  
**Title:** Autonomous Low-Cost Ocean Observation Platform for Polar and Southern Oceans  
**Organization:** Ministry of Earth Sciences (MoES) — National Centre for Polar and Ocean Research (NCPOR)  
**Category:** Hardware / Robotics and Drones  
**Software Architecture:** Simulation-First Autonomous Platform + FastAPI + PostGIS/SQLite + React MapLibre GL Dashboard

---

# 📌 Overview

**BHARATH SENTINEL** is a low-cost autonomous surface vehicle (ASV) designed for ocean observation, environmental monitoring, autonomous navigation, and resilient operation in challenging marine environments.

The platform combines a **twin-hull catamaran autonomous surface vehicle** with a software command center capable of:

- Autonomous mission execution
- Oceanographic and atmospheric data collection
- GPS-based navigation
- Coverage path planning
- Obstacle and ice-floe avoidance
- Geofencing
- Battery and energy monitoring
- AI-based anomaly detection
- Adaptive sampling
- Vehicle-health monitoring
- Automated protective-hub operation
- Fleet monitoring
- Environmental prediction and analysis

The system follows a **simulation-first architecture**, allowing the complete autonomous software stack to be developed and tested before integrating the physical ESP32/STM32-based hardware.

---

# 🏗️ System Architecture

```text
                                ┌───────────────────────────────────────┐
                                │       BHARATH SENTINEL SIMULATOR       │
                                │                                       │
                                │ Boat Physics • Kinematics • GPS       │
                                │ Ocean & Atmospheric Sensors • BMS     │
                                │ Motor • Battery • Safety Systems      │
                                └──────────────────┬────────────────────┘
                                                   │
                                                   │ Telemetry Stream
                                                   ▼
┌─────────────────────────┐     ┌───────────────────────────────────────┐
│     REACT DASHBOARD     │ ◄───┤            FASTAPI BACKEND            │
│                         │ WS  │                                       │
│ MapLibre GL             │ REST│ State Machine                        │
│ Recharts                │     │ PID Path Planning                    │
│ Live Mission Control    │     │ Lawnmower Planner                   │
│ Fleet Monitoring        │     │ Scikit-Learn AI                     │
└─────────────────────────┘     │ Adaptive Sampling                   │
                                │ Mission & Alert Management           │
                                └──────────────────┬────────────────────┘
                                                   │
                                                   │ Persistence
                                                   ▼
                                ┌───────────────────────────────────────┐
                                │          POSTGRES / POSTGIS            │
                                │                                       │
                                │ Telemetry • Missions • Fleet State   │
                                │ Geofences • Alerts • Spatial Data    │
                                └───────────────────────────────────────┘
````

---

# ⚙️ Simulation-First Architecture

BHARATH SENTINEL uses a **digital simulation layer** to reproduce the behaviour of the physical autonomous vessel.

The simulator models:

* Boat kinematics
* GPS position
* Heading
* Velocity
* Motor behaviour
* Ocean conditions
* Atmospheric conditions
* Sensor readings
* Battery state
* Solar generation
* Obstacles
* Ice floes
* Geofence boundaries
* Mission states
* Safety conditions

This allows the navigation, AI, safety and dashboard systems to be tested before physical hardware integration.

---

# 🚤 Multi-Vessel Simulation

The platform supports multiple virtual vessels operating simultaneously.

The demonstration configuration contains **5 BHARATH SENTINEL autonomous vessels**.

```text
BHARATH-SENTINEL-01
BHARATH-SENTINEL-02
BHARATH-SENTINEL-03
BHARATH-SENTINEL-04
BHARATH-SENTINEL-05
```

Each vessel maintains its own:

* GPS position
* Heading
* Velocity
* Mission state
* Battery state
* Sensor readings
* Health state
* Geofence
* Sampling state
* Obstacle state

All vessels can be monitored through the centralized command center.

---

# 🎯 Key Capabilities

## 1. Continuous Physics-Based Simulator Loop

The simulator continuously updates the virtual vessels using:

* Boat physics
* Kinematics
* GPS movement
* Heading
* Motor thrust
* Environmental conditions
* Battery consumption
* Solar generation
* Sensor readings

This creates a continuously evolving digital representation of the autonomous fleet.

---

## 2. PID Lawnmower Coverage Path Planning

BHARATH SENTINEL uses **boustrophedon / lawnmower coverage paths** for systematic observation of a mission area.

```text
        ┌─────────────────────────────┐
        │ → → → → → → → → → → →     │
        │                             │
        │     ← ← ← ← ← ← ← ← ← ←   │
        │                             │
        │ → → → → → → → → → → →     │
        │                             │
        │     ← ← ← ← ← ← ← ← ← ←   │
        │                             │
        │ → → → → → → → → → → →     │
        └─────────────────────────────┘
```

The coverage path is:

1. Generated from the mission area
2. Clipped to the defined geofence
3. Followed using autonomous steering
4. Corrected using PID-based heading control

---

# 📍 Geofencing & Steering Corrections

The system uses multi-tier geofence protection.

The vessel monitors its distance from the mission boundary and applies increasingly strong steering corrections.

```text
Mission Center
      │
      ▼
┌─────────────────────────────┐
│       80% RADIUS            │
│   Early steering correction │
│                             │
│   ┌─────────────────────┐   │
│   │     95% RADIUS      │   │
│   │ Strong correction   │   │
│   │                     │   │
│   │  ┌───────────────┐  │   │
│   │  │   100% LIMIT  │  │   │
│   │  │ Boundary       │  │   │
│   │  └───────────────┘  │   │
│   └─────────────────────┘   │
└─────────────────────────────┘
```

The vessel automatically steers inward when approaching the mission boundary.

---

# 🧊 Obstacle Detection & Dynamic Avoidance

BHARATH SENTINEL can detect simulated environmental hazards such as:

* Ice floes
* Floating objects
* Mission obstacles
* Navigation hazards

When an obstacle is detected, the autonomous system can:

1. Reduce speed
2. Calculate a safe steering direction
3. Turn away from the obstacle
4. Rejoin the mission path
5. Continue the mission

```text
Normal Navigation
       ↓
Obstacle Detected
       ↓
Risk Assessment
       ↓
Reduce Speed
       ↓
Turn Away
       ↓
Avoid Obstacle
       ↓
Rejoin Mission Path
       ↓
Resume Mission
```

---

# 🤖 AI Anomaly Detection

The analytics layer uses a combination of statistical and machine-learning approaches.

### Current approach

* Rolling Z-score
* Dual-pass anomaly detection
* Scikit-Learn `IsolationForest`

The system evaluates incoming environmental measurements and identifies abnormal conditions.

Example:

```text
Normal Sensor Data
       ↓
Rolling Baseline
       ↓
Z-Score Analysis
       ↓
Isolation Forest
       ↓
Anomaly Detected
       ↓
AI Alert
       ↓
Adaptive Sampling
```

---

# 🔬 Adaptive Sampling

When a significant environmental anomaly is detected, BHARATH SENTINEL increases the sampling density around the affected region.

### Normal condition

```text
Sampling Interval = 30 seconds
```

### Severe anomaly

```text
Sampling Interval = 5 seconds
```

The vessel can perform **dense spiral sampling** around the anomaly before returning to the normal mission pattern.

```text
             Anomaly
                ●
             ↗ ↑ ↖
           ↗   ↑   ↖
         ↗     ↑     ↖
        ← ← ← ← ← ← ←
         ↘     ↓     ↙
           ↘   ↓   ↙
             ↘ ↓ ↙
```

This allows the platform to collect higher-resolution observations where environmental conditions change significantly.

---

# 🔋 LiFePO4 Energy & Solar Model

The simulation contains an energy model representing the vessel's power system.

The model includes:

* 12V LiFePO4 battery
* State of Charge (SoC)
* Open Circuit Voltage (OCV)
* Motor power consumption
* Solar generation
* Remaining endurance
* Battery discharge

Motor power consumption is modelled approximately as:

```text
P ∝ v²
```

where:

* `P` = propulsion power
* `v` = vessel velocity

Solar generation varies with the simulated time of day.

The system uses the estimated remaining energy to determine whether the vessel can continue its mission safely.

---

# 🛡️ Automated Protective Hub Shutter

BHARATH SENTINEL contains an automated protective mechanism for the upper electronics hub.

The protective hub operates through a state machine.

```text
OPEN
  │
  ▼
CRITICAL CONDITION
  │
  ▼
CLOSING
  │
  ▼
CLOSED
  │
  ▼
SAFE_MODE
```

Possible triggers include:

* Critical obstacle
* Water leakage
* Low battery
* Severe operating conditions
* Other critical safety events

During a critical event, the system can:

1. Reduce or stop propulsion
2. Close the protective hub
3. Enter `SAFE_MODE`
4. Wait until safe operating conditions are restored

---

# 🔌 Hardware Abstraction Layer

The platform uses a **Hardware Abstraction Layer (HAL)** to separate physical hardware from the software control system.

Key interfaces include:

```text
SensorInterface
NavigationInterface
ShutterInterface
```

This allows the simulator to be replaced by real hardware without requiring major changes to the backend or dashboard.

```text
              ┌─────────────────────┐
              │   FASTAPI BACKEND   │
              └──────────┬──────────┘
                         │
                         ▼
               Hardware Abstraction
                      Layer
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
        SIMULATOR              REAL HARDWARE
                                  │
                           ESP32 / STM32
```

This provides a clean transition from:

**Simulation → Prototype Hardware → Field Deployment**

---

# 🌊 ASV Sensors

## Prototype / Existing Sensors

| Sensor                     | Purpose                                |
| -------------------------- | -------------------------------------- |
| DS18B20                    | Water temperature                      |
| EC/TDS Sensor              | Conductivity / estimated salinity      |
| pH Sensor                  | Water pH                               |
| Turbidity Sensor           | Water turbidity                        |
| GPS/GNSS                   | Position and navigation                |
| MPU6050                    | Motion and orientation                 |
| Compass / Magnetometer     | Heading                                |
| INA219                     | Battery voltage, current and power     |
| Battery Temperature Sensor | Battery safety                         |
| Leak Sensor                | Water ingress detection                |
| Camera                     | Obstacle/environment detection         |
| MS5837                     | Pressure / depth                       |
| BME280                     | Air temperature, humidity and pressure |

## Additional / Deployment Sensors

| Sensor                                 | Purpose                                  |
| -------------------------------------- | ---------------------------------------- |
| Dissolved Oxygen Sensor                | Oxygen/deoxygenation monitoring          |
| Anemometer                             | Wind speed                               |
| Wind Vane                              | Wind direction                           |
| ADCP / Water Current Sensor            | Ocean current measurement                |
| Chlorophyll-a Sensor                   | Chlorophyll / biological productivity    |
| PAR Sensor                             | Underwater light measurement             |
| Wave / Sea-State Sensor                | Wave conditions                          |
| **Motor Current / Temperature Sensor** | Motor health, overload and jam detection |

---

# 🛰️ External Scientific Data

BHARATH SENTINEL can combine onboard observations with external scientific datasets.

| Source                | Purpose                                                       |
| --------------------- | ------------------------------------------------------------- |
| **Sentinel-1**        | Sea-ice and ice-edge information                              |
| **Sentinel-3**        | Sea-surface temperature and ocean colour                      |
| **Copernicus Marine** | Ocean temperature, salinity, currents, sea level, BGC and ice |
| **NASA OceanColor**   | Ocean colour / chlorophyll-related information                |
| **ERA5**              | Atmospheric and weather information                           |
| **Argo / BGC-Argo**   | Oceanographic and biogeochemical reference observations       |

These datasets can support:

* Environmental context
* Baseline generation
* Anomaly detection
* Prediction
* Sensor validation
* Ice monitoring
* Oceanographic analysis

---

# 🧠 Bharat Sentinel Command Center

The **Bharat Sentinel Command Center** is the central software platform for monitoring and managing the autonomous fleet.

## 🗺️ Fleet Map

The dashboard provides:

* Fleet-wide vessel visualization
* GPS positions
* Observation radius
* Boat health status
* Critical alerts
* Mission monitoring
* Geofencing
* Obstacle information

---

# 🌊 Oceanography Dashboard

The system monitors:

* Water temperature
* Conductivity / estimated salinity
* Dissolved oxygen
* pH
* Turbidity
* Pressure / depth

Sensor readings can be visualized using live and historical graphs.

---

# 🌤️ Atmospheric Monitoring

The system monitors:

* Air temperature
* Humidity
* Atmospheric pressure
* Wind speed
* Wind direction

These measurements provide environmental and weather context for autonomous operation.

---

# 🔋 Battery & Vehicle Health

The dashboard monitors:

* Battery voltage
* Battery current
* Power consumption
* Battery condition
* Motor health
* Sensor health
* Leak detection
* Vehicle status
* Mission endurance

---

# 🧪 Environmental Analysis

Bharat Sentinel can combine onboard measurements with external scientific datasets to support analysis of:

* Ocean warming
* Marine environmental anomalies
* Ocean acidification tendency
* Water-quality changes
* Sea-ice / ice-edge changes
* Ocean current and drift conditions
* Atmospheric conditions
* Biological productivity indicators

> Some environmental variables, such as chlorophyll or large-scale ocean currents, are derived primarily from external scientific datasets or require additional deployment-grade sensors.

---

# 🧠 AI & Analytics

## Anomaly Detection

The system identifies unusual environmental and vehicle measurements using:

* Rolling statistical baselines
* Z-score analysis
* Isolation Forest
* Sensor-health rules

---

## Environmental Prediction

Historical ASV observations and external scientific datasets can be used to identify environmental trends and generate predictions.

Potential analysis areas include:

* Ocean temperature trends
* Environmental anomalies
* Water-quality changes
* Atmospheric conditions
* Ice-edge changes
* Current and drift conditions

---

## Sensor Health

The system monitors:

* Sensor heartbeat
* Missing values
* Invalid ranges
* Stuck readings
* Abnormal readings
* Communication failures

---

# 🔄 Complete Data Pipeline

```text
                BHARATH SENTINEL ASV
                         │
                         │ Sensor Telemetry
                         ▼
                  DATA INGESTION
                         │
                         ├───────────────┐
                         │               │
                         ▼               ▼
                CLEANING & QC     EXTERNAL DATA
                         │        Sentinel / NASA
                         │        Copernicus / ERA5
                         │        Argo / BGC-Argo
                         │               │
                         └───────┬───────┘
                                 ▼
                       UNIT NORMALIZATION
                                 │
                                 ▼
                    SPATIAL / TEMPORAL MATCH
                                 │
                                 ▼
                          DATA STORAGE
                                 │
                                 ▼
                         AI / ANALYTICS
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
        Anomaly Detection   Prediction       Sensor Health
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 ▼
                         FASTAPI BACKEND
                                 │
                                 ▼
                 BHARATH SENTINEL COMMAND CENTER
```

---

# 📡 Communication

## Prototype

* Wi-Fi
* LoRa

## Future Deployment

* Satellite communication
* Iridium-class satellite connectivity

The communication architecture is designed to allow the simulated telemetry stream to be replaced by real ASV telemetry.

---

# 🗺️ Autonomous Mission Workflow

```text
Mission Configuration
        ↓
Define Center + Radius
        ↓
Generate Coverage Path
        ↓
Launch Vessel
        ↓
GPS / IMU Navigation
        ↓
PID Path Following
        ↓
Continuous Sensor Sampling
        ↓
Obstacle / Ice Detection
        ↓
Geofence Monitoring
        ↓
Anomaly Detection
        ↓
Adaptive Sampling if Required
        ↓
Battery / Vehicle Health Check
        ↓
Mission Completion
        ↓
Return / Safe State
```

---

# 🚨 Multi-Level Safety Logic

BHARATH SENTINEL continuously evaluates:

```text
                  SENSOR DATA
                       │
                       ▼
                SAFETY CHECKS
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
   OBSTACLE         BATTERY           LEAK
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                 RISK ASSESSMENT
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
        NORMAL       WARNING      CRITICAL
          │            │            │
          ▼            ▼            ▼
       Continue     Slow/Alert   SAFE_MODE
                                  + Shutter
```

---

# 🎬 Master Demo Scenario

The complete autonomous demonstration consists of four stages.

## Stage 1 — Ice Floe Detection

A simulated ice floe approaches the mission path.

```text
Ice Floe Detected
       ↓
BHARATH-SENTINEL-03
       ↓
Warning
       ↓
Speed Reduction
       ↓
Autonomous Turn-Away
       ↓
Route Replanning
       ↓
Mission Continues
```

---

## Stage 2 — Environmental Anomaly

A turbidity anomaly is introduced into the simulated environment.

```text
Turbidity Increase
       ↓
AI Anomaly Detection
       ↓
Alert Generated
       ↓
Adaptive Sampling
       ↓
30s → 5s Sampling
       ↓
Dense Spiral Sampling
       ↓
Environmental Characterization
```

---

## Stage 3 — Low Battery

The battery level decreases during mission execution.

```text
Battery Discharge
       ↓
SoC Estimation
       ↓
Endurance Forecast
       ↓
Low Battery Warning
       ↓
Mission / Safety Decision
```

The dashboard displays the updated energy state and remaining endurance estimate.

---

## Stage 4 — Critical Condition

A severe condition is introduced.

```text
Critical Condition
       ↓
Safety State Machine
       ↓
Propulsion Reduction / Stop
       ↓
Shutter: OPEN
       ↓
Shutter: CLOSING
       ↓
Shutter: CLOSED
       ↓
SAFE_MODE
```

This demonstrates the vessel's autonomous resilience and protection mechanism.

---

# 🚤 Autonomous Safety

The ASV is designed to respond to multiple safety conditions:

* Obstacles
* Ice floes
* Excessive tilt
* Low battery
* Water leakage
* Motor abnormalities
* Sensor failures
* Dangerous environmental conditions
* Geofence violations

Depending on the condition, the vessel can:

* Reduce propulsion
* Stop propulsion
* Alter its path
* Increase sampling
* Close the protective hub
* Enter `SAFE_MODE`

---

# 🛡️ Protective System

```text
Normal Conditions
       ↓
Protective Hub Open
       ↓
Continuous Monitoring
       ↓
Dangerous Condition Detected
       ↓
Reduce / Stop Propulsion
       ↓
Protective Hub Closes
       ↓
Safe / Low-Power Mode
       ↓
Conditions Become Safe
       ↓
Resume Operation
```

Possible triggers include:

* Excessive tilt
* Water ingress
* Severe splash/wave conditions
* Abnormal vibration
* Critical obstacle
* Low battery
* Extreme operating conditions

---

# 💾 Data Storage

## Operational Data

PostgreSQL / PostGIS or SQLite can store:

* Vessel state
* GPS coordinates
* Sensor telemetry
* Missions
* Alerts
* Battery data
* Vehicle health
* Geofences
* Event logs

## Scientific Data

Large scientific datasets can use formats such as:

* NetCDF
* Zarr

Scientific data can be processed using Python and `xarray` before being matched with ASV observations.

---

# 🧰 Backend

The backend acts as the central middleware between:

```text
ASV / Simulator
      ↓
FastAPI
      ↓
State Machine
      ↓
Navigation
      ↓
AI / Analytics
      ↓
Database
      ↓
React Dashboard
```

The backend manages:

* Telemetry
* Fleet state
* Missions
* Navigation state
* Alerts
* Sensor data
* Battery state
* Safety state
* AI results

---

# 🖥️ Frontend

The dashboard is built around a mission-control interface.

### Core technologies

* React
* TypeScript
* MapLibre GL
* Recharts
* HTML5
* CSS3
* Lato

### Main dashboard areas

```text
BHARATH SENTINEL COMMAND CENTER
│
├── Home / Fleet Map
├── Oceanography
├── Atmospheric
├── Battery
├── Fleet Health
├── Analytics
└── Simulation / Demo
```

---

# 💻 Technology Stack

| Layer                   | Technology                    |
| ----------------------- | ----------------------------- |
| Frontend                | React + TypeScript            |
| Mapping                 | MapLibre GL                   |
| Charts                  | Recharts                      |
| Backend                 | Python + FastAPI              |
| AI / ML                 | Scikit-Learn                  |
| Navigation              | PID + Lawnmower Planner       |
| Geometry                | Shapely                       |
| Database                | PostgreSQL + PostGIS / SQLite |
| Scientific Processing   | NumPy + Pandas + xarray       |
| Scientific Formats      | NetCDF + Zarr                 |
| Communication           | WebSocket / REST              |
| Prototype Communication | Wi-Fi / LoRa                  |
| Future Communication    | Satellite                     |
| Hardware MCU            | ESP32 / STM32                 |
| Containerization        | Docker / Docker Compose       |

---

# 🚀 Quickstart Guide

## 1. Backend Setup & Local Execution

```bash
cd backend

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend Swagger API documentation:

```text
http://localhost:8000/docs
```

---

# 2. Frontend Setup & Local Execution

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 3. Docker Compose

For the complete stack with PostGIS:

```bash
docker-compose up --build
```

---

# 🧪 Simulation Mode

The current platform supports a simulation-first development workflow.

```text
SIMULATION
    ↓
Virtual Sensors
    ↓
Virtual GPS
    ↓
Virtual Motors
    ↓
Virtual Battery
    ↓
Virtual Environment
    ↓
FastAPI
    ↓
AI / Navigation
    ↓
Dashboard
```

This allows the software architecture to be tested even before all physical hardware is available.

---

# 🔌 Hardware Integration

The simulator is designed to be replaced progressively by physical hardware.

```text
             CURRENT
          SIMULATION
               │
               ▼
        HARDWARE-IN-LOOP
               │
               ▼
       PHYSICAL PROTOTYPE
               │
               ▼
        CONTROLLED WATER
           TESTING
               │
               ▼
        COASTAL TESTING
               │
               ▼
       COLD-WATER TESTING
               │
               ▼
        POLAR VALIDATION
```

The Hardware Abstraction Layer minimizes changes required during this transition.

---

# 📈 Development Roadmap

```text
Simulation
   ↓
Hardware-in-the-Loop
   ↓
Prototype ASV
   ↓
Pool / Tank Testing
   ↓
Lake Testing
   ↓
Coastal Saltwater Testing
   ↓
Cold-Water Testing
   ↓
Research-Grade Sensor Integration
   ↓
Satellite Communication
   ↓
Polar Validation
   ↓
Southern Ocean Deployment
   ↓
Distributed Multi-ASV Network
```

---

# 🌍 Long-Term Vision

BHARATH SENTINEL is designed as a **scalable distributed ocean-observation platform**.

Instead of relying on a single observation platform, multiple autonomous vessels can operate across different regions and contribute observations to a common command center.

```text
       BHARATH-SENTINEL-01 ──┐
       BHARATH-SENTINEL-02 ──┤
       BHARATH-SENTINEL-03 ──┼──▶ BHARATH SENTINEL
       BHARATH-SENTINEL-04 ──┤       COMMAND CENTER
       BHARATH-SENTINEL-05 ──┘
                                  │
                                  ▼
                           Shared Ocean Data
                                  │
                                  ▼
                             AI / Analytics
                                  │
                                  ▼
                         Environmental Insights
```

The long-term objective is to develop a distributed network of low-cost autonomous observation platforms capable of contributing high-resolution environmental data to polar and ocean research.

---

# 📌 Project Status

**Current Stage:** Prototype / Simulation

The software platform currently uses simulated telemetry representing the structure expected from the physical ASV.

The architecture is designed to transition from simulated telemetry to real sensor telemetry through the Hardware Abstraction Layer.

---

# 🏆 Problem Statement

**SIH 2026 — PS ID 26065**

### Autonomous Low-Cost Ocean Observation Platform for Polar and Southern Oceans

**Organization:**
Ministry of Earth Sciences (MoES) — National Centre for Polar and Ocean Research (NCPOR)

**Category:**
Hardware / Robotics and Drones

---

# 👥 Team

| Member   | Email                                                   |
| -------- | ------------------------------------------------------- |
| Member 1 | [jenisha.9530@gmail.com](mailto:jenisha.9530@gmail.com) |
| Member 2 | [jananiaiml@gmail.com](mailto:jananiaiml@gmail.com)     |
| Member 3 | [kvvenkat492@gmail.com](mailto:kvvenkat492@gmail.com)   |
| Member 4 | [perrarish@gmail.com](mailto:perrarish@gmail.com)       |

---

# 🇮🇳 BHARATH SENTINEL

> **Observe. Understand. Navigate.**

```
```
