import React, { useState } from 'react';
import { 
  ArrowLeft, 
  GitFork, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Download, 
  Clock, 
  ShieldAlert, 
  SlidersHorizontal,
  FileCode,
  Copy,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useGateSentryStore } from '../../lib/store';
import { generateSarifReport } from '../../scanner/sarif';

interface RepoDetailViewProps {
  store: ReturnType<typeof useGateSentryStore>;
}

export const RepoDetailView: React.FC<RepoDetailViewProps> = ({ store }) => {
  const { 
    repos, 
    scans, 
    findings, 
    selectedRepoId, 
    setActiveView, 
    setSelectedFindingId,
    setIsScanSimulatorOpen 
  } = store;

  const [activeTab, setActiveTab] = useState<'overview' | 'scans' | 'findings' | 'policy'>('overview');
  const [inspectScanId, setInspectScanId] = useState<string | null>(null);
  const [copiedAction, setCopiedAction] = useState(false);

  const repo = repos.find(r => r.id === selectedRepoId) || repos[0];
  const repoScans = scans.filter(s => s.repositoryId === repo.id);
  const repoFindings = findings.filter(f => f.repositoryId === repo.id);
  const inspectedScan = repoScans.find(s => s.id === inspectScanId);

  const handleDownloadSarif = (scan: typeof repoScans[0]) => {
    const sarif = generateSarifReport(repo.name, scan.commitSha, repoFindings);
    const blob = new Blob([JSON.stringify(sarif, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gatesentry-${repo.name}-${scan.commitSha.slice(0, 7)}.sarif.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actionYamlSnippet = `name: GateSentry CI Security Scan
on: [push, pull_request]

jobs:
  gatesentry-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run GateSentry Scanner
        uses: gatesentry/action@v1
        with:
          token: \${{ secrets.GATESENTRY_TOKEN }}
          fail-on: "high"`;

  const copyYaml = () => {
    navigator.clipboard.writeText(actionYamlSnippet);
    setCopiedAction(true);
    setTimeout(() => setCopiedAction(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Repository Header */}
      <div>
        <button
          onClick={() => setActiveView('repositories')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Repositories</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-lg shadow-black/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GitFork className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{repo.name}</h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-2 text-slate-300 border border-border-subtle">
                  {repo.provider}
                </span>
                {repo.lastExitCode === 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold font-mono">
                    PASSING
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[11px] font-bold font-mono">
                    BUILD BLOCKED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                <span>default branch: <strong className="text-slate-300">{repo.defaultBranch}</strong></span>
                <span>•</span>
                <span>{repoScans.length} total scan runs</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsScanSimulatorOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Run On-Demand Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border-subtle gap-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'overview' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview & Health
          {activeTab === 'overview' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab('scans')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'scans' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Scan Run History ({repoScans.length})
          {activeTab === 'scans' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab('findings')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'findings' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Flagged Findings ({repoFindings.length})
          {activeTab === 'findings' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Health summary */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle">
              <h3 className="text-sm font-semibold text-white mb-2">Current Branch Guardrail Status</h3>
              <p className="text-xs text-slate-400 mb-4">
                GateSentry is actively enforcing zero-secret and high-CVE gating on this repository.
              </p>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-200 font-medium">Secret Leak Prevention</span>
                  </div>
                  <span className="text-xs font-mono text-slate-300">
                    {repoFindings.filter(f => f.findingType === 'SECRET' && !f.isSuppressed).length === 0
                      ? 'Protected (0 Leaks)'
                      : `${repoFindings.filter(f => f.findingType === 'SECRET' && !f.isSuppressed).length} Leaks Detected`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="text-xs text-slate-200 font-medium">SCA Dependency Vulnerabilities</span>
                  </div>
                  <span className="text-xs font-mono text-slate-300">
                    {repoFindings.filter(f => f.findingType === 'CVE' && !f.isSuppressed).length} Active CVEs
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-xs text-slate-200 font-medium">License Compliance</span>
                  </div>
                  <span className="text-xs font-mono text-slate-300">
                    {repoFindings.filter(f => f.findingType === 'LICENSE').length} Denied Licenses
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: GitHub Action snippet */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">GitHub Action Integration</span>
                <button
                  onClick={copyYaml}
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-white transition-colors"
                >
                  {copiedAction ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAction ? 'Copied' : 'Copy YAML'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Drop this workflow into <code>.github/workflows/security.yml</code> to enforce gates on PRs.
              </p>
              <pre className="p-3.5 rounded-xl bg-background border border-border-subtle font-mono text-[11px] text-slate-300 overflow-x-auto">
                {actionYamlSnippet}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Scan Run History */}
      {activeTab === 'scans' && (
        <div className="rounded-2xl bg-surface-1 border border-border-subtle overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-slate-400 uppercase font-mono text-[11px] bg-surface-2/40">
                <th className="py-3 px-4">Exit Code</th>
                <th className="py-3 px-4">Commit & Branch</th>
                <th className="py-3 px-4">Trigger</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Findings</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 font-mono">
              {repoScans.map(s => (
                <tr key={s.id} className="hover:bg-surface-2/60 transition-colors">
                  <td className="py-3 px-4">
                    {s.exitCode === 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>exit 0 (PASS)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[11px] font-bold">
                        <XCircle className="w-3 h-3" />
                        <span>exit 1 (FAIL)</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-white font-semibold font-sans mr-2">{s.branch}</span>
                    <span className="text-slate-400 text-[11px]">({s.commitSha.slice(0, 7)})</span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300">{s.triggeredBy}</td>
                  <td className="py-3 px-4 text-slate-400">{(s.scanDurationMs / 1000).toFixed(2)}s</td>
                  <td className="py-3 px-4">
                    <span className="text-red-400 font-bold mr-2">{s.secretsCount} Secrets</span>
                    <span className="text-orange-400 font-bold">{s.vulnsCount} CVEs</span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => setInspectScanId(s.id)}
                      className="px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-surface-elevated text-indigo-300 hover:text-white transition-colors text-xs font-sans"
                    >
                      Inspect Logs
                    </button>
                    <button
                      onClick={() => handleDownloadSarif(s)}
                      className="p-1 rounded-lg bg-surface-2 hover:bg-surface-elevated text-slate-400 hover:text-white transition-colors"
                      title="Download SARIF report"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Findings */}
      {activeTab === 'findings' && (
        <div className="rounded-2xl bg-surface-1 border border-border-subtle overflow-hidden">
          <div className="divide-y divide-border-subtle/50">
            {repoFindings.map(f => (
              <div
                key={f.id}
                onClick={() => {
                  setSelectedFindingId(f.id);
                  setActiveView('findings');
                }}
                className="p-4 hover:bg-surface-2/60 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className={`w-5 h-5 shrink-0 ${f.severity === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {f.ruleName}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                        f.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {f.severity}
                      </span>
                      {f.isSuppressed && (
                        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-amber-500/20 text-amber-400">
                          WAIVED
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      {f.filePath}:{f.lineStart} • {f.maskedSnippet}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan Inspector Modal */}
      {inspectedScan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-surface-elevated border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-1">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">Scan Run Inspector #{inspectedScan.id}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  inspectedScan.exitCode === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  Exit Code {inspectedScan.exitCode}
                </span>
              </div>
              <button
                onClick={() => setInspectScanId(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Branch: <strong>{inspectedScan.branch}</strong> ({inspectedScan.commitSha.slice(0, 8)})</span>
                <button
                  onClick={() => handleDownloadSarif(inspectedScan)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-elevated text-slate-200 border border-border-subtle transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download SARIF Report</span>
                </button>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Raw Terminal Output (ANSI Logs)
                </div>
                <pre className="p-4 rounded-xl bg-black border border-border-subtle font-mono text-xs text-slate-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {inspectedScan.rawTerminalLogs}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
