import React, { useState } from 'react';
import { FileCheck2, AlertCircle, X } from 'lucide-react';
import { useGateSentryStore } from '../../lib/store';
import { WaiverCategory } from '../../types';

interface RequestWaiverModalProps {
  store: ReturnType<typeof useGateSentryStore>;
}

export const RequestWaiverModal: React.FC<RequestWaiverModalProps> = ({ store }) => {
  const { 
    isWaiverModalOpen, 
    setIsWaiverModalOpen, 
    waiverTargetFinding, 
    submitWaiverRequest 
  } = store;

  const [category, setCategory] = useState<WaiverCategory>('TEST_FIXTURE');
  const [justification, setJustification] = useState('');
  const [validDays, setValidDays] = useState(30);

  if (!isWaiverModalOpen || !waiverTargetFinding) return null;

  const isValid = justification.trim().length >= 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    submitWaiverRequest(waiverTargetFinding, category, justification.trim(), validDays);
    setJustification('');
    setIsWaiverModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-surface-elevated border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-surface-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Request Security Policy Waiver</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {waiverTargetFinding.ruleName} ({waiverTargetFinding.repositoryName})
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWaiverModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Finding Reference Box */}
          <div className="p-3 rounded-xl bg-surface-2 border border-border-subtle font-mono text-[11px] text-slate-300">
            <div className="text-slate-400 mb-1">Target Violation:</div>
            <div className="text-red-300 font-bold">{waiverTargetFinding.maskedSnippet}</div>
            <div className="text-slate-400 text-[10px] mt-0.5">{waiverTargetFinding.filePath}:{waiverTargetFinding.lineStart}</div>
          </div>

          {/* Justification Category */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Justification Reason Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="TEST_FIXTURE">Test Fixture / Mock Data (Non-production credential)</option>
              <option value="FALSE_POSITIVE">False Positive (Safe string flagged erroneously)</option>
              <option value="UPSTREAM_PATCH_PENDING">Upstream Patch Pending (Vendor patch awaited)</option>
              <option value="COMPENSATING_CONTROL">Compensating Security Control in Place</option>
            </select>
          </div>

          {/* Justification Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-medium">Detailed Engineering Justification</label>
              <span className={`text-[10px] font-mono ${justification.length < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {justification.length} / 20 min chars
              </span>
            </div>
            <textarea
              rows={3}
              value={justification}
              onChange={e => setJustification(e.target.value)}
              placeholder="Explain why this exception is safe to permit in CI pipelines. Detail compensating controls or link ticket..."
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Waiver Validity Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {[7, 14, 30, 90].map(days => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setValidDays(days)}
                  className={`py-2 rounded-lg text-center font-mono text-xs font-semibold transition-all ${
                    validDays === days
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-surface-2 text-slate-400 border border-border-subtle hover:text-white'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Submission Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setIsWaiverModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`px-4 py-2 rounded-xl font-semibold text-xs shadow-md transition-all ${
                isValid
                  ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-amber-600/25 active:scale-95'
                  : 'bg-surface-2 text-slate-500 cursor-not-allowed border border-border-subtle'
              }`}
            >
              Submit Waiver Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
