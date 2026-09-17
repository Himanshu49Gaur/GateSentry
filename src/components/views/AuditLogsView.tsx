import React, { useState } from 'react';
import { 
  History, 
  Download, 
  Search, 
  ShieldCheck, 
  User, 
  Calendar, 
  ArrowRight,
  Code
} from 'lucide-react';
import { useGateSentryStore } from '../../lib/store';

interface AuditLogsViewProps {
  store: ReturnType<typeof useGateSentryStore>;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ store }) => {
  const { auditLogs } = store;
  const [search, setSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter(l => 
    l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
    l.eventCategory.toLowerCase().includes(search.toLowerCase()) ||
    l.resourceType.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCsv = () => {
    const headers = ['id', 'timestamp', 'actor_email', 'event_category', 'resource_type', 'resource_id', 'ip_address'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.createdAt,
      l.actorEmail,
      l.eventCategory,
      l.resourceType,
      l.resourceId,
      l.ipAddress
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gatesentry-audit-soc2-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Audit Trail & Governance Logs</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SOC 2 Type II Certified
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable, cryptographically verifiable records of all policy modifications, waiver approvals, and token generations.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-elevated text-slate-200 hover:text-white border border-border-subtle text-xs font-semibold shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export Compliance Audit Package (CSV)</span>
        </button>
      </div>

      {/* Filter */}
      <div className="p-3.5 rounded-2xl bg-surface-1 border border-border-subtle flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit events, actors, or types..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-2 border border-border-subtle text-xs text-white placeholder-slate-400 focus:outline-none focus:border-border-focus"
          />
        </div>
        <div className="text-xs font-mono text-slate-400 hidden sm:block">
          {filteredLogs.length} immutable records
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl bg-surface-1 border border-border-subtle overflow-hidden shadow-lg shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-slate-400 uppercase font-mono text-[11px] bg-surface-2/40">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Event Category</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 font-mono">
              {filteredLogs.map(log => (
                <React.Fragment key={log.id}>
                  <tr 
                    onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                    className="hover:bg-surface-2/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-semibold text-white">{log.actorName}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{log.actorEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {log.eventCategory}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {log.resourceType}: <span className="text-slate-500">{log.resourceId.slice(0, 10)}...</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {log.ipAddress}
                    </td>
                    <td className="py-3.5 px-4 text-right text-indigo-400 hover:text-indigo-300 font-sans">
                      {expandedLogId === log.id ? 'Hide Diff' : 'View Diff'}
                    </td>
                  </tr>

                  {/* Expandable JSON Diff */}
                  {expandedLogId === log.id && (
                    <tr className="bg-black/60">
                      <td colSpan={6} className="p-4">
                        <div className="rounded-xl bg-surface-2 border border-border-subtle p-3 space-y-2">
                          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Code className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Payload State Diff</span>
                          </div>
                          <pre className="font-mono text-[11px] text-emerald-300 p-2 rounded bg-black overflow-x-auto">
                            {JSON.stringify(log.diff, null, 2)}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
