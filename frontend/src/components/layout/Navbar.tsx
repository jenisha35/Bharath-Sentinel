import React from 'react';
import { Compass, Waves, Wind, Battery, Play, Radio, ShieldCheck } from 'lucide-react';
import { triggerDemoMode } from '../../services/api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isConnected }) => {
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

  const navItems = [
    { id: 'home', label: 'HOME', icon: Compass },
    { id: 'oceanography', label: 'OCEANOGRAPHY', icon: Waves },
    { id: 'atmospheric', label: 'ATMOSPHERIC', icon: Wind },
    { id: 'battery', label: 'BATTERY', icon: Battery },
  ];

  return (
    <header className="bg-aurora-panel border-b border-aurora-border px-6 py-3 flex items-center justify-between shadow-xl">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
          <Compass className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-extrabold tracking-wider text-lg text-white">BHARATH SENTINEL</h1>
            <span className="text-xs bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-500/40">
              POLAR READINESS: DEV STAGE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">Autonomous Resilient Ocean Observation Robot • MoES / NCPOR 26065</p>
        </div>
      </div>

      <nav className="flex items-center space-x-2 bg-aurora-dark/60 p-1.5 rounded-xl border border-aurora-border">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-aurora-border/40 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-aurora-dark rounded-lg border border-aurora-border">
          <Radio className={`w-4 h-4 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
          <span className="text-xs font-mono text-slate-300">
            {isConnected ? 'LIVE WS' : 'DISCONNECTED'}
          </span>
        </div>

        <button
          onClick={handleDemoClick}
          disabled={demoRunning}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs shadow-lg transition-all ${
            demoRunning
              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 cursor-wait'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{demoRunning ? 'DEMO RUNNING...' : 'DEMO MODE'}</span>
        </button>
      </div>
    </header>
  );
};
