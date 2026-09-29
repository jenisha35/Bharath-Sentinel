# BHARATH SENTINEL — Autonomous Resilient Ocean Observation Robot

**SIH 2026 — Problem Statement 26065**  
**Title:** Autonomous Low-Cost Ocean Observation Platform for Polar and Southern Oceans  
**Organization:** Ministry of Earth Sciences (MoES) — National Centre for Polar and Ocean Research (NCPOR)  
**Category:** Hardware / Robotics and Drones  
**Software Architecture:** Simulation-First Autonomous Platform + FastAPI + PostGIS/SQLite + React MapLibre GL Dashboard  

---

## System Architecture

```
                                ┌───────────────────────────────────────┐
                                │       BHARATH SENTINEL SIMULATOR       │
                                │   Boat Physics • Kinematics • GPS     │
                                │   Ocean & Atmospheric Sensors • BMS    │
                                └──────────────────┬────────────────────┘
                                                   │ Telemetry Stream
                                                   ▼
┌─────────────────────────┐     ┌───────────────────────────────────────┐
│     REACT DASHBOARD     │ ◄───┤            FASTAPI BACKEND            │
│  MapLibre GL • Recharts │ WS  │  State Machine • PID Path Planning   │
│  Live Mission Control   │ REST│  Scikit-Learn AI • Lawnmower Planner  │
└─────────────────────────┘     └──────────────────┬────────────────────┘
                                                   │ Persistence
                                                   ▼
                                ┌───────────────────────────────────────┐
                                │          POSTGRES / POSTGIS           │
                                └───────────────────────────────────────┘
```

---

## Key Capabilities

1. **Continuous Physics-Based Simulator Loop**: 5 virtual BHARATH SENTINEL twin-hull catamaran vessels operating autonomously in Southern Ocean / Antarctic observation grids.
2. **PID Lawnmower Coverage Path Planning**: Boustrophedon sweep line generation clipped to circular geofence boundaries using Shapely geometry.
3. **Multi-Tier Geofencing & Steering Corrections**: Automatic inward steering when approaching 80%, 95%, or 100% geofence radii.
4. **Obstacle Detection & Dynamic Avoidance**: Tracks ice floes and hazards. Performs dynamic speed reduction and autonomous turn-away steering.
5. **AI Anomaly Detection & Adaptive Sampling**: Dual-pass rolling Z-score + Scikit-Learn `IsolationForest`. Triggers dense spiral sampling on severe anomalies (switching sampling interval from 30s to 5s).
6. **LiFePO4 Energy & Solar Model**: Calculates 12V LiFePO4 SoC %, OCV voltage curves, motor power draw ($P \propto v^2$), solar diurnal generation, and remaining endurance hours.
7. **Automated Protective Hub Shutter State Machine**: Autonomously closes upper electronics hub shutter during critical obstacles, leaks, or low battery, transitioning vessel into `SAFE_MODE`.
8. **Hardware Abstraction Layer (HAL)**: Clean separation via `SensorInterface`, `NavigationInterface`, and `ShutterInterface` allowing real ESP32/STM32 microcontrollers to replace the simulator without modifying the backend or dashboard.

---

## Quickstart Guide

### 1. Backend Setup & Local Execution
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend Swagger API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Frontend Setup & Local Execution
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Docker Compose (Full Stack with PostGIS)
```bash
docker-compose up --build
```

---

## Master Demo Scenario

To execute the automated 4-stage demonstration sequence:
1. Click **DEMO MODE** in the top navigation bar.
2. Observe Stage 1: Approaching ice floe triggers `BHARATH-SENTINEL-03` warning & autonomous route replanning.
3. Observe Stage 2: Turbidity anomaly triggers AI alert and dense adaptive spiral sampling.
4. Observe Stage 3: Low battery warning updates energy endurance forecast.
5. Observe Stage 4: Severe condition triggers autonomous closure of the upper electronics hub shutter (`OPEN` $\rightarrow$ `CLOSING` $\rightarrow$ `CLOSED` $\rightarrow$ `SAFE_MODE`).
