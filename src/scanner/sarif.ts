import { Finding } from '../types';

/**
 * OASIS SARIF v2.1.0 report generator
 */
export function generateSarifReport(
  repoName: string,
  commitSha: string,
  findings: Finding[]
): Record<string, any> {
  return {
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "GateSentry",
            version: "1.0.0",
            informationUri: "https://github.com/gatesentry/scanner",
            rules: findings.map(f => ({
              id: f.ruleId,
              name: f.ruleName,
              shortDescription: {
                text: f.ruleName
              },
              fullDescription: {
                text: `GateSentry rule violation: ${f.ruleName} (${f.findingType})`
              },
              defaultConfiguration: {
                level: f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'error' : 'warning'
              }
            }))
          }
        },
        results: findings.map(f => ({
          ruleId: f.ruleId,
          level: f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'error' : 'warning',
          message: {
            text: `${f.ruleName}: ${f.metadata.remediationGuide}`
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: f.filePath,
                  uriBaseId: "%SRCROOT%"
                },
                region: {
                  startLine: f.lineStart,
                  endLine: f.lineEnd,
                  snippet: {
                    text: f.maskedSnippet
                  }
                }
              }
            }
          ]
        }))
      }
    ]
  };
}

/**
 * Formats rich ANSI-colored terminal stdout output mimicking the real CLI runner
 */
export function generateTerminalAnsiOutput(
  repoName: string,
  branch: string,
  commitSha: string,
  findings: Finding[],
  exitCode: 0 | 1 | 2,
  durationMs: number
): string {
  const lines: string[] = [];

  lines.push(`\x1b[38;5;99m╔══════════════════════════════════════════════════════════════╗\x1b[0m`);
  lines.push(`\x1b[38;5;99m║       GateSentry CI/CD Security Scanner & Policy Gate        ║\x1b[0m`);
  lines.push(`\x1b[38;5;99m╚══════════════════════════════════════════════════════════════╝\x1b[0m`);
  lines.push(`\x1b[90mRepository:  \x1b[37m${repoName}\x1b[0m`);
  lines.push(`\x1b[90mBranch:      \x1b[36m${branch}\x1b[0m \x1b[90m(commit: \x1b[33m${commitSha.slice(0, 8)}\x1b[90m)\x1b[0m`);
  lines.push(`\x1b[90mDuration:    \x1b[37m${(durationMs / 1000).toFixed(2)}s\x1b[0m`);
  lines.push(``);

  if (findings.length === 0) {
    lines.push(`\x1b[32m✔ All security policies satisfied. Zero secrets or critical vulnerabilities detected.\x1b[0m`);
    lines.push(`\x1b[90mResult: \x1b[1;32mPASSED (exit code 0)\x1b[0m`);
    return lines.join('\n');
  }

  lines.push(`\x1b[1mPolicy Violations Detected (${findings.length} findings):\x1b[0m`);
  lines.push(`────────────────────────────────────────────────────────────────`);

  findings.forEach((f, idx) => {
    const sevColor = f.severity === 'CRITICAL' ? '\x1b[1;31m' : f.severity === 'HIGH' ? '\x1b[1;33m' : '\x1b[34m';
    const tag = f.findingType === 'SECRET' ? '[SECRET LEAK]' : f.findingType === 'CVE' ? '[CVE ADVISORY]' : '[LICENSE]';
    
    lines.push(`\x1b[1m${idx + 1}. ${tag} \x1b[0m${sevColor}${f.severity}\x1b[0m - \x1b[37m${f.ruleName}\x1b[0m`);
    lines.push(`   \x1b[90mLocation:\x1b[0m \x1b[36m${f.filePath}:${f.lineStart}\x1b[0m`);
    lines.push(`   \x1b[90mEvidence:\x1b[0m \x1b[33m${f.maskedSnippet}\x1b[0m`);
    if (f.metadata.cvssScore) {
      lines.push(`   \x1b[90mCVSS:\x1b[0m     \x1b[31m${f.metadata.cvssScore}\x1b[0m \x1b[90m(${f.metadata.cvssVector || ''})\x1b[0m`);
    }
    lines.push(`   \x1b[90mAction:\x1b[0m   \x1b[32m${f.metadata.remediationGuide}\x1b[0m`);
    if (f.isSuppressed) {
      lines.push(`   \x1b[35m[WAIVED] Active waiver approved. Suppressed from blocking build.\x1b[0m`);
    }
    lines.push(``);
  });

  lines.push(`────────────────────────────────────────────────────────────────`);
  if (exitCode === 0) {
    lines.push(`\x1b[1;32m✔ BUILD PERMITTED: All policy violations are covered by active waivers. (exit code 0)\x1b[0m`);
  } else if (exitCode === 1) {
    lines.push(`\x1b[1;31m✖ BUILD BLOCKED: Security threshold exceeded. Failing CI runner step. (exit code 1)\x1b[0m`);
    lines.push(`\x1b[90mRemediate findings or request an AppSec waiver at: \x1b[34mhttps://app.gatesentry.io/findings\x1b[0m`);
  } else {
    lines.push(`\x1b[1;35m⚠ SCANNER ERROR: Configuration or runtime failure. (exit code 2)\x1b[0m`);
  }

  return lines.join('\n');
}
