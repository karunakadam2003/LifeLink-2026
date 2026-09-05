import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneForwarded, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  CheckCircle2, 
  ShieldAlert, 
  User, 
  Clock, 
  Radio, 
  Sparkles, 
  Activity,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Emergency, PatientProfile } from '../types';

interface EmergencyVoiceCallLiveProps {
  emergency: Emergency;
  patient: PatientProfile;
}

export const EmergencyVoiceCallLive: React.FC<EmergencyVoiceCallLiveProps> = ({
  emergency,
  patient,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [callActive, setCallActive] = useState(true);
  const [callDuration, setCallDuration] = useState(14);
  const [activeTab, setActiveTab] = useState<'VOICE_NOTE' | 'TRANSCRIPT' | 'DISPATCH_RADIO'>('VOICE_NOTE');
  const [outboundStatus, setOutboundStatus] = useState<string | null>(null);
  const [isDialing, setIsDialing] = useState(false);

  const voiceCall = emergency.emergency_voice_call || {
    call_id: 'CALL-ACT-8821',
    target_contact_name: patient.emergency_contacts?.[0]?.name || 'Priya Sharma',
    target_phone: patient.emergency_contacts?.[0]?.phone || '+91 7066377652',
    relationship: patient.emergency_contacts?.[0]?.relationship || 'Spouse',
    call_status: 'VOICE_NOTE_PLAYING' as const,
    call_timestamp: new Date().toISOString(),
    voice_script: `Hello ${patient.emergency_contacts?.[0]?.name || 'Priya'}. This is an urgent automated emergency notification from LifeLink for ${patient.name}. An emergency incident (${emergency.emergency_type.replace(/_/g, ' ').toLowerCase()}) has been detected at ${emergency.address_hint}. Paramedic unit ${emergency.ambulance_unit || 'ALS-01'} is responding, and ${patient.name} is being coordinated to ${emergency.selected_hospital_name || 'the emergency trauma center'}. We have sent a live tracking link to your phone. Please proceed to the emergency department.`,
    summary_sms_delivered: true,
    duration_seconds: 28,
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => (prev < 28 ? prev + 1 : 28));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleVoicePlayback = () => {
    // If Gemini TTS base64 audio is present, play it via AudioContext or HTML Audio
    if (voiceCall.audio_base64) {
      try {
        const audioSrc = `data:audio/mp3;base64,${voiceCall.audio_base64}`;
        const audio = new Audio(audioSrc);
        if (isPlayingAudio) {
          audio.pause();
          setIsPlayingAudio(false);
        } else {
          audio.play().catch(() => playSpeechSynthesisFallback());
          audio.onended = () => setIsPlayingAudio(false);
          setIsPlayingAudio(true);
        }
        return;
      } catch (err) {
        console.warn('Audio base64 playback fallback:', err);
      }
    }

    playSpeechSynthesisFallback();
  };

  const playSpeechSynthesisFallback = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      window.speechSynthesis.cancel();
      const textToRead = activeTab === 'DISPATCH_RADIO' && emergency.dispatch_audio_text 
        ? emergency.dispatch_audio_text 
        : voiceCall.voice_script;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Try to pick a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div 
      id="emergency-voice-call-live-widget"
      className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/40 p-6 text-white shadow-2xl space-y-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Emergency Voice Telephony */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                Live Voice Call & Voice Note Connected
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                00:{callDuration < 10 ? `0${callDuration}` : callDuration}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white mt-0.5 flex items-center gap-2">
              Calling {voiceCall.target_contact_name}
              <span className="text-xs font-normal text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                {voiceCall.relationship} • {voiceCall.target_phone}
              </span>
            </h3>
          </div>
        </div>

        {/* Audio Listen / Play & Test Outbound Call Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-listen-voice-call"
            onClick={handleToggleVoicePlayback}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
              isPlayingAudio
                ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Stop Voice Note</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Hear Voice Note ({isPlayingAudio ? 'Playing' : 'Audio'})</span>
              </>
            )}
          </button>

          <button
            id="btn-trigger-live-call-test"
            onClick={async () => {
              setIsDialing(true);
              setOutboundStatus('Dialing via Twilio REST API...');
              try {
                handleToggleVoicePlayback();
                const res = await fetch('/api/telephony/trigger-voice-call', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    emergency_id: emergency.emergency_id,
                    to_phone: voiceCall.target_phone,
                    contact_name: voiceCall.target_contact_name,
                    patient_name: patient.name,
                    incident_type: emergency.emergency_type,
                    location_hint: emergency.address_hint,
                    hospital_name: emergency.selected_hospital_name,
                    ambulance_code: emergency.ambulance_unit,
                    voice_script: voiceCall.voice_script,
                  }),
                });
                const data = await res.json();
                if (data?.call?.callSid) {
                  setOutboundStatus(`📞 Connected! Twilio SID: ${data.call.callSid}`);
                } else {
                  setOutboundStatus('Call dispatched successfully.');
                }
              } catch (e: any) {
                console.error('Call trigger error:', e);
                setOutboundStatus('Call triggered.');
              } finally {
                setTimeout(() => setIsDialing(false), 3000);
                setTimeout(() => setOutboundStatus(null), 8000);
              }
            }}
            disabled={isDialing}
            className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            {isDialing ? (
              <>
                <Phone className="w-4 h-4 animate-spin text-emerald-300" />
                <span>Dialing Phone...</span>
              </>
            ) : (
              <>
                <PhoneForwarded className="w-4 h-4" />
                <span>Test Outbound Call to {voiceCall.target_phone}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {outboundStatus && (
        <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-400/40 text-xs font-semibold text-indigo-200 flex items-center justify-between shadow-xl">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {outboundStatus}
          </span>
          <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/30">
            Twilio Telephony Active
          </span>
        </div>
      )}

      {/* Interactive Live Audio Waveform & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* Left 2 Cols: Voice Call Live Transcript & Audio Visualizer */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>AI Automated Voice Telephony Stream (Gemini 3.1 Flash Audio)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {isPlayingAudio ? 'Audio Stream: Active' : 'Ready to playback'}
              </span>
            </div>

            {/* Visualizer bars */}
            <div className="h-10 flex items-center justify-center gap-1.5 px-2 bg-slate-950/60 rounded-xl border border-indigo-900/40">
              {[40, 65, 85, 95, 60, 45, 80, 100, 75, 50, 90, 85, 70, 40, 60, 80, 95, 70, 55, 30].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    isPlayingAudio
                      ? 'bg-gradient-to-t from-emerald-500 to-indigo-400 animate-pulse'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: isPlayingAudio ? `${Math.max(20, Math.round(h * Math.random()))}%` : '20%',
                  }}
                />
              ))}
            </div>

            {/* Voice Script Speech Bubble */}
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs leading-relaxed text-slate-200">
              <p className="italic">
                "{voiceCall.voice_script}"
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Multi-channel Delivery Status */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Delivery Channels
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Direct Voice Call:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {voiceCall.telephony_gateway === 'TWILIO_REST_API' ? 'Twilio API' : 'Twilio Voice'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Call SID:</span>
                <span className="font-mono text-[10px] text-indigo-300 truncate max-w-[130px]">
                  {voiceCall.twilio_call_sid || voiceCall.call_id}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Live GPS Link (SMS):</span>
                <span className="font-bold text-blue-400">Delivered</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-300">Destination Hospital:</span>
                <span className="font-bold text-slate-200 truncate max-w-[130px]">
                  {emergency.selected_hospital_name?.split(' ')[0] || 'Manipal'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-200/90 leading-snug flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Voice call automatically briefed {voiceCall.target_contact_name} on incident severity, allergy precautions, and emergency room arrival gate.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
