import React, { useState } from 'react';
import { 
  Bot, 
  Cpu, 
  Database, 
  Navigation, 
  Building2, 
  Radio, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Search, 
  Terminal,
  ShieldAlert,
  Sliders,
  Filter,
  Layers,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentActivityLog, EmergencyEvent, ActionProposal } from '../types';
import { AgentActivityStream } from './AgentActivityStream';
import { HitlDecisionCenter } from './HitlDecisionCenter';
import { PubSubStream } from './PubSubStream';
import { BigQueryAndProtocolView } from './BigQueryAndProtocolView';

interface AgentWorkflowViewProps {
  logs: AgentActivityLog[];
  events: EmergencyEvent[];
  proposals: ActionProposal[];
  onApproveProposal: (id: string) => void;
  onRejectProposal: (id: string) => void;
  onTriggerEvent: (type: any, payload: any) => void;
}

export const AgentWorkflowView: React.FC<AgentWorkflowViewProps> = ({
  logs,
  events,
  proposals,
  onApproveProposal,
  onRejectProposal,
  onTriggerEvent,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('CoordinatorAgent');
  const [activeSubTab, setActiveSubTab] = useState<'GRAPH' | 'LOGS' | 'HITL' | 'PUBSUB' | 'SCHEMAS'>('GRAPH');

  const agentsPipeline = [
    {
      id: 'CoordinatorAgent',
      name: 'LifeLink Orchestrator',
      model: 'Google ADK + Gemini 3.7 Flash',
      role: 'Coordinates multi-agent parallel workflows, synthesizes clinical facts, and enforces deterministic safety constraints.',
      icon: Cpu,
      color: 'indigo',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      latency: '340ms',
      status: 'COMPLETED',
      dataSources: ['Pub/Sub Ingest', 'Gemini Reasoning Core'],
    },
    {
      id: 'MedicalContextAgent',
      name: 'Medical Context Agent',
      model: 'BigQuery / HIPAA Enclave',
      role: 'Extracts critical blood type, drug allergies, active prescriptions, and enforces user privacy preferences.',
      icon: Database,
      color: 'blue',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      latency: '42ms',
      status: 'COMPLETED',
      dataSources: ['BigQuery Patient Vault', 'Consent Engine'],
    },
    {
      id: 'HospitalIntelligenceAgent',
      name: 'Hospital Intelligence Agent',
      model: 'Vector Capacity Matrix / BigQuery',
      role: 'Evaluates Level 1 trauma readiness, ER/ICU bed occupancy, and surgical team availability across regional centers.',
      icon: Building2,
      color: 'purple',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      latency: '180ms',
      status: 'COMPLETED',
      dataSources: ['Hospital Telemetry API', 'Trauma Matrix DB'],
    },
    {
      id: 'LocationAgent',
      name: 'Location & Routing Agent',
      model: 'Google Maps Platform Dynamic Routes',
      role: 'Calculates real-time transit times, dynamic traffic congestion avoidance, and golden-hour travel corridors.',
      icon: Navigation,
      color: 'emerald',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      latency: '260ms',
      status: 'COMPLETED',
      dataSources: ['Google Maps Routes API', 'Live Traffic Flow'],
    },
    {
      id: 'ResponseAgent',
      name: 'Response & Dispatch Agent',
      model: 'Fleet IoT Dispatcher / Twilio Voice',
      role: 'Dispatches nearest Advanced Life Support (ALS) unit, delivers pre-arrival clinical summary, and alerts family contacts.',
      icon: Radio,
      color: 'rose',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      latency: '150ms',
      status: 'COMPLETED',
      dataSources: ['Ambulance IoT Fleet', 'Twilio Voice API'],
    },
    {
      id: 'MonitoringAgent',
      name: 'Continuous Monitoring Agent',
      model: 'Event-Driven Pub/Sub Listener',
      role: 'Monitors ongoing transit telemetry and hospital divert signals; autonomously executes re-planning if conditions degrade.',
      icon: Activity,
      color: 'amber',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      latency: 'Real-time',
      status: 'ACTIVE',
      dataSources: ['Google Cloud Pub/Sub', 'Ambulance Vitals IoT'],
    },
  ];

  const currentAgentInfo = agentsPipeline.find((a) => a.id === selectedAgent) || agentsPipeline[0];
  const agentLogs = logs.filter((l) => l.agent_name === selectedAgent);

  return (
    <div id="inside-lifelink-container" className="max-w-7xl mx-auto space-y-8 pb-16 text-white">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Inside LifeLink • Multi-Agent Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              ADK Multi-Agent Architecture
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Google Agent Development Kit (ADK) orchestrates 5 specialized AI agents working together in parallel. Experience the live agent topology, decision reasoning, and Pub/Sub event streams below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono">
              Total Agents: <strong className="text-emerald-400">6 Specialized</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono">
              Pending HITL: <strong className="text-amber-400">{proposals.filter(p => p.status === 'PENDING').length} Actions</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs Bar (Visual Graph, Activity Logs, HITL Approvals, Pub/Sub, Schemas) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('GRAPH')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'GRAPH'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Multi-Agent Visual Graph</span>
        </button>

        <button
          onClick={() => setActiveSubTab('HITL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'HITL'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>HITL Decision Center ({proposals.filter(p => p.status === 'PENDING').length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('LOGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'LOGS'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Agent Activity Logs ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PUBSUB')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'PUBSUB'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4 text-purple-400" />
          <span>Pub/Sub Telemetry Bus</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SCHEMAS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'SCHEMAS'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 text-blue-400" />
          <span>BigQuery Schemas &amp; ACP</span>
        </button>
      </div>

      {/* 3. SUB-TAB 1: MULTI-AGENT VISUAL TOPOLOGY GRAPH */}
      {activeSubTab === 'GRAPH' && (
        <div className="space-y-8">
          {/* Orchestrator Master Node */}
          <div className="flex flex-col items-center">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-2 border-indigo-500 shadow-2xl max-w-xl w-full text-center space-y-3 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Root Orchestration Engine
              </span>

              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-black text-white">LifeLink Orchestrator (Coordinator)</h3>
                  <p className="text-xs text-indigo-300 font-mono">Google ADK 2.0 + Gemini 3.7 Flash</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Coordinates parallel execution of sub-agents, aggregates facts, resolves hospital matching, and verifies clinical safety constraints.
              </p>

              <div className="pt-2 flex items-center justify-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Consensus Achieved (340ms)
                </span>
              </div>
            </div>

            {/* Connecting Visual Branch */}
            <div className="w-0.5 h-10 bg-gradient-to-b from-indigo-500 to-slate-700" />
            <div className="w-full max-w-4xl h-0.5 bg-slate-700 hidden md:block" />
          </div>

          {/* Sub-Agents Specialized Nodes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {agentsPipeline.filter(a => a.id !== 'CoordinatorAgent').map((agent) => {
              const Icon = agent.icon;
              const isSelected = selectedAgent === agent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-xl relative ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${agent.badgeColor}`}>
                        {agent.status === 'COMPLETED' ? '✓ Completed' : '● Monitoring'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{agent.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{agent.model}</p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{agent.role}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Latency: <strong className="text-white">{agent.latency}</strong></span>
                    <span className="text-indigo-400 font-bold hover:underline">Details →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Agent Deep-Dive Panel */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-950 flex items-center justify-center text-indigo-400 font-bold border border-indigo-800">
                  <currentAgentInfo.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{currentAgentInfo.name}</h3>
                  <p className="text-xs text-slate-400">{currentAgentInfo.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Model Engine:</span>
                <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-indigo-300">
                  {currentAgentInfo.model}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Data Sources */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Integrated Data Sources &amp; Protocols
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentAgentInfo.dataSources.map((ds, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium">
                      {ds}
                    </span>
                  ))}
                </div>
              </div>

              {/* Execution Telemetry */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recent Autonomous Actions
                </h4>
                <div className="space-y-2">
                  {agentLogs.length > 0 ? (
                    agentLogs.slice(-3).map((l, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{l.action}</span>
                          <span className="text-[10px] font-mono text-slate-400">{l.latency_ms}ms</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{l.reasoning}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">Autonomous workflow synchronized in background.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 2: HITL DECISION CENTER */}
      {activeSubTab === 'HITL' && (
        <HitlDecisionCenter
          proposals={proposals}
          onApprove={onApproveProposal}
          onReject={onRejectProposal}
        />
      )}

      {/* 5. SUB-TAB 3: ACTIVITY LOGS */}
      {activeSubTab === 'LOGS' && (
        <AgentActivityStream logs={logs} />
      )}

      {/* 6. SUB-TAB 4: PUBSUB STREAM */}
      {activeSubTab === 'PUBSUB' && (
        <PubSubStream events={events} onSimulateEvent={onTriggerEvent} />
      )}

      {/* 7. SUB-TAB 5: SCHEMAS & PROTOCOL */}
      {activeSubTab === 'SCHEMAS' && (
        <BigQueryAndProtocolView />
      )}
    </div>
  );
};
