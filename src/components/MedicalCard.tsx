import React, { useState } from 'react';
import { Shield, AlertCircle, Pill, PhoneCall, Volume2, CheckCircle2, Lock, FileText, UserCheck, Play, Pause } from 'lucide-react';
import { Emergency } from '../types.js';

interface MedicalCardProps {
  emergency: Emergency;
}

export const MedicalCard: React.FC<MedicalCardProps> = ({ emergency }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const card = emergency.medical_emergency_card;

  const handlePlayVoiceDispatch = () => {
    if (!emergency.dispatch_audio_text) return;

    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(emergency.dispatch_audio_text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis not supported in this browser viewport.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col space-y-4">
      {/* Card Header & Privacy Shield */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="font-black text-sm uppercase tracking-wider text-white">
            Consented Emergency Medical Safeguards
          </h3>
        </div>
        <div className="flex items-center space-x-1 text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
          <Lock className="w-3 h-3" />
          <span>Privacy-Minimized PHI</span>
        </div>
      </div>

      {/* Clinical Summary Highlight Box */}
      <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800 text-xs">
        <div className="flex items-center space-x-1.5 text-sky-400 font-bold mb-1.5 uppercase text-[11px]">
          <FileText className="w-3.5 h-3.5" />
          <span>Automated Responder Clinical Briefing</span>
        </div>
        <p className="text-slate-200 leading-relaxed">
          {card?.critical_summary || 'Standard emergency protocol active. Awaiting profile synchronization.'}
        </p>
      </div>

      {/* Grid: Blood Group, Allergies, Medications */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Blood Group */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center font-black text-base text-red-400">
            {card?.blood_group || 'O+'}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Blood Group</span>
            <span className="text-xs font-bold text-slate-200">Verified Consented</span>
          </div>
        </div>

        {/* Allergy Contraindications */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-rose-900/60 sm:col-span-2">
          <div className="flex items-center space-x-1.5 text-rose-400 font-bold text-[11px] mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Critical Allergy Alerts (Contraindicated)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {card?.verified_allergies && card.verified_allergies.length > 0 ? (
              card.verified_allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950/90 text-rose-300 border border-rose-800"
                >
                  ⚠️ {allergy}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No verified drug allergies</span>
            )}
          </div>
        </div>
      </div>

      {/* Medications & Chronic Conditions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold mb-1 text-[11px]">
            <Pill className="w-3.5 h-3.5" />
            <span>Active Medications</span>
          </div>
          <ul className="space-y-1 text-slate-300">
            {card?.relevant_meds && card.relevant_meds.length > 0 ? (
              card.relevant_meds.map((med, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{med}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">None logged</li>
            )}
          </ul>
        </div>

        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center space-x-1.5 text-indigo-400 font-bold mb-1 text-[11px]">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Key Clinical Conditions</span>
          </div>
          <ul className="space-y-1 text-slate-300">
            {card?.key_conditions && card.key_conditions.length > 0 ? (
              card.key_conditions.map((cond, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>{cond}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">No chronic history</li>
            )}
          </ul>
        </div>
      </div>

      {/* Voice Dispatch Audio Player Bar */}
      {emergency.dispatch_audio_text && (
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950/50 to-slate-950 p-3 rounded-xl border border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-2.5">
            <button
              onClick={handlePlayVoiceDispatch}
              id="btn-play-voice-dispatch"
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition flex items-center justify-center shrink-0 mt-0.5"
              title="Play simulated EMT Radio Dispatch Announcement"
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div>
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>LifeLink EMT Voice Dispatch Radio Broadcast</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1 italic mt-0.5">
                {emergency.dispatch_audio_text}
              </p>
            </div>
          </div>
          <button
            onClick={handlePlayVoiceDispatch}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 whitespace-nowrap"
          >
            {isPlayingAudio ? 'Stop Radio' : '📻 Play Radio Callout'}
          </button>
        </div>
      )}
    </div>
  );
};
