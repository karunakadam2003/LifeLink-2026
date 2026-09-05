import React, { useState } from 'react';
import { Hospital, Emergency } from '../types.js';
import { Building2, Bed, Clock, ShieldCheck, AlertOctagon, CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface HospitalMatrixProps {
  hospitals: Hospital[];
  emergency: Emergency;
}

export const HospitalMatrix: React.FC<HospitalMatrixProps> = ({
  hospitals,
  emergency,
}) => {
  const [selectedDetailsHospital, setSelectedDetailsHospital] = useState<Hospital | null>(null);

  // Sort hospitals by match_score or distance
  const sortedHospitals = [...hospitals].sort((a, b) => {
    if (a.hospital_id === emergency.selected_hospital_id) return -1;
    if (b.hospital_id === emergency.selected_hospital_id) return 1;
    return (b.match_score || 0) - (a.match_score || 0);
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col space-y-3.5">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-sky-400" />
          <h3 className="font-black text-sm uppercase tracking-wider text-white">
            Hospital Intelligence & Capacity Matrix
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Ranked by Gemini Multi-Factor Algorithm
        </span>
      </div>

      {/* Hospital Ranking Table / Cards */}
      <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
        {sortedHospitals.map(hosp => {
          const isSelected = hosp.hospital_id === emergency.selected_hospital_id;
          const isDiverted = hosp.operating_status === 'CODE_BLACK_DIVERT';
          const isOriginalDiverted = hosp.hospital_id === emergency.original_hospital_id;

          return (
            <div
              key={hosp.hospital_id}
              onClick={() => setSelectedDetailsHospital(hosp)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                  : isDiverted
                  ? 'bg-rose-950/20 border-rose-800/60 opacity-80'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Hospital Name & Badges */}
                <div className="flex items-start space-x-2.5">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    isSelected ? 'bg-emerald-600 text-white' : isDiverted ? 'bg-rose-900 text-rose-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {isSelected ? <CheckCircle2 className="w-4 h-4" /> : isDiverted ? <AlertOctagon className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={`text-sm font-bold ${isSelected ? 'text-emerald-300 font-extrabold' : 'text-white'}`}>
                        {hosp.name}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                          Active Selection
                        </span>
                      )}
                      {isDiverted && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                          Code Black Divert
                        </span>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                      <span>Trauma: <strong className="text-slate-200">{hosp.trauma_capability}</strong></span>
                      <span>•</span>
                      <span>ER Bays: <strong className={hosp.er_beds_available > 0 ? 'text-emerald-400' : 'text-red-400'}>{hosp.er_beds_available} Open</strong></span>
                      <span>•</span>
                      <span>ICU: <strong className="text-slate-200">{hosp.icu_beds_available} Open</strong></span>
                    </div>
                  </div>
                </div>

                {/* Score & ETA Column */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
                  <div className="flex items-center space-x-1 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-amber-300">{hosp.eta_minutes} mins</span>
                    <span className="text-[11px] text-slate-500">({hosp.distance_km}km)</span>
                  </div>

                  {hosp.match_score !== undefined && (
                    <div className="text-[11px] font-bold text-slate-300 mt-0.5">
                      Match: <span className={isSelected ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}>{hosp.match_score}/100</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rationale snippet */}
              {hosp.selection_rationale && (
                <div className="mt-2.5 pt-2 border-t border-slate-900 text-[11px] text-slate-300 leading-snug flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{hosp.selection_rationale}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
