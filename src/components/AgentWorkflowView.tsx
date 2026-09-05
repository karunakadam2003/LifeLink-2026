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
  Filter
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
  const [activeSubTab, setActiveSubTab] = useState<'WORKFLOW' | 'LOGS' | 'HITL' | 'PUBSUB' | 'SCHEMAS'>('WORKFLOW');

  const agentsPipeline = [
    {
      id: 'CoordinatorAgent',
      name: 'Coordinator Agent',
      model: 'gemini-2.5-flash',
      role: 'Orchestrates multi-agent subtasks, synthesizes findings, enforces deterministic safety constraints.',
      icon: Cpu,
      color: 'indigo',
      latency: '342ms',
      status: 'ACTIVE',
      dataSources: ['Pub/Sub Ingest', 'Gemini Reasoning Core'],
    },
    {
      id: 'MedicalContextAgent',
      name: 'Medical Context Agent',
      model: 'BigQuery / HIPAA Enclave',
      role: 'Extracts critical blood type, drug allergies, active anticoagulants, and enforces patient privacy preferences.',
      icon: Database,
      color: 'blue',
      latency: '180ms',
      status: 'ACTIVE',
      dataSources: ['BigQuery Encrypted Patient Vault', 'Consent Engine'],
    },
    {
      id: 'LocationAgent',
      name: 'Location & Routing Agent',
      model: 'Google Maps Platform Code Assist',
      role: 'Calculates real-time transit times, dynamic traffic congestion avoidance, and golden-hour travel corridors.',
      icon: Navigation,
      color: 'emerald',
      latency: '290ms',
      status: 'ACTIVE',
      dataSources: ['Google Maps Routes API', 'Live Traffic Flow'],
    },
    {
      id: 'HospitalIntelligenceAgent',
      name: 'Hospital Intelligence Agent',
      model: 'Vector Search / Capacity Matrix',
      role: 'Evaluates trauma capabilities, ICU/ER bed availability, operating surge status, and surgical team readiness.',
      icon: Building2,
      color: 'purple',
      latency: '210ms',
      status: 'ACTIVE',
      dataSources: ['Hospital Telemetry API', 'Trauma Matrix DB'],
    },
    {
      id: 'ResponseAgent',
      name: 'Response & Dispatch Agent',
      model: 'Fleet IoT Dispatcher',
      role: 'Dispatches nearest Advanced Life Support (ALS) unit, delivers pre-arrival clinical summary, alerts family.',
      icon: Radio,
      color: 'rose',
      latency: '150ms',
      status: 'ACTIVE',
      dataSources: ['Ambulance IoT Fleet', 'Twilio/GCP Voice API'],
    },
    {
      id: 'MonitoringAgent',
      name: 'Continuous Monitoring Agent',
      model: 'Event-Driven Pub/Sub Listener',
      role: 'Monitors ongoing transit telemetry, hospital divert signals, and autonomously executes re-planning if conditions degrade.',
      icon: Activity,
      color: 'amber',
      latency: 'Real-time',
      status: 'MONITORING',
      dataSources: ['Google Cloud Pub/Sub', 'Ambulance Vitals IoT'],
    },
  ];

  const currentAgentInfo = agentsPipeline.find((a) => a.id === selectedAgent) || agentsPipeline[0];
  const agentLogs = logs.filter((l) => l.agent_name === selectedAgent);

  return (
    <div id="agent-workflow-view" className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
            <Cpu className="w-3.5 h-3.5" />
            Layer 2 — Autonomous Multi-Agent Coordination Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Agent Command Center & Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Observe the decoupled multi-agent architecture executing across Google Cloud (Gemini 2.5 Flash, BigQuery, Maps API, Pub/Sub event bus).
          </p>
        </div>

        {/* System Latency Badge */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Response Latency</span>
            <p className="text-xl font-mono font-black text-emerald-400">384 ms</p>
          </div>
          <Zap className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('WORKFLOW')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'WORKFLOW'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          🔄 Multi-Agent Topology
        </button>
        <button
          onClick={() => setActiveSubTab('LOGS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'LOGS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          📜 Live Agent Trace Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('HITL')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'HITL'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          🛡️ Human-in-the-Loop Safety Gate ({proposals.length})
        </button>
        <button
          onClick={() => setActiveSubTab('PUBSUB')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'PUBSUB'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          📡 Pub/Sub Event Stream ({events.length})
        </button>
        <button
          id="subtab-schemas-protocol"
          onClick={() => setActiveSubTab('SCHEMAS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'SCHEMAS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          📐 BigQuery & ACP Protocol
        </button>
      </div>

      {/* SUB-TAB: WORKFLOW TOPOLOGY */}
      {activeSubTab === 'WORKFLOW' && (
        <div className="space-y-6">
          {/* Agent Pipeline Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentsPipeline.map((agent) => {
              const Icon = agent.icon;
              const isSelected = selectedAgent === agent.id;
              return (
                <div
                  key={agent.id}
                  id={`agent-card-${agent.id}`}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all space-y-4 ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
                      {agent.latency}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {agent.name}
                    </h3>
                    <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {agent.model}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {agent.role}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{agent.dataSources.length} Data Sources</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      Inspect <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Agent Inspector Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {React.createElement(currentAgentInfo.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {currentAgentInfo.name}
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                      Online & Bound
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Engine: {currentAgentInfo.model} • Execution Latency: {currentAgentInfo.latency}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentAgentInfo.dataSources.map((ds, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono">
                    {ds}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Agent Functional Responsibilities & Deterministic Boundaries
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700">
                {currentAgentInfo.role}
              </p>
            </div>

            {/* Recent Execution Logs for Selected Agent */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recent Step Traces for {currentAgentInfo.name} ({agentLogs.length} events)
              </h4>

              {agentLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 italic">No execution events logged yet for this agent in the current session.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {agentLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{log.step_title}</span>
                        <span className="font-mono text-[10px] text-slate-400">{log.action_type}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">{log.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: LOGS */}
      {activeSubTab === 'LOGS' && (
        <AgentActivityStream logs={logs} />
      )}

      {/* SUB-TAB: HITL DECISION CENTER */}
      {activeSubTab === 'HITL' && (
        <HitlDecisionCenter
          proposals={proposals}
          onApprove={onApproveProposal}
          onReject={onRejectProposal}
        />
      )}

      {/* SUB-TAB: PUBSUB EVENT BUS */}
      {activeSubTab === 'PUBSUB' && (
        <PubSubStream events={events} onTriggerEvent={onTriggerEvent} />
      )}

      {/* SUB-TAB: BIGQUERY & ACP PROTOCOL SCHEMAS */}
      {activeSubTab === 'SCHEMAS' && (
        <BigQueryAndProtocolView />
      )}
    </div>
  );
};
