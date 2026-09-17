import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, GitFork, SlidersHorizontal, KeyRound, Terminal, X, ArrowRight } from 'lucide-react';
import { useGateSentryStore } from '../../lib/store';

interface CommandPaletteProps {
  store: ReturnType<typeof useGateSentryStore>;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ store }) => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    repos, 
    findings, 
    setActiveView, 
    setSelectedFindingId,
    setSelectedRepoId,
    setIsScanSimulatorOpen 
  } = store;

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredRepos = repos.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
  const filteredFindings = findings.filter(f => 
    f.ruleName.toLowerCase().includes(query.toLowerCase()) || 
    f.ruleId.toLowerCase().includes(query.toLowerCase()) ||
    f.filePath.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-surface-elevated border border-border-focus/60 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-border-subtle flex items-center gap-3 bg-surface-1/50">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            placeholder="Search repositories, findings, rule IDs (e.g. AWS, axios, checkout-api)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button 
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-4 text-xs">
          {/* Quick Actions */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-2 mb-1.5">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setIsScanSimulatorOpen(true);
                }}
                className="p-2.5 rounded-lg bg-surface-2 hover:bg-surface-2/80 border border-border-subtle flex items-center gap-2 text-slate-200 hover:text-white transition-all text-left"
              >
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Run Interactive Scan</span>
              </button>
              <button
                onClick={() => {
                  setIsCommandPaletteOpen(false);
                  setActiveView('policies');
                }}
                className="p-2.5 rounded-lg bg-surface-2 hover:bg-surface-2/80 border border-border-subtle flex items-center gap-2 text-slate-200 hover:text-white transition-all text-left"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Configure Policy Engine</span>
              </button>
            </div>
          </div>

          {/* Repositories */}
          {filteredRepos.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-2 mb-1.5">
                Repositories ({filteredRepos.length})
              </div>
              <div className="space-y-1">
                {filteredRepos.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRepoId(r.id);
                      setActiveView('repo-detail');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full p-2 rounded-lg hover:bg-surface-2 flex items-center justify-between text-slate-300 hover:text-white transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <GitFork className="w-4 h-4 text-indigo-400" />
                      <span className="font-medium text-white">{r.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">branch: {r.defaultBranch}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Findings */}
          {filteredFindings.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-2 mb-1.5">
                Flagged Findings ({filteredFindings.length})
              </div>
              <div className="space-y-1">
                {filteredFindings.map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setSelectedFindingId(f.id);
                      setActiveView('findings');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full p-2 rounded-lg hover:bg-surface-2 flex items-center justify-between text-slate-300 hover:text-white transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <ShieldAlert className={`w-4 h-4 shrink-0 ${f.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`} />
                      <div className="truncate">
                        <span className="font-medium text-white mr-2">{f.ruleName}</span>
                        <span className="text-slate-400 text-[11px] font-mono">{f.filePath}:{f.lineStart}</span>
                      </div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                      f.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {f.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Hotkeys */}
        <div className="p-3 border-t border-border-subtle bg-surface-1/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with <kbd className="px-1 py-0.5 rounded bg-surface-2 text-slate-300">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-surface-2 text-slate-300">↓</kbd></span>
          <span>Close with <kbd className="px-1 py-0.5 rounded bg-surface-2 text-slate-300">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
};
