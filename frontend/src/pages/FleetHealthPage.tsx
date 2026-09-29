import React, { useEffect, useState } from 'react';
import { fetchFleetHealth } from '../services/api';
import { FleetHealthItem } from '../types';
import { HeartPulse, Battery, Cpu, Radio, Shield, Zap, Lock, RefreshCw } from 'lucide-react';

export const FleetHealthPage: React.FC = () => {
  const [fleetHealth, setFleetHealth] = useState<FleetHealthItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await fetchFleetHealth();
      setFleetHealth(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GREEN':
      case 'OK':
      case 'SAFE':
      case 'HEALTHY':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">OK 🟢</span>;
      case 'YELLOW':
      case 'DEGRADED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">WARN 🟡</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse">CRITICAL 🔴</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center justify-between bg-[#0F172A] p-5 rounded-2xl border border-[#1E293B] shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-display">FLEET SYSTEM HEALTH & SUBSYSTEM DIAGNOSTICS</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Real-time status of Battery, Sensors, GPS, Comms, Leak, Motors & Protective Shutter</p>
          </div>
        </div>

        <button onClick={loadData} className="p-2.5 bg-[#080C14] border border-[#1E293B] hover:border-slate-600 rounded-xl text-slate-300 hover:text-white transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fleetHealth.map((item) => (
          <div key={item.boat_id} className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] rounded-2xl p-6 shadow-2xl space-y-5 transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center space-x-2 font-display">
                  <span>{item.boat_id}</span>
                  <span className="text-xs text-slate-400 font-normal">({item.name})</span>
                </h3>
                <p className="text-xs font-mono text-cyan-400 mt-0.5">Health Score: {item.overall_health_score.toFixed(1)} / 100</p>
              </div>
              {getStatusBadge(item.overall_status)}
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-3 bg-[#080C14] rounded-xl border border-[#1E293B]">
                <div className="flex items-center space-x-2.5 text-slate-300">
                  <Battery className="w-4 h-4 text-emerald-400" />
                  <span>Battery State ({item.battery_pct.toFixed(1)}%)</span>
                </div>
                {getStatusBadge(item.battery_status)}
              </div>

              <div className="flex items-center justify-between p-3 bg-[#080C14] rounded-xl border border-[#1E293B]">
                <div className="flex items-center space-x-2.5 text-slate-300">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Sensors Pipeline</span>
                </div>
                {getStatusBadge(item.sensors_status)}
              </div>

              <div className="flex items-center justify-between p-3 bg-[#080C14] rounded-xl border border-[#1E293B]">
                <div className="flex items-center space-x-2.5 text-slate-300">
                  <Radio className="w-4 h-4 text-sky-400" />
                  <span>GPS / GNSS (NEO-6M)</span>
                </div>
                {getStatusBadge(item.gps_status)}
              </div>

              <div className="flex items-center justify-between p-3 bg-[#080C14] rounded-xl border border-[#1E293B]">
                <div className="flex items-center space-x-2.5 text-slate-300">
                  <Radio className="w-4 h-4 text-indigo-400" />
                  <span>Communication Link</span>
                </div>
                {getStatusBadge(item.comm_status)}
              </div>

              <div className="flex items-center justify-between p-3 bg-[#080C14] rounded-xl border border-[#1E293B]">
                <div className="flex items-center space-x-2.5 text-slate-300">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <span>Hull Leak Sensor</span>
                </div>
                {getStatusBadge(item.leak_detected ? 'CRITICAL' : 'SAFE')}
              </div>

              <div className="flex items-center justify-between p-3 bg-[#080C14] rounded-xl border border-[#1E293B]">
                <div className="flex items-center space-x-2.5 text-slate-300">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Motors ({item.motor_temperature.toFixed(1)}°C)</span>
                </div>
                {getStatusBadge(item.motor_status)}
              </div>

              <div className="flex items-center justify-between p-3 bg-[#080C14] rounded-xl border border-[#1E293B]">
                <div className="flex items-center space-x-2.5 text-slate-300">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Protective Shutter</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                  item.shutter_state === 'CLOSED' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {item.shutter_state}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
