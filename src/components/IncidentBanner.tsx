import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, MapPin, CheckCircle2, Siren, ArrowRight, ShieldCheck, Heart, Activity } from 'lucide-react';
import { Emergency } from '../types.js';

interface IncidentBannerProps {
  emergency: Emergency;
}

export const IncidentBanner: React.FC<IncidentBannerProps> = ({ emergency }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(14);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [emergency.emergency_id]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getSeverityBadge = () => {
    switch (emergency.severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  const getStatusBadge = () => {
    switch (emergency.status) {
      case 'ACTION_REQUIRED':
        return { label: 'Operator Action Required', color: 'bg-amber-500 text-slate-950 font-bold' };
      case 'AMBULANCE_EN_ROUTE':
        return { label: 'Ambulance En Route', color: 'bg-emerald-500 text-slate-950 font-bold animate-pulse' };
      case 'RE_PLANNING':
        return { label: 'Autonomous Re-plan Active', color: 'bg-indigo-500 text-white font-bold animate-pulse' };
      default:
        return { label: 'Coordinating', color: 'bg-sky-600 text-white' };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-5">
      <div className="max-w-7xl mx-auto">
        {/* Re-planning Alert Banner if Re-Planned */}
        {emergency.re_planned && (
          <div className="mb-3.5 p-3 rounded-xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border border-indigo-500/50 flex items-start justify-between gap-3 shadow-lg shadow-indigo-950/40 animate-fadeIn">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-indigo-600 text-white mt-0.5">
                <Siren className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/40">
                    Live Re-Plan Active
                  </span>
                  <span className="text-sm font-semibold text-white">
                    Facility Rerouted: {emergency.original_hospital_name} →{' '}
                    <span className="text-emerald-400 font-bold">{emergency.selected_hospital_name}</span>
                  </span>
                </div>
                <p className="text-xs text-indigo-200/90 mt-1 font-medium">
                  {emergency.re_plan_reason}
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-400 font-mono">Re-plan Latency</span>
              <div className="text-xs font-bold text-emerald-400">~380ms</div>
            </div>
          </div>
        )}

        {/* Main Incident Stats Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Patient and Incident Type */}
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-400">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  {emergency.emergency_type.replace(/_/g, ' ')}
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wide ${getSeverityBadge()}`}>
                  {emergency.severity} SEVERITY
                </span>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                <span className="font-semibold text-slate-200">
                  Patient: <span className="text-sky-300 font-bold">{emergency.patient_name}</span> ({emergency.patient_id})
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {emergency.address_hint}
                </span>
                <span className="flex items-center gap-1 font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Response T+{formatElapsed(elapsedSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Vitals Telemetry Widget */}
          <div className="flex items-center flex-wrap gap-2.5 bg-slate-950/90 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
            <div className="flex items-center space-x-1.5 pr-2 border-r border-slate-800">
              <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">HR</div>
                <div className="font-bold text-slate-200">{emergency.vitals.heart_rate} <span className="text-[10px] font-normal text-slate-400">bpm</span></div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 pr-2 border-r border-slate-800">
              <Activity className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">BP</div>
                <div className="font-bold text-slate-200">{emergency.vitals.systolic_bp}/{emergency.vitals.diastolic_bp}</div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 pr-2 border-r border-slate-800">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">SpO2</div>
                <div className={`font-bold ${emergency.vitals.spO2 < 90 ? 'text-red-400' : 'text-emerald-400'}`}>{emergency.vitals.spO2}%</div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">GCS Score</div>
                <div className="font-bold text-slate-200">{emergency.vitals.gcs_score}/15</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
