import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building2, 
  ShieldCheck, 
  Clock, 
  Zap, 
  CheckCircle2, 
  ArrowUpRight, 
  Briefcase, 
  Heart, 
  Activity,
  Award,
  Layers,
  PieChart,
  BarChart3,
  Copy,
  Check,
  Flame,
  Target,
  Globe,
  Sparkles,
  Lock,
  Database
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

export const InvestorBusinessView: React.FC = () => {
  const [userScale, setUserScale] = useState(250000); // 250k protected users
  const [enterpriseSeats, setEnterpriseSeats] = useState(45000); // 45k seats
  const [hospitalPartners, setHospitalPartners] = useState(85); // 85 ER nodes
  const [payerMembers, setPayerMembers] = useState(150000); // 150k insurance lives
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Financial calculations
  const consumerRevenue = (userScale * 0.12 * 9.99 * 12); // 12% paid conversion @ $9.99/mo
  const enterpriseRevenue = (enterpriseSeats * 4.0 * 12); // $4/seat/mo
  const hospitalRevenue = (hospitalPartners * 2500 * 12); // $2.5k/mo per ER
  const insuranceRevenue = (payerMembers * 1.5 * 12); // $1.50/member/mo B2B2C
  const totalARR = consumerRevenue + enterpriseRevenue + hospitalRevenue + insuranceRevenue;
  const estimatedLivesSaved = Math.round((userScale + payerMembers) * 0.0018); // ~18 lives saved per 10k users/yr

  const mrrData = [
    { month: 'Q1 Y1', arr: 1.4, users: 45 },
    { month: 'Q2 Y1', arr: 2.8, users: 85 },
    { month: 'Q3 Y1', arr: 4.6, users: 135 },
    { month: 'Q4 Y1', arr: 6.9, users: 195 },
    { month: 'Q1 Y2', arr: 10.2, users: 290 },
    { month: 'Q2 Y2', arr: 14.8, users: 420 },
    { month: 'Q3 Y2', arr: 20.5, users: 610 },
    { month: 'Q4 Y2', arr: 28.4, users: 890 },
  ];

  const responseTimeComparison = [
    { category: 'Incident Triaging', traditional: 420, lifelink: 12 },
    { category: 'Hospital Bed Verification', traditional: 540, lifelink: 8 },
    { category: 'Ambulance Unit Dispatch', traditional: 360, lifelink: 15 },
    { category: 'Emergency Contact Alert', traditional: 600, lifelink: 5 },
    { category: 'ER Trauma Pre-Registration', traditional: 480, lifelink: 10 },
  ];

  const copyPitchSummary = () => {
    const text = `LifeLink Pitch Executive Summary:
• Market: $48B Global Emergency Healthcare & Coordination Market
• Problem: 25-45 minute dispatch delays & lack of patient history lead to preventable ER deaths during the "Golden Hour".
• Solution: Autonomous 7-Agent AI Emergency OS powered by Google Cloud (Gemini 3.7 Flash + BigQuery + Pub/Sub).
• Traction & Economics: Projected ARR: $${(totalARR / 1000000).toFixed(2)}M at 86% gross margins across B2C, Enterprise, ER SaaS, and Insurance Payers.
• Latency: < 780ms automated triage vs 15-minute legacy manual dispatch.`;
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div id="investor-business-container" className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Top Hero Banner */}
      <div 
        id="business-hero-banner"
        className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5" />
              Investor & Commercial Intelligence Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              LifeLink Commercial & Valuation Engine
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Transforming the fragmented <strong className="text-white">$48B global emergency coordination market</strong> through autonomous multi-agent healthcare orchestration on Google Cloud.
            </p>
          </div>

          {/* Quick Metrics Cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total ARR Model</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                ${(totalARR / 1000000).toFixed(2)}M
              </p>
              <p className="text-[10px] text-emerald-300/80 mt-0.5">86% Gross Margin</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Protected Lives</p>
              <p className="text-2xl font-black text-indigo-400 mt-1">
                {((userScale + payerMembers) / 1000).toFixed(0)}k
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Active Subscribers</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Partner ERs</p>
              <p className="text-2xl font-black text-rose-400 mt-1">
                {hospitalPartners}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Hospital Nodes</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Lives Saved</p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                ~{estimatedLivesSaved}
              </p>
              <p className="text-[10px] text-amber-300/80 mt-0.5">Est. Annually</p>
            </div>
          </div>
        </div>

        {/* Action button bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Multi-channel Monetization: Consumer Subscriptions • Enterprise B2B • Hospital SaaS • Insurance Payers</span>
          </div>

          <button
            onClick={copyPitchSummary}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition"
          >
            {copiedPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPitch ? 'Copied Pitch Summary!' : 'Copy 60-Sec Investor Pitch'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Scale Simulator & Unit Economics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Revenue & Scale Simulator */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Interactive Financial Model & Unit Economics
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust key market adoption variables to evaluate dynamic ARR and margin sensitivity.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-300 font-mono text-xs font-bold">
              Dynamic ARR Simulator
            </span>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  B2C Passport Users
                </span>
                <span className="font-mono text-indigo-300 font-bold">{userScale.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min={25000} 
                max={1000000} 
                step={25000}
                value={userScale} 
                onChange={(e) => setUserScale(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>$9.99/mo (12% conversion)</span>
                <span className="text-emerald-400 font-bold">${(consumerRevenue / 1000000).toFixed(2)}M ARR</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  Corporate Employee Seats
                </span>
                <span className="font-mono text-blue-300 font-bold">{enterpriseSeats.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min={5000} 
                max={200000} 
                step={5000}
                value={enterpriseSeats} 
                onChange={(e) => setEnterpriseSeats(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>$4.00/seat/mo (B2B Health)</span>
                <span className="text-emerald-400 font-bold">${(enterpriseRevenue / 1000000).toFixed(2)}M ARR</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-rose-400" />
                  Connected Hospital ER Desks
                </span>
                <span className="font-mono text-rose-300 font-bold">{hospitalPartners} ERs</span>
              </div>
              <input 
                type="range" 
                min={10} 
                max={500} 
                step={5}
                value={hospitalPartners} 
                onChange={(e) => setHospitalPartners(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>$2,500/ER/mo (Pre-Alert SaaS)</span>
                <span className="text-emerald-400 font-bold">${(hospitalRevenue / 1000000).toFixed(2)}M ARR</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Insurance Payer Lives
                </span>
                <span className="font-mono text-emerald-300 font-bold">{payerMembers.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min={20000} 
                max={500000} 
                step={10000}
                value={payerMembers} 
                onChange={(e) => setPayerMembers(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>$1.50/member/mo (B2B2C)</span>
                <span className="text-emerald-400 font-bold">${(insuranceRevenue / 1000000).toFixed(2)}M ARR</span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown Visualization */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              ARR Growth Trajectory ($M ARR over 8 Quarters)
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(value: any) => [`$${value}M ARR`, 'Annual Recurring Revenue']}
                  />
                  <Area type="monotone" dataKey="arr" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorArr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Col: Defensibility Moat & Why We Win */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Defensibility Moat</h2>
            </div>
            <p className="text-xs text-slate-400">
              Why LifeLink is extremely hard to replicate:
            </p>

            <div className="mt-4 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Data Flywheel & BigQuery Network Effects</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Every incident streams into BigQuery, refining routing algorithms and divert prediction models.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Zero-Knowledge Consented Health Vault</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Proprietary HIPAA & DPDP pre-authorization protocols that unlock critical health context only during verified crises.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Autonomous Dynamic Re-Planning Engine</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Event-driven Google Cloud Pub/Sub architecture that automatically re-routes ambulances upon Code Black Diverts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-700/60 mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-200">Valuation Benchmark</span>
              <span className="font-bold text-emerald-400">14x ARR Multiple</span>
            </div>
            <p className="text-[11px] text-indigo-300/80 mt-1">
              Healthcare AI infrastructure companies command premium multiples due to mission-critical retention (&gt;98% B2B gross retention).
            </p>
          </div>
        </div>
      </div>

      {/* Latency Comparison: Traditional 911 vs. LifeLink */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-400" />
              Operational Velocity: Traditional 911/108 vs. LifeLink Autonomous AI
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparison of seconds elapsed from incident trigger to execution.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              Traditional Manual Dispatch (Seconds)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              LifeLink Autonomous AI (Seconds)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {responseTimeComparison.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-center">
              <p className="text-xs font-bold text-slate-300 min-h-[32px] flex items-center justify-center">
                {item.category}
              </p>
              <div className="space-y-1.5">
                <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-900/50">
                  <p className="text-[10px] uppercase font-bold text-rose-400">Legacy Manual</p>
                  <p className="text-lg font-black text-rose-300">{item.traditional}s</p>
                  <p className="text-[9px] text-slate-400">({(item.traditional / 60).toFixed(1)} mins)</p>
                </div>

                <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-800/60 shadow-md shadow-emerald-950">
                  <p className="text-[10px] uppercase font-bold text-emerald-400">LifeLink AI</p>
                  <p className="text-lg font-black text-emerald-300">{item.lifelink}s</p>
                  <p className="text-[9px] text-emerald-400/90 font-bold font-mono">
                    {Math.round(item.traditional / item.lifelink)}x Faster
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Landscape Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          Competitive Advantage Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Capability</th>
                <th className="pb-3 font-semibold text-rose-400 text-center">Legacy 911 / 108 Dispatch</th>
                <th className="pb-3 font-semibold text-amber-400 text-center">Basic GPS Dispatch Apps</th>
                <th className="pb-3 font-semibold text-blue-400 text-center">General Telehealth Apps</th>
                <th className="pb-3 font-semibold text-emerald-400 text-center bg-emerald-950/30 rounded-t-xl px-2">
                  LifeLink Autonomous AI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3.5 font-bold text-white">Pre-Consented Medical Vault Access</td>
                <td className="text-center text-rose-400 font-bold">❌ None</td>
                <td className="text-center text-rose-400 font-bold">❌ None</td>
                <td className="text-center text-amber-400">⚠️ Manual Form Entry</td>
                <td className="text-center text-emerald-400 font-bold bg-emerald-950/30">✅ Instant Zero-Knowledge BigQuery</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">Dynamic Hospital Divert Re-Routing</td>
                <td className="text-center text-rose-400 font-bold">❌ Blind Arrival</td>
                <td className="text-center text-rose-400 font-bold">❌ None</td>
                <td className="text-center text-rose-400 font-bold">❌ None</td>
                <td className="text-center text-emerald-400 font-bold bg-emerald-950/30">✅ Live Pub/Sub Re-planning (&lt;450ms)</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">AI Multi-Agent Reasoning Crew</td>
                <td className="text-center text-rose-400 font-bold">❌ Manual Operators</td>
                <td className="text-center text-rose-400 font-bold">❌ Heuristic only</td>
                <td className="text-center text-amber-400">⚠️ Simple Chatbot</td>
                <td className="text-center text-emerald-400 font-bold bg-emerald-950/30">✅ 7 Google ADK Autonomous Agents</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">Hospital ER Pre-Alert Voice AI</td>
                <td className="text-center text-amber-400">⚠️ Paramedic Radio</td>
                <td className="text-center text-rose-400 font-bold">❌ None</td>
                <td className="text-center text-rose-400 font-bold">❌ None</td>
                <td className="text-center text-emerald-400 font-bold bg-emerald-950/30">✅ Automated Clinical Voice Briefing</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-white">Multi-lingual Family Emergency Portal</td>
                <td className="text-center text-rose-400 font-bold">❌ Delayed Calls</td>
                <td className="text-center text-rose-400 font-bold">❌ None</td>
                <td className="text-center text-rose-400 font-bold">❌ None</td>
                <td className="text-center text-emerald-400 font-bold bg-emerald-950/30">✅ Real-time Translation (3+ Languages)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
