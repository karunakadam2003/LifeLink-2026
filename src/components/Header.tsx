import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Shield, 
  Cpu, 
  RefreshCw, 
  Radio, 
  Database, 
  Zap, 
  Heart, 
  Building2, 
  TrendingUp, 
  BookOpen, 
  Sparkles,
  Cloud,
  CheckCircle2,
  Play,
  Users,
  Terminal,
  Layers,
  PhoneCall
} from 'lucide-react';

export type UserRolePane = 'CITIZEN' | 'HOSPITAL' | 'TECH_INVESTOR';

export type AppPersonaTab = 
  | 'CONSUMER_PASSPORT'
  | 'CONSUMER_EMERGENCY'
  | 'FAMILY_PORTAL'
  | 'HOSPITAL_PORTAL'
  | 'AGENT_WORKFLOW'
  | 'SCHEMAS_PROTOCOL'
  | 'INVESTOR_HUB'
  | 'PRODUCT_STORY';

interface HeaderProps {
  currentTab: AppPersonaTab;
  onSelectTab: (tab: AppPersonaTab) => void;
  activeRole: UserRolePane;
  onSelectRole: (role: UserRolePane) => void;
  hasActiveEmergency: boolean;
  onResetDemo: () => void;
  onOpenEvaluation: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentTab, 
  onSelectTab, 
  activeRole,
  onSelectRole,
  hasActiveEmergency,
  onResetDemo, 
  onOpenEvaluation, 
  isLoading 
}) => {
  const [bqStatus, setBqStatus] = useState<{ isGcpConnected: boolean; datasetId: string } | null>(null);

  useEffect(() => {
    fetch('/api/bigquery/status')
      .then(res => res.json())
      .then(data => setBqStatus(data))
      .catch(() => setBqStatus({ isGcpConnected: false, datasetId: 'lifelink_emergency_dw' }));
  }, []);

  return (
    <header className="bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 text-white sticky top-0 z-50 shadow-2xl">
      {/* 1. Top Telemetry & Cloud Live Status Bar */}
      <div className="bg-slate-900/80 border-b border-slate-800/60 px-4 sm:px-6 py-1.5 text-[11px] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300 font-semibold">GCP Stack:</span>
          </span>

          {/* BigQuery Status Pill */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-950/70 border border-blue-800/70 text-blue-300">
            <Database className="w-3 h-3 text-blue-400" />
            <span className="font-semibold">BigQuery DW:</span>
            <span className="text-emerald-400 font-mono text-[10px] font-bold">
              {bqStatus?.isGcpConnected ? 'ONLINE (GCP US)' : 'ACTIVE'}
            </span>
          </div>

          {/* Pub/Sub Stream Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-950/70 border border-purple-800/70 text-purple-300">
            <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
            <span className="font-semibold">Pub/Sub Bus:</span>
            <span className="text-emerald-400 font-mono text-[10px] font-bold">STREAMING</span>
          </div>

          {/* Gemini AI Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-800/70 text-rose-300">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span className="font-semibold">Gemini 3.7 Flash:</span>
            <span className="text-emerald-400 font-mono text-[10px] font-bold">REASONING (ADK)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono">Response Latency:</span>
            <span className="text-emerald-400 font-mono font-bold bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/60 text-[10px]">
              &lt; 780ms
            </span>
          </div>
          <span className="hidden lg:inline text-slate-600">|</span>
          <span className="hidden lg:inline text-slate-400 font-medium">HIPAA & DPDP Pre-Consented Vault</span>
        </div>
      </div>

      {/* 2. Main Brand & Role Persona Selector Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <button 
            onClick={() => {
              onSelectRole('CITIZEN');
              onSelectTab('CONSUMER_PASSPORT');
            }}
            className="flex items-center space-x-3 text-left focus:outline-hidden group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/40 ring-2 ring-rose-500/30 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-rose-200 transition-colors">
                  LifeLink
                </span>
                <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                  Agentic Emergency OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Autonomous Healthcare & Geospatial Coordination
              </p>
            </div>
          </button>
        </div>

        {/* 3 User Mode Tabs (Citizen, Hospital Ops, Tech & Investor) */}
        <div className="flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
          {/* Pane 1: Citizen & Family */}
          <button
            onClick={() => {
              onSelectRole('CITIZEN');
              if (currentTab !== 'CONSUMER_PASSPORT' && currentTab !== 'CONSUMER_EMERGENCY' && currentTab !== 'FAMILY_PORTAL') {
                onSelectTab('CONSUMER_PASSPORT');
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeRole === 'CITIZEN'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Citizen & Family</span>
            {hasActiveEmergency && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
          </button>

          {/* Pane 2: Hospital Ops */}
          <button
            onClick={() => {
              onSelectRole('HOSPITAL');
              onSelectTab('HOSPITAL_PORTAL');
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeRole === 'HOSPITAL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hospital & Dispatch</span>
          </button>

          {/* Pane 3: Tech & Investor */}
          <button
            onClick={() => {
              onSelectRole('TECH_INVESTOR');
              if (currentTab !== 'AGENT_WORKFLOW' && currentTab !== 'SCHEMAS_PROTOCOL' && currentTab !== 'INVESTOR_HUB' && currentTab !== 'PRODUCT_STORY') {
                onSelectTab('AGENT_WORKFLOW');
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeRole === 'TECH_INVESTOR'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>AI Tech & Investor Hub</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenEvaluation}
            id="btn-agent-eval"
            title="View clinical triage benchmarks and AI evaluation"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-950/80 text-indigo-200 border border-indigo-700/80 hover:bg-indigo-900 transition shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Benchmarks</span>
            <span className="sm:hidden">Evals</span>
          </button>

          <button
            onClick={onResetDemo}
            disabled={isLoading}
            id="btn-reset-hero"
            title="Run interactive 60-second Hero Emergency scenario"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400/30 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : 'fill-white'}`} />
            <span>Hero Demo</span>
          </button>
        </div>
      </div>

      {/* 3. Sub-Navigation Bar tailored for the selected Role */}
      <div className="bg-slate-900/50 border-t border-slate-800/60 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Context Tag & Sub-views */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            {activeRole === 'CITIZEN' && (
              <>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline mr-2">
                  Citizen Workspace:
                </span>
                <button
                  onClick={() => onSelectTab('CONSUMER_PASSPORT')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    currentTab === 'CONSUMER_PASSPORT'
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-rose-400" />
                  My Medical Passport & SOS
                </button>

                <button
                  onClick={() => onSelectTab('CONSUMER_EMERGENCY')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    currentTab === 'CONSUMER_EMERGENCY'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-rose-400 hover:bg-rose-950/30'
                  }`}
                >
                  {hasActiveEmergency && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                  🚨 Live Emergency Tracker
                </button>

                <button
                  onClick={() => onSelectTab('FAMILY_PORTAL')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    currentTab === 'FAMILY_PORTAL'
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Family & Next-of-Kin Portal
                </button>
              </>
            )}

            {activeRole === 'HOSPITAL' && (
              <>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline mr-2">
                  Hospital Ops:
                </span>
                <button
                  onClick={() => onSelectTab('HOSPITAL_PORTAL')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    currentTab === 'HOSPITAL_PORTAL'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-300" />
                  ER Trauma Bay Intake & Bed Control
                </button>

                <button
                  onClick={() => onSelectTab('CONSUMER_EMERGENCY')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    currentTab === 'CONSUMER_EMERGENCY'
                      ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Fleet Dispatch & GPS Map
                </button>
              </>
            )}

            {activeRole === 'TECH_INVESTOR' && (
              <>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline mr-2">
                  AI Architecture:
                </span>
                <button
                  onClick={() => onSelectTab('AGENT_WORKFLOW')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    currentTab === 'AGENT_WORKFLOW'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-300" />
                  7-Agent Multi-Agent Workflow
                </button>

                <button
                  onClick={() => onSelectTab('SCHEMAS_PROTOCOL')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    currentTab === 'SCHEMAS_PROTOCOL'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-blue-300" />
                  BigQuery DW & ACP Protocol
                </button>

                <button
                  onClick={() => onSelectTab('INVESTOR_HUB')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    currentTab === 'INVESTOR_HUB'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                  Commercial ARR Engine
                </button>

                <button
                  onClick={() => onSelectTab('PRODUCT_STORY')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    currentTab === 'PRODUCT_STORY'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  Product Story & Pitch
                </button>
              </>
            )}
          </div>

          {/* Quick Role Hint */}
          <div className="text-[11px] text-slate-400 hidden lg:flex items-center gap-1.5">
            {activeRole === 'CITIZEN' && (
              <span className="text-rose-300/90 font-medium">
                🛡️ <strong>Citizen Mode:</strong> Clean personal health card, 1-tap SOS trigger, and live family updates.
              </span>
            )}
            {activeRole === 'HOSPITAL' && (
              <span className="text-blue-300/90 font-medium">
                🏥 <strong>Hospital Mode:</strong> ER trauma bay telemetry, live bed occupancy, and divert triggers.
              </span>
            )}
            {activeRole === 'TECH_INVESTOR' && (
              <span className="text-indigo-300/90 font-medium">
                🧠 <strong>Tech & Investor Mode:</strong> Google Cloud BigQuery, ADK multi-agent protocol, and ARR financials.
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
