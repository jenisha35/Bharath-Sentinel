import React, { useEffect, useState } from 'react';
import { Telemetry } from '../types';
import { fetchAtmosphereHistory } from '../services/api';
import { Wind, Thermometer, Gauge, CloudRain, Navigation, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AtmosphericPageProps {
  fleet: Telemetry[];
  selectedBoatId: string;
  onSelectBoat: (id: string) => void;
}

export const AtmosphericPage: React.FC<AtmosphericPageProps> = ({
  fleet,
  selectedBoatId,
  onSelectBoat
}) => {
  const [selectedSensor, setSelectedSensor] = useState<string>('wind_speed');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);

  const selectedBoat = fleet.find((b) => b.boat_id === selectedBoatId) || fleet[0];

  useEffect(() => {
    if (!selectedBoatId) return;

    const loadHistory = async () => {
      try {
        const res = await fetchAtmosphereHistory(selectedBoatId, 60);
        if (res.history) setHistoryData(res.history);
        if (res.forecasts && res.forecasts[selectedSensor]) {
          setForecastData(res.forecasts[selectedSensor].forecast || []);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadHistory();
    const interval = setInterval(loadHistory, 3000);
    return () => clearInterval(interval);
  }, [selectedBoatId, selectedSensor]);

  if (!selectedBoat) return <div className="p-6 text-slate-400 font-mono">Loading atmospheric data...</div>;

  const atmoSensors = [
    { key: 'air_temperature', name: 'Air Temperature', val: selectedBoat.atmosphere.air_temperature, unit: '°C' },
    { key: 'humidity', name: 'Relative Humidity', val: selectedBoat.atmosphere.humidity, unit: '%' },
    { key: 'atmospheric_pressure', name: 'Barometric Pressure', val: selectedBoat.atmosphere.atmospheric_pressure, unit: 'hPa' },
    { key: 'wind_speed', name: 'Wind Speed', val: selectedBoat.atmosphere.wind_speed, unit: 'kts' },
    { key: 'wind_direction', name: 'Wind Direction', val: selectedBoat.atmosphere.wind_direction, unit: '°' },
  ];

  const chartData = [
    ...historyData.map((d) => ({
      time: new Date(d.timestamp).toLocaleTimeString(),
      measured: d[selectedSensor],
      predicted: null
    })),
    ...forecastData.map((d) => ({
      time: new Date(d.timestamp).toLocaleTimeString() + ' (Fcst)',
      measured: null,
      predicted: d.value
    }))
  ];

  const isStormWarning = selectedBoat.atmosphere.wind_speed > 25.0 || selectedBoat.atmosphere.atmospheric_pressure < 975.0;

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-2xl border border-[#1E293B] shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-2xl">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-display">ATMOSPHERIC MONITORING</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Polar weather front tracking & barometric dynamics</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400 mr-1">TARGET VESSEL:</span>
          {fleet.map((b) => (
            <button
              key={b.boat_id}
              onClick={() => onSelectBoat(b.boat_id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                b.boat_id === selectedBoatId
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-[#080C14] border border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-600'
              }`}
            >
              {b.boat_id}
            </button>
          ))}
        </div>
      </div>

      {/* Atmospheric Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {atmoSensors.map((s) => {
          const isSelected = s.key === selectedSensor;
          return (
            <div
              key={s.key}
              onClick={() => setSelectedSensor(s.key)}
              className={`bg-[#0F172A] p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-sky-400/80 ring-2 ring-sky-500/20 shadow-xl shadow-sky-500/10'
                  : 'border-[#1E293B] hover:border-slate-600'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">{s.name}</span>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className="text-3xl font-extrabold text-white font-display">{s.val}</span>
                <span className="text-xs font-mono text-sky-400 font-bold">{s.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graph & Weather Synthesizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="pb-4 border-b border-[#1E293B]">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2 font-display">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>{selectedSensor.replace('_', ' ').toUpperCase()} HISTORICAL & AI PREDICTION</span>
            </h3>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="measured" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.12} strokeWidth={2} name="MEASURED" />
                <Area type="monotone" dataKey="predicted" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.12} strokeDasharray="5 5" strokeWidth={2} name="PREDICTED" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weather Synthesizer */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-[#1E293B] mb-5">
              <h3 className="text-xs font-bold tracking-wider text-slate-300 uppercase font-mono">
                ATMOSPHERIC SYNTHESIZER
              </h3>
            </div>

            <div className={`p-4 rounded-xl border mb-5 ${isStormWarning ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
              <span className="text-[10px] font-mono block mb-1 uppercase text-slate-400">WEATHER SYSTEM STATE</span>
              <span className="text-base font-extrabold font-mono leading-tight block">
                {isStormWarning ? 'WARNING: HIGH WINDS / LOW PRESSURE FRONT' : 'STABLE POLAR WEATHER'}
              </span>
            </div>

            <div className="bg-[#080C14] p-4 rounded-xl border border-[#1E293B] font-mono text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">BAROMETRIC PRESSURE:</span>
                <span className="text-slate-200 font-bold">{selectedBoat.atmosphere.atmospheric_pressure.toFixed(1)} hPa</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">WIND VECTOR:</span>
                <span className="text-sky-400 font-bold">{selectedBoat.atmosphere.wind_speed.toFixed(1)} kts @ {selectedBoat.atmosphere.wind_direction.toFixed(0)}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
