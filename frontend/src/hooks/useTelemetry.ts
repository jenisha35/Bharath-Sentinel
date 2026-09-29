import { useEffect, useState, useRef } from 'react';
import { Telemetry, Obstacle, EventItem } from '../types';
import { fetchFleetTelemetry } from '../services/api';

export function useTelemetry() {
  const [fleet, setFleet] = useState<Telemetry[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [selectedBoatId, setSelectedBoatId] = useState<string>('BHARATH-SENTINEL-01');

  const wsRef = useRef<WebSocket | null>(null);

  // Initial REST fetch & periodic fallback loop to guarantee non-zero fleet
  useEffect(() => {
    let isMounted = true;

    const loadFleet = () => {
      fetchFleetTelemetry()
        .then((data) => {
          if (isMounted && data && data.fleet && data.fleet.length > 0) {
            setFleet(data.fleet);
            if (data.obstacles) setObstacles(data.obstacles);
          }
        })
        .catch((err) => console.error('REST fleet fetch fallback error:', err));
    };

    loadFleet();

    const pollInterval = setInterval(loadFleet, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  // Real-time WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;

    function connect() {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'TELEMETRY_UPDATE') {
            if (data.fleet && data.fleet.length > 0) setFleet(data.fleet);
            if (data.obstacles) setObstacles(data.obstacles);
          }
        } catch (e) {
          console.error('Failed to parse WS telemetry frame:', e);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000); // Auto reconnect
      };

      socket.onerror = () => {
        setIsConnected(false);
      };
    }

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const selectedBoat = fleet.find((b) => b.boat_id === selectedBoatId) || fleet[0] || null;

  const fleetSummary = {
    total: fleet.length,
    normal: fleet.filter((b) => b.status === 'GREEN').length,
    warning: fleet.filter((b) => b.status === 'YELLOW').length,
    critical: fleet.filter((b) => b.status === 'RED').length,
  };

  return {
    fleet,
    obstacles,
    events,
    isConnected,
    selectedBoatId,
    setSelectedBoatId,
    selectedBoat,
    fleetSummary,
  };
}
