import React, { useState } from 'react';
import { 
  Heart, 
  Phone, 
  MapPin, 
  Navigation, 
  Building2, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  MessageSquare, 
  Share2,
  User,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { Emergency, Hospital, Ambulance, PatientProfile } from '../types';
import { EmergencyVoiceCallLive } from './EmergencyVoiceCallLive';

interface FamilyPortalViewProps {
  emergency: Emergency | null;
  patient: PatientProfile;
  hospitals: Hospital[];
  ambulances: Ambulance[];
}

export const FamilyPortalView: React.FC<FamilyPortalViewProps> = ({
  emergency,
  patient,
  hospitals,
  ambulances,
}) => {
  const [responderNote, setResponderNote] = useState('');
  const [noteSent, setNoteSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedHospital = hospitals.find(
    (h) => h.hospital_id === emergency?.selected_hospital_id
  ) || hospitals[0];

  const assignedAmbulance = ambulances.find(
    (a) => a.ambulance_id === emergency?.ambulance_id
  ) || ambulances[0];

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responderNote.trim()) return;
    setNoteSent(true);
    setTimeout(() => {
      setResponderNote('');
      setNoteSent(false);
    }, 4000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div id="family-portal-container" className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div 
        id="family-alert-banner"
        className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-8 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              Family Emergency Access Link
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              Someone you care about needs help.
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              LifeLink has verified an active medical response for <strong className="text-white">{patient.name}</strong>. Responders and destination ER are in real-time sync.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-share-family-link"
              onClick={handleCopyLink}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink ? 'Link Copied!' : 'Share Live Tracking'}
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Voice Call Audio Note */}
      {emergency && (
        <EmergencyVoiceCallLive
          emergency={emergency}
          patient={patient}
        />
      )}

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Patient & Destination Status */}
        <div className="md:col-span-2 space-y-6">
          <div 
            id="family-patient-status-card"
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-xl">
                  {patient.blood_group}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{patient.name}</h3>
                  <p className="text-xs text-slate-500">{patient.age} yrs • {patient.gender} • {patient.relationship || 'Emergency Profile'}</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Response in Progress
              </span>
            </div>

            {/* Destination & Ambulance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Destination Hospital</span>
                  <span className="text-xs font-bold text-emerald-600">{selectedHospital?.eta_minutes || 8} min ETA</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedHospital?.name}</h4>
                <p className="text-xs text-slate-500">{selectedHospital?.address}</p>
                <div className="pt-2">
                  <a
                    href={`tel:${selectedHospital?.contact_phone || '+918025024444'}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Hospital ER Desk
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Assigned Paramedic Unit</span>
                  <span className="text-xs font-bold text-rose-600">{assignedAmbulance?.eta_to_patient_minutes || 5} min ETA</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{assignedAmbulance?.unit_code}</h4>
                <p className="text-xs text-slate-500">Crew: {assignedAmbulance?.paramedic_crew.join(', ')}</p>
                <div className="pt-2">
                  <a
                    href="tel:+918099887766"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Paramedic Crew
                  </a>
                </div>
              </div>
            </div>

            {/* Note to Responders Form */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                  Send Critical Medical Note to Paramedics & ER
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Have critical information about recent medication timing, symptoms, or allergies? Transmit directly to the crew's tablet.
              </p>

              <form onSubmit={handleSendNote} className="space-y-3">
                <input
                  id="input-family-responder-note"
                  type="text"
                  value={responderNote}
                  onChange={(e) => setResponderNote(e.target.value)}
                  placeholder="e.g. He took his 75mg blood thinner at 8:00 AM this morning..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Transmitted with authenticated digital signature</span>
                  <button
                    id="btn-submit-family-note"
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Transmit to Crew
                  </button>
                </div>

                {noteSent && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 font-semibold"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Note successfully transmitted to {assignedAmbulance?.unit_code} in-transit telemetry console!
                  </motion.div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Right Col: Family Emergency Contacts & Location Advice */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              What to do right now
            </h3>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">1. Head to the Hospital</p>
                <p>Proceed to <strong>{selectedHospital?.name} Emergency Department</strong>. Staff have received patient context.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">2. Carry Physical ID & Card</p>
                <p>Carry the patient's Aadhaar/National ID and insurance card ({patient.insurance_id}).</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">3. Keep Phone Line Open</p>
                <p>The treating physician may call to confirm consent for emergency interventions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
