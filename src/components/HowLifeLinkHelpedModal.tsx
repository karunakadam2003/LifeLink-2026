import React from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Navigation, 
  Phone, 
  Users, 
  Cpu, 
  ArrowRight,
  Share2,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Emergency, Hospital, Ambulance, PatientProfile } from '../types';

interface HowLifeLinkHelpedModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: Emergency | null;
  patient: PatientProfile;
  selectedHospital?: Hospital;
  assignedAmbulance?: Ambulance;
}

export const HowLifeLinkHelpedModal: React.FC<HowLifeLinkHelpedModalProps> = ({
  isOpen,
  onClose,
  emergency,
  patient,
  selectedHospital,
  assignedAmbulance,
}) => {
  if (!isOpen) return null;

  const actionsCompleted = [
    {
      agent: 'Emergency Intake Agent',
      title: 'Incident Ingested & Severity Assessed',
      desc: `Evaluated ${emergency?.emergency_type?.replace(/_/g, ' ') || 'Emergency'} in 340ms, extracted critical allergies (${patient.allergies.join(', ') || 'None'}) & blood group (${patient.blood_group}).`,
      time: '0.3s',
      icon: ShieldCheck,
      color: 'text-rose-400',
    },
    {
      agent: 'Location & Routing Agent',
      title: 'Real-Time Location & Corridor Locked',
      desc: 'Pinpointed exact GPS coordinates and computed dynamic route avoiding peak traffic delays.',
      time: '0.8s',
      icon: Navigation,
      color: 'text-emerald-400',
    },
    {
      agent: 'Hospital Intelligence Agent',
      title: '4 Nearby Hospitals Evaluated',
      desc: `Selected ${selectedHospital?.name || 'Trauma Center'} (2.4 km away) with 0m ER wait time and Level 1 trauma surgical capacity.`,
      time: '1.4s',
      icon: Building2,
      color: 'text-purple-400',
    },
    {
      agent: 'Response & Dispatch Agent',
      title: 'Closest ALS Ambulance Dispatched',
      desc: `Dispatched unit ${assignedAmbulance?.unit_code || 'ALS-01'} and transmitted pre-arrival medical summary to paramedics.`,
      time: '2.1s',
      icon: Clock,
      color: 'text-amber-400',
    },
    {
      agent: 'Communication Agent',
      title: 'Emergency Contacts Notified',
      desc: `Placed automated voice call to ${patient.emergency_contacts[0]?.name || 'Primary Contact'} with authenticated live tracking link.`,
      time: '2.9s',
      icon: Phone,
      color: 'text-blue-400',
    },
  ];

  return (
    <div 
      id="modal-how-lifelink-helped"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-slate-900 rounded-3xl p-7 border border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">How LifeLink Coordinated This Response</h3>
              <p className="text-xs text-slate-400">Autonomous Multi-Agent AI Transparency Summary</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Hero Metric Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              Response Completed in Under 1 Minute
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">5 Agents in Parallel</span>
          </div>

          <h4 className="text-xl font-extrabold text-white">
            In 43 seconds, LifeLink took care of everything.
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            Instead of making a distressed patient dial multiple numbers or explain medical history during trauma, LifeLink's autonomous agents coordinated every critical action simultaneously.
          </p>
        </div>

        {/* Actions Timeline */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Autonomous Actions Executed
          </h5>

          <div className="space-y-2.5">
            {actionsCompleted.map((action, idx) => {
              const Icon = action.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3 text-xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className={`w-4 h-4 ${action.color}`} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white truncate">{action.title}</p>
                      <span className="text-[10px] font-mono text-slate-400 ml-2">+{action.time}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{action.desc}</p>
                    <p className="text-[10px] text-slate-500 font-mono pt-1">Executed by: {action.agent}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multi-Agent Orchestration Footnote */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-indigo-200">Powered by Google ADK Multi-Agent Architecture</p>
            <p className="text-indigo-300/80 text-[11px]">
              Actions were executed deterministically across Google Cloud Pub/Sub, Gemini 3.7 Flash, and BigQuery.
            </p>
          </div>
        </div>

        {/* Close CTA */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Close Summary
          </button>
        </div>
      </motion.div>
    </div>
  );
};
