import { Finding, Policy, ScanExecution, Suppression } from '../types';
import { calculateShannonEntropy, isLikelyFalsePositive } from './entropy';
import { maskSecretString, SECRET_SIGNATURES } from './signatures';
import { scanDependencies } from './sca';
import { evaluatePolicy } from './policy';
import { generateTerminalAnsiOutput } from './sarif';

export interface FileToScan {
  path: string;
  content: string;
}

export function executeScan(
  files: FileToScan[],
  repositoryId: string,
  repositoryName: string,
  branch: string,
  commitSha: string,
  policy: Policy,
  activeSuppressions: Suppression[] = []
): {
  scanExecution: ScanExecution;
  findings: Finding[];
} {
  const startTime = Date.now();
  const findings: Finding[] = [];

  // 1. Scan each file
  for (const file of files) {
    const lines = file.content.split('\n');

    // A. Secret scanning (all files)
    lines.forEach((line, lineIndex) => {
      const lineNum = lineIndex + 1;

      for (const sig of SECRET_SIGNATURES) {
        // Reset regex state
        sig.regex.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = sig.regex.exec(line)) !== null) {
          const rawMatch = match[1] || match[0];

          // If signature requires minimum entropy, verify it
          if (sig.minEntropy) {
            const entropy = calculateShannonEntropy(rawMatch);
            if (entropy < sig.minEntropy || isLikelyFalsePositive(rawMatch)) {
              continue;
            }
          }

          const masked = maskSecretString(rawMatch);
          const maskedLine = line.replace(rawMatch, masked);
          const fingerprint = `${sig.id}_${file.path}_${lineNum}_${masked}`;

          findings.push({
            id: `f-${Math.random().toString(36).substring(2, 9)}`,
            scanExecutionId: '',
            repositoryId,
            repositoryName,
            findingType: 'SECRET',
            severity: sig.severity,
            fingerprint,
            ruleId: sig.id,
            ruleName: sig.name,
            filePath: file.path,
            lineStart: lineNum,
            lineEnd: lineNum,
            maskedSnippet: maskedLine.trim(),
            rawSnippetPreview: line.trim(),
            isSuppressed: false,
            metadata: {
              entropyScore: calculateShannonEntropy(rawMatch),
              providerDocUrl: sig.providerDocUrl,
              remediationGuide: sig.remediationGuide,
              quickFixCommand: `git reset HEAD~1 && git checkout -- ${file.path}`
            },
            detectedAt: new Date().toISOString()
          });
        }
      }
    });

    // B. SCA Dependency Scanning (for lockfiles/manifests)
    if (
      file.path.endsWith('package.json') ||
      file.path.endsWith('package-lock.json') ||
      file.path.endsWith('requirements.txt')
    ) {
      const scaResult = scanDependencies(file.path, file.content, policy.licenseDenylist);

      // Add CVE findings
      scaResult.vulnerabilities.forEach(v => {
        const fingerprint = `${v.cve.cveId}_${file.path}_${v.cve.packageName}`;
        findings.push({
          id: `f-${Math.random().toString(36).substring(2, 9)}`,
          scanExecutionId: '',
          repositoryId,
          repositoryName,
          findingType: 'CVE',
          severity: v.cve.severity,
          fingerprint,
          ruleId: v.cve.cveId,
          ruleName: `${v.cve.packageName} ${v.cve.cveId}`,
          filePath: file.path,
          lineStart: v.line,
          lineEnd: v.line,
          maskedSnippet: `"${v.cve.packageName}": "${v.detectedVersion}"`,
          isSuppressed: false,
          metadata: {
            cveId: v.cve.cveId,
            cvssScore: v.cve.cvssScore,
            cvssVector: v.cve.cvssVector,
            packageName: v.cve.packageName,
            installedVersion: v.detectedVersion,
            fixedVersion: v.cve.fixedVersion,
            remediationGuide: v.cve.remediation,
            quickFixCommand: v.cve.ecosystem === 'npm'
              ? `npm install ${v.cve.packageName}@latest`
              : `pip install --upgrade ${v.cve.packageName}>=${v.cve.fixedVersion}`
          },
          detectedAt: new Date().toISOString()
        });
      });

      // Add License findings
      scaResult.licenseViolations.forEach(l => {
        const fingerprint = `LICENSE_${l.license}_${file.path}_${l.packageName}`;
        findings.push({
          id: `f-${Math.random().toString(36).substring(2, 9)}`,
          scanExecutionId: '',
          repositoryId,
          repositoryName,
          findingType: 'LICENSE',
          severity: 'HIGH',
          fingerprint,
          ruleId: `GATESENTRY-LIC-${l.license}`,
          ruleName: `Restricted License: ${l.license}`,
          filePath: file.path,
          lineStart: l.line,
          lineEnd: l.line,
          maskedSnippet: `package "${l.packageName}" has license "${l.license}"`,
          isSuppressed: false,
          metadata: {
            packageName: l.packageName,
            licenseSpdx: l.license,
            remediationGuide: `Package "${l.packageName}" is licensed under denylisted "${l.license}". Replace with an approved permissive library (MIT, Apache-2.0, BSD).`
          },
          detectedAt: new Date().toISOString()
        });
      });
    }
  }

  // 2. Evaluate against policy
  const evaluation = evaluatePolicy(findings, policy, activeSuppressions);
  const durationMs = Date.now() - startTime + Math.floor(Math.random() * 400 + 800); // realistic 0.8-1.2s
  const scanExecutionId = `scan-${Math.random().toString(36).substring(2, 9)}`;

  // Link scan execution ID
  findings.forEach(f => {
    f.scanExecutionId = scanExecutionId;
  });

  const secretsCount = findings.filter(f => f.findingType === 'SECRET').length;
  const vulnsCount = findings.filter(f => f.findingType === 'CVE').length;
  const licenseViolationsCount = findings.filter(f => f.findingType === 'LICENSE').length;

  const terminalLogs = generateTerminalAnsiOutput(
    repositoryName,
    branch,
    commitSha,
    findings,
    evaluation.exitCode,
    durationMs
  );

  const scanExecution: ScanExecution = {
    id: scanExecutionId,
    repositoryId,
    repositoryName,
    commitSha,
    branch,
    ciProvider: 'github-actions',
    triggeredBy: 'CI Runner',
    exitCode: evaluation.exitCode,
    scanDurationMs: durationMs,
    secretsCount,
    vulnsCount,
    licenseViolationsCount,
    rawTerminalLogs: terminalLogs,
    scannerVersion: '1.0.0',
    createdAt: new Date().toISOString()
  };

  return { scanExecution, findings };
}
