import React from 'react';
import { 
  GitFork, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  FileText, 
  Terminal,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useGateSentryStore } from '../../lib/store';

interface DashboardViewProps {
  store: ReturnType<typeof useGateSentryStore>;
}

// 30-Day Mock Trend Data
const TREND_DATA = [
  { date: 'Aug 18', secrets: 3, cves: 8, suppressed: 1 },
  { date: 'Aug 22', secrets: 2, cves: 10, suppressed: 2 },
  { date: 'Aug 26', secrets: 4, cves: 9, suppressed: 2 },
  { date: 'Aug 30', secrets: 1, cves: 7, suppressed: 3 },
  { date: 'Sep 03', secrets: 3, cves: 6, suppressed: 3 },
  { date: 'Sep 07', secrets: 2, cves: 5, suppressed: 4 },
  { date: 'Sep 11', secrets: 3, cves: 4, suppressed: 4 },
  { date: 'Sep 15', secrets: 2, cves: 2, suppressed: 2 },
];

const THREAT_DATA = [
  { name: 'AWS Access Key', count: 4, color: '#EF4444' },
  { name: 'OpenAI Secret', count: 2, color: '#EF4444' },
  { name: 'axios ReDoS', count: 3, color: '#F97316' },
  { name: 'lodash Pollution', count: 2, color: '#F97316' },
  { name: 'AGPL-3.0 License', count: 1, color: '#F59E0B' },
];

export const DashboardView: React.FC<DashboardViewProps> = ({ store }) => {
  const { 
    repos, 
    findings, 
    scans, 
    setActiveView, 
    setSelectedRepoId, 
    setSelectedScanId,
    setIsScanSimulatorOpen 
  } = store;

  const totalScans = scans.length;
  const criticalHighFindings = findings.filter(f => (f.severity === 'CRITICAL' || f.severity === 'HIGH') && !f.isSuppressed);
  const passedScans = scans.filter(s => s.exitCode === 0).length;
  const passRate = totalScans > 0 ? ((passedScans / totalScans) * 100).toFixed(1) : '100';
  const failingReposCount = repos.filter(r => r.lastExitCode === 1).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Executive Security Posture</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Fleet Active
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time CI/CD guardrail telemetry, secret detection health, and vulnerability exposure metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsScanSimulatorOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Trigger CI Scan</span>
          </button>
          <button
            onClick={() => setActiveView('findings')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-elevated border border-border-subtle text-slate-300 hover:text-white text-xs font-medium transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>View All Findings</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Repositories */}
        <div 
          onClick={() => setActiveView('repositories')}
          className="p-5 rounded-2xl bg-surface-1 border border-border-subtle hover:border-border-focus transition-all duration-150 cursor-pointer group shadow-lg shadow-black/10"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Active Repositories</span>
            <GitFork className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-sans text-white">{repos.length}</span>
            <span className="text-xs font-mono text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100% Monitored
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono">
            <span className="text-emerald-400">{repos.length - failingReposCount} Passing</span>
            <span className="text-slate-400">•</span>
            <span className={failingReposCount > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}>
              {failingReposCount} Failing
            </span>
          </div>
        </div>

        {/* Card 2: Scans Evaluated */}
        <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-lg shadow-black/10">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Scans Evaluated</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-sans text-white">{totalScans * 28 + 142}</span>
            <span className="text-xs font-mono text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14% 7d
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>P95 Scan Latency: <strong>3.42s</strong></span>
          </div>
        </div>

        {/* Card 3: Critical & High Findings */}
        <div 
          onClick={() => setActiveView('findings')}
          className="p-5 rounded-2xl bg-surface-1 border border-border-subtle hover:border-red-500/40 transition-all duration-150 cursor-pointer group shadow-lg shadow-black/10"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Critical / High Findings</span>
            <ShieldAlert className="w-4 h-4 text-red-400 group-hover:animate-bounce" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-sans text-red-400">{criticalHighFindings.length}</span>
            <span className="text-xs font-mono text-emerald-400 flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5" /> -40% MTTR
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-mono">
            <span className="text-red-400 font-semibold">{findings.filter(f => f.findingType === 'SECRET' && !f.isSuppressed).length} Secrets</span>
            <span className="text-slate-400">•</span>
            <span className="text-orange-400">{findings.filter(f => f.findingType === 'CVE' && !f.isSuppressed).length} CVEs</span>
          </div>
        </div>

        {/* Card 4: Policy Pass Rate */}
        <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-lg shadow-black/10">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Policy Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-sans text-emerald-400">{passRate}%</span>
            <span className="text-xs font-mono text-slate-400">Target: 95%</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-mono">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>{scans.filter(s => s.exitCode === 1).length} Builds Blocked by Guardrail</span>
          </div>
        </div>
      </div>

      {/* Center Charts: 30-Day Exposure Curve & Threat Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Exposure Trend (Recharts Multi-Area) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-lg shadow-black/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Vulnerability & Leaked Secret Exposure Trend</h3>
              <p className="text-xs text-slate-400">Shift-left prevention impact across all branches over 30 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-slate-300">Secrets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-slate-300">High CVEs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-300">Waived</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSecrets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorCves" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C243B', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '8px', 
                    fontSize: '12px',
                    color: '#fff' 
                  }} 
                />
                <Area type="monotone" dataKey="secrets" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSecrets)" />
                <Area type="monotone" dataKey="cves" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorCves)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 Cols: Top Threat Breakdown */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-lg shadow-black/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Top Flagged Threat Types</h3>
            <p className="text-xs text-slate-400 mb-4">Most frequent blocked rule violations</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={THREAT_DATA} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C243B', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: '8px', 
                    fontSize: '12px' 
                  }} 
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {THREAT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Table: Real-Time CI/CD Scan Pipeline Feed */}
      <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle shadow-lg shadow-black/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Live Pipeline Scan Stream</h3>
            <p className="text-xs text-slate-400">Ingested runner executions & exit code guardrails</p>
          </div>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Streaming Real-Time</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-slate-400 uppercase font-mono text-[11px]">
                <th className="py-3 px-3">Result / Exit</th>
                <th className="py-3 px-3">Repository</th>
                <th className="py-3 px-3">Branch & Commit</th>
                <th className="py-3 px-3">Triggered By</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Violations</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40 font-mono">
              {scans.slice(0, 6).map(scan => (
                <tr 
                  key={scan.id}
                  onClick={() => {
                    setSelectedRepoId(scan.repositoryId);
                    setSelectedScanId(scan.id);
                    setActiveView('repo-detail');
                  }}
                  className="hover:bg-surface-2/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-3">
                    {scan.exitCode === 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>PASS (0)</span>
                      </span>
                    ) : scan.exitCode === 1 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[11px] font-bold">
                        <XCircle className="w-3 h-3" />
                        <span>FAIL (1)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[11px] font-bold">
                        <span>ERROR (2)</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 font-sans font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {scan.repositoryName}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-slate-300 font-sans mr-2">{scan.branch}</span>
                    <span className="text-slate-400 text-[11px]">({scan.commitSha.slice(0, 7)})</span>
                  </td>
                  <td className="py-3.5 px-3 font-sans text-slate-300">
                    {scan.triggeredBy}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">
                    {(scan.scanDurationMs / 1000).toFixed(2)}s
                  </td>
                  <td className="py-3.5 px-3">
                    {scan.secretsCount > 0 && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold mr-1.5">
                        {scan.secretsCount} Secret
                      </span>
                    )}
                    {scan.vulnsCount > 0 && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[10px] font-bold">
                        {scan.vulnsCount} CVE
                      </span>
                    )}
                    {scan.secretsCount === 0 && scan.vulnsCount === 0 && (
                      <span className="text-emerald-400 text-[11px]">0 Violations</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-sans group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
