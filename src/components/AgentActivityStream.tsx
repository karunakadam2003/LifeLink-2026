import React, { useState } from 'react';
import { AgentActivityLog } from '../types.js';
import { Bot, Terminal, Code2, CheckCircle, AlertTriangle, ArrowRight, Filter, ChevronDown, ChevronUp, Cpu, Flame } from 'lucide-react';

interface AgentActivityStreamProps {
  logs: AgentActivityLog[];
}

export const AgentActivityStream: React.FC<AgentActivityStreamProps> = ({ logs }) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const agentColors: Record<string, { bg: string; text: string; border: string }> = {
    CoordinatorAgent: { bg: 'bg-red-950/60', text: 'text-red-300', border: 'border-red-800' },
    MedicalContextAgent: { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-800' },
    LocationAgent: { bg: 'bg-sky-950/60', text: 'text-sky-300', border: 'border-sky-800' },
    HospitalIntelligenceAgent: { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-800' },
    CommunicationAgent: { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-800' },
    ResponseAgent: { bg: 'bg-indigo-950/60', text: 'text-indigo-300', border: 'border-indigo-800' },
    MonitoringAgent: { bg: 'bg-rose-950/60', text: 'text-rose-300', border: 'border-rose-800' },
  };

  const filteredLogs = selectedAgent === 'ALL'
    ? logs
    : logs.filter(l => l.agent_name === selectedAgent);

  const getActionBadge = (type: AgentActivityLog['action_type']) => {
    switch (type) {
      case 'THOUGHT':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">REASONING</span>;
      case 'TOOL_CALL':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-950 text-blue-300 border border-blue-800">TOOL CALL</span>;
      case 'TOOL_RESULT':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-800">RESULT</span>;
      case 'DELEGATION':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-950 text-indigo-300 border border-indigo-800">DELEGATE</span>;
      case 'DECISION':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950 text-amber-300 border border-amber-800">DECISION</span>;
      case 'RE_PLAN_TRIGGER':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">⚡ RE-PLAN</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-[560px]">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <h3 className="font-black text-sm uppercase tracking-wider text-white">
            Autonomous Multi-Agent Activity & Reasoning Stream
          </h3>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 rounded-full">
            {filteredLogs.length} Events
          </span>
        </div>

        {/* Filter Dropdown / Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
          {['ALL', 'CoordinatorAgent', 'MedicalContextAgent', 'HospitalIntelligenceAgent', 'MonitoringAgent'].map(ag => (
            <button
              key={ag}
              onClick={() => setSelectedAgent(ag)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition whitespace-nowrap ${
                selectedAgent === ag
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {ag === 'ALL' ? 'All Agents' : ag.replace('Agent', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Scrollable Stream */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1.5 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-sans">
            No agent activities recorded yet.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const agentStyle = agentColors[log.agent_name] || { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
            const isExpanded = expandedLogId === log.id;
            const hasData = log.input_data || log.output_data;

            return (
              <div
                key={log.id}
                className={`p-3 rounded-xl border transition-all ${
                  log.action_type === 'RE_PLAN_TRIGGER'
                    ? 'bg-gradient-to-r from-rose-950/70 to-slate-900 border-rose-600/80 shadow-md'
                    : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${agentStyle.bg} ${agentStyle.text} ${agentStyle.border}`}>
                      {log.agent_name}
                    </span>
                    {getActionBadge(log.action_type)}
                    <span className="text-[11px] font-bold text-slate-200 font-sans">
                      {log.step_title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-slate-300 text-xs font-sans leading-relaxed">
                  {log.details}
                </p>

                {/* Optional Expandable Payload Inspector */}
                {hasData && (
                  <div className="mt-2 pt-1.5 border-t border-slate-900">
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 font-sans"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>{isExpanded ? 'Hide Payload Trace' : 'Inspect Tool / JSON Payload'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-2.5 rounded-lg bg-black/70 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                        {log.input_data && (
                          <div className="mb-1.5">
                            <span className="text-amber-400 font-bold uppercase text-[9px] block">Input Parameters:</span>
                            <pre className="text-slate-300 whitespace-pre-wrap">{JSON.stringify(log.input_data, null, 2)}</pre>
                          </div>
                        )}
                        {log.output_data && (
                          <div>
                            <span className="text-emerald-400 font-bold uppercase text-[9px] block">Execution Output:</span>
                            <pre className="text-slate-300 whitespace-pre-wrap">{JSON.stringify(log.output_data, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
