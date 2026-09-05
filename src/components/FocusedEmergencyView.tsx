import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Navigation, 
  Building2, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  ShieldCheck, 
  HeartHandshake,
  AlertTriangle,
  Send,
  Eye,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Emergency, Hospital, Ambulance, PatientProfile, EmergencyEvent } from '../types';
import { GeospatialMap } from './GeospatialMap';
import { EmergencyVoiceCallLive } from './EmergencyVoiceCallLive';

interface FocusedEmergencyViewProps {
  emergency: Emergency;
  patient: PatientProfile;
  hospitals: Hospital[];
  ambulances: Ambulance[];
  events: EmergencyEvent[];
  onTriggerReplan: (reason: string) => void;
  onSimulateHospitalDivert: (hospitalId: string) => void;
  onResolveEmergency: () => void;
  onViewOperatorDashboard?: () => void;
}

export const FocusedEmergencyView: React.FC<FocusedEmergencyViewProps> = ({
  emergency,
  patient,
  hospitals,
  ambulances,
  events,
  onTriggerReplan,
  onSimulateHospitalDivert,
  onResolveEmergency,
  onViewOperatorDashboard,
}) => {
  const [showExplainability, setShowExplainability] = useState(false);
  const [showSimulationDrawer, setShowSimulationDrawer] = useState(false);

  const selectedHospital = hospitals.find(
    (h) => h.hospital_id === emergency.selected_hospital_id
  ) || hospitals[0];

  const assignedAmbulance = ambulances.find(
    (a) => a.ambulance_id === emergency.ambulance_id
  ) || ambulances[0];

  // Timeline events built from real emergency events
  const timelineMilestones = [
    {
      time: '00:00',
      label: 'Emergency Detected',
      desc: `${emergency.emergency_type.replace(/_/g, ' ')} detected in Bengaluru. Autonomous coordination initialized.`,
      status: 'DONE',
    },
    {
      time: '00:01',
      label: 'Medical Context Analyzed',
      desc: `Patient ${patient.name} (${patient.blood_group}, allergies: ${patient.allergies.join(', ') || 'None'}) verified.`,
      status: 'DONE',
    },
    {
      time: '00:02',
      label: 'Hospital & Ambulance Matched',
      desc: `${selectedHospital?.name || 'Trauma Center'} selected. ${assignedAmbulance?.unit_code || 'ALS-01'} dispatched.`,
      status: 'DONE',
    },
    {
      time: '00:03',
      label: 'Family & Responders Notified',
      desc: `Automated alert sent to ${patient.emergency_contacts[0]?.name || 'Family'} with live tracking link.`,
      status: 'DONE',
    },
    ...(emergency.re_planned ? [{
      time: '00:04',
      label: 'Autonomous Re-Plan Triggered',
      desc: emergency.re_plan_reason || 'Rerouted to alternate Level 1 facility due to updated telemetry.',
      status: 'DONE',
    }] : []),
    {
      time: 'ETA 5m',
      label: 'Hospital Trauma Team Ready',
      desc: `${selectedHospital?.name} ER intake team briefed. Trauma bay reserved.`,
      status: emergency.status === 'RESOLVED' ? 'DONE' : 'IN_PROGRESS',
    },
  ];

  return (
    <div id="focused-emergency-container" className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Re-plan Banner if rerouted */}
      {emergency.re_planned && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold flex items-center gap-2">
                Response Plan Dynamically Updated
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-md">
                  Autonomous Re-route
                </span>
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                {emergency.re_plan_reason || 'Previous facility encountered capacity divert. LifeLink autonomously rerouted ambulance to nearest optimal Level 1 Trauma Center.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowExplainability(true)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 hover:bg-amber-50 transition-all shrink-0"
          >
            Why was this changed?
          </button>
        </motion.div>
      )}

      {/* WE'RE ON IT - Hero Status Bar */}
      <div 
        id="hero-were-on-it"
        className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              Live Medical Emergency Coordination Active
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              We're on it. Help is en route.
            </h1>

            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Autonomous agents have secured <strong className="text-white">{selectedHospital?.name}</strong>, dispatched <strong className="text-white">{assignedAmbulance?.unit_code}</strong>, and notified emergency contacts with live status updates.
            </p>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Ambulance ETA</p>
              <p className="text-2xl font-black text-rose-400 mt-1">
                {assignedAmbulance?.eta_to_patient_minutes || 5} min
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{assignedAmbulance?.unit_code}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Hospital ETA</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {selectedHospital?.eta_minutes || 8} min
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Trauma Bay Ready</p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center flex flex-col justify-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Family Status</p>
              <p className="text-sm font-bold text-blue-300 mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                Alerted & Tracking
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{patient.emergency_contacts[0]?.name}</p>
            </div>
          </div>
        </div>

        {/* Live Multi-Stage Progress Ribbon */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { step: '1', title: 'Incident Ingested', sub: 'Location & vitals locked', done: true },
            { step: '2', title: 'Ambulance En Route', sub: `${assignedAmbulance?.unit_code}`, done: true },
            { step: '3', title: 'Hospital Coordinated', sub: `${selectedHospital?.name.split(' ')[0]}`, done: true },
            { step: '4', title: 'Trauma Handoff', sub: 'ER bay prepared', done: emergency.status === 'RESOLVED' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center gap-3 ${
                item.done
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  item.done ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {item.done ? <CheckCircle2 className="w-4 h-4" /> : item.step}
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-white truncate">{item.title}</p>
                <p className="text-[11px] text-slate-400 truncate">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Voice Call to Emergency Contacts Widget */}
      <EmergencyVoiceCallLive
        emergency={emergency}
        patient={patient}
      />

      {/* Main Grid: Live Map + Human Timeline & Explainability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Geospatial Map */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            id="emergency-map-card"
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-rose-600" />
                  Live Real-Time Dispatch Route
                </h3>
                <p className="text-xs text-slate-500">
                  Google Maps Platform Code Assist Dynamic Routing • Avoiding Koramangala traffic bottlenecks
                </p>
              </div>

              {/* Explainability Button */}
              <button
                id="btn-open-explainability-modal"
                onClick={() => setShowExplainability(true)}
                className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs flex items-center gap-2 shadow-2xs transition-all"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Why did LifeLink choose this hospital?
              </button>
            </div>

            {/* Map Container */}
            <div className="h-[440px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
              <GeospatialMap
                emergency={emergency}
                hospitals={hospitals}
                ambulances={ambulances}
                selectedHospitalId={emergency.selected_hospital_id}
                onSelectHospital={() => {}}
              />
            </div>

            {/* Destination Highlight & Quick Actions */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedHospital?.name}</h4>
                  <p className="text-xs text-slate-500">
                    {selectedHospital?.address} • {selectedHospital?.trauma_capability} • 0m Wait Time
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`tel:${selectedHospital?.contact_phone || '+918025024444'}`}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Call ER Desk
                </a>

                <button
                  id="btn-open-sim-drawer"
                  onClick={() => setShowSimulationDrawer(!showSimulationDrawer)}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Test Re-Route Event
                </button>
              </div>
            </div>

            {/* Simulation Drawer for Test Scenarios */}
            <AnimatePresence>
              {showSimulationDrawer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Simulate Real-Time Incident Divert / Re-planning
                    </h5>
                    <button
                      onClick={() => setShowSimulationDrawer(false)}
                      className="text-xs text-amber-700 dark:text-amber-300 font-bold hover:underline"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                    Test LifeLink's autonomous re-planning agent. Simulating a code black divert or major road blockage will trigger continuous monitoring agents to recalculate the optimal route in &lt;400ms.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      id="btn-sim-code-black"
                      onClick={() => {
                        if (selectedHospital) {
                          onSimulateHospitalDivert(selectedHospital.hospital_id);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-2xs"
                    >
                      Trigger Code Black Divert at {selectedHospital?.name.split(' ')[0]}
                    </button>

                    <button
                      id="btn-sim-traffic-replan"
                      onClick={() => {
                        onTriggerReplan('Severe traffic congestion spike on Primary Arterial Road (+18m delay). Recalculating route.');
                      }}
                      className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-2xs"
                    >
                      Trigger Road Blockage & Re-Route
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Col: Calm Human Timeline & Patient Summary */}
        <div className="space-y-6">
          {/* Plain Language Human Timeline */}
          <div 
            id="calm-human-timeline"
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Coordination Timeline
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Real-time Stream</span>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {timelineMilestones.map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-3 pl-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-bold ${
                      item.status === 'DONE'
                        ? 'bg-emerald-600 text-white ring-4 ring-white dark:ring-slate-900'
                        : 'bg-amber-500 text-white ring-4 ring-white dark:ring-slate-900 animate-pulse'
                    }`}
                  >
                    {item.status === 'DONE' ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  <div className="space-y-0.5 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                      <span className="text-[10px] font-mono text-slate-400">+{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainability Callout Card */}
          <div 
            id="explainability-callout"
            className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border border-indigo-500/30 shadow-lg space-y-3"
          >
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Explainable AI Intelligence
            </div>

            <h4 className="text-base font-bold text-white">
              Why was {selectedHospital?.name.split(' ')[0]} recommended?
            </h4>

            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Based on patient history ({patient.blood_group}, allergies, {emergency.emergency_type.replace(/_/g, ' ')}), LifeLink selected the closest <strong>Level 1 Trauma Center</strong> with zero ER wait time and direct Cath Lab capacity.
            </p>

            <button
              id="btn-inspect-full-reasoning"
              onClick={() => setShowExplainability(true)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Eye className="w-4 h-4" />
              Inspect Decision Data & Rejected Alternatives
            </button>
          </div>

          {/* Operator Mode Toggle */}
          {onViewOperatorDashboard && (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-white">Under the Hood</p>
                <p className="text-slate-500">View Multi-Agent logs & Pub/Sub bus</p>
              </div>
              <button
                id="btn-goto-operator-view"
                onClick={onViewOperatorDashboard}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                Agent Workflow
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Explainability ("Why did LifeLink choose this?") */}
      <AnimatePresence>
        {showExplainability && (
          <div 
            id="modal-explainability"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recommendation Explanation</h3>
                    <p className="text-xs text-slate-500">Autonomous Decision Architecture & Rationale</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowExplainability(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Recommended Hospital Card */}
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    Recommended Choice • 98.4% Match Score
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    ETA: {selectedHospital?.eta_minutes} min
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedHospital?.name}
                </h4>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Trauma Capability:</strong> Level 1 Trauma Center with 24x7 surgical readiness matches the severity profile of {emergency.emergency_type.replace(/_/g, ' ')}.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>ER Capacity:</strong> {selectedHospital?.er_beds_available} ER beds and {selectedHospital?.icu_beds_available} ICU beds currently open with 0 wait time.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Dynamic Route:</strong> Google Maps Platform routing avoided severe peak congestion on Koramangala Inner Ring Road, saving an estimated 11 minutes.</span>
                  </p>
                </div>
              </div>

              {/* Alternatives Considered and Rejected */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Alternative Hospitals Evaluated & Rejected
                </h4>

                <div className="space-y-2">
                  {hospitals
                    .filter((h) => h.hospital_id !== selectedHospital?.hospital_id)
                    .slice(0, 3)
                    .map((alt) => (
                      <div
                        key={alt.hospital_id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{alt.name}</p>
                          <p className="text-slate-500 mt-0.5">
                            {alt.hospital_id === 'HOSP-BLR-05' 
                              ? 'Rejected: Elevated surge divert status and 14 min estimated triage backlog.'
                              : alt.distance_km > 8 
                              ? `Rejected: +${Math.round(alt.eta_minutes - (selectedHospital?.eta_minutes || 0))} min transit delay exceeds golden hour survival threshold.`
                              : 'Rejected: Lower composite capability score compared to primary trauma recommendation.'}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold text-[10px] shrink-0">
                          Not Optimal
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Correlated Data Points */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">Correlated Real-Time Data Sources:</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                    Google Maps Platform Traffic Flow
                  </span>
                  <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                    BigQuery Hospital ER Capacity Telemetry
                  </span>
                  <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                    Patient Allergy & Medication Context
                  </span>
                  <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                    Pub/Sub Ambulance Telemetry
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowExplainability(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-md"
                >
                  Close Explanation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
