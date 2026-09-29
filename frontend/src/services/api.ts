import { Telemetry, Anomaly, EventItem, FleetHealthItem } from '../types';

const API_BASE = '/api/v1';

export async function fetchBoats() {
  const res = await fetch(`${API_BASE}/boats`);
  if (!res.ok) throw new Error('Failed to fetch boats');
  return res.json();
}

export async function fetchFleetTelemetry() {
  const res = await fetch(`${API_BASE}/telemetry/fleet`);
  if (!res.ok) throw new Error('Failed to fetch fleet telemetry');
  return res.json();
}

export async function fetchOceanHistory(boatId: string, limit = 60) {
  const res = await fetch(`${API_BASE}/telemetry/ocean/${boatId}?limit=${limit}&forecast=true`);
  if (!res.ok) throw new Error('Failed to fetch ocean history');
  return res.json();
}

export async function fetchAtmosphereHistory(boatId: string, limit = 60) {
  const res = await fetch(`${API_BASE}/telemetry/atmosphere/${boatId}?limit=${limit}&forecast=true`);
  if (!res.ok) throw new Error('Failed to fetch atmosphere history');
  return res.json();
}

export async function fetchBatteryHistory(boatId: string, limit = 60) {
  const res = await fetch(`${API_BASE}/telemetry/battery/${boatId}?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch battery history');
  return res.json();
}

export async function fetchFleetHealth(): Promise<FleetHealthItem[]> {
  const res = await fetch(`${API_BASE}/fleet-health`);
  if (!res.ok) throw new Error('Failed to fetch fleet health');
  return res.json();
}

export async function sendShutterCommand(boatId: string, command: 'OPEN_HUB' | 'CLOSE_HUB') {
  const res = await fetch(`${API_BASE}/shutter/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ boat_id: boatId, command })
  });
  if (!res.ok) throw new Error('Failed to send shutter command');
  return res.json();
}

export async function injectSimEvent(boatId: string, eventType: string, sensorName?: string, value?: number) {
  const res = await fetch(`${API_BASE}/sim/inject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ boat_id: boatId, event_type: eventType, sensor_name: sensorName, value })
  });
  if (!res.ok) throw new Error('Failed to inject sim event');
  return res.json();
}

export async function triggerDemoMode() {
  const res = await fetch(`${API_BASE}/sim/demo`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger demo mode');
  return res.json();
}

export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/anomalies/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchClimatePredictions(boatId: string, limit = 60) {
  const res = await fetch(`${API_BASE}/predictions/climate/${boatId}?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch climate predictions');
  return res.json();
}
