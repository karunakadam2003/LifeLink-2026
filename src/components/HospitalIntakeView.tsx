import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Heart, 
  Pill, 
  ShieldAlert, 
  Activity, 
  Stethoscope, 
  UserCheck, 
  Send, 
  FileText,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { Hospital, Ambulance, Emergency, PatientProfile } from '../types';

interface HospitalIntakeViewProps {
  hospital: Hospital;
  emergency: Emergency | null;
  patient: PatientProfile;
  ambulance: Ambulance | null;
  onSimulateDivert: (hospitalId: string) => void;
}

export const HospitalIntakeView: React.FC<HospitalIntakeViewProps> = ({
  hospital,
  emergency,
  patient,
  ambulance,
  onSimulateDivert,
}) => {
  const [assignedBay, setAssignedBay] = useState('Trauma Bay 1 (Red Zone)');
  const [prepChecklist, setPrepChecklist] = useState({
    traumaTeamPaged: true,
    ctScannerCleared: true,
    bloodBankCrossmatchAlerted: true,
    respiratoryTherapyStandingBy: false,
  });
  const [divertActive, setDivertActive] = useState(hospital.operating_status === 'CODE_BLACK_DIVERT');

  const toggleChecklist = (key: keyof typeof prepChecklist) => {
    setPrepChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleDivert = () => {
    const next = !divertActive;
    setDivertActive(next);
    onSimulateDivert(hospital.hospital_id);
  };

  return (
    <div id="hospital-intake-container" className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-bold">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                {hospital.trauma_capability} • 24x7 ER Ready
              </span>
              {divertActive && (
                <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider border border-rose-500/30 animate-pulse">
                  Code Black Divert Active
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {hospital.name} — Emergency Department Intake
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live Trauma Triage Portal • Station ID: ER-DESK-BLR-01
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-divert-status"
            onClick={handleToggleDivert}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              divertActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
                : 'bg-white/10 hover:bg-rose-600/20 border border-white/20 text-slate-200 hover:text-white'
            }`}
          >
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            {divertActive ? 'Cancel ER Divert' : 'Declare Code Black Divert'}
          </button>
        </div>
      </div>

      {/* Main Grid: Incoming Ambulance & Patient Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Inbound Case & Privacy-Preserved EHR */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Inbound Trauma Strip */}
          <div 
            id="inbound-patient-card"
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
                  Incoming Priority 1 Trauma
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                  Patient {patient.name} ({patient.age}y / {patient.gender[0]})
                </h3>
                <p className="text-xs text-slate-500">
                  Incident: <strong>{emergency?.emergency_type.replace(/_/g, ' ') || 'High Impact Polytrauma'}</strong>
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {hospital.eta_minutes || 6} MIN
                </div>
                <p className="text-[11px] uppercase font-bold text-slate-400">Estimated Arrival</p>
              </div>
            </div>

            {/* Privacy Sanitized Clinical Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400">Blood Group</span>
                <p className="text-xl font-black text-rose-900 dark:text-rose-200 mt-1">{patient.blood_group}</p>
                <p className="text-[11px] text-rose-600 mt-0.5">Universal Crossmatch Alerted</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Critical Allergies</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.allergies.map((a, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-[11px] font-bold text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400">Current Anticoagulants</span>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mt-1">
                  {patient.medications[0] || 'Apixaban 2.5mg BID'}
                </p>
                <p className="text-[10px] text-blue-600 mt-0.5">Reversal agent on standby</p>
              </div>
            </div>

            {/* In-Transit Paramedic Telemetry */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    In-Transit Paramedic Vitals Telemetry ({ambulance?.unit_code || 'ALS-01'})
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Live IoT Stream</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400">Heart Rate</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{emergency?.vitals.heart_rate || 108} bpm</p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400">Blood Pressure</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {emergency?.vitals.systolic_bp || 135}/{emergency?.vitals.diastolic_bp || 88}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400">SpO2</span>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{emergency?.vitals.spO2 || 97}%</p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400">GCS Score</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{emergency?.vitals.gcs_score || 14}/15</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: ER Bed Assignment & Trauma Preparation Checklist */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              Trauma Bay & Team Allocation
            </h3>

            {/* Bay Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Assigned Resuscitation Suite
              </label>
              <select
                id="select-trauma-bay"
                value={assignedBay}
                onChange={(e) => setAssignedBay(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Trauma Bay 1 (Red Zone)">Trauma Bay 1 (Red Zone) — Available</option>
                <option value="Resuscitation Suite 2">Resuscitation Suite 2 — Available</option>
                <option value="Cath Lab A (Cardiology)">Cath Lab A (Cardiology) — Cleared</option>
                <option value="CT Trauma Suite 1">CT Trauma Suite 1 — Standby</option>
              </select>
            </div>

            {/* Pre-Arrival Preparation Checklist */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pre-Arrival Readiness Protocol
              </label>

              <div className="space-y-2 text-xs">
                {[
                  { key: 'traumaTeamPaged' as const, label: 'Trauma Surgery Team Paged' },
                  { key: 'ctScannerCleared' as const, label: 'Helical CT Scanner Cleared' },
                  { key: 'bloodBankCrossmatchAlerted' as const, label: '2 Units O-Negative Reserved' },
                  { key: 'respiratoryTherapyStandingBy' as const, label: 'Respiratory Therapist on Standby' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggleChecklist(item.key)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                      prepChecklist[item.key]
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="font-semibold">{item.label}</span>
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        prepChecklist[item.key] ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Acknowledge Button */}
            <div className="pt-2">
              <button
                id="btn-hospital-ack-inbound"
                className="w-full py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Acknowledge Inbound Patient Context
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
