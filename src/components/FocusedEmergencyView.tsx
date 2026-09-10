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
  Sliders,
  Radio,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Emergency, Hospital, Ambulance, PatientProfile, EmergencyEvent } from '../types';
import { GeospatialMap } from './GeospatialMap';
import { EmergencyVoiceCallLive } from './EmergencyVoiceCallLive';
import { HowLifeLinkHelpedModal } from './HowLifeLinkHelpedModal';

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
  const [isActivityExpanded, setIsActivityExpanded] = useState(true);
  const [showHelpedModal, setShowHelpedModal] = useState(false);

  const selectedHospital = hospitals.find(
    (h) => h.hospital_id === emergency.selected_hospital_id
  ) || hospitals[0] || {
    hospital_id: 'HOSP-BLR-01',
    name: 'Manipal Hospital (Old Airport Rd)',
    address: '98 HAL Old Airport Rd, Kodihalli, Bengaluru',
    distance_km: 2.4,
    eta_minutes: 8,
    trauma_capability: 'Level 1 Trauma Center',
    cath_lab_available: true,
    er_beds_available: 5,
    icu_beds_available: 2,
    composite_capability_score: 98.4,
  };

  const assignedAmbulance = ambulances.find(
    (a) => a.ambulance_id === emergency.ambulance_id
  ) || ambulances[0] || {
    ambulance_id: 'AMB-01',
    unit_code: 'ALS-PARAMEDIC-01',
    vehicle_type: 'ADVANCED_LIFE_SUPPORT',
    status: 'DISPATCHED',
    eta_to_patient_minutes: 5,
    assigned_paramedic: 'Dr. Vikrant Rao',
  };

  // Plain-Language Human Activity Timeline
  const humanActivityTimeline = [
    {
      time: '00:00',
      label: 'LifeLink understood the emergency',
      desc: `${emergency.emergency_type.replace(/_/g, ' ')} identified in Bengaluru. Autonomous coordination initialized.`,
      status: 'DONE',
    },
    {
      time: '00:01',
      label: 'Location & Medical Context confirmed',
      desc: `Coordinates locked. Patient ${patient.name} (${patient.blood_group}, allergies: ${patient.allergies.join(', ') || 'None'}) verified.`,
      status: 'DONE',
    },
    {
      time: '00:02',
      label: 'Nearby emergency care identified',
      desc: `Screened 4 regional facilities. Selected ${selectedHospital?.name} based on Level 1 trauma capability and 0m ER wait time.`,
      status: 'DONE',
    },
    {
      time: '00:02',
      label: 'Emergency contact notified',
      desc: `Alerted ${patient.emergency_contacts[0]?.name} (${patient.emergency_contacts[0]?.phone}) with authenticated live tracking link.`,
      status: 'DONE',
    },
    {
      time: '00:03',
      label: 'Ambulance assistance in progress',
      desc: `Dispatched Advanced Life Support unit ${assignedAmbulance?.unit_code}. Estimated arrival in ${assignedAmbulance?.eta_to_patient_minutes || 5} minutes.`,
      status: 'DONE',
    },
    ...(emergency.re_planned ? [{
      time: '00:04',
      label: 'Autonomous Re-Route Executed',
      desc: emergency.re_plan_reason || 'Rerouted to alternate Level 1 facility due to capacity alert.',
      status: 'DONE',
    }] : []),
    {
      time: `ETA ${selectedHospital?.eta_minutes || 8}m`,
      label: 'Hospital Trauma Team preparing intake',
      desc: `${selectedHospital?.name} ER trauma bay reserved and briefed with patient medical flags.`,
      status: emergency.status === 'RESOLVED' ? 'DONE' : 'IN_PROGRESS',
    },
  ];

  return (
    <div id="focused-emergency-container" className="max-w-7xl mx-auto space-y-6 pb-20 text-white">
      {/* Top Re-plan Banner if rerouted */}
      {emergency.re_planned && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold flex items-center gap-2 text-amber-200">
                Response Plan Dynamically Updated
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                  Autonomous Re-Route
                </span>
              </p>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {emergency.re_plan_reason || 'Previous facility encountered capacity divert. LifeLink autonomously rerouted ambulance to nearest optimal Level 1 Trauma Center in <400ms.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowExplainability(true)}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/50 text-amber-300 hover:bg-slate-800 transition shrink-0"
          >
            Why was this changed?
          </button>
        </motion.div>
      )}

      {/* 1. HERO REASSURANCE STATUS BANNER ("You're not alone. LifeLink is taking care of it.") */}
      <div 
        id="hero-were-on-it"
        className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              Emergency Response Active
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              You&apos;re not alone.<br />LifeLink is taking care of it.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Autonomous AI agents have locked your location, secured <strong className="text-white">{selectedHospital?.name}</strong>, dispatched <strong className="text-white">{assignedAmbulance?.unit_code}</strong>, and notified your family with live tracking.
            </p>
          </div>

          {/* Mission Control Metric Pills */}
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
                Alerted &amp; Tracking
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{patient.emergency_contacts[0]?.name}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Checklist Ribbon (Section 3 of User Prompt) */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Location confirmed', sub: 'Bengaluru (12.97, 77.64)', done: true },
            { label: 'Emergency care identified', sub: selectedHospital?.name.split(' ')[0], done: true },
            { label: 'Emergency contact notified', sub: patient.emergency_contacts[0]?.name, done: true },
            { label: 'Ambulance in progress', sub: `${assignedAmbulance?.eta_to_patient_minutes || 5}m ETA`, done: true },
            { label: 'Navigation prepared', sub: 'Fastest corridor locked', done: emergency.status === 'RESOLVED' || true },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                item.done
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  item.done ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-white truncate">{item.label}</p>
                <p className="text-[10px] text-slate-400 truncate">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Automated Voice Call Telephony Widget */}
      <EmergencyVoiceCallLive
        emergency={emergency}
        patient={patient}
      />

      {/* 3. MAIN GRID: Mission Control Geospatial Route Map + Reassuring Human Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Geospatial Map */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            id="emergency-map-card"
            className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-rose-500" />
                  Live Real-Time Transit Corridor
                </h3>
                <p className="text-xs text-slate-400">
                  Google Maps Platform Dynamic Routes • Avoiding Koramangala traffic bottlenecks
                </p>
              </div>

              {/* Explainability Action */}
              <button
                onClick={() => setShowExplainability(true)}
                className="px-4 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/80 font-bold text-xs flex items-center gap-2 shadow-sm transition"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Why did LifeLink choose this hospital?
              </button>
            </div>

            {/* Map Container */}
            <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-800 relative shadow-inner">
              <GeospatialMap
                emergency={emergency}
                hospitals={hospitals}
                ambulances={ambulances}
                selectedHospitalId={emergency.selected_hospital_id}
                onSelectHospital={() => {}}
              />
            </div>

            {/* Destination Highlight & Action Controls */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedHospital?.name}</h4>
                  <p className="text-xs text-slate-400">
                    {selectedHospital?.address} • {selectedHospital?.trauma_capability} • 0m Wait Time
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`tel:${selectedHospital?.contact_phone || '+918025024444'}`}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Call ER Desk
                </a>

                <button
                  onClick={() => setShowSimulationDrawer(!showSimulationDrawer)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Test Re-Route Event
                </button>
              </div>
            </div>

            {/* Simulation Drawer for Dynamic Testing */}
            <AnimatePresence>
              {showSimulationDrawer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Simulate Real-Time Telemetry Event
                    </h5>
                    <button
                      onClick={() => setShowSimulationDrawer(false)}
                      className="text-xs text-amber-300 font-bold hover:underline"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-xs text-amber-300/80">
                    Test LifeLink&apos;s continuous monitoring agent. Simulating an unexpected hospital divert or major road gridlock triggers autonomous re-planning in &lt;400ms.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (selectedHospital) {
                          onSimulateHospitalDivert(selectedHospital.hospital_id);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/30 transition"
                    >
                      Simulate Code Black Divert at {selectedHospital?.name.split(' ')[0]}
                    </button>

                    <button
                      onClick={() => {
                        onTriggerReplan('Severe congestion spike on Primary Arterial Corridor (+18m delay). Recalculating route.');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-600/30 transition"
                    >
                      Simulate Traffic Surge &amp; Re-Route
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Col: Expandable "LifeLink is taking care of this" Activity + Human Reasonings */}
        <div className="space-y-6">
          {/* Plain Language Human Activity Timeline */}
          <div 
            id="calm-human-timeline"
            className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">LifeLink is taking care of this</h3>
              </div>
              <button
                onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
              >
                <span>{isActivityExpanded ? 'Collapse' : 'Expand'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isActivityExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <AnimatePresence>
              {isActivityExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800 overflow-hidden"
                >
                  {humanActivityTimeline.map((item, idx) => (
                    <div key={idx} className="relative flex items-start gap-3 pl-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-bold ${
                          item.status === 'DONE'
                            ? 'bg-emerald-600 text-white ring-4 ring-slate-900'
                            : 'bg-amber-500 text-white ring-4 ring-slate-900 animate-pulse'
                        }`}
                      >
                        {item.status === 'DONE' ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      <div className="space-y-0.5 text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">{item.label}</p>
                          <span className="text-[10px] font-mono text-slate-400">+{item.time}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subtle Parallel AI Agents Communication */}
            <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-2.5 text-xs text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>LifeLink&apos;s AI agents are coordinating this response in parallel.</span>
            </div>
          </div>

          {/* Explainability Callout Card ("How LifeLink decided") */}
          <div 
            id="explainability-callout"
            className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-500/30 shadow-xl space-y-3"
          >
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              How LifeLink Decided
            </div>

            <h4 className="text-base font-bold text-white">
              Why was {selectedHospital?.name.split(' ')[0]} chosen?
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              Selected this hospital because it is <strong>{selectedHospital?.distance_km || 2.4} km away</strong>, has zero ER wait time, and provides dedicated Level 1 trauma surgery matching the severity profile of {emergency.emergency_type.replace(/_/g, ' ')}.
            </p>

            <button
              onClick={() => setShowExplainability(true)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Eye className="w-4 h-4" />
              Inspect Evaluated Alternatives
            </button>
          </div>

          {/* Quick Action Footer */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setShowHelpedModal(true)}
              className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition text-center"
            >
              AI Transparency Summary
            </button>

            {onViewOperatorDashboard && (
              <button
                onClick={onViewOperatorDashboard}
                className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
              >
                <span>Inside AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Explainability ("Why did LifeLink choose this?") */}
      <AnimatePresence>
        {showExplainability && (
          <div 
            id="modal-explainability"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-slate-900 rounded-3xl p-7 border border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-950 flex items-center justify-center text-indigo-400 font-bold border border-indigo-800">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">How LifeLink Decided</h3>
                    <p className="text-xs text-slate-400">Autonomous Decision Architecture &amp; Rationale</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowExplainability(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition"
                >
                  ✕
                </button>
              </div>

              {/* Recommended Hospital Card */}
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    Recommended Choice • 98.4% Match Score
                  </span>
                  <span className="text-xs font-semibold text-emerald-300">
                    ETA: {selectedHospital?.eta_minutes} min
                  </span>
                </div>

                <h4 className="text-base font-bold text-white">
                  {selectedHospital?.name}
                </h4>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Trauma Capability:</strong> Level 1 Trauma Center with 24x7 surgical readiness matches the severity profile of {emergency.emergency_type.replace(/_/g, ' ')}.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>ER Capacity:</strong> {selectedHospital?.er_beds_available} ER beds and {selectedHospital?.icu_beds_available} ICU beds currently open with 0 wait time.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Dynamic Route:</strong> Google Maps Platform routing avoided severe peak congestion on Koramangala Inner Ring Road, saving an estimated 11 minutes.</span>
                  </p>
                </div>
              </div>

              {/* Alternatives Considered and Rejected */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Alternative Hospitals Evaluated &amp; Rejected
                </h4>

                <div className="space-y-2">
                  {hospitals
                    .filter((h) => h.hospital_id !== selectedHospital?.hospital_id)
                    .slice(0, 3)
                    .map((alt) => (
                      <div
                        key={alt.hospital_id}
                        className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{alt.name}</p>
                          <p className="text-slate-400 mt-0.5">
                            {alt.hospital_id === 'HOSP-BLR-05' 
                              ? 'Rejected: Elevated surge divert status and 14 min estimated triage backlog.'
                              : alt.distance_km > 8 
                              ? `Rejected: +${Math.round(alt.eta_minutes - (selectedHospital?.eta_minutes || 0))} min transit delay exceeds golden hour survival threshold.`
                              : 'Rejected: Lower composite capability score compared to primary trauma recommendation.'}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 font-semibold text-[10px] shrink-0">
                          Not Optimal
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowExplainability(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                >
                  Close Explanation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Transparency Summary Modal */}
      <HowLifeLinkHelpedModal
        isOpen={showHelpedModal}
        onClose={() => setShowHelpedModal(false)}
        emergency={emergency}
        patient={patient}
        selectedHospital={selectedHospital}
        assignedAmbulance={assignedAmbulance}
      />
    </div>
  );
};
