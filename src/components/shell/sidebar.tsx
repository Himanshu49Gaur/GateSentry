import React from 'react';
import { 
  LayoutDashboard, 
  GitFork, 
  ShieldAlert, 
  FileCheck2, 
  SlidersHorizontal, 
  History, 
  KeyRound, 
  Sparkles,
  ChevronRight,
  Terminal,
  Copy,
  Check,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useGateSentryStore } from '../../lib/store';
import { ActiveView } from '../../types';

interface SidebarProps {
  store: ReturnType<typeof useGateSentryStore>;
}

export const Sidebar: React.FC<SidebarProps> = ({ store }) => {
  const { 
    activeView, 
    setActiveView, 
    repos, 
    findings, 
    suppressions,
    setIsScanSimulatorOpen,
    isSidebarCollapsed,
    toggleSidebar
  } = store;

  const [copied, setCopied] = React.useState(false);

  const activeFindingsCount = findings.filter(f => !f.isSuppressed).length;
  const pendingWaiversCount = suppressions.filter(s => s.status === 'PENDING_APPROVAL').length;

  const navItems: { id: ActiveView; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Executive Posture', icon: LayoutDashboard },
    { id: 'repositories', label: 'Repositories', icon: GitFork, badge: repos.length },
    { id: 'findings', label: 'Vulnerabilities & Secrets', icon: ShieldAlert, badge: activeFindingsCount, badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    { id: 'waivers', label: 'Waivers & Governance', icon: FileCheck2, badge: pendingWaiversCount, badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    { id: 'policies', label: 'Policy Engine Studio', icon: SlidersHorizontal },
    { id: 'audit-logs', label: 'Audit Trail (SOC 2)', icon: History },
    { id: 'settings', label: 'CI Tokens & Settings', icon: KeyRound },
  ];

  const handleCopyCli = () => {
    navigator.clipboard.writeText('gatesentry scan --fail-on=high');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside 
      className={`fixed top-16 left-0 bottom-0 bg-surface-1 border-r border-border-subtle flex flex-col justify-between z-30 transition-all duration-300 hidden md:flex ${
        isSidebarCollapsed ? 'w-16 p-2' : 'w-64 p-3.5'
      }`}
    >
      {/* Navigation Links */}
      <div className="space-y-1">
        {/* Header Strip with Collapse / Expand Button */}
        <div className={`flex items-center justify-between pb-2 mb-1 border-b border-border-subtle/60 ${isSidebarCollapsed ? 'justify-center' : 'px-2'}`}>
          {!isSidebarCollapsed && (
            <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
              Platform Navigation
            </span>
          )}
          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand Sidebar [Ctrl+B]" : "Collapse Sidebar to access whole dashboard [Ctrl+B]"}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-2 transition-colors ${isSidebarCollapsed ? 'w-full flex items-center justify-center' : ''}`}
            aria-label="Toggle Sidebar Navigation"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-indigo-400 hover:scale-110 transition-transform" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={isSidebarCollapsed ? `${item.label} ${item.badge ? `(${item.badge})` : ''}` : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 group relative ${
                isSidebarCollapsed 
                  ? 'justify-center p-2.5 my-1' 
                  : 'justify-between px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-surface-2/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'} transition-colors`} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </div>

              {!isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : (item.badgeColor || 'bg-surface-elevated text-slate-300')
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Dot badge on collapsed mode */}
              {isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                  item.id === 'findings' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
              )}
            </button>
          );
        })}

        {/* Guided Quickstart button */}
        <div className="pt-2">
          <button
            onClick={() => setActiveView('onboarding')}
            title={isSidebarCollapsed ? "Guided Setup Wizard" : undefined}
            className={`w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 ${
              isSidebarCollapsed
                ? 'justify-center p-2.5'
                : 'justify-between px-3 py-2.5'
            } ${
              activeView === 'onboarding'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 bg-surface-2/40 hover:bg-surface-2 border border-border-subtle'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              {!isSidebarCollapsed && <span>Guided Setup Wizard</span>}
            </div>
            {!isSidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="space-y-3 pt-3 border-t border-border-subtle">
        {/* CLI Scan Box */}
        {!isSidebarCollapsed ? (
          <div className="p-2.5 rounded-xl bg-surface-2 border border-border-subtle">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>CLI Engine v1.0.0</span>
              </span>
              <button 
                onClick={handleCopyCli} 
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy Command"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="bg-background/90 rounded px-2 py-1 font-mono text-[11px] text-slate-300 truncate">
              $ gatesentry scan
            </div>
          </div>
        ) : (
          <button
            onClick={handleCopyCli}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-surface-2 hover:bg-surface-elevated text-slate-400 hover:text-white border border-border-subtle transition-colors"
            title="Copy CLI Scan command: gatesentry scan"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        )}

        {/* Test Simulator Trigger Button */}
        <button
          onClick={() => setIsScanSimulatorOpen(true)}
          title={isSidebarCollapsed ? "Launch Scan Simulator" : undefined}
          className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-xs shadow-md shadow-indigo-600/20 active:scale-98 transition-all ${
            isSidebarCollapsed ? 'p-2.5' : 'py-2 px-3'
          }`}
        >
          <Terminal className="w-4 h-4 shrink-0" />
          {!isSidebarCollapsed && <span>Launch Scan Simulator</span>}
        </button>
      </div>
    </aside>
  );
};
