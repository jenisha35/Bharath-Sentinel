import React from 'react';
import { Play, Radio, AlertOctagon, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { triggerDemoMode } from '../../services/api';

interface TopBarProps {
  isConnected: boolean;
  fleetSummary: { total: number; normal: number; warning: number; critical: number };
}

export const TopBar: React.FC<TopBarProps> = ({ isConnected, fleetSummary }) => {
  const [demoRunning, setDemoRunning] = React.useState(false);

  const handleDemoClick = async () => {
    try {
      setDemoRunning(true);
      await triggerDemoMode();
      setTimeout(() => setDemoRunning(false), 35000);
    } catch (e) {
      console.error(e);
      setDemoRunning(false);
    }
  };

  return (
    <header className="bg-[#0F172A] border-b border-[#1E293B] px-6 py-3 flex items-center justify-between shadow-2xl z-20 sticky top-0">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="font-extrabold text-sm tracking-wider text-white uppercase flex items-center space-x-2">
            <span>BHARATH SENTINEL</span>
            <span className="text-slate-500 font-normal">|</span>
            <span className="text-cyan-400 font-mono font-medium text-xs">OCEAN COMMAND CENTER</span>
          </h1>
          <span className="text-[10px] font-mono text-slate-400 block tracking-tight">MoES / NCPOR Problem Statement 26065</span>
        </div>

        {/* SIMULATION MODE Mandatory Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-amber-500/10 text-amber-300 font-mono text-[10px] font-bold px-3 py-1 rounded-full border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span className="uppercase tracking-wider">SIMULATION MODE</span>
        </div>
      </div>

      {/* Fleet Live Counter Metrics */}
      <div className="hidden lg:flex items-center space-x-6 font-mono text-xs bg-[#080C14] px-4 py-1.5 rounded-xl border border-[#1E293B]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-400 text-[11px]">FLEET:</span>
          <strong className="text-white font-bold text-sm">{fleetSummary.total}</strong>
        </div>

        <div className="flex items-center space-x-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="text-slate-400 text-[11px]">NOMINAL:</span>
          <strong className="font-bold">{fleetSummary.normal}</strong>
        </div>

        <div className="flex items-center space-x-1.5 text-amber-400">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span className="text-slate-400 text-[11px]">WARN:</span>
          <strong className="font-bold">{fleetSummary.warning}</strong>
        </div>

        <div className="flex items-center space-x-1.5 text-rose-400">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="text-slate-400 text-[11px]">CRITICAL:</span>
          <strong className="font-bold">{fleetSummary.critical}</strong>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#080C14] rounded-xl border border-[#1E293B] text-[11px] font-mono">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
          <span className="text-slate-300 font-semibold">{isConnected ? 'WS LINKED' : 'OFFLINE'}</span>
        </div>

        <button
          onClick={handleDemoClick}
          disabled={demoRunning}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
            demoRunning
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 active:scale-95'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{demoRunning ? 'DEMO ACTIVE' : 'RUN DEMO'}</span>
        </button>
      </div>
    </header>
  );
};
