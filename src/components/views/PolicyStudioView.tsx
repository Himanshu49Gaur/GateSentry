import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Code2, 
  Play, 
  Save, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Copy,
  Plus,
  X
} from 'lucide-react';
import { useGateSentryStore } from '../../lib/store';
import { Policy, SeverityLevel } from '../../types';

interface PolicyStudioViewProps {
  store: ReturnType<typeof useGateSentryStore>;
}

export const PolicyStudioView: React.FC<PolicyStudioViewProps> = ({ store }) => {
  const { policy, updatePolicy, repos, scans } = store;

  const [formPolicy, setFormPolicy] = useState<Policy>({ ...policy });
  const [newLicense, setNewLicense] = useState('');
  const [newIgnorePath, setNewIgnorePath] = useState('');
  const [selectedSimRepoId, setSelectedSimRepoId] = useState(repos[0]?.id || '');
  const [dryRunResult, setDryRunResult] = useState<{ evaluated: number; blocked: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Generate live YAML string
  const generateYaml = (p: Policy) => {
    return `# GateSentry Security Policy Configuration (.gatesentry.yml)
version: "${p.version}"

fail_on:
  secrets: ${p.failOnSecrets}
  vulnerability_severity: "${p.minFailSeverity}"
  cvss_threshold: ${p.cvssThreshold.toFixed(1)}
  licenses:
${p.licenseDenylist.map(l => `    - "${l}"`).join('\n')}

scanner:
  secrets:
    entropy_threshold: ${p.entropyThreshold.toFixed(2)}
    scan_git_history: ${p.scanGitHistory}

ignore:
  paths:
${p.ignorePaths.map(path => `    - "${path}"`).join('\n')}
`;
  };

  const handleSave = () => {
    updatePolicy(formPolicy);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddLicense = () => {
    if (!newLicense.trim() || formPolicy.licenseDenylist.includes(newLicense.trim())) return;
    setFormPolicy(prev => ({
      ...prev,
      licenseDenylist: [...prev.licenseDenylist, newLicense.trim()]
    }));
    setNewLicense('');
  };

  const handleRemoveLicense = (lic: string) => {
    setFormPolicy(prev => ({
      ...prev,
      licenseDenylist: prev.licenseDenylist.filter(l => l !== lic)
    }));
  };

  const handleAddIgnore = () => {
    if (!newIgnorePath.trim() || formPolicy.ignorePaths.includes(newIgnorePath.trim())) return;
    setFormPolicy(prev => ({
      ...prev,
      ignorePaths: [...prev.ignorePaths, newIgnorePath.trim()]
    }));
    setNewIgnorePath('');
  };

  const handleRemoveIgnore = (path: string) => {
    setFormPolicy(prev => ({
      ...prev,
      ignorePaths: prev.ignorePaths.filter(p => p !== path)
    }));
  };

  const handleDryRun = () => {
    const targetScans = scans.filter(s => s.repositoryId === selectedSimRepoId);
    const count = targetScans.length;
    // Simulate how many would be blocked
    const blockedCount = formPolicy.failOnSecrets ? Math.max(1, count - 1) : 0;
    setDryRunResult({
      evaluated: count || 1,
      blocked: blockedCount,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Security Policy Studio</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-surface-2 text-slate-300 border border-border-subtle">
              Global Organization Baseline
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure automated build-breaking criteria, CVSS fail limits, and license compliance rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-4 h-4" /> Policy Published!
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Publish Policy Rules</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Controls (Left) vs Live Synchronized YAML (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive Form Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Secret Enforcement */}
          <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>Secret & Credential Detection Gate</span>
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border-subtle">
              <div>
                <div className="text-xs font-medium text-white">Fail Build on Secrets Detection</div>
                <div className="text-[11px] text-slate-400">Strictly blocks CI pipeline if high-entropy keys or cloud tokens are found</div>
              </div>
              <input
                type="checkbox"
                checked={formPolicy.failOnSecrets}
                onChange={e => setFormPolicy(prev => ({ ...prev, failOnSecrets: e.target.checked }))}
                className="w-4 h-4 rounded text-indigo-600 bg-surface-elevated border-border-subtle focus:ring-0 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span>Shannon Entropy Threshold: <strong className="text-indigo-400 font-mono">{formPolicy.entropyThreshold.toFixed(2)}</strong></span>
                <span className="text-[11px] text-slate-500 font-mono">Default: 4.50</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="6.0"
                step="0.05"
                value={formPolicy.entropyThreshold}
                onChange={e => setFormPolicy(prev => ({ ...prev, entropyThreshold: parseFloat(e.target.value) }))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>3.0 (Strict / Higher FP)</span>
                <span>4.5 (Optimal Balance)</span>
                <span>6.0 (Only Hex Keys)</span>
              </div>
            </div>
          </div>

          {/* Section 2: SCA & CVSS Gate */}
          <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-orange-400" />
              <span>Vulnerability (SCA) & CVSS Score Gate</span>
            </h3>

            {/* Min Severity */}
            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5">Minimum Failing CVE Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as SeverityLevel[]).map(sev => (
                  <button
                    type="button"
                    key={sev}
                    onClick={() => setFormPolicy(prev => ({ ...prev, minFailSeverity: sev }))}
                    className={`py-2 rounded-xl text-center font-mono text-xs font-semibold transition-all ${
                      formPolicy.minFailSeverity === sev
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        : 'bg-surface-2 text-slate-400 border border-border-subtle hover:text-white'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* CVSS Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                <span>CVSS Base Score Threshold: <strong className="text-orange-400 font-mono">{formPolicy.cvssThreshold.toFixed(1)} / 10.0</strong></span>
                <span className="text-[11px] text-slate-500 font-mono">Fails if CVSS &gt;= limit</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="10.0"
                step="0.1"
                value={formPolicy.cvssThreshold}
                onChange={e => setFormPolicy(prev => ({ ...prev, cvssThreshold: parseFloat(e.target.value) }))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 3: License Denylist */}
          <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle space-y-3">
            <h3 className="text-sm font-semibold text-white">Denied Open-Source Licenses</h3>
            <p className="text-xs text-slate-400">Dependencies with these SPDX licenses will immediately halt the build.</p>

            <div className="flex flex-wrap gap-2 mb-2">
              {formPolicy.licenseDenylist.map(lic => (
                <span
                  key={lic}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 text-slate-200 border border-border-subtle text-xs font-mono"
                >
                  <span>{lic}</span>
                  <button onClick={() => handleRemoveLicense(lic)} className="text-slate-400 hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add SPDX identifier (e.g. EUPL-1.2)..."
                value={newLicense}
                onChange={e => setNewLicense(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
              />
              <button
                onClick={handleAddLicense}
                className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-2 border border-border-subtle text-xs text-slate-200 hover:text-white"
              >
                Add License
              </button>
            </div>
          </div>

          {/* Section 4: Ignored Paths */}
          <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle space-y-3">
            <h3 className="text-sm font-semibold text-white">Excluded Paths (Glob Patterns)</h3>
            <p className="text-xs text-slate-400">Files matching these patterns are bypassed during secret scans.</p>

            <div className="flex flex-wrap gap-2 mb-2">
              {formPolicy.ignorePaths.map(p => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 text-slate-300 border border-border-subtle text-xs font-mono"
                >
                  <span>{p}</span>
                  <button onClick={() => handleRemoveIgnore(p)} className="text-slate-400 hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. mock_fixtures/**"
                value={newIgnorePath}
                onChange={e => setNewIgnorePath(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
              />
              <button
                onClick={handleAddIgnore}
                className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-2 border border-border-subtle text-xs text-slate-200 hover:text-white"
              >
                Add Path
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Synchronized YAML Preview & Dry-Run Simulator */}
        <div className="lg:col-span-5 space-y-5">
          {/* YAML Live Sync Box */}
          <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle flex flex-col justify-between h-[420px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-white font-mono">.gatesentry.yml</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Synchronized
              </span>
            </div>

            <pre className="flex-1 p-3.5 rounded-xl bg-black border border-border-subtle font-mono text-[11px] text-slate-300 overflow-auto leading-relaxed select-all">
              {generateYaml(formPolicy)}
            </pre>
          </div>

          {/* Test Policy Dry-Run Simulator */}
          <div className="p-5 rounded-2xl bg-surface-1 border border-border-subtle space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Test Policy Dry-Run Simulation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluate this draft policy against historical scan runs before publishing.
            </p>

            <div>
              <label className="block text-xs text-slate-300 font-medium mb-1.5">Target Repository for Simulation</label>
              <select
                value={selectedSimRepoId}
                onChange={e => setSelectedSimRepoId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-xs text-white focus:outline-none"
              >
                {repos.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.provider})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDryRun}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-surface-2 hover:bg-surface-elevated text-slate-200 hover:text-white border border-border-subtle text-xs font-semibold transition-all"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate Policy Impact</span>
            </button>

            {dryRunResult && (
              <div className="p-3 rounded-xl bg-surface-2 border border-border-subtle space-y-1.5 animate-in fade-in duration-150">
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Simulation Outcome</span>
                  <span className="text-amber-400 font-mono">{dryRunResult.blocked} / {dryRunResult.evaluated} Builds Blocked</span>
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  Under these rules, {dryRunResult.blocked} past execution(s) would have triggered build failures.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
