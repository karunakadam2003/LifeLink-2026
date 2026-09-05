import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  MapPin, 
  Cpu, 
  Database, 
  Radio, 
  Building2, 
  Heart, 
  Phone, 
  Zap, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductStoryViewProps {
  onLaunchLiveDemo: () => void;
}

export const ProductStoryView: React.FC<ProductStoryViewProps> = ({ onLaunchLiveDemo }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const storySteps = [
    {
      stepNumber: 1,
      time: '08:32 AM',
      title: 'The Incident Occurs',
      tagline: 'When you can\'t speak, who speaks for you?',
      description: 'Aarav Sharma (34) is involved in a high-velocity vehicular collision on Old Airport Road, Bengaluru. He suffers head trauma and is rendered completely unconscious. He cannot unlock his phone or speak to bystanders.',
      icon: '💥',
      techBadge: 'Vehicle Telemetry / Satellite Crash Beacon',
      dataHighlight: 'Unresponsive • GCS 8 • Bengaluru Central (12.9716, 77.5946)',
      quote: '"During an accident or stroke, the patient is often incapacitated. Seconds determine survival."',
    },
    {
      stepNumber: 2,
      time: '08:32:01 AM',
      title: 'Autonomous Ingestion & Medical Context Agent',
      tagline: 'Retrieving life-saving medical truths in milliseconds.',
      description: 'LifeLink\'s Coordinator Agent immediately activates the Medical Context Agent. Querying encrypted BigQuery vaults with patient consent, it retrieves critical flags: Aarav is Blood Group O+, severely allergic to Penicillin, and taking Metformin.',
      icon: '🪪',
      techBadge: 'Google Cloud BigQuery & Confidential Enclave',
      dataHighlight: 'Blood O+ • Penicillin Allergy Alert • Metformin Daily',
      quote: '"Responders now know NEVER to administer penicillin before even touching the patient."',
    },
    {
      stepNumber: 3,
      time: '08:32:02 AM',
      title: 'Location & Hospital Intelligence Match',
      tagline: 'The nearest hospital is NOT always the right hospital.',
      description: 'The Hospital Intelligence Agent correlates real-time ER capacities across 6 regional hospitals. Victoria Hospital is 3km away but under Code Black Divert with a 14-minute ER backlog. Manipal Hospital HAL (4.8km) has an open Level 1 Trauma bay and 24x7 neurosurgery team ready.',
      icon: '🏥',
      techBadge: 'Vector Capacity Matrix & Gemini Reasoning',
      dataHighlight: 'Manipal HAL Selected (Score 98.4%) • Victoria Govt Hospital Diverted',
      quote: '"LifeLink avoids sending critical trauma patients to overcrowded emergency rooms."',
    },
    {
      stepNumber: 4,
      time: '08:32:03 AM',
      title: 'Paramedic Dispatch & Family Sync',
      tagline: 'Every responder in complete synchronized alignment.',
      description: 'Response Agent dispatches RapidResponder-ALS-01 (5m ETA) and pre-populates the paramedic in-cab tablet with trauma alerts. Simultaneously, an authenticated SMS with live tracking link is transmitted to Aarav\'s spouse, Priya Sharma.',
      icon: '🚑',
      techBadge: 'IoT Fleet Telemetry & Twilio Voice Bus',
      dataHighlight: 'ALS-01 Dispatched • Family Tracking Link Sent',
      quote: '"Family members receive immediate calm clarity instead of frantic guessing."',
    },
    {
      stepNumber: 5,
      time: '08:34:12 AM',
      title: 'Sudden Traffic Spike & Autonomous Re-Planning',
      tagline: 'Real-world emergencies are dynamic. LifeLink adapts in 380ms.',
      description: 'A sudden tanker breakdown blocks the Koramangala arterial corridor, adding 18 minutes to the route. Continuous Monitoring Agent detects the Pub/Sub alert, re-runs routing through Google Maps Platform, and redirects the ambulance via the HAL access expressway seamlessly.',
      icon: '🔄',
      techBadge: 'Google Cloud Pub/Sub & Autonomous Re-route',
      dataHighlight: 'Dynamic Reroute Completed in 380ms • 11 Minutes Saved',
      quote: '"Deterministic safety rules guarantee instant adaptation without human hesitation."',
    },
    {
      stepNumber: 6,
      time: '08:41:00 AM',
      title: 'The Golden Hour Outcome',
      tagline: 'From chaos to coordinated care within 9 minutes.',
      description: 'Ambulance arrives at Manipal Hospital Trauma Bay 1. The ER surgical team is pre-scrubbed, O-Negative blood is crossmatched and waiting, and the patient enters the CT suite immediately without paper triage delays. Aarav survives with full neurological recovery.',
      icon: '✨',
      techBadge: 'Total Coordination Latency: 384ms • Golden Hour Secured',
      dataHighlight: 'Patient Stabilized • 17.8 Minutes Total Saved vs Traditional 911',
      quote: '"This is why we built LifeLink. When you can\'t speak, your AI speaks for you."',
    },
  ];

  const current = storySteps[currentStep];

  return (
    <div id="product-story-container" className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Product Narrative
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          What happens when you can't speak?
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
          Walk through the 60-second end-to-end simulation of LifeLink coordinating a real-life medical emergency.
        </p>
      </div>

      {/* Story Progress Bar */}
      <div className="flex items-center justify-between gap-2 px-2">
        {storySteps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentStep(idx)}
            className={`flex-1 h-2 rounded-full transition-all ${
              idx === currentStep
                ? 'bg-rose-600 scale-y-125'
                : idx < currentStep
                ? 'bg-emerald-500'
                : 'bg-slate-200 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Main Story Card */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{current.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                  Step {current.stepNumber} of {storySteps.length}
                </span>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                  {current.time}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {current.title}
              </h2>
            </div>
          </div>

          <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono border border-indigo-200 dark:border-indigo-800 hidden sm:inline-block">
            {current.techBadge}
          </span>
        </div>

        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
          {current.description}
        </p>

        {/* Data Highlight Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <Activity className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="text-xs text-slate-800 dark:text-slate-200 font-mono">
            <strong>System State:</strong> {current.dataHighlight}
          </div>
        </div>

        {/* Quote Block */}
        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-900 dark:text-rose-200 text-xs sm:text-sm italic">
          {current.quote}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {currentStep < storySteps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5 shadow-md"
            >
              Next Milestone
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onLaunchLiveDemo}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs hover:from-rose-500 hover:to-red-500 flex items-center gap-2 shadow-lg shadow-rose-600/30 animate-pulse"
            >
              <Play className="w-4 h-4" />
              Launch Live Coordination Engine
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
