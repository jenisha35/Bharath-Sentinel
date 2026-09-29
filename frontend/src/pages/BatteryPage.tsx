import React, { useEffect, useState } from 'react';
import { Telemetry } from '../types';
import { fetchBatteryHistory } from '../services/api';
import { Battery, Sun, Zap, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface BatteryPageProps {
  fleet: Telemetry[];
  selectedBoatId: string;
  onSelectBoat: (id: string) => void;
}

export const BatteryPage: React.FC<BatteryPageProps> = ({
  fleet,
  selectedBoatId,
  onSelectBoat
}) => {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [enduranceForecast, setEnduranceForecast] = useState<any>({});

  const selectedBoat = fleet.find((b) => b.boat_id === selectedBoatId) || fleet[0];

  useEffect(() => {
    if (!selectedBoatId) return;

    const loadHistory = async () => {
      try {
        const res = await fetchBatteryHistory(selectedBoatId, 60);
        if (res.history) setHistoryData(res.history);
        if (res.endurance_forecast) setEnduranceForecast(res.endurance_forecast);
      } catch (e) {
        console.error(e);
      }
    };

    loadHistory();
    const interval = setInterval(loadHistory, 3000);
    return () => clearInterval(interval);
  }, [selectedBoatId]);

  if (!selectedBoat) return <div className="p-6 text-slate-400 font-mono">Loading battery telemetry...</div>;

  const chartData = historyData.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    soc: d.battery_percentage,
    solar: d.solar_power,
    power: d.power_consumption,
    voltage: d.voltage
  }));

  const isBatteryLow = selectedBoat.battery.percentage < 25.0;

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-2xl border border-[#1E293B] shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
            <Battery className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-display">LiFePO4 BATTERY & SOLAR MANAGEMENT</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Energy balance model & power consumption forecast</p>
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
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-[#080C14] border border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-600'
              }`}
            >
              {b.boat_id}
            </button>
          ))}
        </div>
      </div>

      {/* Battery Gauges & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 font-mono">
        <div className={`p-5 rounded-2xl border col-span-2 shadow-xl ${isBatteryLow ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-[#0F172A] border-[#1E293B]'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">STATE OF CHARGE (SOC %)</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">12V LiFePO4</span>
          </div>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-4xl font-extrabold text-white font-display">{selectedBoat.battery.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-[#080C14] h-2.5 rounded-full mt-3 overflow-hidden border border-[#1E293B]">
            <div
              className={`h-full transition-all rounded-full ${isBatteryLow ? 'bg-rose-500' : 'bg-emerald-400'}`}
              style={{ width: `${selectedBoat.battery.percentage}%` }}
            />
          </div>
        </div>

        <div className="bg-[#0F172A] border border-[#1E293B] p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">BUS VOLTAGE</span>
          <span className="text-2xl font-extrabold text-white font-display mt-2">{selectedBoat.battery.voltage.toFixed(2)} V</span>
        </div>

        <div className="bg-[#0F172A] border border-[#1E293B] p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">NET CURRENT</span>
          <span className="text-2xl font-extrabold text-cyan-400 font-display mt-2">{selectedBoat.battery.current.toFixed(2)} A</span>
        </div>

        <div className="bg-[#0F172A] border border-[#1E293B] p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">POWER DRAW</span>
          <span className="text-2xl font-extrabold text-amber-400 font-display mt-2">{selectedBoat.battery.power_consumption.toFixed(1)} W</span>
        </div>

        <div className="bg-[#0F172A] border border-[#1E293B] p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">SOLAR GAIN</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-display mt-2">+{selectedBoat.battery.solar_power.toFixed(1)} W</span>
        </div>

        <div className="bg-[#0F172A] border border-[#1E293B] p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">EST. ENDURANCE</span>
          <span className="text-2xl font-extrabold text-white font-display mt-2">{selectedBoat.battery.estimated_runtime.toFixed(1)} hrs</span>
        </div>
      </div>

      {/* Charge Curves & Power Decomposition Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="pb-4 border-b border-[#1E293B]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>SOLAR GENERATION VS PROPULSION POWER DRAW</span>
            </h3>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Line type="monotone" dataKey="soc" stroke="#10B981" strokeWidth={2} dot={false} name="BATTERY SOC %" />
                <Line type="monotone" dataKey="solar" stroke="#F59E0B" strokeWidth={2} dot={false} name="SOLAR GAIN (W)" />
                <Line type="monotone" dataKey="power" stroke="#EF4444" strokeWidth={2} dot={false} name="POWER DRAW (W)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Endurance Predictor Widget */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#1E293B] mb-5">
              <h3 className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center space-x-2 font-mono">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>ENERGY FORECAST WIDGET</span>
              </h3>
            </div>

            <div className="bg-[#080C14] p-4 rounded-xl border border-[#1E293B] space-y-3.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">PROPULSION DRAW:</span>
                <span className="text-rose-400 font-bold">{(15 * (selectedBoat.navigation.speed ** 2)).toFixed(1)} W</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">ELECTRONICS & SENSORS:</span>
                <span className="text-amber-400 font-bold">25.0 W</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">SOLAR ARRAY DIURNAL GAIN:</span>
                <span className="text-emerald-400 font-bold">+{selectedBoat.battery.solar_power.toFixed(1)} W</span>
              </div>
              <div className="pt-3 border-t border-[#1E293B] flex justify-between items-center">
                <span className="text-slate-300 font-bold">ESTIMATED RUNTIME:</span>
                <span className="text-cyan-400 font-extrabold text-sm">{selectedBoat.battery.estimated_runtime.toFixed(1)} HOURS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
