import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileCode, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useGateSentryStore } from '../../lib/store';
import { FileToScan } from '../../scanner/engine';

interface LiveScanSimulatorModalProps {
  store: ReturnType<typeof useGateSentryStore>;
}

const PRESETS = [
  {
    id: 'aws_leak',
    name: '🔴 Leak AWS Key & Axios ReDoS (Exit 1)',
    desc: 'Triggers Shannon entropy + regex secret detector + SCA vulnerability',
    files: [
      {
        path: 'src/config/aws.ts',
        content: `// AWS S3 client configuration
import { S3Client } from '@aws-sdk/client-s3';

// Leaked credentials committed by mistake
const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
const AWS_REGION = "us-east-1";

export const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
  }
});`
      },
      {
        path: 'package.json',
        content: `{
  "name": "payment-api",
  "version": "1.0.0",
  "dependencies": {
    "axios": "0.21.1",
    "express": "4.18.2"
  }
}`
      }
    ]
  },
  {
    id: 'openai_key',
    name: '🔴 OpenAI Secret Key in Python (Exit 1)',
    desc: 'Triggers sk-proj high-entropy secret signature',
    files: [
      {
        path: 'worker/agent.py',
        content: `import os

# OpenAI API Key hardcoded
OPENAI_API_KEY = "sk-proj-4j7xK9mP1qRt8vW3yZaBcDeFgHiJkLmNoPqRsTuVwXyZ"

def query_llm(prompt):
    return "response"`
      }
    ]
  },
  {
    id: 'clean_pass',
    name: '🟢 Clean Repository (Exit 0)',
    desc: 'Environment secrets and safe dependencies only',
    files: [
      {
        path: 'src/index.ts',
        content: `// Secure secret injection via environment variables
const apiKey = process.env.SERVICE_API_KEY;
if (!apiKey) {
  throw new Error("Missing SERVICE_API_KEY");
}
console.log("Service initialized securely.");`
      },
      {
        path: 'package.json',
        content: `{
  "name": "clean-app",
  "dependencies": {
    "axios": "^1.7.0",
    "express": "^4.19.2"
  }
}`
      }
    ]
  },
  {
    id: 'license_violation',
    name: '🟡 Restricted AGPL License (Exit 1)',
    desc: 'Denylisted open-source license trigger',
    files: [
      {
        path: 'package.json',
        content: `{
  "name": "document-service",
  "dependencies": {
    "pdf-creator-pro": "1.0.0"
  }
}`
      }
    ]
  }
];

export const LiveScanSimulatorModal: React.FC<LiveScanSimulatorModalProps> = ({ store }) => {
  const { 
    isScanSimulatorOpen, 
    setIsScanSimulatorOpen, 
    repos, 
    triggerLiveScan 
  } = store;

  const [selectedRepoId, setSelectedRepoId] = useState(repos[0]?.id || '');
  const [selectedPresetId, setSelectedPresetId] = useState(PRESETS[0].id);
  const [customPath, setCustomPath] = useState(PRESETS[0].files[0].path);
  const [customContent, setCustomContent] = useState(PRESETS[0].files[0].content);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<any>(null);

  if (!isScanSimulatorOpen) return null;

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = PRESETS.find(pr => pr.id === presetId);
    if (p && p.files.length > 0) {
      setCustomPath(p.files[0].path);
      setCustomContent(p.files[0].content);
    }
  };

  const handleRunScan = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const p = PRESETS.find(pr => pr.id === selectedPresetId);
      const files: FileToScan[] = p ? [...p.files] : [{ path: customPath, content: customContent }];
      
      // If user modified the first file, update it
      files[0] = { path: customPath, content: customContent };

      const result = triggerLiveScan(selectedRepoId, files, 'feature/test-branch');
      setLastScanResult(result);
      setIsExecuting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-surface-elevated border border-border-focus/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-surface-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Interactive CI/CD Scanner Playground</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                  Live Go/TS Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Execute real Shannon entropy & regex secret detection, SCA lookups, and policy exit code enforcement.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsScanSimulatorOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split View */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Controls & Code Input */}
          <div className="lg:col-span-6 space-y-4 text-xs">
            {/* Target Repo */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Target Repository Context</label>
              <select
                value={selectedRepoId}
                onChange={e => setSelectedRepoId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle text-white focus:outline-none"
              >
                {repos.map(r => (
                  <option key={r.id} value={r.id}>{r.name} (branch: {r.defaultBranch})</option>
                ))}
              </select>
            </div>

            {/* Test Presets */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Select Vulnerability Test Scenario</label>
              <div className="space-y-1.5">
                {PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`w-full p-2.5 rounded-xl text-left border transition-all ${
                      selectedPresetId === preset.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium shadow-sm'
                        : 'bg-surface-2 border-border-subtle text-slate-300 hover:text-white hover:bg-surface-2/80'
                    }`}
                  >
                    <div className="font-semibold text-xs">{preset.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Editor Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-slate-300">File to Scan</span>
                <input
                  type="text"
                  value={customPath}
                  onChange={e => setCustomPath(e.target.value)}
                  className="px-2 py-1 rounded bg-surface-2 border border-border-subtle font-mono text-[11px] text-indigo-300 w-52"
                />
              </div>
              <textarea
                rows={7}
                value={customContent}
                onChange={e => setCustomContent(e.target.value)}
                className="w-full p-3 rounded-xl bg-black border border-border-subtle font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed select-text"
              />
            </div>

            <button
              onClick={handleRunScan}
              disabled={isExecuting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all text-xs"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Files with GateSentry Engine...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Execute Security Scan</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Terminal Output & Exit Code */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Scanner Terminal Output (ANSI)
              </span>
              {lastScanResult && (
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold ${
                  lastScanResult.exitCode === 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {lastScanResult.exitCode === 0 ? 'exit 0 (PASS)' : 'exit 1 (BUILD BROKEN)'}
                </span>
              )}
            </div>

            <div className="flex-1 min-h-[360px] p-4 rounded-xl bg-black border border-border-subtle font-mono text-xs text-slate-200 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {lastScanResult ? (
                lastScanResult.rawTerminalLogs
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                  <Terminal className="w-8 h-8 mb-2 opacity-50" />
                  <span>Select a scenario and click "Execute Security Scan"</span>
                  <span className="text-[11px] text-slate-600 mt-1">Real-time entropy & lockfile analysis</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
