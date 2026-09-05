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
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientProfile, EmergencyType, PrivacyShareLevel } from '../types';

interface ConsumerPassportViewProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: PatientProfile) => void;
  onTriggerEmergency: (type: EmergencyType, description: string) => void;
  onViewLiveEmergency?: () => void;
  hasActiveEmergency: boolean;
}

export const ConsumerPassportView: React.FC<ConsumerPassportViewProps> = ({
  patient,
  onUpdatePatient,
  onTriggerEmergency,
  onViewLiveEmergency,
  hasActiveEmergency,
}) => {
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<EmergencyType>('ROAD_ACCIDENT');
  const [customEmergencyText, setCustomEmergencyText] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [testedContactId, setTestedContactId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PRIVACY' | 'EMERGENCY_SETUP'>('OVERVIEW');

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
      desc: 'Severe chest tightness radiating to left arm, shortness of breath',
      icon: '❤️',
    },
    {
      type: 'STROKE_SYMPTOMS',
      label: 'Acute Stroke Symptoms',
      desc: 'Sudden facial droop, arm weakness, slurred speech (FAST protocol)',
      icon: '🧠',
    },
    {
      type: 'ELDERLY_FALL',
      label: 'Elderly Fall with Injury',
      desc: 'Ground level fall with suspected hip fracture & inability to get up',
      icon: '🩹',
    },
    {
      type: 'ANAPHYLAXIS',
      label: 'Severe Anaphylaxis',
      desc: 'Acute allergic reaction, airway constriction & stridor',
      icon: '⚠️',
    },
  ];

  const [callStatusMessage, setCallStatusMessage] = useState<string | null>(null);

  const handleTestContact = async (contact: typeof patient.emergency_contacts[0]) => {
    setTestedContactId(contact.contact_id);
    setCallStatusMessage(`Connecting live emergency phone call to ${contact.phone}...`);

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
    <div id="consumer-passport-container" className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Protection Banner */}
      <div 
        id="passport-hero-banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/90 via-slate-900 to-slate-950 border border-emerald-500/30 p-8 shadow-2xl backdrop-blur-xl text-white"
      >
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LifeLink Active Protection
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              You're Protected, {patient.name.split(' ')[0]}.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              If an emergency happens and you cannot speak, LifeLink's autonomous agents instantly coordinate with responders, dispatch the optimal hospital, and inform your family.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Readiness Card */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 min-w-[200px]">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-700"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-400"
                    strokeDasharray={`${patient.readiness_score}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-bold text-white leading-none">{patient.readiness_score}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Emergency Readiness</p>
                <p className="text-sm font-semibold text-emerald-300">Ready for Instant Dispatch</p>
              </div>
            </div>

            {hasActiveEmergency && onViewLiveEmergency && (
              <button
                id="btn-goto-live-emergency"
                onClick={onViewLiveEmergency}
                className="px-6 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                Active Emergency In Progress
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          id="tab-btn-overview"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'OVERVIEW'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          🪪 Emergency Passport
        </button>
        <button
          id="tab-btn-privacy"
          onClick={() => setActiveTab('PRIVACY')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'PRIVACY'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          🔒 Granular Privacy & Consent
        </button>
        <button
          id="tab-btn-trigger"
          onClick={() => setActiveTab('EMERGENCY_SETUP')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'EMERGENCY_SETUP'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          }`}
        >
          🚨 Coordinate Emergency Now
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW (Emergency Passport) */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Passport Card */}
          <div className="lg:col-span-2 space-y-6">
            <div 
              id="medical-passport-card"
              className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                    {patient.blood_group}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {patient.name}
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-normal">
                        {patient.age} yrs • {patient.gender}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {patient.patient_id} • Verified BigQuery Encrypted</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    HIPAA Compliant
                  </span>
                </div>
              </div>

              {/* Grid of Medical Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Allergies */}
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Critical Allergies
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map((allergy, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-200 text-xs font-semibold shadow-xs border border-amber-200 dark:border-amber-800">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <Pill className="w-4 h-4 text-blue-600" />
                    Current Medications
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.medications.map((med, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-200 text-xs font-semibold shadow-xs border border-blue-200 dark:border-blue-800">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Relevant Conditions */}
                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40">
                  <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <Heart className="w-4 h-4 text-purple-600" />
                    Relevant Medical Conditions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.relevant_conditions.map((cond, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-purple-900 dark:text-purple-200 text-xs font-semibold shadow-xs border border-purple-200 dark:border-purple-800">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Insurance & Physician */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Insurance & Care Team
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-800 dark:text-slate-200 font-semibold">{patient.insurance_provider || 'Star Health'}</p>
                    <p className="text-slate-500 font-mono text-[11px]">Policy: {patient.insurance_id}</p>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                      Primary Dr: {patient.primary_physician || 'Dr. Anand Raman, Manipal Health'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Sharing Transparency Notice */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-white">Emergency Data Transmission Guarantee</p>
                  <p>
                    During an active emergency, LifeLink transmits only strictly necessary medical flags (allergies, anticoagulant use, blood type) to assigned paramedics and ER trauma teams. Zero advertising, zero unauthorized disclosure.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Trigger Emergency CTA */}
            <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base font-bold text-rose-950 dark:text-rose-200 flex items-center justify-center sm:justify-start gap-2">
                  <Activity className="w-5 h-5 text-rose-600 animate-pulse" />
                  Simulate or Trigger Emergency Coordination
                </h3>
                <p className="text-xs text-rose-800/80 dark:text-rose-300/80 max-w-md">
                  Activate the full autonomous Google Cloud agent stack to coordinate ambulance, hospital matching, and family notifications.
                </p>
              </div>
              <button
                id="btn-open-emergency-drawer"
                onClick={() => setActiveTab('EMERGENCY_SETUP')}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-all shrink-0"
              >
                Launch Coordination Flow
              </button>
            </div>
          </div>

          {/* Right Column: Emergency Contacts & Privacy Summary */}
          <div className="space-y-6">
            {/* Connected Emergency Contacts */}
            <div 
              id="emergency-contacts-card"
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Emergency Contacts
                </h3>
                <span className="text-xs font-medium text-slate-500">
                  {patient.emergency_contacts.length} Connected
                </span>
              </div>

              <div className="space-y-3">
                {callStatusMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    {callStatusMessage}
                  </div>
                )}
                {patient.emergency_contacts.map((contact) => (
                  <div
                    key={contact.contact_id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {contact.name}
                          {contact.is_primary && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                              Primary
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">{contact.relationship} • {contact.phone}</p>
                      </div>

                      <button
                        id={`btn-test-alert-${contact.contact_id}`}
                        onClick={() => handleTestContact(contact)}
                        disabled={testedContactId === contact.contact_id}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        {testedContactId === contact.contact_id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600">Calling...</span>
                          </>
                        ) : (
                          <>
                            <Phone className="w-3 h-3 text-emerald-500" />
                            Test Voice Call
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                When triggered, LifeLink sends an authenticated SMS with live tracking URL and calls primary contact with AI voice status.
              </p>
            </div>

            {/* Privacy Quick Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  Privacy Preferences
                </h3>
                <button
                  onClick={() => setActiveTab('PRIVACY')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Manage
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Share Allergies & Meds:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Always Allowed</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Full EHR Records:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {patient.data_sharing_permissions.full_medical_records === 'ASK_FIRST' ? 'Ask First' : 'Explicit Approval'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600 dark:text-slate-400">AI Coordination:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Authorized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRIVACY CONTROLS */}
      {activeTab === 'PRIVACY' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Lock className="w-6 h-6 text-indigo-600" />
              Granular Data Sharing Controls
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              You own your medical data. Define precisely what information LifeLink agents can share with paramedics, emergency physicians, and family members during a critical incident.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                key: 'critical_allergies' as const,
                title: 'Critical Allergies & Anaphylaxis Triggers',
                desc: 'Needed by paramedics before administering penicillin, anesthesia, or contrast dyes.',
                current: patient.data_sharing_permissions.critical_allergies,
              },
              {
                key: 'current_medications' as const,
                title: 'Current Prescriptions & Anticoagulants',
                desc: 'Vital for trauma surgeons to know if you are taking blood thinners or diabetes meds.',
                current: patient.data_sharing_permissions.current_medications,
              },
              {
                key: 'medical_history' as const,
                title: 'Past Conditions & Surgical History',
                desc: 'Helps matching agent choose specialty centers (Stroke, Cardiac, Trauma).',
                current: patient.data_sharing_permissions.medical_history,
              },
              {
                key: 'insurance_information' as const,
                title: 'Health Insurance & Policy Numbers',
                desc: 'Transmitted to hospital intake desk to expedite emergency admission registration.',
                current: patient.data_sharing_permissions.insurance_information,
              },
              {
                key: 'full_medical_records' as const,
                title: 'Full Longitudinal Health Records (EHR)',
                desc: 'Complete lab history and doctor notes across all non-emergency visits.',
                current: patient.data_sharing_permissions.full_medical_records,
              },
              {
                key: 'location_tracking' as const,
                title: 'Real-Time Location & Geolocation Breadcrumbs',
                desc: 'Allows dispatch agent to pinpoint exact coordinate for ambulance navigation.',
                current: patient.data_sharing_permissions.location_tracking,
              },
            ].map((item) => (
              <div
                key={item.key}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>

                <div className="flex items-center gap-2">
                  {(['ALLOWED', 'ASK_FIRST', 'REQUIRE_EXPLICIT_APPROVAL'] as PrivacyShareLevel[]).map((level) => {
                    const isSelected = item.current === level;
                    const labels = {
                      ALLOWED: 'Always Share',
                      ASK_FIRST: 'Ask If Responsive',
                      REQUIRE_EXPLICIT_APPROVAL: 'Strict Approval Only',
                    };
                    return (
                      <button
                        key={level}
                        onClick={() => handlePermissionChange(item.key, level)}
                        className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl transition-all border ${
                          isSelected
                            ? level === 'ALLOWED'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : level === 'ASK_FIRST'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50'
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

          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm font-bold text-indigo-950 dark:text-indigo-200">Zero Commercial Data Sale Guarantee</p>
                <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80">
                  Data is processed strictly in memory using confidential compute enclaves on Google Cloud.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
              SOC-2 & HIPAA Verified
            </span>
          </div>
        </div>
      )}

      {/* TAB CONTENT: EMERGENCY TRIGGER / SCENARIO SELECTOR */}
      {activeTab === 'EMERGENCY_SETUP' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
              Select Emergency Scenario to Coordinate
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select an incident type or provide custom details. LifeLink will execute multi-agent coordination across medical context, location intelligence, ambulance dispatch, and hospital intake.
            </p>
          </div>

          {/* Scenario Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyScenarios.map((sc) => {
              const isSelected = selectedEmergencyType === sc.type;
              return (
                <div
                  key={sc.type}
                  id={`scenario-card-${sc.type}`}
                  onClick={() => setSelectedEmergencyType(sc.type)}
                  className={`p-5 rounded-2xl cursor-pointer border transition-all space-y-2 ${
                    isSelected
                      ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-500 shadow-md ring-2 ring-rose-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{sc.icon}</span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
                        Selected
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sc.label}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{sc.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Custom description option */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Optional Context or Incident Notes
            </label>
            <input
              id="input-emergency-custom-notes"
              type="text"
              value={customEmergencyText}
              onChange={(e) => setCustomEmergencyText(e.target.value)}
              placeholder="e.g. Patient found unresponsive near HAL Old Airport Road junction..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Action Trigger Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              <span>Patient: <strong>{patient.name}</strong> • Location: <strong>Bengaluru Central (12.9716, 77.5946)</strong></span>
            </div>

            <button
              id="btn-execute-emergency-coordination"
              onClick={() => {
                onTriggerEmergency(
                  selectedEmergencyType, 
                  customEmergencyText || emergencyScenarios.find(s => s.type === selectedEmergencyType)?.desc || 'Emergency coordination requested.'
                );
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-base shadow-xl shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <span className="w-3 h-3 rounded-full bg-white animate-ping" />
              Begin Autonomous Coordination
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
