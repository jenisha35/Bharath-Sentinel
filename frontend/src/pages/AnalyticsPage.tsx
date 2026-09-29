import React, { useEffect, useState } from 'react';
import { Telemetry } from '../types';
import { fetchEvents, fetchClimatePredictions } from '../services/api';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, Activity, BrainCircuit, Waves, Thermometer, Droplet, Flame, Wind, Layers, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, ComposedChart, Area, Line, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AnalyticsPageProps {
  fleet: Telemetry[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ fleet }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedBoatId, setSelectedBoatId] = useState<string>(fleet.length > 0 ? fleet[0].boat_id : 'BHARATH-SENTINEL-01');
  const [predictionsData, setPredictionsData] = useState<any>(null);
  const [loadingPreds, setLoadingPreds] = useState<boolean>(true);

  useEffect(() => {
    fetchEvents().then(setEvents).catch(console.error);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoadingPreds(true);
    fetchClimatePredictions(selectedBoatId)
      .then((res) => {
        if (isMounted && res.predictions) {
          setPredictionsData(res.predictions);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoadingPreds(false);
      });

    const interval = setInterval(() => {
      fetchClimatePredictions(selectedBoatId)
        .then((res) => {
          if (isMounted && res.predictions) setPredictionsData(res.predictions);
        })
        .catch(console.error);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedBoatId]);

  const anomalyEvents = events.filter((e) => e.event_type === 'ANOMALY');

  const fleetHealthChartData = fleet.map((b) => ({
    name: b.boat_id.replace('BHARATH-SENTINEL-', 'BS').replace('AURORA-', 'A'),
    health: b.health.overall,
    battery: b.battery.percentage,
    turbidity: b.ocean.turbidity,
    speed: b.navigation.speed
  }));

  const renderModelBadge = (modelName: string, dataSource: string) => (
    <div className="mt-3 pt-3 border-t border-[#1E293B] flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
      <div className="flex items-center space-x-1.5">
        <span className="text-slate-500 uppercase tracking-wider font-bold">MODEL:</span>
        <span className="text-purple-300 font-semibold">{modelName}</span>
      </div>
      <div className="flex items-center space-x-1.5">
        <span className="text-slate-500 uppercase tracking-wider font-bold">SOURCE:</span>
        <span className="text-cyan-300 font-semibold">{dataSource}</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 max-w-[1800px] mx-auto">
      {/* Existing Header */}
      <div className="flex items-center justify-between bg-[#0F172A] p-5 rounded-2xl border border-[#1E293B] shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-display">CROSS-FLEET ANALYTICS & AI LOG</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Statistical fleet metrics, Scikit-Learn IsolationForest scores & anomaly logs</p>
          </div>
        </div>
      </div>

      {/* Existing Cross-Fleet Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="pb-4 border-b border-[#1E293B]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>FLEET HEALTH & BATTERY COMPARISON</span>
            </h3>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetHealthChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="health" fill="#06B6D4" radius={[6, 6, 0, 0]} name="HEALTH SCORE" />
                <Bar dataKey="battery" fill="#10B981" radius={[6, 6, 0, 0]} name="BATTERY %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="pb-4 border-b border-[#1E293B]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>AI ANOMALY DETECTION LOG</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-72 pr-2 font-mono text-xs">
            {anomalyEvents.length === 0 ? (
              <div className="text-slate-500 text-center py-12">No AI anomalies logged yet.</div>
            ) : (
              anomalyEvents.map((evt, idx) => (
                <div key={idx} className="bg-[#080C14] p-3 rounded-xl border border-[#1E293B] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-cyan-400">{evt.boat_id}</span>
                    <p className="text-slate-300 text-xs mt-0.5">{evt.description}</p>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold">
                    {evt.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* NEW SECTION: CLIMATE & ENVIRONMENTAL PREDICTION */}
      {/* ========================================================================= */}
      <div className="pt-8 border-t border-[#1E293B] space-y-6">
        {/* Section Header & Vessel Quick Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-2xl border border-[#1E293B] shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white font-display">CLIMATE & ENVIRONMENTAL PREDICTION</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Local Southern Ocean environmental trends, AI predictions & multi-sensor risk indicators
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-400 mr-1">SELECT VESSEL:</span>
            {fleet.map((b) => (
              <button
                key={b.boat_id}
                onClick={() => setSelectedBoatId(b.boat_id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  b.boat_id === selectedBoatId
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                    : 'bg-[#080C14] border border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-600'
                }`}
              >
                {b.boat_id}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Climate Prediction Graphs Grid */}
        {loadingPreds || !predictionsData ? (
          <div className="p-12 text-center text-slate-400 font-mono">Generating scientific climate & environmental predictions...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 1. Ocean Warming Graph */}
            <div className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase font-display">{predictionsData.ocean_warming.title}</h3>
                  </div>
                  <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    {predictionsData.ocean_warming.current_value}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400 mt-2">{predictionsData.ocean_warming.risk_label}</p>

                <div className="h-64 w-full pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictionsData.ocean_warming.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                      <Area type="monotone" dataKey="upper_bound" stroke="none" fill="#F59E0B" fillOpacity={0.1} name="UNCERTAINTY BAND" />
                      <Line type="monotone" dataKey="measured" stroke="#06B6D4" strokeWidth={2.5} dot={false} name="MEASURED WATER TEMP" />
                      <Line type="monotone" dataKey="reference" stroke="#A855F7" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="COPERNICUS/ARGO BASELINE" />
                      <Line type="monotone" dataKey="predicted" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2.5} dot={false} name="AI PREDICTED TEMP" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {renderModelBadge(predictionsData.ocean_warming.model_name, predictionsData.ocean_warming.data_source)}
            </div>

            {/* 2. Ocean Acidification Graph */}
            <div className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center space-x-2">
                    <Droplet className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase font-display">{predictionsData.ocean_acidification.title}</h3>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {predictionsData.ocean_acidification.current_value}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400 mt-2">{predictionsData.ocean_acidification.risk_label}</p>

                <div className="h-64 w-full pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictionsData.ocean_acidification.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="measured_ph" stroke="#10B981" strokeWidth={2.5} dot={false} name="MEASURED pH" />
                      <Line type="monotone" dataKey="context" stroke="#38BDF8" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="TEMP/SALINITY CONTEXT" />
                      <Line type="monotone" dataKey="predicted_ph" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2.5} dot={false} name="PREDICTED pH TREND" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {renderModelBadge(predictionsData.ocean_acidification.model_name, predictionsData.ocean_acidification.data_source)}
            </div>

            {/* 3. Ocean Deoxygenation Graph */}
            <div className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center space-x-2">
                    <Waves className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase font-display">{predictionsData.ocean_deoxygenation.title}</h3>
                  </div>
                  <span className="text-xs font-bold font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                    {predictionsData.ocean_deoxygenation.current_value}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400 mt-2">{predictionsData.ocean_deoxygenation.risk_label}</p>

                <div className="h-64 w-full pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictionsData.ocean_deoxygenation.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="threshold" stroke="#EF4444" strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="LOW OXYGEN LIMIT (8.0 mg/L)" />
                      <Line type="monotone" dataKey="measured_do" stroke="#38BDF8" strokeWidth={2.5} dot={false} name="MEASURED DISSOLVED OXYGEN" />
                      <Line type="monotone" dataKey="predicted_do" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2.5} dot={false} name="PREDICTED DO TREND" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {renderModelBadge(predictionsData.ocean_deoxygenation.model_name, predictionsData.ocean_deoxygenation.data_source)}
            </div>

            {/* 4. Salinity Changes Graph */}
            <div className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase font-display">{predictionsData.salinity_changes.title}</h3>
                  </div>
                  <span className="text-xs font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    {predictionsData.salinity_changes.current_value}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400 mt-2">{predictionsData.salinity_changes.risk_label}</p>

                <div className="h-64 w-full pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictionsData.salinity_changes.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="measured_salinity" stroke="#818CF8" strokeWidth={2.5} dot={false} name="MEASURED SALINITY (PSU)" />
                      <Line type="monotone" dataKey="reference" stroke="#A855F7" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="ARGO/COPERNICUS REFERENCE" />
                      <Line type="monotone" dataKey="predicted_salinity" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2.5} dot={false} name="PREDICTED SALINITY" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {renderModelBadge(predictionsData.salinity_changes.model_name, predictionsData.salinity_changes.data_source)}
            </div>

            {/* 5. Water-Quality Deterioration Graph */}
            <div className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase font-display">{predictionsData.water_quality.title}</h3>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {predictionsData.water_quality.current_value}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400 mt-2">{predictionsData.water_quality.risk_label}</p>

                <div className="h-64 w-full pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictionsData.water_quality.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="warning_line" stroke="#F59E0B" strokeDasharray="3 3" strokeWidth={1} dot={false} name="WARNING BOUNDARY (70)" />
                      <Line type="monotone" dataKey="critical_line" stroke="#EF4444" strokeDasharray="3 3" strokeWidth={1} dot={false} name="CRITICAL BOUNDARY (40)" />
                      <Line type="monotone" dataKey="quality_score" stroke="#10B981" strokeWidth={2.5} dot={false} name="COMPOSITE WATER QUALITY" />
                      <Line type="monotone" dataKey="predicted_score" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2.5} dot={false} name="PREDICTED CONDITION" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {renderModelBadge(predictionsData.water_quality.model_name, predictionsData.water_quality.data_source)}
            </div>

            {/* 6. Marine Heat Events Graph */}
            <div className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase font-display">{predictionsData.marine_heat_events.title}</h3>
                  </div>
                  <span className="text-xs font-bold font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    {predictionsData.marine_heat_events.current_value}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400 mt-2">{predictionsData.marine_heat_events.risk_label}</p>

                <div className="h-64 w-full pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictionsData.marine_heat_events.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="baseline_90th" stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="90TH PERCENTILE BASELINE (3.2°C)" />
                      <Line type="monotone" dataKey="measured_sst" stroke="#06B6D4" strokeWidth={2.5} dot={false} name="MEASURED SST" />
                      <Line type="monotone" dataKey="predicted_sst" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2.5} dot={false} name="PREDICTED SST" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {renderModelBadge(predictionsData.marine_heat_events.model_name, predictionsData.marine_heat_events.data_source)}
            </div>

            {/* 7. Atmospheric Changes Graph */}
            <div className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase font-display">{predictionsData.atmospheric_changes.title}</h3>
                  </div>
                  <span className="text-xs font-bold font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                    {predictionsData.atmospheric_changes.current_value}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400 mt-2">{predictionsData.atmospheric_changes.risk_label}</p>

                <div className="h-64 w-full pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictionsData.atmospheric_changes.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="measured_pressure" stroke="#38BDF8" strokeWidth={2.5} dot={false} name="BAROMETRIC PRESSURE (hPa)" />
                      <Line type="monotone" dataKey="era5_reference" stroke="#A855F7" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="ERA5 REANALYSIS BASELINE" />
                      <Line type="monotone" dataKey="predicted_pressure" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2.5} dot={false} name="PREDICTED PRESSURE" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {renderModelBadge(predictionsData.atmospheric_changes.model_name, predictionsData.atmospheric_changes.data_source)}
            </div>

            {/* 8. Environmental Anomalies Graph */}
            <div className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-extrabold text-white uppercase font-display">{predictionsData.environmental_anomalies.title}</h3>
                  </div>
                  <span className="text-xs font-bold font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    {predictionsData.environmental_anomalies.current_value}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-400 mt-2">{predictionsData.environmental_anomalies.risk_label}</p>

                <div className="h-64 w-full pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictionsData.environmental_anomalies.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748B" tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="baseline" stroke="#10B981" strokeDasharray="3 3" strokeWidth={1} dot={false} name="BASELINE INDEX (15.0)" />
                      <Line type="monotone" dataKey="anomaly_index" stroke="#C084FC" strokeWidth={2.5} dot={false} name="FUSED ANOMALY INDEX" />
                      <Line type="monotone" dataKey="predicted_index" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2.5} dot={false} name="PREDICTED ANOMALY INDEX" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {renderModelBadge(predictionsData.environmental_anomalies.model_name, predictionsData.environmental_anomalies.data_source)}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
