import React, { useState } from 'react';
import { 
  Sparkles, 
  GitFork, 
  KeyRound, 
  Terminal, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  Activity,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGateSentryStore } from '../../lib/store';

interface OnboardingViewProps {
  store: ReturnType<typeof useGateSentryStore>;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ store }) => {
  const { 
    setActiveView, 
    generateCiToken, 
    triggerLiveScan, 
    repos 
  } = store;

  const [step, setStep] = useState(1);
  const [selectedOrgName, setSelectedOrgName] = useState('Acme-Engineering');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const handleGenerateStepToken = () => {
    const token = generateCiToken('Onboarding-Quickstart-Token', null);
    setGeneratedToken(token);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleTestVerifyScan = () => {
    setIsVerifying(true);
    setTimeout(() => {
      // Run scan on sample clean files
      triggerLiveScan(
        repos[0].id,
        [
          { path: 'src/index.ts', content: 'export const hello = "world";\nconsole.log(hello);' },
          { path: 'package.json', content: '{\n  "name": "sample",\n  "dependencies": {\n    "express": "^4.18.2"\n  }\n}' }
        ],
        'main'
      );
      setIsVerifying(false);
      setVerifiedSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 1800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quickstart Onboarding Wizard</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome to GateSentry DevSecOps
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Set up automated CI/CD security enforcement guardrails in four simple steps.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between relative px-6">
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-border-subtle z-0" />
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="relative z-10 flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs font-mono transition-all ${
              step === s
                ? 'bg-indigo-600 text-white shadow-glow border-2 border-indigo-400'
                : step > s
                ? 'bg-emerald-500 text-white'
                : 'bg-surface-2 text-slate-400 border border-border-subtle'
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className="text-[11px] font-medium text-slate-400 mt-2">
              {s === 1 ? 'Connect' : s === 2 ? 'CI Token' : s === 3 ? 'Pipeline' : 'Verify'}
            </span>
          </div>
        ))}
      </div>

      {/* Step Cards */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface-1 border border-border-subtle shadow-2xl shadow-black/20">
        {/* Step 1: Connect Git Org */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-white mb-1">Step 1: Connect Git Organization</h2>
              <p className="text-xs text-slate-400">
                Authorize GateSentry to scan pull requests and enforce status checks on your repositories.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">GitHub Enterprise / Cloud App</div>
                  <div className="text-[11px] text-slate-400">Read access to code diffs & PR status checks</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                Connected
              </span>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
              >
                <span>Continue to CI Token</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Generate Runner Token */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-white mb-1">Step 2: Generate Ingestion Runner Token</h2>
              <p className="text-xs text-slate-400">
                Your CI runner uses this scoped machine token to authenticate and transmit SARIF security telemetry.
              </p>
            </div>

            {!generatedToken ? (
              <div className="p-6 rounded-xl bg-surface-2 border border-border-subtle text-center space-y-3">
                <KeyRound className="w-8 h-8 text-indigo-400 mx-auto" />
                <div className="text-xs text-slate-300 font-medium">No runner token generated yet</div>
                <button
                  onClick={handleGenerateStepToken}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md"
                >
                  Generate Token Secret
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="text-xs font-bold text-amber-300">Your Generated CI Runner Secret:</div>
                <div className="p-2.5 rounded bg-black font-mono text-xs text-slate-100 select-all break-all border border-border-subtle">
                  {generatedToken}
                </div>
                <button
                  onClick={() => handleCopy(generatedToken)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-xs transition-all"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? 'Copied' : 'Copy Secret'}</span>
                </button>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!generatedToken}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  generatedToken
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95'
                    : 'bg-surface-2 text-slate-500 cursor-not-allowed border border-border-subtle'
                }`}
              >
                <span>Continue to Pipeline Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pipeline Snippet */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-white mb-1">Step 3: Add GitHub Actions Workflow</h2>
              <p className="text-xs text-slate-400">
                Commit this file to <code>.github/workflows/security.yml</code> in your repository.
              </p>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-black border border-border-subtle font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
{`name: GateSentry CI Security Scan
on: [push, pull_request]

jobs:
  gatesentry-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run GateSentry Scanner
        uses: gatesentry/action@v1
        with:
          token: \${{ secrets.GATESENTRY_TOKEN }}
          fail-on: "high"`}
              </pre>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md active:scale-95 transition-all"
              >
                <span>Continue to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Verification */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-150 text-center py-4">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Step 4: Verify First Scan Execution</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Test the end-to-end integration by triggering a simulated CI runner execution.
              </p>
            </div>

            <div className="py-6 flex flex-col items-center justify-center">
              {isVerifying ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-full bg-indigo-600/20 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-400 animate-spin mx-auto">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div className="text-xs font-mono text-indigo-300">
                    Listening for incoming runner SARIF payload...
                  </div>
                </div>
              ) : verifiedSuccess ? (
                <div className="space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-glow-pass">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="text-sm font-bold text-emerald-400">
                    Verification Complete! Exit Code 0 (Passed)
                  </div>
                  <div className="text-xs text-slate-400 max-w-sm mx-auto">
                    First scan ingested successfully. GateSentry is now actively guarding your repositories.
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleTestVerifyScan}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  <span>Simulate Incoming CI Scan</span>
                </button>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-border-subtle">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setActiveView('dashboard')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md active:scale-95 transition-all"
              >
                Go to Executive Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
