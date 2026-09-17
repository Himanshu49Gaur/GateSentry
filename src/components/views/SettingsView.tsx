import React, { useState } from 'react';
import { 
  KeyRound, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ShieldAlert, 
  AlertTriangle,
  Radio,
  Send
} from 'lucide-react';
import { useGateSentryStore } from '../../lib/store';

interface SettingsViewProps {
  store: ReturnType<typeof useGateSentryStore>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ store }) => {
  const { tokens, generateCiToken, revokeCiToken, repos } = store;

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [targetRepoId, setTargetRepoId] = useState<string>('ALL');
  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Revoke confirmation
  const [revokingTokenId, setRevokingTokenId] = useState<string | null>(null);
  const [revokeConfirmText, setRevokeConfirmText] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim()) return;
    const fullToken = generateCiToken(
      tokenName.trim(), 
      targetRepoId === 'ALL' ? null : targetRepoId
    );
    setRevealedToken(fullToken);
    setTokenName('');
  };

  const handleCopyRevealed = () => {
    if (!revealedToken) return;
    navigator.clipboard.writeText(revealedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleConfirmRevoke = () => {
    if (revokeConfirmText !== 'REVOKE' || !revokingTokenId) return;
    revokeCiToken(revokingTokenId);
    setRevokingTokenId(null);
    setRevokeConfirmText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>CI/CD Runner Tokens & Integrations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate and manage machine-to-machine authentication tokens for GitHub Actions, GitLab CI, and runner pipelines.
          </p>
        </div>

        <button
          onClick={() => {
            setRevealedToken(null);
            setIsGenerateModalOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Runner Token</span>
        </button>
      </div>

      {/* Runner Tokens Table */}
      <div className="rounded-2xl bg-surface-1 border border-border-subtle overflow-hidden shadow-lg shadow-black/10">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-2/30">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Active CI Machine Tokens</span>
          <span className="text-xs font-mono text-slate-400">{tokens.filter(t => !t.isRevoked).length} Active</span>
        </div>

        <div className="divide-y divide-border-subtle/50">
          {tokens.map(t => (
            <div key={t.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  {t.isRevoked ? (
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-red-500/20 text-red-400">
                      REVOKED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-mono">
                  <span>Prefix: <strong className="text-slate-200">{t.tokenPrefix}</strong></span>
                  <span>•</span>
                  <span>Masked: {t.maskedToken.slice(0, 20)}...</span>
                  <span>•</span>
                  <span>Created: {new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                {!t.isRevoked && (
                  <button
                    onClick={() => {
                      setRevokingTokenId(t.id);
                      setRevokeConfirmText('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Token</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks & Alerts Configuration */}
      <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle space-y-4 shadow-lg shadow-black/10">
        <h3 className="text-sm font-semibold text-white">Alert Dispatchers & Webhooks</h3>
        <p className="text-xs text-slate-400">Receive instant alerts when a commit leaks an unencrypted secret or breaks a build.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-2 border border-border-subtle flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-white">Slack Security Channel</div>
              <div className="text-xs text-slate-400 mt-0.5">Alerts dispatched to <code>#security-alerts</code></div>
              <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected & Live
              </span>
            </div>
            <button className="px-3 py-1 rounded bg-surface-elevated text-xs text-slate-300 hover:text-white border border-border-subtle">
              Configure
            </button>
          </div>

          <div className="p-4 rounded-xl bg-surface-2 border border-border-subtle flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-white">Jira / Linear Issue Export</div>
              <div className="text-xs text-slate-400 mt-0.5">Automated ticket creation for un-remediated CVEs</div>
              <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                OAuth 2.0 Connected
              </span>
            </div>
            <button className="px-3 py-1 rounded bg-surface-elevated text-xs text-slate-300 hover:text-white border border-border-subtle">
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* Generate Token Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-elevated border border-border-subtle rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-white mb-1">Generate CI/CD Runner Token</h2>
            <p className="text-xs text-slate-400 mb-4">
              This token is used by the GateSentry CLI in GitHub Actions or runner scripts to authenticate and ingest telemetry.
            </p>

            {revealedToken ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Copy this token now! It will never be shown again.</span>
                  </div>
                  <div className="p-2.5 rounded bg-black font-mono text-xs text-slate-100 select-all break-all border border-border-subtle">
                    {revealedToken}
                  </div>
                  <button
                    onClick={handleCopyRevealed}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all"
                  >
                    {copiedToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedToken ? 'Copied to Clipboard!' : 'Copy Runner Secret'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="w-full py-2 rounded-xl bg-surface-2 hover:bg-surface-elevated text-white font-medium text-xs border border-border-subtle"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Token Name / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. GitHub-Actions-Production-Runner"
                    value={tokenName}
                    onChange={e => setTokenName(e.target.value)}
                    autoFocus
                    required
                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Repository Scope</label>
                  <select
                    value={targetRepoId}
                    onChange={e => setTargetRepoId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-white focus:outline-none"
                  >
                    <option value="ALL">Organization-Wide (All Repositories)</option>
                    {repos.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
                  >
                    Generate Token Secret
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Revoke Defensive Modal */}
      {revokingTokenId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-elevated border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Revoke Machine CI Token?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This action is immediate. Any active CI/CD pipeline using this token will halt with HTTP 401 Unauthorized.
              </p>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Type <strong className="text-red-400 font-mono">REVOKE</strong> to confirm:
              </label>
              <input
                type="text"
                value={revokeConfirmText}
                onChange={e => setRevokeConfirmText(e.target.value)}
                placeholder="REVOKE"
                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-white font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokingTokenId(null)}
                className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={revokeConfirmText !== 'REVOKE'}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  revokeConfirmText === 'REVOKE'
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 active:scale-95'
                    : 'bg-surface-2 text-slate-500 cursor-not-allowed border border-border-subtle'
                }`}
              >
                Permanently Revoke Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
