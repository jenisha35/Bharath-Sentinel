import React from 'react';
import { Telemetry, Obstacle } from '../types';
import { AuroraMap } from '../components/map/AuroraMap';
import { EventStream } from '../components/layout/EventStream';
import { SimControlPanel } from '../components/controls/SimControlPanel';
import { Shield, Battery, Waves, Wind, Lock, Unlock, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { sendShutterCommand } from '../services/api';

interface HomePageProps {
  fleet: Telemetry[];
  obstacles: Obstacle[];
  selectedBoatId: string;
  onSelectBoat: (id: string) => void;
  selectedBoat: Telemetry | null;
  fleetSummary: { total: number; normal: number; warning: number; critical: number };
}

export const HomePage: React.FC<HomePageProps> = ({
  fleet,
  obstacles,
  selectedBoatId,
  onSelectBoat,
  selectedBoat,
  fleetSummary
}) => {

  const handleShutter = async (cmd: 'OPEN_HUB' | 'CLOSE_HUB') => {
    if (!selectedBoat) return;
    try {
      await sendShutterCommand(selectedBoat.boat_id, cmd);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Fleet Top Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] p-5 rounded-2xl shadow-xl flex items-center justify-between transition-all">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">ACTIVE BOATS</p>
            <h3 className="text-3xl font-extrabold text-white mt-1 font-display">{fleetSummary.total} <span className="text-xs font-normal text-slate-400">VESSELS</span></h3>
          </div>
          <div className="p-3.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] p-5 rounded-2xl shadow-xl flex items-center justify-between transition-all">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">HEALTHY OPERATIONAL</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1 font-display">{fleetSummary.normal} <span className="text-xs font-normal text-slate-400">NOMINAL</span></h3>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] p-5 rounded-2xl shadow-xl flex items-center justify-between transition-all">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">WARNING STATUS</p>
            <h3 className="text-3xl font-extrabold text-amber-400 mt-1 font-display">{fleetSummary.warning} <span className="text-xs font-normal text-slate-400">ALERT</span></h3>
          </div>
          <div className="p-3.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl shadow-inner">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0F172A] border border-[#1E293B] hover:border-[#26334D] p-5 rounded-2xl shadow-xl flex items-center justify-between transition-all">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">CRITICAL SAFETY MODE</p>
            <h3 className="text-3xl font-extrabold text-rose-400 mt-1 font-display">{fleetSummary.critical} <span className="text-xs font-normal text-slate-400">HAZARD</span></h3>
          </div>
          <div className="p-3.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl shadow-inner">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Map & Telemetry Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[540px]">
        <div className="lg:col-span-2 flex flex-col">
          <AuroraMap
            fleet={fleet}
            obstacles={obstacles}
            selectedBoatId={selectedBoatId}
            onSelectBoat={onSelectBoat}
          />
        </div>

        {/* Selected Boat Telemetry Detail Card */}
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-4">
          {selectedBoat ? (
            <>
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
                  <div>
                    <h2 className="text-xl font-extrabold text-white flex items-center space-x-2 font-display">
                      <span>{selectedBoat.boat_id}</span>
                      <span className="text-xs text-slate-400 font-normal">({selectedBoat.name})</span>
                    </h2>
                    <p className="text-xs font-mono text-cyan-400 mt-0.5">MISSION STATE: {selectedBoat.navigation.mission_state}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider ${
                    selectedBoat.status === 'GREEN' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                    selectedBoat.status === 'YELLOW' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                    'bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse'
                  }`}>
                    {selectedBoat.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-5 font-mono text-xs">
                  <div className="bg-[#080C14] p-3 rounded-xl border border-[#1E293B]">
                    <span className="text-slate-500 block text-[10px] uppercase">LATITUDE</span>
                    <span className="text-slate-100 font-bold text-sm">{selectedBoat.location.latitude.toFixed(5)}°</span>
                  </div>
                  <div className="bg-[#080C14] p-3 rounded-xl border border-[#1E293B]">
                    <span className="text-slate-500 block text-[10px] uppercase">LONGITUDE</span>
                    <span className="text-slate-100 font-bold text-sm">{selectedBoat.location.longitude.toFixed(5)}°</span>
                  </div>
                  <div className="bg-[#080C14] p-3 rounded-xl border border-[#1E293B]">
                    <span className="text-slate-500 block text-[10px] uppercase">HEADING</span>
                    <span className="text-slate-100 font-bold text-sm">{selectedBoat.navigation.heading.toFixed(1)}°</span>
                  </div>
                  <div className="bg-[#080C14] p-3 rounded-xl border border-[#1E293B]">
                    <span className="text-slate-500 block text-[10px] uppercase">SPEED</span>
                    <span className="text-slate-100 font-bold text-sm">{selectedBoat.navigation.speed.toFixed(2)} kts</span>
                  </div>
                  <div className="bg-[#080C14] p-3 rounded-xl border border-[#1E293B]">
                    <span className="text-slate-500 block text-[10px] uppercase">BATTERY</span>
                    <span className="text-emerald-400 font-bold text-sm">{selectedBoat.battery.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="bg-[#080C14] p-3 rounded-xl border border-[#1E293B]">
                    <span className="text-slate-500 block text-[10px] uppercase">HEALTH SCORE</span>
                    <span className="text-cyan-400 font-bold text-sm">{selectedBoat.health.overall.toFixed(1)} / 100</span>
                  </div>
                </div>

                {/* Shutter Hub Status Banner & Manual Control */}
                <div className="bg-[#080C14] p-4 rounded-xl border border-[#1E293B] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">PROTECTIVE ELECTRONICS SHUTTER</span>
                    <span className={`text-xs font-extrabold font-mono mt-0.5 block ${
                      selectedBoat.shutter.state === 'CLOSED' ? 'text-purple-400' : 'text-emerald-400'
                    }`}>
                      STATE: {selectedBoat.shutter.state}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleShutter('OPEN_HUB')}
                      className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-mono font-bold rounded-lg border border-emerald-500/30 transition-all"
                    >
                      OPEN
                    </button>
                    <button
                      onClick={() => handleShutter('CLOSE_HUB')}
                      className="px-3 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-mono font-bold rounded-lg border border-purple-500/30 transition-all"
                    >
                      CLOSE
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1E293B]">
                <span className="text-[10px] font-mono text-slate-400 block mb-2.5 uppercase tracking-wider">FLEET QUICK SELECT</span>
                <div className="grid grid-cols-5 gap-2 font-mono text-xs">
                  {fleet.map((b) => (
                    <button
                      key={b.boat_id}
                      onClick={() => onSelectBoat(b.boat_id)}
                      className={`py-2 text-center rounded-xl border transition-all ${
                        b.boat_id === selectedBoatId
                          ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md'
                          : 'bg-[#080C14] text-slate-300 border-[#1E293B] hover:border-slate-600'
                      }`}
                    >
                      {b.boat_id.replace('BHARATH-SENTINEL-', '').replace('AURORA-', '')}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-center py-16 font-mono text-xs">Select a vessel from map to inspect telemetry.</div>
          )}
        </div>
      </div>

      {/* Real-time Event Stream & Simulation Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EventStream />
        <SimControlPanel selectedBoatId={selectedBoatId} />
      </div>
    </div>
  );
};
