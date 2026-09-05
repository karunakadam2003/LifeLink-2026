import React from 'react';
import { ActionProposal } from '../types.js';
import { CheckCircle2, XCircle, ShieldAlert, AlertTriangle, UserCheck, Lock, Check } from 'lucide-react';

interface HitlDecisionCenterProps {
  proposals: ActionProposal[];
  onApproveAction: (actionId: string) => void;
  onRejectAction: (actionId: string) => void;
  isLoading: boolean;
}

export const HitlDecisionCenter: React.FC<HitlDecisionCenterProps> = ({
  proposals,
  onApproveAction,
  onRejectAction,
  isLoading,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-black text-sm uppercase tracking-wider text-white">
              Human-in-the-Loop (HITL) Decision Center
            </h3>
            <p className="text-[11px] text-slate-400">
              High-impact safety actions require authorized operator approval
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-800 text-amber-300 text-[10px] font-bold">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Governance Enforced</span>
        </div>
      </div>

      {/* Action Cards List */}
      <div className="space-y-3">
        {proposals.map(proposal => {
          const isPending = proposal.status === 'PENDING';
          const isApproved = proposal.status === 'APPROVED';

          return (
            <div
              key={proposal.action_id}
              className={`p-4 rounded-xl border transition-all ${
                isPending
                  ? 'bg-amber-950/20 border-amber-600/70 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30'
                  : isApproved
                  ? 'bg-emerald-950/30 border-emerald-800/80 opacity-90'
                  : 'bg-slate-950/80 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`text-xs font-bold ${isPending ? 'text-amber-300' : isApproved ? 'text-emerald-300' : 'text-slate-400'}`}>
                      {proposal.title}
                    </span>
                    {proposal.high_impact && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-950 text-red-300 border border-red-800">
                        High Impact
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      isPending ? 'bg-amber-500 text-slate-950 animate-pulse' : isApproved ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {proposal.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    {proposal.description}
                  </p>

                  {/* Supporting Evidence List */}
                  {proposal.evidence && proposal.evidence.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Agent Rationale & Evidence:
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-300">
                        {proposal.evidence.map((ev, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    Requires Role: <span className="text-slate-400">{proposal.requires_role}</span>
                  </div>
                </div>

                {/* Approve / Reject Action Buttons */}
                <div className="flex sm:flex-col items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 shrink-0">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => onApproveAction(proposal.action_id)}
                        disabled={isLoading}
                        id={`btn-approve-${proposal.action_id}`}
                        className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/40 transition disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Action</span>
                      </button>

                      <button
                        onClick={() => onRejectAction(proposal.action_id)}
                        disabled={isLoading}
                        id={`btn-reject-${proposal.action_id}`}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                      >
                        <span>Reject</span>
                      </button>
                    </>
                  ) : isApproved ? (
                    <div className="flex items-center space-x-1 text-emerald-400 font-bold text-xs bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-800">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Executed</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-slate-400 font-bold text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                      <XCircle className="w-4 h-4" />
                      <span>Rejected</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
