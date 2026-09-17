import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  Bell, 
  ChevronDown, 
  Activity, 
  Terminal, 
  ExternalLink,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useGateSentryStore } from '../../lib/store';
import { UserRole } from '../../types';

interface TopbarProps {
  store: ReturnType<typeof useGateSentryStore>;
}

export const Topbar: React.FC<TopbarProps> = ({ store }) => {
  const { 
    org, 
    user, 
    switchRole, 
    setIsCommandPaletteOpen, 
    setIsScanSimulatorOpen,
    suppressions,
    setActiveView,
    isSidebarCollapsed,
    toggleSidebar
  } = store;

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const pendingWaivers = suppressions.filter(s => s.status === 'PENDING_APPROVAL');

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'APPSEC_ADMIN', label: 'AppSec Admin (David)', desc: 'Can author policies & approve waivers' },
    { role: 'DEVOPS_ENGINEER', label: 'DevOps Lead (Alex)', desc: 'Manages CI runners & repo links' },
    { role: 'DEVELOPER', label: 'Software Engineer (Maya)', desc: 'Views triage guides & requests waivers' },
    { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full organization authority' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-1/90 backdrop-blur-md border-b border-border-subtle z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Brand Emblem, Sidebar Toggle & Org Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Prominent Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? "Expand Platform Navigation (Ctrl+B)" : "Collapse Platform Navigation (Ctrl+B)"}
          className="p-2 rounded-xl bg-surface-2 hover:bg-surface-elevated text-slate-300 hover:text-white border border-border-subtle transition-all flex items-center justify-center group shrink-0"
          aria-label="Toggle Sidebar"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          )}
        </button>

        <button 
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 group-hover:shadow-glow transition-all duration-200">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-indigo-200 transition-colors">GateSentry</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">CI/CD</span>
            </div>
          </div>
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-border-subtle hidden sm:block" />

        {/* Org Selector */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-2/60 border border-border-subtle text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-300 font-medium">{org.name}</span>
          <span className="text-[10px] text-slate-400 bg-surface-elevated px-1.5 py-0.5 rounded font-mono">Enterprise</span>
        </div>
      </div>

      {/* Center: Global Search (Cmd+K) */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-2/80 border border-border-subtle text-slate-400 hover:text-slate-200 hover:border-border-focus text-xs transition-all duration-150 group shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <span>Search repositories, findings, rules...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border-subtle font-mono text-[10px] text-slate-300">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Trigger Test Scan Button */}
        <button
          onClick={() => setIsScanSimulatorOpen(true)}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-medium transition-all shadow-sm active:scale-95"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Live Scan CLI Simulator</span>
        </button>

        {/* Live CI Runner Status Badge */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping-slow" />
          <span>Ingestion Live</span>
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-9 h-9 rounded-lg bg-surface-2/60 border border-border-subtle flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingWaivers.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center shadow-md">
                {pendingWaivers.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface-elevated border border-border-subtle shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-2">
                <span className="text-xs font-semibold text-white">Notifications</span>
                <span className="text-[10px] text-slate-400 font-mono">{pendingWaivers.length} pending</span>
              </div>
              {pendingWaivers.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
                  <span>All caught up! Zero pending alerts.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingWaivers.map(w => (
                    <div 
                      key={w.id} 
                      onClick={() => {
                        setActiveView('waivers');
                        setIsNotifOpen(false);
                      }}
                      className="p-2.5 rounded-lg bg-surface-2/70 hover:bg-surface-2 border border-border-subtle cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-slate-200">{w.findingTitle}</div>
                          <div className="text-[11px] text-slate-400">Requested by {w.requestedByUserName}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RBAC Role Switcher (Allows user to test all 4 personas) */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border-subtle hover:border-slate-600 transition-colors text-xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <div className="text-left hidden sm:block">
              <span className="text-slate-300 font-medium block leading-tight">{user.fullName.split(' ')[0]}</span>
              <span className="text-[10px] text-indigo-300 font-mono block leading-tight">{user.role.replace('_', ' ')}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-elevated border border-border-subtle shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-2 py-1 mb-1">
                Switch Persona / RBAC Role
              </div>
              {roles.map(r => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role);
                    setIsRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    user.role === r.role ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-surface-2'
                  }`}
                >
                  <div>
                    <div className="font-medium">{r.label}</div>
                    <div className="text-[10px] text-slate-400">{r.desc}</div>
                  </div>
                  {user.role === r.role && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
