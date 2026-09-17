import React, { useEffect } from 'react';
import { useGateSentryStore } from './lib/store';
import { Topbar } from './components/shell/Topbar';
import { Sidebar } from './components/shell/Sidebar';
import { CommandPalette } from './components/shell/CommandPalette';
import { DashboardView } from './components/views/DashboardView';
import { RepositoriesView } from './components/views/RepositoriesView';
import { RepoDetailView } from './components/views/RepoDetailView';
import { FindingsView } from './components/views/FindingsView';
import { WaiversView } from './components/views/WaiversView';
import { PolicyStudioView } from './components/views/PolicyStudioView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { SettingsView } from './components/views/SettingsView';
import { OnboardingView } from './components/views/OnboardingView';
import { RequestWaiverModal } from './components/modals/RequestWaiverModal';
import { LiveScanSimulatorModal } from './components/modals/LiveScanSimulatorModal';
import { 
  LayoutDashboard, 
  GitFork, 
  ShieldAlert, 
  FileCheck2, 
  SlidersHorizontal 
} from 'lucide-react';

export function App() {
  const store = useGateSentryStore();
  const { activeView, setActiveView, isSidebarCollapsed, toggleSidebar } = store;

  // Keyboard shortcut (Ctrl+B / Cmd+B) to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Global Topbar */}
      <Topbar store={store} />

      <div className="flex flex-1 pt-16">
        {/* Global Sidebar (Desktop/Tablet) */}
        <Sidebar store={store} />

        {/* Main Content Viewport with dynamic offset to guarantee ZERO overlap with sidebar */}
        <div 
          className={`flex-1 min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
          }`}
        >
          <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto pb-20 md:pb-8 overflow-x-hidden">
            {activeView === 'dashboard' && <DashboardView store={store} />}
            {activeView === 'repositories' && <RepositoriesView store={store} />}
            {activeView === 'repo-detail' && <RepoDetailView store={store} />}
            {activeView === 'findings' && <FindingsView store={store} />}
            {activeView === 'waivers' && <WaiversView store={store} />}
            {activeView === 'policies' && <PolicyStudioView store={store} />}
            {activeView === 'audit-logs' && <AuditLogsView store={store} />}
            {activeView === 'settings' && <SettingsView store={store} />}
            {activeView === 'onboarding' && <OnboardingView store={store} />}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-surface-1 border-t border-border-subtle z-40 flex items-center justify-around px-2">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeView === 'dashboard' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveView('repositories')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeView === 'repositories' || activeView === 'repo-detail' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>Repos</span>
        </button>
        <button
          onClick={() => setActiveView('findings')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeView === 'findings' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Findings</span>
        </button>
        <button
          onClick={() => setActiveView('waivers')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeView === 'waivers' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Waivers</span>
        </button>
        <button
          onClick={() => setActiveView('policies')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeView === 'policies' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Policy</span>
        </button>
      </nav>

      {/* Global Modals & Dialogs */}
      <CommandPalette store={store} />
      <RequestWaiverModal store={store} />
      <LiveScanSimulatorModal store={store} />
    </div>
  );
}

export default App;
