import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Telemetry, Obstacle } from '../../types';
import { Eye, EyeOff, Maximize2 } from 'lucide-react';

interface AuroraMapProps {
  fleet: Telemetry[];
  obstacles: Obstacle[];
  selectedBoatId: string;
  onSelectBoat: (boatId: string) => void;
}

function createCirclePolygon(center: [number, number], radiusMeters: number, points = 64): number[][] {
  const [lon, lat] = center;
  const latRad = (lat * Math.PI) / 180;
  const km = radiusMeters / 1000;
  const distLon = km / (111.32 * Math.cos(latRad));
  const distLat = km / 110.57;

  const coords: number[][] = [];
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([lon + distLon * Math.cos(theta), lat + distLat * Math.sin(theta)]);
  }
  coords.push(coords[0]);
  return coords;
}

export const AuroraMap: React.FC<AuroraMapProps> = ({
  fleet,
  obstacles,
  selectedBoatId,
  onSelectBoat
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const isLoadedRef = useRef(false);
  const onSelectBoatRef = useRef(onSelectBoat);
  onSelectBoatRef.current = onSelectBoat;

  const [showGeofences, setShowGeofences] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showObstacles, setShowObstacles] = useState(true);

  // Helper to update GeoJSON sources in MapLibre
  const updateMapData = () => {
    if (!map.current || !isLoadedRef.current) return;

    // 1. Observation Radii Polygons
    const radiiFeatures: any[] = [];
    if (showGeofences) {
      fleet.forEach((b) => {
        const radiusM = b.observation_radius_m || 2500.0;
        const centerLon = b.center_location?.longitude ?? b.location.longitude;
        const centerLat = b.center_location?.latitude ?? b.location.latitude;
        const circleCoords = createCirclePolygon([centerLon, centerLat], radiusM);

        radiiFeatures.push({
          type: 'Feature',
          properties: { boat_id: b.boat_id },
          geometry: {
            type: 'Polygon',
            coordinates: [circleCoords]
          }
        });
      });
    }

    // 2. Lawnmower Coverage Routes
    const routesFeatures: any[] = [];
    if (showRoutes) {
      fleet.forEach((b) => {
        const waypoints = b.adaptive_waypoints?.length ? b.adaptive_waypoints : b.coverage_waypoints;
        if (waypoints && waypoints.length >= 2) {
          const lineCoords = waypoints.map((pt) => [pt[1], pt[0]]);
          routesFeatures.push({
            type: 'Feature',
            properties: { boat_id: b.boat_id },
            geometry: {
              type: 'LineString',
              coordinates: lineCoords
            }
          });
        }
      });
    }

    // 3. Obstacles (Ice Floes)
    const obstacleFeatures: any[] = [];
    if (showObstacles) {
      obstacles.forEach((obs) => {
        obstacleFeatures.push({
          type: 'Feature',
          properties: { id: obs.id },
          geometry: {
            type: 'Point',
            coordinates: [obs.longitude, obs.latitude]
          }
        });
      });
    }

    // 4. Fleet Boats Markers & Labels
    const boatFeatures: any[] = [];
    fleet.forEach((b) => {
      const { boat_id, location, status, shutter } = b;
      const isSelected = boat_id === selectedBoatId;
      const shortId = boat_id.replace('BHARATH-SENTINEL-', 'BS').replace('AURORA-', 'A');
      const labelText = `${shortId}${shutter?.state === 'CLOSED' ? '🛡️' : ''}`;

      let color = '#34D399'; // GREEN -> emerald-400
      if (status === 'YELLOW') color = '#FBBF24'; // YELLOW -> amber-400
      if (status === 'RED') color = '#F43F5E'; // RED -> rose-500

      boatFeatures.push({
        type: 'Feature',
        properties: {
          boat_id,
          shortId,
          label: labelText,
          status,
          color,
          isSelected
        },
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        }
      });
    });

    const radiiSrc = map.current.getSource('fleet-radii-src') as maplibregl.GeoJSONSource;
    if (radiiSrc) {
      radiiSrc.setData({ type: 'FeatureCollection', features: radiiFeatures });
    }

    const routesSrc = map.current.getSource('fleet-routes-src') as maplibregl.GeoJSONSource;
    if (routesSrc) {
      routesSrc.setData({ type: 'FeatureCollection', features: routesFeatures });
    }

    const obsSrc = map.current.getSource('obstacles-src') as maplibregl.GeoJSONSource;
    if (obsSrc) {
      obsSrc.setData({ type: 'FeatureCollection', features: obstacleFeatures });
    }

    const boatsSrc = map.current.getSource('fleet-boats-src') as maplibregl.GeoJSONSource;
    if (boatsSrc) {
      boatsSrc.setData({ type: 'FeatureCollection', features: boatFeatures });
    }
  };

  // Initialize MapLibre Satellite Basemap and Geospatial GeoJSON Layers
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri, Maxar, Earthstar Geographics'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [78.0, -53.0], // Southern Ocean (South of India)
      zoom: 3.2,
      pitch: 0
    });

    m.addControl(new maplibregl.NavigationControl(), 'top-right');

    m.on('load', () => {
      isLoadedRef.current = true;

      // 1. Observation Radii Layers
      m.addSource('fleet-radii-src', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      m.addLayer({
        id: 'fleet-radii-fill',
        type: 'fill',
        source: 'fleet-radii-src',
        paint: {
          'fill-color': '#06B6D4',
          'fill-opacity': 0.04
        }
      });

      m.addLayer({
        id: 'fleet-radii-stroke',
        type: 'line',
        source: 'fleet-radii-src',
        paint: {
          'line-color': '#06B6D4',
          'line-opacity': 0.25,
          'line-width': 4.0,
          'line-blur': 6.0
        }
      });

      // 2. Lawnmower Routes Layers
      m.addSource('fleet-routes-src', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      m.addLayer({
        id: 'fleet-routes-line',
        type: 'line',
        source: 'fleet-routes-src',
        paint: {
          'line-color': '#38BDF8',
          'line-opacity': 0.35,
          'line-width': 1.0,
          'line-dasharray': [2, 3]
        }
      });

      // 3. Obstacles (Ice Floes) Layers
      m.addSource('obstacles-src', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      m.addLayer({
        id: 'obstacles-circle',
        type: 'circle',
        source: 'obstacles-src',
        paint: {
          'circle-radius': 8,
          'circle-color': 'rgba(6, 182, 212, 0.25)',
          'circle-stroke-color': 'rgba(34, 211, 238, 0.6)',
          'circle-stroke-width': 1
        }
      });

      m.addLayer({
        id: 'obstacles-symbol',
        type: 'symbol',
        source: 'obstacles-src',
        layout: {
          'text-field': '🧊',
          'text-size': 10,
          'text-allow-overlap': true,
          'text-ignore-placement': true
        }
      });

      // 4. Fleet Boats Map Layers
      m.addSource('fleet-boats-src', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      // Selected boat outer halo ring
      m.addLayer({
        id: 'fleet-boats-selected-halo',
        type: 'circle',
        source: 'fleet-boats-src',
        filter: ['==', ['get', 'isSelected'], true],
        paint: {
          'circle-radius': 9,
          'circle-color': 'rgba(0, 0, 0, 0)',
          'circle-stroke-color': '#22D3EE',
          'circle-stroke-width': 2
        }
      });

      // Boat colored dot marker
      m.addLayer({
        id: 'fleet-boats-dot',
        type: 'circle',
        source: 'fleet-boats-src',
        paint: {
          'circle-radius': ['case', ['get', 'isSelected'], 6.5, 4.5],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#0F172A',
          'circle-stroke-width': 1.5
        }
      });

      // Boat ID & Shutter status label
      m.addLayer({
        id: 'fleet-boats-label',
        type: 'symbol',
        source: 'fleet-boats-src',
        layout: {
          'text-field': ['get', 'label'],
          'text-font': ['Open Sans Bold'],
          'text-size': 10,
          'text-anchor': 'left',
          'text-offset': [0.8, 0],
          'text-allow-overlap': true,
          'text-ignore-placement': true
        },
        paint: {
          'text-color': '#67E8F9',
          'text-halo-color': '#020617',
          'text-halo-width': 3,
          'text-halo-blur': 0.5
        }
      });

      // Click listener for boat selection
      const handleBoatClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        if (e.features && e.features.length > 0) {
          const boatId = e.features[0].properties?.boat_id;
          if (boatId) {
            onSelectBoatRef.current(boatId);
          }
        }
      };

      m.on('click', 'fleet-boats-dot', handleBoatClick);
      m.on('click', 'fleet-boats-label', handleBoatClick);

      // Mouse hover cursor styling
      m.on('mouseenter', 'fleet-boats-dot', () => {
        m.getCanvas().style.cursor = 'pointer';
      });
      m.on('mouseleave', 'fleet-boats-dot', () => {
        m.getCanvas().style.cursor = '';
      });
      m.on('mouseenter', 'fleet-boats-label', () => {
        m.getCanvas().style.cursor = 'pointer';
      });
      m.on('mouseleave', 'fleet-boats-label', () => {
        m.getCanvas().style.cursor = '';
      });

      // Initial render of all map features once style is loaded
      updateMapData();
    });

    map.current = m;

    return () => {
      map.current?.remove();
      map.current = null;
      isLoadedRef.current = false;
    };
  }, []);

  // Update GeoJSON source data whenever props or layer toggles change
  useEffect(() => {
    updateMapData();
  }, [fleet, obstacles, selectedBoatId, showGeofences, showRoutes, showObstacles]);

  // Fit view bounds over all Southern Ocean fleet vessels
  const handleFitFleet = () => {
    if (!map.current || fleet.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    fleet.forEach((b) => bounds.extend([b.location.longitude, b.location.latitude]));
    map.current.fitBounds(bounds, { padding: 80, maxZoom: 7 });
  };

  return (
    <div className="relative w-full h-full min-h-[540px] rounded-2xl overflow-hidden border border-[#1E293B] shadow-2xl">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Control Toolbar */}
      <div className="absolute top-4 left-4 bg-[#0F172A]/90 backdrop-blur-md border border-[#1E293B] p-2.5 rounded-2xl flex flex-wrap items-center gap-2 shadow-2xl z-20">
        <button
          onClick={handleFitFleet}
          className="flex items-center space-x-1.5 bg-cyan-500 text-slate-950 font-mono font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md hover:bg-cyan-400 transition-all active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>FIT SOUTHERN OCEAN FLEET</span>
        </button>

        <button
          onClick={() => setShowGeofences(!showGeofences)}
          className={`flex items-center space-x-1 text-xs font-mono px-3 py-1.5 rounded-xl transition-all ${
            showGeofences ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {showGeofences ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>OBSERVATION RADII</span>
        </button>

        <button
          onClick={() => setShowRoutes(!showRoutes)}
          className={`flex items-center space-x-1 text-xs font-mono px-3 py-1.5 rounded-xl transition-all ${
            showRoutes ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {showRoutes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>LAWNMOWER ROUTES</span>
        </button>

        <button
          onClick={() => setShowObstacles(!showObstacles)}
          className={`flex items-center space-x-1 text-xs font-mono px-3 py-1.5 rounded-xl transition-all ${
            showObstacles ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {showObstacles ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>ICE FLOES</span>
        </button>
      </div>
    </div>
  );
};

