import React from 'react';
import { 
  Sparkles, 
  Cpu, 
  Database, 
  Radio, 
  Cloud, 
  Navigation, 
  ShieldCheck, 
  Zap, 
  Layers, 
  CheckCircle2,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface AboutTechViewProps {
  onLaunchSimulation?: () => void;
  onViewArchitecture?: () => void;
}

export const AboutTechView: React.FC<AboutTechViewProps> = ({
  onLaunchSimulation,
  onViewArchitecture,
}) => {
  const gcpTechStack = [
    {
      name: 'Google Agent Development Kit (ADK 2.0)',
      role: 'Autonomous Multi-Agent Orchestration Engine',
      description: 'Coordinates deterministic parallel workflows between specialized intake, hospital discovery, routing, and communication agents with structured state handoffs.',
      icon: Cpu,
      badge: 'Agentic Core',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      name: 'Gemini 3.7 Flash',
      role: 'Clinical Severity & Multi-Criteria Triage Reasoning',
      description: 'Performs sub-400ms contextual reasoning to assess emergency severity, match trauma criteria with hospital capabilities, and synthesize natural explainable rationales.',
      icon: Sparkles,
      badge: 'Reasoning Model',
      color: 'from-rose-600 to-amber-600',
    },
    {
      name: 'Google Cloud BigQuery',
      role: 'Healthcare Data Warehouse & ER Bed Matrix',
      description: 'Provides encrypted, low-latency relational stores for hospital trauma readiness, live ICU bed occupancy, and patient pre-consented medical profiles.',
      icon: Database,
      badge: 'Data Warehouse',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      name: 'Google Cloud Pub/Sub',
      role: 'Real-Time Telemetry & Event Streaming Bus',
      description: 'Enables asynchronous, distributed event streams connecting ambulance GPS beacons, hospital divert alerts, and patient vital telemetry for instant autonomous re-planning.',
      icon: Radio,
      badge: 'Event Mesh',
      color: 'from-purple-600 to-pink-600',
    },
    {
      name: 'Google Maps Platform Dynamic Routes',
      role: 'Geospatial Transit & Congestion Avoidance',
      description: 'Calculates real-time congestion-aware corridors between patient location and regional trauma centers, actively avoiding peak arterial bottlenecks.',
      icon: Navigation,
      badge: 'Geospatial',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      name: 'Google Cloud Run',
      role: 'Serverless Auto-Scaling Container Infrastructure',
      description: 'Houses the containerized Node.js/Express coordination microservices with zero cold-start latency and HIPAA-ready isolated runtime environments.',
      icon: Cloud,
      badge: 'Compute Engine',
      color: 'from-sky-600 to-blue-600',
    },
  ];

  return (
    <div id="about-tech-container" className="max-w-6xl mx-auto space-y-8 pb-16 text-white">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Cloud className="w-3.5 h-3.5 text-blue-400" />
              Google Cloud & ADK Architecture
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Technology Stack & Architecture
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              LifeLink is built on Google's official Agent Development Kit (ADK) and Google Cloud platform to demonstrate autonomous, deterministic multi-agent orchestration for mission-critical healthcare responses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onLaunchSimulation && (
              <button
                onClick={onLaunchSimulation}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Run Live Simulation
              </button>
            )}
            {onViewArchitecture && (
              <button
                onClick={onViewArchitecture}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center gap-2"
              >
                <Cpu className="w-4 h-4 text-indigo-400" />
                Multi-Agent Graph
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Technology Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gcpTechStack.map((tech, idx) => {
          const Icon = tech.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${tech.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                    {tech.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {tech.name}
                </h3>
                <p className="text-xs font-semibold text-slate-400">{tech.role}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{tech.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production Implemented
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. Core Architectural Paradigm */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          The Multi-Agent Orchestration Difference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
            <h4 className="font-bold text-white">Parallel Specialization</h4>
            <p className="leading-relaxed">
              Instead of a single monolithic prompt, specialized agents operate concurrently on hospital capacity, route geometry, and telecom dispatch.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
            <h4 className="font-bold text-white">Autonomous Re-Planning</h4>
            <p className="leading-relaxed">
              If an in-transit hospital triggers a Code Black divert or a traffic corridor jams, listening agents re-route the ambulance within 400 milliseconds.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
            <h4 className="font-bold text-white">Deterministic Guardrails</h4>
            <p className="leading-relaxed">
              Human-in-the-loop (HITL) gates and pre-consented data sharing ensure AI acts strictly within clinical protocols and patient authorizations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
