import React from 'react';
import { Telemetry } from '../types';
import { SimControlPanel } from '../components/controls/SimControlPanel';
import { Sliders } from 'lucide-react';

interface SimulationPageProps {
  fleet: Telemetry[];
  selectedBoatId: string;
  onSelectBoat: (id: string) => void;
}

export const SimulationPage: React.FC<SimulationPageProps> = ({
  fleet,
  selectedBoatId,
  onSelectBoat
}) => {
  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-2xl border border-[#1E293B] shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-display">SIMULATION EVENT INJECTION & CONTROL</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Developer tools for triggering anomalies, hazards & protective shutter control</p>
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

      <SimControlPanel selectedBoatId={selectedBoatId} />
    </div>
  );
};
