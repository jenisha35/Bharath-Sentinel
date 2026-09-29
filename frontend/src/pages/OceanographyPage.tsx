import React, { useEffect, useState } from 'react';
import { Telemetry } from '../types';
import { fetchOceanHistory } from '../services/api';
import { Waves, Thermometer, Droplet, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface OceanographyPageProps {
  fleet: Telemetry[];
  selectedBoatId: string;
  onSelectBoat: (id: string) => void;
}

export const OceanographyPage: React.FC<OceanographyPageProps> = ({
  fleet,
  selectedBoatId,
  onSelectBoat
}) => {
  const [selectedSensor, setSelectedSensor] = useState<string>('turbidity');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<string>('1H');

  const selectedBoat = fleet.find((b) => b.boat_id === selectedBoatId) || fleet[0];

  useEffect(() => {
    if (!selectedBoatId) return;

    const loadHistory = async () => {
      try {
        const res = await fetchOceanHistory(selectedBoatId, 60);
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

  if (!selectedBoat) return <div className="p-6 text-slate-400 font-mono">Loading oceanography data...</div>;

  const oceanSensors = [
    { key: 'temperature', name: 'Water Temperature', val: selectedBoat.ocean.temperature, unit: '°C', normal: '-2.0 to 5.0 °C' },
    { key: 'salinity', name: 'Salinity / Conductivity', val: selectedBoat.ocean.salinity, unit: 'PSU', normal: '33.5 to 35.0 PSU' },
    { key: 'dissolved_oxygen', name: 'Dissolved Oxygen', val: selectedBoat.ocean.dissolved_oxygen, unit: 'mg/L', normal: '9.0 to 13.0 mg/L' },
    { key: 'ph', name: 'pH Level', val: selectedBoat.ocean.ph, unit: 'pH', normal: '7.8 to 8.4' },
    { key: 'turbidity', name: 'Turbidity', val: selectedBoat.ocean.turbidity, unit: 'NTU', normal: '< 5.0 NTU' },
    { key: 'depth', name: 'Water Depth', val: selectedBoat.ocean.depth, unit: 'm', normal: '50 to 500 m' },
  ];

  // Overall Ocean Condition Synthesizer calculation
  const turbidityHigh = selectedBoat.ocean.turbidity > 8.0;
  const doLow = selectedBoat.ocean.dissolved_oxygen < 8.0;

  let overallState = 'NORMAL';
  let overallReason = 'All oceanographic sensor parameters are within expected polar baseline boundaries.';

  if (turbidityHigh) {
    overallState = 'WARNING';
    overallReason = `Turbidity anomaly detected (${selectedBoat.ocean.turbidity.toFixed(1)} NTU). Adaptive sampling triggered.`;
  } else if (doLow) {
    overallState = 'WARNING';
    overallReason = `Dissolved Oxygen level dip detected (${selectedBoat.ocean.dissolved_oxygen.toFixed(1)} mg/L).`;
  }

  // Combined Measured + Predicted Chart Data
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

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Top Header & Vessel Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-2xl border border-[#1E293B] shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-display">OCEANOGRAPHY MONITORING</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Physical water column measurements & AI anomaly detection</p>
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
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-[#080C14] border border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-600'
              }`}
            >
              {b.boat_id}
            </button>
          ))}
        </div>
      </div>

      {/* Ocean Sensor Parameter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {oceanSensors.map((s) => {
          const isSelected = s.key === selectedSensor;
          return (
            <div
              key={s.key}
              onClick={() => setSelectedSensor(s.key)}
              className={`bg-[#0F172A] p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-cyan-400/80 ring-2 ring-cyan-500/20 shadow-xl shadow-cyan-500/10'
                  : 'border-[#1E293B] hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">{s.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="SENSOR HEALTHY" />
              </div>
              <div className="flex items-baseline space-x-1.5 my-2">
                <span className="text-3xl font-extrabold text-white font-display">{s.val}</span>
                <span className="text-xs font-mono text-cyan-400 font-bold">{s.unit}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 block">Baseline: {s.normal}</span>
            </div>
          );
        })}
      </div>

      {/* Main Graph & Overall Analysis Synthesizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center space-x-2 font-display">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>{selectedSensor.replace('_', ' ').toUpperCase()} TIME-SERIES & AI FORECAST</span>
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">Solid line = Measured • Dashed line = Statistical Forecast</p>
            </div>
            <div className="flex space-x-1 bg-[#080C14] p-1 rounded-xl border border-[#1E293B] text-xs font-mono">
              {['1H', '6H', '24H', '7D'].map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-lg transition-all ${timeRange === r ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="measured" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.12} strokeWidth={2} name="MEASURED" />
                <Area type="monotone" dataKey="predicted" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.12} strokeDasharray="5 5" strokeWidth={2} name="PREDICTED" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainable Ocean Condition Synthesizer Card */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-[#1E293B] mb-5">
              <h3 className="text-xs font-bold tracking-wider text-slate-300 uppercase font-mono">
                EXPLAINABLE OVERALL CONDITION SYNTHESIZER
              </h3>
            </div>

            <div className="bg-[#080C14] p-4 rounded-xl border border-[#1E293B] mb-5">
              <span className="text-[10px] font-mono text-slate-500 block mb-1 uppercase">OVERALL SYNTHESIZED STATE</span>
              <div className="flex items-center space-x-2.5">
                <span className={`w-3 h-3 rounded-full ${overallState === 'NORMAL' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
                <span className={`text-xl font-extrabold font-mono ${overallState === 'NORMAL' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {overallState}
                </span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 bg-[#080C14] rounded-xl border border-[#1E293B]">
                <span className="text-slate-400 text-[10px] block mb-1 uppercase">AI DIAGNOSTIC RATIONALE</span>
                <p className="text-slate-200 leading-relaxed">{overallReason}</p>
              </div>

              <div className="p-3.5 bg-[#080C14] rounded-xl border border-[#1E293B] space-y-1.5">
                <span className="text-slate-400 text-[10px] block uppercase">DATA CLASSIFICATION HONESTY</span>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cyan-400 font-bold">● MEASURED</span>
                  <span className="text-slate-300">Physics Simulator Loop</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-400 font-bold">▲ PREDICTED</span>
                  <span className="text-slate-300">Holt-Winters Forecaster</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
