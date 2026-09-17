import React, { useState } from 'react';
import { 
  GitFork, 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Terminal, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useGateSentryStore } from '../../lib/store';
import { Repository } from '../../types';

interface RepositoriesViewProps {
  store: ReturnType<typeof useGateSentryStore>;
}

export const RepositoriesView: React.FC<RepositoriesViewProps> = ({ store }) => {
  const { 
    repos, 
    setSelectedRepoId, 
    setActiveView, 
    connectRepository, 
    setIsScanSimulatorOpen 
  } = store;

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'passing' | 'failing'>('all');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoProvider, setNewRepoProvider] = useState<'github' | 'gitlab' | 'bitbucket'>('github');

  const filteredRepos = repos.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === 'passing') return matchesSearch && r.lastExitCode === 0;
    if (filterStatus === 'failing') return matchesSearch && r.lastExitCode === 1;
    return matchesSearch;
  });

  const handleCreateRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;
    const repo = connectRepository(newRepoName.trim(), newRepoProvider);
    setNewRepoName('');
    setIsConnectModalOpen(false);
    setSelectedRepoId(repo.id);
    setActiveView('repo-detail');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Repository Fleet</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-surface-2 text-slate-300 border border-border-subtle">
              {repos.length} Connected
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage monitored git repositories, branch policies, and continuous pipeline guardrails.
          </p>
        </div>

        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Repository</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-surface-1 border border-border-subtle">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by repository name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-xs text-white placeholder-slate-400 focus:outline-none focus:border-border-focus"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStatus === 'all' ? 'bg-surface-elevated text-white border border-border-focus' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({repos.length})
          </button>
          <button
            onClick={() => setFilterStatus('passing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStatus === 'passing' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Passing ({repos.filter(r => r.lastExitCode === 0).length})
          </button>
          <button
            onClick={() => setFilterStatus('failing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterStatus === 'failing' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Failing ({repos.filter(r => r.lastExitCode === 1).length})
          </button>
        </div>
      </div>

      {/* Repositories Table / Grid */}
      <div className="rounded-2xl bg-surface-1 border border-border-subtle overflow-hidden shadow-lg shadow-black/10">
        <div className="divide-y divide-border-subtle/50">
          {filteredRepos.map(repo => (
            <div
              key={repo.id}
              onClick={() => {
                setSelectedRepoId(repo.id);
                setActiveView('repo-detail');
              }}
              className="p-4 sm:p-5 hover:bg-surface-2/60 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Left Details */}
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-all shrink-0">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {repo.name}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-2 text-slate-400 border border-border-subtle">
                      {repo.provider}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                    <span>branch: <strong className="text-slate-300">{repo.defaultBranch}</strong></span>
                    <span>•</span>
                    <span>Last scan: {repo.lastScannedAt ? new Date(repo.lastScannedAt).toLocaleTimeString() : 'Never'}</span>
                  </div>
                </div>
              </div>

              {/* Center Posture Pill */}
              <div className="flex items-center gap-4">
                <div>
                  {repo.lastExitCode === 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PASSING (exit 0)</span>
                    </span>
                  ) : repo.lastExitCode === 1 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold font-mono">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>FAILING (exit 1)</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">NOT SCANNED YET</span>
                  )}
                </div>

                {/* Findings Counter */}
                <div className="flex items-center gap-1.5">
                  {repo.openFindingsCount.critical > 0 && (
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-xs font-bold">
                      {repo.openFindingsCount.critical} Crit
                    </span>
                  )}
                  {repo.openFindingsCount.high > 0 && (
                    <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono text-xs font-bold">
                      {repo.openFindingsCount.high} High
                    </span>
                  )}
                  {repo.openFindingsCount.critical === 0 && repo.openFindingsCount.high === 0 && (
                    <span className="text-xs text-emerald-400 font-mono">0 Blocker Findings</span>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}

          {filteredRepos.length === 0 && (
            <div className="p-12 text-center">
              <GitFork className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-sm text-slate-300 font-medium">No repositories match your filter</div>
              <div className="text-xs text-slate-400 mt-1">Try changing your search term or clear the filter.</div>
            </div>
          )}
        </div>
      </div>

      {/* Connect Repo Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-elevated border border-border-subtle rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-white mb-1">Connect Git Repository</h2>
            <p className="text-xs text-slate-400 mb-4">
              Add a new repository to activate GateSentry shift-left guardrails.
            </p>

            <form onSubmit={handleCreateRepo} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Repository Name</label>
                <input
                  type="text"
                  placeholder="e.g. billing-microservice"
                  value={newRepoName}
                  onChange={e => setNewRepoName(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Git Provider</label>
                <select
                  value={newRepoProvider}
                  onChange={e => setNewRepoProvider(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="github">GitHub</option>
                  <option value="gitlab">GitLab</option>
                  <option value="bitbucket">Bitbucket</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
                >
                  Connect & Inspect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
