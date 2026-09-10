import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  MapPin, 
  Building2, 
  Radio, 
  Phone, 
  Navigation, 
  Activity, 
  Cpu, 
  ArrowRight,
  Zap,
  ShieldCheck,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Emergency, Hospital, Ambulance, PatientProfile, EmergencyType } from '../types';
import { HowLifeLinkHelpedModal } from './HowLifeLinkHelpedModal';

interface SimulationRunnerViewProps {
  patient: PatientProfile;
  hospitals: Hospital[];
  ambulances: Ambulance[];
  onLaunchFullEmergency: (type: EmergencyType, desc: string) => void;
  onViewArchitecture: () => void;
}

interface SimulationStep {
  id: number;
  title: string;
  subtitle: string;
  agent: string;
  agentModel: string;
  icon: any;
  color: string;
  badge: string;
  details: string[];
  metrics: { label: string; value: string }[];
  visualNarrative: string;
}

export const SimulationRunnerView: React.FC<SimulationRunnerViewProps> = ({
  patient,
  hospitals,
  ambulances,
  onLaunchFullEmergency,
  onViewArchitecture,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const [selectedScenario, setSelectedScenario] = useState<EmergencyType>('ROAD_ACCIDENT');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const selectedHospital = hospitals[0] || {
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

  const assignedAmbulance = ambulances[0] || {
    ambulance_id: 'AMB-01',
    unit_code: 'ALS-PARAMEDIC-01',
    vehicle_type: 'ADVANCED_LIFE_SUPPORT',
    status: 'DISPATCHED',
    eta_to_patient_minutes: 5,
    assigned_paramedic: 'Dr. Vikrant Rao',
  };

  const simulationSteps: SimulationStep[] = [
    {
      id: 1,
      title: 'Emergency Triggered',
      subtitle: 'Incident ingested via voice, phone crash detection, or 1-tap SOS',
      agent: 'Coordinator Agent',
      agentModel: 'Google ADK + Gemini 3.7 Flash',
      icon: ShieldAlert,
      color: 'from-rose-600 to-red-600',
      badge: 'Step 1 of 8',
      details: [
        'Crash sensor telemetry and voice signal ingested from Bengaluru corridor (12.9716, 77.6412).',
        'LifeLink autonomous coordinator initializes multi-agent workflow instantly.',
        'Initial severity classified as CRITICAL / POLYTRAUMA in 320ms.',
      ],
      metrics: [
        { label: 'Triage Latency', value: '320ms' },
        { label: 'Confidence Score', value: '99.2%' },
        { label: 'Protocol', value: 'ADK Core' },
      ],
      visualNarrative: 'Understanding emergency... LifeLink verifies signal validity and starts parallel coordination.',
    },
    {
      id: 2,
      title: 'Medical Passport Context Locked',
      subtitle: 'Patient blood group, allergies, medications, and consent preferences extracted',
      agent: 'Medical Context Agent',
      agentModel: 'BigQuery / HIPAA Enclave',
      icon: ShieldCheck,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Step 2 of 8',
      details: [
        `Patient verified: ${patient.name} (${patient.age}y, ${patient.gender}).`,
        `Blood Group: ${patient.blood_group} • Insurance: ${patient.insurance_provider}.`,
        `Critical Allergies flagged: ${patient.allergies.join(', ') || 'None reported'}.`,
        'Active medications extracted to alert trauma surgeons against contraindications.',
      ],
      metrics: [
        { label: 'Vault Query', value: '42ms' },
        { label: 'Allergy Flags', value: `${patient.allergies.length} Active` },
        { label: 'Privacy Protocol', value: 'Pre-Consented' },
      ],
      visualNarrative: 'Accessing emergency profile... Critical allergies and blood type prepared for paramedics.',
    },
    {
      id: 3,
      title: 'Nearby Hospital Discovery',
      subtitle: 'Real-time telemetry scan across 4 regional medical centers',
      agent: 'Hospital Intelligence Agent',
      agentModel: 'Vector Capacity Matrix',
      icon: Building2,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Step 3 of 8',
      details: [
        'Scanned Manipal Hospital, Apollo Hospital, St. Johns Medical, and Aster CMI.',
        'Queried real-time ER bed occupancy, ICU capacity, and surgical team readiness.',
        'Filtered out facilities with active diversion alerts or saturated trauma bays.',
      ],
      metrics: [
        { label: 'Facilities Screened', value: '4 Centers' },
        { label: 'Data Sync', value: 'Live BigQuery DW' },
        { label: 'Surge Filter', value: 'Active' },
      ],
      visualNarrative: 'Finding nearby emergency care... Evaluating trauma capability and bed availability.',
    },
    {
      id: 4,
      title: 'Optimal Hospital Selection',
      subtitle: 'Multi-criteria optimization matching patient injury to trauma capability',
      agent: 'Hospital Intelligence Agent',
      agentModel: 'Gemini Multi-Attribute Ranker',
      icon: CheckCircle2,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Step 4 of 8',
      details: [
        `Selected ${selectedHospital.name} (Match Score: 98.4%).`,
        `Distance: ${selectedHospital.distance_km} km • ETA: ${selectedHospital.eta_minutes} mins.`,
        'Reasoning: Dedicated Level 1 Trauma Center with Cath Lab ready and 0m ER wait time.',
        'Alternative facilities deprioritized due to longer transit times or secondary triage.',
      ],
      metrics: [
        { label: 'Selected Facility', value: selectedHospital.name.split(' ')[0] },
        { label: 'ER Beds Open', value: `${selectedHospital.er_beds_available} Beds` },
        { label: 'Match Confidence', value: '98.4%' },
      ],
      visualNarrative: `Selected ${selectedHospital.name} because it is ${selectedHospital.distance_km} km away and has immediate trauma capacity.`,
    },
    {
      id: 5,
      title: 'Emergency Contact Alert & Telephony',
      subtitle: 'Next-of-kin automated voice call placed with authenticated tracking URL',
      agent: 'Communication & Voice Agent',
      agentModel: 'Twilio Cloud Voice API + Pub/Sub',
      icon: Phone,
      color: 'from-amber-600 to-orange-600',
      badge: 'Step 5 of 8',
      details: [
        `Primary contact alerted: ${patient.emergency_contacts[0]?.name} (${patient.emergency_contacts[0]?.phone}).`,
        'Automated clear voice status delivered: Incident location, assigned hospital, and ambulance unit.',
        'Secure one-click tracking URL sent via SMS with real-time map sync.',
      ],
      metrics: [
        { label: 'Call Status', value: 'Connected' },
        { label: 'Contacts Reached', value: '2 of 2' },
        { label: 'Tracking URL', value: 'Authenticated' },
      ],
      visualNarrative: 'Notifying your trusted contacts... Family alerted with live status and emergency tracking.',
    },
    {
      id: 6,
      title: 'Ambulance Dispatch & Vitals Link',
      subtitle: 'Nearest Advanced Life Support (ALS) vehicle assigned to incident',
      agent: 'Response & Dispatch Agent',
      agentModel: 'Fleet IoT Dispatcher',
      icon: Radio,
      color: 'from-rose-600 to-pink-600',
      badge: 'Step 6 of 8',
      details: [
        `Dispatched ${assignedAmbulance.unit_code} from Indiranagar base.`,
        `Ambulance ETA to patient: ${assignedAmbulance.eta_to_patient_minutes} minutes.`,
        'Transmitted pre-arrival clinical packet directly to paramedic mobile terminal.',
      ],
      metrics: [
        { label: 'Unit Code', value: assignedAmbulance.unit_code },
        { label: 'Ambulance ETA', value: `${assignedAmbulance.eta_to_patient_minutes} min` },
        { label: 'Telemetry Link', value: 'Bi-directional' },
      ],
      visualNarrative: `Ambulance ${assignedAmbulance.unit_code} dispatched and en route to patient coordinates.`,
    },
    {
      id: 7,
      title: 'Dynamic Traffic Navigation Corridor',
      subtitle: 'Real-time transit planning avoiding peak arterial bottlenecks',
      agent: 'Location & Routing Agent',
      agentModel: 'Google Maps Platform Dynamic Routes',
      icon: Navigation,
      color: 'from-teal-600 to-emerald-600',
      badge: 'Step 7 of 8',
      details: [
        'Calculated fastest route from incident point to Manipal Hospital.',
        'Autonomous route planner avoided severe congestion on 100ft road junction.',
        'Continuous monitoring agent standing by for dynamic re-routing if traffic spikes.',
      ],
      metrics: [
        { label: 'Route Time', value: `${selectedHospital.eta_minutes} mins` },
        { label: 'Traffic Delay Avoided', value: '-11 mins' },
        { label: 'Routing Engine', value: 'Google Maps' },
      ],
      visualNarrative: 'Preparing fastest route... Real-time route locked, saving 11 critical minutes.',
    },
    {
      id: 8,
      title: 'Response Fully Coordinated',
      subtitle: 'All agents completed synchronization in 43 seconds',
      agent: 'Coordinator Agent',
      agentModel: 'Google ADK Autonomous Mesh',
      icon: Sparkles,
      color: 'from-emerald-600 via-teal-600 to-cyan-600',
      badge: 'Step 8 of 8 • Complete',
      details: [
        'All 5 specialized agents achieved autonomous consensus.',
        'ER Trauma Team pre-alerted and trauma bay reserved.',
        'Ambulance en route; family tracking live on their personal device.',
        'Continuous monitoring agent active to respond to telemetry updates or hospital divert.',
      ],
      metrics: [
        { label: 'Total Coordination Time', value: '43 seconds' },
        { label: 'Agents Synced', value: '5 of 5' },
        { label: 'Status', value: 'Protected' },
      ],
      visualNarrative: 'Your emergency response is fully coordinated. Help is on the way.',
    },
  ];

  const currentStep = simulationSteps[currentStepIndex];

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      const intervalMs = playbackSpeed === 1 ? 3000 : 1500;
      timer = setTimeout(() => {
        if (currentStepIndex < simulationSteps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          setIsSummaryOpen(true);
        }
      }, intervalMs);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, playbackSpeed]);

  const handleNext = () => {
    if (currentStepIndex < simulationSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsSummaryOpen(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  return (
    <div id="simulation-runner-container" className="max-w-6xl mx-auto space-y-8 pb-16 text-white">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Competition Demo & Simulation Lab
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Interactive Multi-Agent Simulation
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Experience the complete autonomous LifeLink workflow in simulated real time. Watch how 5 specialized Google ADK agents coordinate hospital matching, dispatch, and loved-one notification without disturbing emergency services.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onLaunchFullEmergency(selectedScenario, 'Hero emergency simulation launched.')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              Launch Live Tracker
            </button>

            <button
              onClick={onViewArchitecture}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              Inside Architecture
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Step Progression Ribbon */}
      <div className="bg-slate-900/80 rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Autonomous Coordination Flow (8 Stages)
          </h3>
          <span className="text-xs font-mono text-indigo-400 font-bold">
            Stage {currentStepIndex + 1} of 8
          </span>
        </div>

        {/* Step Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {simulationSteps.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={step.id}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex(idx);
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold">0{step.id}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  ) : null}
                </div>
                <p className="text-xs font-bold truncate">{step.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Hero Stage Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stage Card (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden"
            >
              {/* Agent Badge & Stage Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentStep.color} flex items-center justify-center shadow-lg shadow-indigo-600/20`}>
                    <currentStep.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                      {currentStep.badge}
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">{currentStep.title}</h2>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-slate-800/60 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                  <p className="text-xs text-slate-400">Active AI Agent</p>
                  <p className="text-sm font-bold text-indigo-300">{currentStep.agent}</p>
                  <p className="text-[10px] font-mono text-slate-500">{currentStep.agentModel}</p>
                </div>
              </div>

              {/* Human-Centered Narrative Callout */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-800/80 to-indigo-950/50 border border-slate-700/70 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">What LifeLink is doing</p>
                <p className="text-base font-bold text-white leading-snug">
                  &ldquo;{currentStep.visualNarrative}&rdquo;
                </p>
              </div>

              {/* Step Execution Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Autonomous Subtasks Completed
                </h4>
                <div className="space-y-2">
                  {currentStep.details.map((detail, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-3 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-slate-200 leading-relaxed">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics Cluster */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                {currentStep.metrics.map((metric, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-center">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{metric.label}</p>
                    <p className="text-sm sm:text-base font-bold text-white mt-0.5">{metric.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Simulation Playback Controls */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-2">
              <button
                id="btn-sim-play-pause"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause Auto-Play' : 'Start Auto-Play'}</span>
              </button>

              <button
                id="btn-sim-reset"
                onClick={handleReset}
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Reset to Stage 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs font-bold">
                <button
                  onClick={() => setPlaybackSpeed(1)}
                  className={`px-2.5 py-1 rounded-lg ${playbackSpeed === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  1x
                </button>
                <button
                  onClick={() => setPlaybackSpeed(2)}
                  className={`px-2.5 py-1 rounded-lg ${playbackSpeed === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  2x
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-sim-prev"
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs disabled:opacity-40 transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                id="btn-sim-next"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
              >
                {currentStepIndex === simulationSteps.length - 1 ? 'View Summary' : 'Next Stage'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Scenario Selection & Live Inspector (1 col) */}
        <div className="space-y-6">
          {/* Quick Scenario Selector */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Simulation Incident Preset
            </h3>

            <div className="space-y-2">
              {[
                { type: 'ROAD_ACCIDENT' as EmergencyType, name: 'Vehicular Accident (Polytrauma)', icon: '🚗' },
                { type: 'CARDIAC_ARREST' as EmergencyType, name: 'Cardiac Event / Stemi', icon: '❤️' },
                { type: 'STROKE_SYMPTOMS' as EmergencyType, name: 'Acute Stroke (FAST Protocol)', icon: '🧠' },
                { type: 'ELDERLY_FALL' as EmergencyType, name: 'Elderly Fall with Hip Fracture', icon: '🩹' },
              ].map((sc) => {
                const isSelected = selectedScenario === sc.type;
                return (
                  <button
                    key={sc.type}
                    onClick={() => setSelectedScenario(sc.type)}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{sc.icon}</span>
                      <span className="font-bold">{sc.name}</span>
                    </div>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Transparency Summary Card */}
          <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 rounded-3xl p-6 border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Transparency Report
            </div>

            <h4 className="text-base font-bold text-white">
              Why Multi-Agent AI Matters in Emergencies
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              In high-stress medical incidents, cognitive overload causes critical delays. LifeLink automates parallel tasks across hospital capacity, routing, and family contact without human latency.
            </p>

            <button
              onClick={() => setIsSummaryOpen(true)}
              className="w-full py-3 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Open &ldquo;How LifeLink Helped&rdquo; Breakdown
            </button>
          </div>

          {/* Real-Time Patient Info Card */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white">Simulated Profile</span>
              <span className="text-emerald-400 font-bold">{patient.blood_group}</span>
            </div>
            <p className="text-slate-300 font-bold">{patient.name} ({patient.age}y)</p>
            <p className="text-slate-400">Allergies: <span className="text-amber-300">{patient.allergies.join(', ') || 'None'}</span></p>
            <p className="text-slate-400">Primary Contact: <span className="text-slate-200">{patient.emergency_contacts[0]?.name}</span></p>
          </div>
        </div>
      </div>

      {/* AI Transparency Summary Modal */}
      <HowLifeLinkHelpedModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        emergency={null}
        patient={patient}
        selectedHospital={selectedHospital}
        assignedAmbulance={assignedAmbulance}
      />
    </div>
  );
};
