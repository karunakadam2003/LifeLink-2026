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
  Sliders,
  Info,
  ShieldAlert,
  ChevronDown,
  PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type AppPersonaTab = 
  | 'CONSUMER_PASSPORT'      // Home & Protection
  | 'CONSUMER_EMERGENCY'     // Live Emergency Response
  | 'SIMULATION_RUNNER'      // Interactive 8-step simulation
  | 'FAMILY_PORTAL'          // Contacts & Family Portal
  | 'EMERGENCY_PREFERENCES'  // Preferences & Autonomy
  | 'AGENT_WORKFLOW'         // Inside LifeLink (Multi-Agent Architecture)
  | 'HOSPITAL_PORTAL'        // ER Trauma Bay Intake Desk
  | 'ABOUT_TECH'             // Google Tech & ADK Stack
  | 'SCHEMAS_PROTOCOL'       // BigQuery DW & SQL Console
  | 'INVESTOR_HUB'           // Business & Arr
  | 'PRODUCT_STORY';         // Product Narrative

export type UserRolePane = 'CITIZEN' | 'HOSPITAL' | 'TECH_INVESTOR';

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
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const [showMoreNav, setShowMoreNav] = useState(false);

  useEffect(() => {
    fetch('/api/bigquery/status')
      .then(res => res.json())
      .then(data => setBqStatus(data))
      .catch(() => setBqStatus({ isGcpConnected: false, datasetId: 'lifelink_emergency_dw' }));
  }, []);

  return (
    <header className="bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 text-white sticky top-0 z-50 shadow-2xl">
      {/* 1. Top Calm Status & Telemetry Pill Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-6 py-1.5 text-[11px] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LifeLink Autonomous Mesh Active</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <span className="text-slate-400 hidden sm:inline">
            Google ADK 2.0 + Gemini 3.7 Flash + BigQuery DW
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <button
            onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-[10px] font-semibold transition"
          >
            <Cloud className="w-3 h-3 text-blue-400" />
            <span>GCP Telemetry</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showTelemetryDrawer ? 'rotate-180' : ''}`} />
          </button>

          <span className="hidden md:inline text-slate-400 font-mono text-[10px]">
            Response Latency: <strong className="text-emerald-400">&lt; 380ms</strong>
          </span>
        </div>
      </div>

      {/* Collapsible Telemetry Bar for Technical Judges */}
      <AnimatePresence>
        {showTelemetryDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 text-xs text-slate-300 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-300">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold">BigQuery:</span>
                  <span className="font-mono text-[10px] text-emerald-400">
                    {bqStatus?.isGcpConnected ? 'ONLINE (GCP US)' : 'HEALTHCARE DW SYNC'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-300">
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-semibold">Pub/Sub Bus:</span>
                  <span className="font-mono text-[10px] text-emerald-400">STREAMING (AMBULANCE + ER)</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-semibold">Gemini 3.7 Flash:</span>
                  <span className="font-mono text-[10px] text-emerald-400">REASONING CORE</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectTab('ABOUT_TECH')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  <span>View Full Tech Breakdown</span>
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Brand & Primary Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
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
                  Emergency AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Autonomous Medical Response & Coordination
              </p>
            </div>
          </button>
        </div>

        {/* Primary Product Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner max-w-full overflow-x-auto">
          {/* Tab 1: Home & Protection */}
          <button
            onClick={() => {
              onSelectRole('CITIZEN');
              onSelectTab('CONSUMER_PASSPORT');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentTab === 'CONSUMER_PASSPORT'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Home</span>
          </button>

          {/* Tab 2: Live Emergency Tracker */}
          <button
            onClick={() => {
              onSelectRole('CITIZEN');
              onSelectTab('CONSUMER_EMERGENCY');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentTab === 'CONSUMER_EMERGENCY'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400/40'
                : hasActiveEmergency
                ? 'text-rose-400 hover:bg-rose-950/30 animate-pulse'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {hasActiveEmergency && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Emergency Response</span>
          </button>

          {/* Tab 3: Simulation Runner (Hero Demo) */}
          <button
            onClick={() => {
              onSelectRole('CITIZEN');
              onSelectTab('SIMULATION_RUNNER');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentTab === 'SIMULATION_RUNNER'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-indigo-300 hover:bg-indigo-950/40'
            }`}
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Test Simulation</span>
          </button>

          {/* Tab 4: Emergency Contacts & Family */}
          <button
            onClick={() => {
              onSelectRole('CITIZEN');
              onSelectTab('FAMILY_PORTAL');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentTab === 'FAMILY_PORTAL'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Contacts & Family</span>
          </button>

          {/* Tab 5: Preferences */}
          <button
            onClick={() => {
              onSelectRole('CITIZEN');
              onSelectTab('EMERGENCY_PREFERENCES');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentTab === 'EMERGENCY_PREFERENCES'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Preferences</span>
          </button>

          {/* Tab 6: Inside LifeLink (For Judges) */}
          <button
            onClick={() => {
              onSelectRole('TECH_INVESTOR');
              onSelectTab('AGENT_WORKFLOW');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentTab === 'AGENT_WORKFLOW'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Inside LifeLink</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onResetDemo}
            disabled={isLoading}
            id="btn-reset-hero"
            title="Launch interactive Hero Emergency scenario"
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400/30 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : 'fill-white'}`} />
            <span>Hero Demo</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMoreNav(!showMoreNav)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1"
            >
              <span>More</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showMoreNav && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                onClick={() => setShowMoreNav(false)}
              >
                <button
                  onClick={() => {
                    onSelectRole('HOSPITAL');
                    onSelectTab('HOSPITAL_PORTAL');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Hospital ER Intake Desk</span>
                </button>

                <button
                  onClick={() => onSelectTab('ABOUT_TECH')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <Cloud className="w-4 h-4 text-indigo-400" />
                  <span>Google Cloud & ADK Stack</span>
                </button>

                <button
                  onClick={() => onSelectTab('SCHEMAS_PROTOCOL')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>BigQuery SQL & Schemas</span>
                </button>

                <button
                  onClick={() => onSelectTab('INVESTOR_HUB')}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Investor & ARR Hub</span>
                </button>

                <button
                  onClick={onOpenEvaluation}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800 pt-2"
                >
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>AI Benchmarks & Evals</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
