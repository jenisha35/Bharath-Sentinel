import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, ShieldAlert, CheckCircle } from 'lucide-react';
import { fetchEvents } from '../../services/api';
import { EventItem } from '../../types';

export const EventStream: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const evts = await fetchEvents();
        setEvents(evts);
      } catch (e) {
        console.error(e);
      }
    };
    loadEvents();
    const interval = setInterval(loadEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
      case 'EMERGENCY':
        return <span className="flex items-center space-x-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/25 text-[10px] font-mono"><ShieldAlert className="w-3 h-3" /><span>CRITICAL</span></span>;
      case 'WARNING':
      case 'HIGH':
        return <span className="flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25 text-[10px] font-mono"><AlertTriangle className="w-3 h-3" /><span>WARNING</span></span>;
      default:
        return <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25 text-[10px] font-mono"><Info className="w-3 h-3" /><span>INFO</span></span>;
    }
  };

  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 flex flex-col h-full shadow-2xl">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#1E293B] mb-4">
        <h3 className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center space-x-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>REAL-TIME SYSTEM LOG</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-500 bg-[#080C14] px-2.5 py-0.5 rounded-full border border-[#1E293B]">{events.length} EVENTS RECORDED</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[240px] pr-2 font-mono text-xs">
        {events.length === 0 ? (
          <div className="text-slate-500 text-center py-8">No telemetry events logged yet.</div>
        ) : (
          events.map((evt, idx) => (
            <div key={evt.id || idx} className="bg-[#080C14] p-3 rounded-xl border border-[#1E293B] hover:border-slate-700 transition-all flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-cyan-400">{evt.boat_id}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                  {getSeverityBadge(evt.severity)}
                </div>
                <p className="text-slate-300 text-xs">{evt.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
