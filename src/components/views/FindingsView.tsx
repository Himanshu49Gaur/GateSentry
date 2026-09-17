import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ExternalLink, 
  X, 
  Copy, 
  Check, 
  Terminal, 
  ChevronRight, 
  AlertTriangle,
  FileCheck2
} from 'lucide-react';
import { useGateSentryStore } from '../../lib/store';
import { Finding, SeverityLevel, FindingCategory } from '../../types';

interface FindingsViewProps {
  store: ReturnType<typeof useGateSentryStore>;
}

export const FindingsView: React.FC<FindingsViewProps> = ({ store }) => {
  const { 
    findings, 
    selectedFindingId, 
    setSelectedFindingId, 
    openWaiverModalForFinding 
  } = store;

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [copiedCode, setCopiedCode] = useState(false);

  const activeDrawerFinding = findings.find(f => f.id === selectedFindingId);

  const filteredFindings = findings.filter(f => {
    const matchesSearch = 
      f.ruleName.toLowerCase().includes(search.toLowerCase()) ||
      f.filePath.toLowerCase().includes(search.toLowerCase()) ||
      (f.repositoryName && f.repositoryName.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType === 'ALL' || f.findingType === selectedType;
    const matchesSeverity = selectedSeverity === 'ALL' || f.severity === selectedSeverity;

    return matchesSearch && matchesType && matchesSeverity;
  });

  const handleCopyFix = (cmd?: string) => {
    if (!cmd) return;
    navigator.clipboard.writeText(cmd);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Vulnerabilities & Secret Findings</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              {findings.filter(f => !f.isSuppressed).length} Active Blockers
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise-wide vulnerability posture, high-entropy secret leaks, and license violations.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-2xl bg-surface-1 border border-border-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search findings, packages, files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-xs text-white placeholder-slate-400 focus:outline-none focus:border-border-focus"
          />
        </div>

        {/* Type & Severity Selectors */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Finding Type */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="SECRET">Secrets Only</option>
            <option value="CVE">CVEs (SCA) Only</option>
            <option value="LICENSE">License Violations</option>
          </select>

          {/* Severity */}
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      <div className="rounded-2xl bg-surface-1 border border-border-subtle overflow-hidden shadow-lg shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-slate-400 uppercase font-mono text-[11px] bg-surface-2/40">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Finding Name</th>
                <th className="py-3 px-4">Repository</th>
                <th className="py-3 px-4">File Path & Line</th>
                <th className="py-3 px-4">Evidence Snippet</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 font-mono">
              {filteredFindings.map(f => (
                <tr 
                  key={f.id}
                  onClick={() => setSelectedFindingId(f.id)}
                  className="hover:bg-surface-2/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                      f.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : f.severity === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {f.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {f.ruleName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {f.repositoryName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {f.filePath}:{f.lineStart}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                    {f.maskedSnippet}
                  </td>
                  <td className="py-3.5 px-4">
                    {f.isSuppressed ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        WAIVED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">
                        ACTIVE BLOCK
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-indigo-400 hover:text-indigo-300 text-xs font-sans group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                      <span>Triage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredFindings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                    <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <div className="text-sm text-slate-300 font-medium">No findings match your criteria</div>
                    <div className="text-xs text-slate-500 mt-1">Try broadening your search or filter options.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER-01: Slide-In Finding Triage Drawer */}
      {activeDrawerFinding && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl bg-surface-elevated border-l border-border-subtle h-screen shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div className="p-5 border-b border-border-subtle flex items-start justify-between bg-surface-1">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                      activeDrawerFinding.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    }`}>
                      {activeDrawerFinding.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Rule ID: {activeDrawerFinding.ruleId}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {activeDrawerFinding.ruleName}
                  </h2>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    Repo: <strong>{activeDrawerFinding.repositoryName}</strong> • {activeDrawerFinding.filePath}:{activeDrawerFinding.lineStart}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFindingId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-5 space-y-6">
                {/* Masked Code Evidence Block */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
                    <span>Masked Code Evidence Snippet</span>
                    <span className="text-[11px] font-mono text-emerald-400">Sensitive Token Redacted</span>
                  </div>
                  <div className="p-4 rounded-xl bg-black border border-border-subtle font-mono text-xs text-slate-200">
                    <div className="text-slate-500 text-[11px] mb-1">
                      // {activeDrawerFinding.filePath} (Line {activeDrawerFinding.lineStart})
                    </div>
                    <div className="p-2 rounded bg-red-500/10 border-l-2 border-red-500 text-red-200 break-all">
                      {activeDrawerFinding.maskedSnippet}
                    </div>
                  </div>
                </div>

                {/* CVSS & Vulnerability Intelligence */}
                {activeDrawerFinding.metadata.cvssScore && (
                  <div className="p-4 rounded-xl bg-surface-2 border border-border-subtle space-y-2">
                    <div className="text-xs font-semibold text-white flex items-center justify-between">
                      <span>CVSS v3.1 Intelligence Score</span>
                      <span className="text-sm font-bold text-red-400 font-mono">
                        {activeDrawerFinding.metadata.cvssScore} / 10.0
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Vector: {activeDrawerFinding.metadata.cvssVector}
                    </div>
                    {activeDrawerFinding.metadata.fixedVersion && (
                      <div className="text-xs text-emerald-400 font-mono">
                        Safe Remediation Target: {activeDrawerFinding.metadata.fixedVersion}
                      </div>
                    )}
                  </div>
                )}

                {/* Remediation Playbook */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-white uppercase tracking-wider">
                    Remediation Playbook (Step-by-Step)
                  </div>
                  <div className="p-4 rounded-xl bg-surface-2 border border-border-subtle text-xs text-slate-300 leading-relaxed">
                    {activeDrawerFinding.metadata.remediationGuide}
                  </div>

                  {activeDrawerFinding.metadata.quickFixCommand && (
                    <div className="p-3 rounded-xl bg-surface-1 border border-border-subtle">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                        <span>Quick Fix Command</span>
                        <button
                          onClick={() => handleCopyFix(activeDrawerFinding.metadata.quickFixCommand)}
                          className="flex items-center gap-1 text-indigo-400 hover:text-white transition-colors"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="p-2 rounded bg-black font-mono text-xs text-slate-200 select-all overflow-x-auto">
                        $ {activeDrawerFinding.metadata.quickFixCommand}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-border-subtle bg-surface-1 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  openWaiverModalForFinding(activeDrawerFinding);
                  setSelectedFindingId(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold active:scale-95 transition-all"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Request Temporary Waiver</span>
              </button>

              <button
                onClick={() => setSelectedFindingId(null)}
                className="px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-elevated text-slate-300 hover:text-white text-xs font-medium border border-border-subtle transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
