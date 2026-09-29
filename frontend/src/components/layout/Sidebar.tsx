import React, { useState } from 'react';
import { Compass, Waves, Wind, Battery, HeartPulse, BarChart3, Sliders, ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [sensorsExpanded, setSensorsExpanded] = useState(true);

  const navItemClass = (tabName: string) =>
    activeTab === tabName
      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold border border-cyan-400/30'
      : 'text-slate-400 hover:bg-[#121824] hover:text-slate-200 border border-transparent';

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-[#1E293B] flex flex-col justify-between select-none shadow-2xl z-30 shrink-0">
      <div className="p-5">
        {/* BHARATH SENTINEL Branding Logo */}
        <div className="flex items-center space-x-3.5 pb-6 border-b border-[#1E293B]">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 shadow-md">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-widest text-sm text-white font-display">BHARATH SENTINEL</h1>
            <span className="text-[10px] font-mono text-cyan-400 block tracking-widest uppercase">COMMAND CENTER</span>
          </div>
        </div>

        {/* Vertical Navigation Items */}
        <nav className="mt-6 space-y-2 text-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all ${navItemClass('home')}`}
          >
            <Compass className="w-4 h-4" />
            <span className="font-semibold tracking-wide">HOME (MAP)</span>
          </button>

          {/* SENSORS Dropdown Category */}
          <div className="space-y-1">
            <button
              onClick={() => setSensorsExpanded(!sensorsExpanded)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-slate-400 hover:bg-[#121824] hover:text-slate-200 rounded-2xl transition-all"
            >
              <div className="flex items-center space-x-3 font-semibold tracking-wide">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>SENSORS</span>
              </div>
              {sensorsExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {sensorsExpanded && (
              <div className="ml-4 pl-3 border-l border-[#1E293B] space-y-1.5 pt-1">
                <button
                  onClick={() => setActiveTab('oceanography')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                    activeTab === 'oceanography'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
                  }`}
                >
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Oceanography</span>
                </button>

                <button
                  onClick={() => setActiveTab('atmospheric')}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                    activeTab === 'atmospheric'
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
                  }`}
                >
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                  <span>Atmospheric</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('battery')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all ${navItemClass('battery')}`}
          >
            <Battery className="w-4 h-4" />
            <span className="font-semibold tracking-wide">BATTERY</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet_health')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all ${navItemClass('fleet_health')}`}
          >
            <HeartPulse className="w-4 h-4" />
            <span className="font-semibold tracking-wide">FLEET HEALTH</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all ${navItemClass('analytics')}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="font-semibold tracking-wide">ANALYTICS</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all ${navItemClass('simulation')}`}
          >
            <Sliders className="w-4 h-4" />
            <span className="font-semibold tracking-wide">SIMULATION</span>
          </button>
        </nav>
      </div>

      {/* Footer System Status Card */}
      <div className="p-4 m-4 bg-[#080C14] rounded-2xl border border-[#1E293B] font-mono text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center space-x-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-bold tracking-wider">SYSTEM NOMINAL</span>
        </div>
        <p className="text-slate-500 text-[10px]">MoES / NCPOR 26065</p>
      </div>
    </aside>
  );
};
