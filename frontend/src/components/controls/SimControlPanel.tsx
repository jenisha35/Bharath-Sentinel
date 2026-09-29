import React, { useState } from 'react';
import { Sliders, Zap, Shield, AlertTriangle, RefreshCw, Lock, Unlock } from 'lucide-react';
import { injectSimEvent, sendShutterCommand } from '../../services/api';

interface SimControlPanelProps {
  selectedBoatId: string;
}

export const SimControlPanel: React.FC<SimControlPanelProps> = ({ selectedBoatId }) => {
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  const triggerEvent = async (eventType: string, sensorName?: string, val?: number) => {
    try {
      setLoading(true);
      await injectSimEvent(selectedBoatId, eventType, sensorName, val);
      setLastAction(`Triggered: ${eventType.toUpperCase()} on ${selectedBoatId}`);
    } catch (e) {
      console.error(e);
      setLastAction('Error triggering event');
    } finally {
      setLoading(false);
    }
  };

  const toggleShutter = async (cmd: 'OPEN_HUB' | 'CLOSE_HUB') => {
    try {
      setLoading(true);
      await sendShutterCommand(selectedBoatId, cmd);
      setLastAction(`Shutter set to: ${cmd} for ${selectedBoatId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#1E293B] mb-4">
        <h3 className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center space-x-2 font-mono">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>SIMULATION CONTROL PANEL ({selectedBoatId})</span>
        </h3>
        {lastAction && <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{lastAction}</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-semibold font-mono">
        <button
          onClick={() => triggerEvent('ocean_anomaly', 'turbidity', 22.0)}
          disabled={loading}
          className="flex items-center space-x-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 p-3 rounded-xl transition-all active:scale-95"
        >
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">INJECT OCEAN ANOMALY</span>
        </button>

        <button
          onClick={() => triggerEvent('atmo_anomaly', 'wind_speed', 35.0)}
          disabled={loading}
          className="flex items-center space-x-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/25 p-3 rounded-xl transition-all active:scale-95"
        >
          <Zap className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="truncate">INJECT ATMO ANOMALY</span>
        </button>

        <button
          onClick={() => triggerEvent('spawn_obstacle')}
          disabled={loading}
          className="flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 p-3 rounded-xl transition-all active:scale-95"
        >
          <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">SPAWN ICE FLOE</span>
        </button>

        <button
          onClick={() => triggerEvent('low_battery')}
          disabled={loading}
          className="flex items-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 p-3 rounded-xl transition-all active:scale-95"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate">SIMULATE LOW BATTERY</span>
        </button>

        <button
          onClick={() => toggleShutter('CLOSE_HUB')}
          disabled={loading}
          className="flex items-center space-x-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 p-3 rounded-xl transition-all active:scale-95"
        >
          <Lock className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="truncate">CLOSE HUB SHUTTER</span>
        </button>

        <button
          onClick={() => toggleShutter('OPEN_HUB')}
          disabled={loading}
          className="flex items-center space-x-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 p-3 rounded-xl transition-all active:scale-95"
        >
          <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">OPEN HUB SHUTTER</span>
        </button>

        <button
          onClick={() => triggerEvent('leak')}
          disabled={loading}
          className="flex items-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 p-3 rounded-xl transition-all active:scale-95"
        >
          <Shield className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate">SIMULATE HULL LEAK</span>
        </button>

        <button
          onClick={() => triggerEvent('reset')}
          disabled={loading}
          className="flex items-center space-x-2 bg-[#080C14] hover:bg-slate-800 text-slate-200 border border-[#1E293B] hover:border-slate-600 p-3 rounded-xl transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-slate-300 shrink-0" />
          <span className="truncate">RESET VESSEL SIM</span>
        </button>
      </div>
    </div>
  );
};
