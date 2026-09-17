import React, { useState } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Shield, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { useGateSentryStore } from '../../lib/store';

interface WaiversViewProps {
  store: ReturnType<typeof useGateSentryStore>;
}

export const WaiversView: React.FC<WaiversViewProps> = ({ store }) => {
  const { 
    suppressions, 
    approveWaiver, 
    rejectWaiver, 
    user, 
    switchRole 
  } = store;

  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'expired'>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingWaivers = suppressions.filter(s => s.status === 'PENDING_APPROVAL');
  const activeWaivers = suppressions.filter(s => s.status === 'APPROVED');
  const expiredOrRejected = suppressions.filter(s => s.status === 'REJECTED' || s.status === 'EXPIRED');

  const canApprove = user.role === 'APPSEC_ADMIN' || user.role === 'SUPER_ADMIN';

  const handleRejectSubmit = (id: string) => {
    if (!rejectReason.trim()) return;
    rejectWaiver(id, rejectReason.trim());
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Security Waivers & Governance</span>
            {pendingWaivers.length > 0 && (
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {pendingWaivers.length} Awaiting AppSec Review
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Time-bound security exceptions, audit approvals, and automated CI suppression rule fingerprints.
          </p>
        </div>

        {/* RBAC notice badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-1 border border-border-subtle text-xs">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400">Current Role:</span>
          <span className="font-semibold text-white font-mono">{user.role}</span>
          {!canApprove && (
            <button
              onClick={() => switchRole('APPSEC_ADMIN')}
              className="ml-2 text-indigo-400 hover:text-indigo-300 underline text-[11px]"
            >
              Switch to AppSec
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle gap-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'pending' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Pending Approvals</span>
          {pendingWaivers.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center border border-amber-500/40">
              {pendingWaivers.length}
            </span>
          )}
          {activeTab === 'pending' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />}
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'active' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Active Approved Waivers ({activeWaivers.length})</span>
          {activeTab === 'active' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
        </button>

        <button
          onClick={() => setActiveTab('expired')}
          className={`pb-3 px-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'expired' ? 'text-slate-200 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Rejected / Expired ({expiredOrRejected.length})</span>
          {activeTab === 'expired' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-500 rounded-full" />}
        </button>
      </div>

      {/* Tab 1: Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingWaivers.map(waiver => (
            <div 
              key={waiver.id}
              className="p-5 rounded-2xl bg-surface-1 border border-border-subtle hover:border-amber-500/30 transition-all shadow-lg shadow-black/10 space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{waiver.findingTitle}</h3>
                    <div className="text-xs text-slate-400 font-mono">
                      Repo: <strong className="text-slate-300">{waiver.repositoryName}</strong> • Fingerprint: <span className="text-slate-500">{waiver.fingerprint.slice(0, 16)}...</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expires: {new Date(waiver.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Justification Box */}
              <div className="p-4 rounded-xl bg-surface-2 border border-border-subtle space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="text-slate-300 font-semibold">Category: {waiver.reasonCategory.replace(/_/g, ' ')}</span>
                  <span>Requested by {waiver.requestedByUserName}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed italic">
                  "{waiver.justification}"
                </p>
              </div>

              {/* Reject Prompt Drawer */}
              {rejectingId === waiver.id && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2 animate-in fade-in duration-150">
                  <div className="text-xs font-semibold text-red-300">Specify Rejection Rationale</div>
                  <input
                    type="text"
                    placeholder="e.g. Test fixture lacks compensating IAM network restriction..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-background border border-border-subtle text-xs text-white"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setRejectingId(null)}
                      className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRejectSubmit(waiver.id)}
                      className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-semibold text-xs"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}

              {/* Actions for AppSec */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-400">
                  {canApprove ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> AppSec Authorization Verified
                    </span>
                  ) : (
                    <span className="text-amber-400 text-[11px]">
                      AppSec Admin permission required to approve
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRejectingId(waiver.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-surface-2 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-border-subtle text-xs font-medium transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      if (!canApprove) switchRole('APPSEC_ADMIN');
                      approveWaiver(waiver.id);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/25 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Waiver</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pendingWaivers.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-surface-1 border border-border-subtle">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">No Pending Waiver Requests</div>
              <div className="text-xs text-slate-400 mt-1">All repositories are strictly complying with organizational security guardrails.</div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Active Approved Waivers */}
      {activeTab === 'active' && (
        <div className="rounded-2xl bg-surface-1 border border-border-subtle overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-slate-400 uppercase font-mono text-[11px] bg-surface-2/40">
                <th className="py-3 px-4">Finding & Repository</th>
                <th className="py-3 px-4">Approved By</th>
                <th className="py-3 px-4">Reason Category</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 font-mono">
              {activeWaivers.map(w => (
                <tr key={w.id} className="hover:bg-surface-2/60 transition-colors">
                  <td className="py-3.5 px-4 font-sans">
                    <div className="font-semibold text-white">{w.findingTitle}</div>
                    <div className="text-slate-400 text-xs font-mono mt-0.5">{w.repositoryName}</div>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-300">
                    {w.approvedByUserName || 'AppSec Team'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {w.reasonCategory.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4 text-amber-300">
                    {new Date(w.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      ACTIVE SUPPRESSION
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Expired / Rejected */}
      {activeTab === 'expired' && (
        <div className="rounded-2xl bg-surface-1 border border-border-subtle overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-slate-400 uppercase font-mono text-[11px] bg-surface-2/40">
                <th className="py-3 px-4">Finding Title</th>
                <th className="py-3 px-4">Repository</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 font-mono">
              {expiredOrRejected.map(w => (
                <tr key={w.id} className="hover:bg-surface-2/60 transition-colors">
                  <td className="py-3 px-4 text-white font-sans">{w.findingTitle}</td>
                  <td className="py-3 px-4 text-slate-300">{w.repositoryName}</td>
                  <td className="py-3 px-4 text-red-400 font-bold">{w.status}</td>
                  <td className="py-3 px-4 text-slate-400 font-sans italic">{w.rejectionReason || 'Expired on timeline'}</td>
                </tr>
              ))}
              {expiredOrRejected.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-sans">
                    Zero rejected or expired waivers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
