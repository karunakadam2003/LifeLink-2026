import React from 'react';
import { EmergencyEvent } from '../types.js';
import { Radio, Activity, Send, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

interface PubSubStreamProps {
  events: EmergencyEvent[];
}

export const PubSubStream: React.FC<PubSubStreamProps> = ({ events }) => {
  const getEventBadge = (type: EmergencyEvent['event_type']) => {
    switch (type) {
      case 'INCIDENT_DETECTED':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'HOSPITAL_DIVERT_TRIGGERED':
        return 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse';
      case 'TRAFFIC_CONGESTION_SPIKE':
        return 'bg-orange-950 text-orange-300 border-orange-800';
      case 'RE_PLAN_COMPLETED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'HUMAN_APPROVAL_GRANTED':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h3 className="font-black text-sm uppercase tracking-wider text-white">
            Google Cloud Pub/Sub Live Event Bus
          </h3>
        </div>
        <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
          topic: lifelink.telemetry.events
        </span>
      </div>

      {/* Stream Messages */}
      <div className="space-y-2 overflow-y-auto max-h-[220px] font-mono text-xs pr-1">
        {events.map(ev => (
          <div
            key={ev.event_id}
            className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-start justify-between gap-2"
          >
            <div className="space-y-1">
              <div className="flex items-center flex-wrap gap-1.5">
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase ${getEventBadge(ev.event_type)}`}>
                  {ev.event_type.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  source: <strong className="text-slate-400">{ev.source}</strong>
                </span>
              </div>
              <p className="text-slate-200 text-xs font-sans">
                {ev.summary}
              </p>
            </div>
            <span className="text-[10px] text-slate-500 whitespace-nowrap">
              {new Date(ev.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
