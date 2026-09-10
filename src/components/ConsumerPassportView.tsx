import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Heart, 
  AlertTriangle, 
  Pill, 
  Phone, 
  Lock, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Send, 
  UserCheck, 
  Sliders, 
  FileText, 
  Info,
  Clock,
  MapPin,
  ExternalLink,
  Shield,
  Activity,
  Zap,
  Play,
  ArrowRight,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientProfile, EmergencyType, PrivacyShareLevel } from '../types';

interface ConsumerPassportViewProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: PatientProfile) => void;
  onTriggerEmergency: (type: EmergencyType, description: string) => void;
  onViewLiveEmergency?: () => void;
  onLaunchSimulation?: () => void;
  onOpenPreferences?: () => void;
  hasActiveEmergency: boolean;
}

export const ConsumerPassportView: React.FC<ConsumerPassportViewProps> = ({
  patient,
  onUpdatePatient,
  onTriggerEmergency,
  onViewLiveEmergency,
  onLaunchSimulation,
  onOpenPreferences,
  hasActiveEmergency,
}) => {
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<EmergencyType>('ROAD_ACCIDENT');
  const [customEmergencyText, setCustomEmergencyText] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);
  const [testedContactId, setTestedContactId] = useState<string | null>(null);
  const [callStatusMessage, setCallStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'PROFILE' | 'PRIVACY'>('HOME');

  const emergencyScenarios: { type: EmergencyType; label: string; desc: string; icon: string }[] = [
    {
      type: 'ROAD_ACCIDENT',
      label: 'Vehicular Accident',
      desc: 'High velocity collision, potential polytrauma & vehicle entrapment',
      icon: '🚗',
    },
    {
      type: 'CARDIAC_ARREST',
      label: 'Cardiac Event / Chest Pain',
      desc: 'Severe chest tightness radiating to arm, shortness of breath',
      icon: '❤️',
    },
    {
      type: 'STROKE_SYMPTOMS',
      label: 'Acute Stroke Symptoms',
      desc: 'Facial droop, arm weakness, speech difficulty (FAST protocol)',
      icon: '🧠',
    },
    {
      type: 'ELDERLY_FALL',
      label: 'Elderly Fall with Injury',
      desc: 'Ground level fall with suspected hip fracture & immobility',
      icon: '🩹',
    },
    {
      type: 'ANAPHYLAXIS',
      label: 'Severe Anaphylaxis',
      desc: 'Acute allergic reaction, airway constriction & stridor',
      icon: '⚠️',
    },
  ];

  const handleTestContact = async (contact: typeof patient.emergency_contacts[0]) => {
    setTestedContactId(contact.contact_id);
    setCallStatusMessage(`Connecting automated voice verification call to ${contact.phone}...`);

    try {
      const response = await fetch('/api/telephony/trigger-voice-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_phone: contact.phone,
          contact_name: contact.name,
          patient_name: patient.name,
          incident_type: 'VERIFICATION_TEST',
          location_hint: 'Indiranagar 100ft Road',
          hospital_name: 'Manipal Hospital (Trauma Center)',
          ambulance_code: 'ALS-01',
          voice_script: `Hello ${contact.name}. This is a live verification call from LifeLink Emergency Operations for ${patient.name}. Emergency telemetry and automated voice dispatch is operational.`,
        }),
      });

      const data = await response.json();
      if (data?.call?.callSid) {
        setCallStatusMessage(`📞 Phone call placed via Twilio! SID: ${data.call.callSid}. Phone is ringing.`);
      }
    } catch (e: any) {
      console.error('Telephony trigger error:', e);
      setCallStatusMessage('Voice call request processed.');
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(
        `LifeLink Emergency Call connecting to ${contact.name} at ${contact.phone}. Outbound telephony active.`
      );
      window.speechSynthesis.speak(msg);
    }

    setTimeout(() => {
      setTestedContactId(null);
      setTimeout(() => setCallStatusMessage(null), 5000);
    }, 4000);
  };

  const executeEmergencyTrigger = () => {
    setIsTriggering(true);
    const desc = customEmergencyText || emergencyScenarios.find(s => s.type === selectedEmergencyType)?.desc || 'Emergency assistance requested.';
    onTriggerEmergency(selectedEmergencyType, desc);
  };

  const handlePermissionChange = (field: keyof typeof patient.data_sharing_permissions, value: PrivacyShareLevel) => {
    const updated: PatientProfile = {
      ...patient,
      data_sharing_permissions: {
        ...patient.data_sharing_permissions,
        [field]: value,
      },
    };
    onUpdatePatient(updated);
  };

  return (
    <div id="consumer-home-container" className="max-w-6xl mx-auto space-y-8 pb-16 text-white">
      {/* 1. HERO EMERGENCY ACTIVATION CARD (Trigger within 2s) */}
      <div 
        id="hero-emergency-protection-banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl"
      >
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Intro Column */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              LifeLink is Ready • You&apos;re Protected
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              LifeLink can coordinate help when you can&apos;t.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              If an emergency happens, LifeLink instantly analyzes medical context, secures the optimal hospital, dispatches an ambulance, and alerts your family with live tracking.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Blood Type: <strong className="text-white">{patient.blood_group}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Contacts: <strong className="text-white">{patient.emergency_contacts.length} Connected</strong>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Readiness: <strong className="text-emerald-400">{patient.readiness_score}%</strong>
              </span>
            </div>
          </div>

          {/* Right Hero Emergency Action Button Column */}
          <div className="flex flex-col items-center justify-center min-w-[280px] sm:min-w-[340px] space-y-3">
            {hasActiveEmergency && onViewLiveEmergency ? (
              <button
                id="btn-goto-active-emergency"
                onClick={onViewLiveEmergency}
                className="w-full py-6 px-8 rounded-3xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-lg shadow-2xl shadow-rose-600/50 ring-4 ring-rose-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 animate-pulse cursor-pointer"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white" />
                <span>ACTIVE EMERGENCY IN PROGRESS</span>
                <ChevronRight className="w-6 h-6" />
              </button>
            ) : (
              <button
                id="btn-dominant-emergency-trigger"
                onClick={executeEmergencyTrigger}
                disabled={isTriggering}
                className="w-full py-6 px-8 rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-xl tracking-wider uppercase shadow-2xl shadow-rose-600/40 ring-4 ring-rose-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3.5 cursor-pointer disabled:opacity-50"
              >
                <ShieldAlert className="w-7 h-7 animate-bounce" />
                <span>{isTriggering ? 'Coordinating Help...' : 'I NEED HELP'}</span>
              </button>
            )}

            <p className="text-xs text-center text-slate-400 max-w-xs leading-relaxed">
              LifeLink will autonomously coordinate emergency care and notify your trusted contacts.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Secondary Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Test LifeLink Simulation */}
        <div 
          onClick={onLaunchSimulation}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
              Demo Mode
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
              Test LifeLink Simulation
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Simulate an emergency response without contacting real emergency services.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 pt-1">
            <span>Run 8-Step Walkthrough</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Emergency Contacts */}
        <div 
          onClick={() => setActiveTab('PROFILE')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              {patient.emergency_contacts.length} Connected
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Emergency Contacts
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Primary: {patient.emergency_contacts[0]?.name} ({patient.emergency_contacts[0]?.relationship})
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 pt-1">
            <span>Test Voice Dispatch</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Emergency Preferences */}
        <div 
          onClick={onOpenPreferences}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              Autonomy
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
              Emergency Preferences
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Decide what LifeLink can do automatically on your behalf.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-blue-400 pt-1">
            <span>Manage Permissions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Medical Passport Summary */}
        <div 
          onClick={() => setActiveTab('PROFILE')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition cursor-pointer group shadow-lg flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
              {patient.blood_group} Vault
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              Medical Passport
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Allergies: {patient.allergies.join(', ') || 'None'} • {patient.medications.length} Prescriptions
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-purple-400 pt-1">
            <span>View Medical Profile</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. Sub-View Navigation Tabs (Quick Assistance, Medical Profile, Privacy) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('HOME')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'HOME'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🚨 Select Emergency Scenario
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'PROFILE'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🪪 Medical Profile & Contacts
        </button>

        <button
          onClick={() => setActiveTab('PRIVACY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'PRIVACY'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🔒 Privacy & Data Sharing
        </button>
      </div>

      {/* 4. TAB 1: EMERGENCY SCENARIO QUICK-SELECT */}
      {activeTab === 'HOME' && (
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Select Specific Emergency Scenario
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose an incident type to simulate or trigger immediate multi-agent orchestration.
              </p>
            </div>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {emergencyScenarios.map((sc) => {
              const isSelected = selectedEmergencyType === sc.type;
              return (
                <div
                  key={sc.type}
                  id={`scenario-card-${sc.type}`}
                  onClick={() => setSelectedEmergencyType(sc.type)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all space-y-2 ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30 text-white'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{sc.icon}</span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider">
                        Selected
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{sc.label}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{sc.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Optional context */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Optional Incident Notes (Location or Situation)
            </label>
            <input
              type="text"
              value={customEmergencyText}
              onChange={(e) => setCustomEmergencyText(e.target.value)}
              placeholder="e.g. Patient near 100ft road Indiranagar, vehicle collision with airbag deployment..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Trigger Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              <span>Patient: <strong className="text-white">{patient.name}</strong> • GPS: <strong className="text-white">Bengaluru (12.9716, 77.6412)</strong></span>
            </div>

            <button
              onClick={executeEmergencyTrigger}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Trigger Multi-Agent Coordination</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. TAB 2: MEDICAL PROFILE & CONTACTS */}
      {activeTab === 'PROFILE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medical Passport Card (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-700/60 flex items-center justify-center text-indigo-300 font-bold text-lg">
                    {patient.blood_group}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {patient.name}
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                        {patient.age} yrs • {patient.gender}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {patient.patient_id} • BigQuery Encrypted</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 text-emerald-300 text-xs font-semibold border border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Pre-Consented
                </span>
              </div>

              {/* Grid of Medical Facts with Explanations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Allergies */}
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Critical Allergies
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {patient.allergies.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-200 text-xs font-semibold border border-amber-800/80">
                        {a}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Transmitted to paramedics before administering antibiotics or anesthesia.
                  </p>
                </div>

                {/* Medications */}
                <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
                    <Pill className="w-4 h-4 text-blue-400" />
                    Current Prescriptions
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {patient.medications.map((m, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 text-blue-200 text-xs font-semibold border border-blue-800/80">
                        {m}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Alerts trauma surgeons against adverse drug interactions or anticoagulants.
                  </p>
                </div>

                {/* Relevant Conditions */}
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                    <Heart className="w-4 h-4 text-purple-400" />
                    Medical Conditions
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {patient.relevant_conditions.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 text-purple-200 text-xs font-semibold border border-purple-800/80">
                        {c}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Helps the hospital intelligence agent match specialized stroke or cardiac centers.
                  </p>
                </div>

                {/* Insurance & Physician */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Insurance & Care Team
                  </div>
                  <p className="text-white font-semibold pt-1">{patient.insurance_provider}</p>
                  <p className="text-slate-400 font-mono text-[11px]">Policy: {patient.insurance_id}</p>
                  <p className="text-slate-400 text-[11px]">Doctor: {patient.primary_physician}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Emergency Contacts with Voice Test (1 col) */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  Emergency Contacts
                </h3>
                <span className="text-xs text-slate-400">{patient.emergency_contacts.length} Connected</span>
              </div>

              {callStatusMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {callStatusMessage}
                </div>
              )}

              <div className="space-y-3">
                {patient.emergency_contacts.map((contact) => (
                  <div
                    key={contact.contact_id}
                    className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          {contact.name}
                          {contact.is_primary && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800">
                              Primary
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400">{contact.relationship} • {contact.phone}</p>
                      </div>

                      <button
                        onClick={() => handleTestContact(contact)}
                        disabled={testedContactId === contact.contact_id}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 border border-slate-700 flex items-center gap-1.5 transition"
                      >
                        {testedContactId === contact.contact_id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Calling...</span>
                          </>
                        ) : (
                          <>
                            <Radio className="w-3 h-3 text-emerald-400" />
                            <span>Test Call</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                During an emergency, LifeLink automatically dials primary contacts and sends an authenticated live tracking link.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: PRIVACY & DATA SHARING */}
      {activeTab === 'PRIVACY' && (
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              Granular Emergency Privacy Controls
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              You own your medical data. Choose what information is shared with paramedics and ER trauma physicians during an emergency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: 'critical_allergies' as const,
                title: 'Critical Drug Allergies',
                desc: 'Needed by paramedics before administering penicillin, anesthesia, or contrast dyes.',
                current: patient.data_sharing_permissions.critical_allergies,
              },
              {
                key: 'current_medications' as const,
                title: 'Active Prescriptions & Blood Thinners',
                desc: 'Vital for trauma surgeons to prepare for anticoagulated hemorrhage.',
                current: patient.data_sharing_permissions.current_medications,
              },
              {
                key: 'medical_history' as const,
                title: 'Past Conditions & Surgical History',
                desc: 'Helps matching agent choose appropriate specialty center (Stroke, Cardiac, Trauma).',
                current: patient.data_sharing_permissions.medical_history,
              },
              {
                key: 'location_tracking' as const,
                title: 'Real-Time Emergency Geolocation',
                desc: 'Transmits exact coordinate breadcrumbs strictly to responding ambulance and hospital.',
                current: patient.data_sharing_permissions.location_tracking,
              },
            ].map((item) => (
              <div
                key={item.key}
                className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>

                <div className="flex items-center gap-2">
                  {(['ALLOWED', 'ASK_FIRST', 'REQUIRE_EXPLICIT_APPROVAL'] as PrivacyShareLevel[]).map((level) => {
                    const isSelected = item.current === level;
                    const labels = {
                      ALLOWED: 'Always Share',
                      ASK_FIRST: 'Ask First',
                      REQUIRE_EXPLICIT_APPROVAL: 'Strict Approval',
                    };
                    return (
                      <button
                        key={level}
                        onClick={() => handlePermissionChange(item.key, level)}
                        className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-xl transition border ${
                          isSelected
                            ? level === 'ALLOWED'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : level === 'ASK_FIRST'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-slate-700 text-white border-slate-600 shadow-xs'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {labels[level]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
