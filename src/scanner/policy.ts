import { Finding, Policy, Suppression } from '../types';

export interface PolicyEvaluationResult {
  exitCode: 0 | 1 | 2;
  passed: boolean;
  totalViolations: number;
  breachingFindings: Finding[];
  waivedFindings: Finding[];
  policySummary: {
    secretsBreached: boolean;
    cveSeverityBreached: boolean;
    cvssThresholdBreached: boolean;
    licenseBreached: boolean;
  };
}

const SEVERITY_WEIGHT: Record<string, number> = {
  'CRITICAL': 4,
  'HIGH': 3,
  'MEDIUM': 2,
  'LOW': 1,
  'INFO': 0,
};

export function evaluatePolicy(
  findings: Finding[],
  policy: Policy,
  activeSuppressions: Suppression[] = []
): PolicyEvaluationResult {
  const activeWaiverFingerprints = new Set(
    activeSuppressions
      .filter(s => s.status === 'APPROVED' && new Date(s.expiresAt) > new Date())
      .map(s => s.fingerprint)
  );

  const breachingFindings: Finding[] = [];
  const waivedFindings: Finding[] = [];

  let secretsBreached = false;
  let cveSeverityBreached = false;
  let cvssThresholdBreached = false;
  let licenseBreached = false;

  const minSeverityWeight = SEVERITY_WEIGHT[policy.minFailSeverity] || 3; // default HIGH

  for (const finding of findings) {
    // Check if this finding has an active waiver
    if (activeWaiverFingerprints.has(finding.fingerprint) || finding.isSuppressed) {
      finding.isSuppressed = true;
      waivedFindings.push(finding);
      continue;
    }

    let isBreach = false;

    // Rule 1: Fail on secrets
    if (finding.findingType === 'SECRET' && policy.failOnSecrets) {
      isBreach = true;
      secretsBreached = true;
    }

    // Rule 2: Fail on CVE severity or CVSS score
    if (finding.findingType === 'CVE') {
      const weight = SEVERITY_WEIGHT[finding.severity] || 0;
      if (weight >= minSeverityWeight) {
        isBreach = true;
        cveSeverityBreached = true;
      }
      const cvss = finding.metadata.cvssScore || 0;
      if (cvss >= policy.cvssThreshold) {
        isBreach = true;
        cvssThresholdBreached = true;
      }
    }

    // Rule 3: Fail on license denylist
    if (finding.findingType === 'LICENSE') {
      const spdx = finding.metadata.licenseSpdx || '';
      if (policy.licenseDenylist.includes(spdx)) {
        isBreach = true;
        licenseBreached = true;
      }
    }

    if (isBreach) {
      breachingFindings.push(finding);
    }
  }

  const passed = breachingFindings.length === 0;
  const exitCode: 0 | 1 | 2 = passed ? 0 : 1;

  return {
    exitCode,
    passed,
    totalViolations: breachingFindings.length,
    breachingFindings,
    waivedFindings,
    policySummary: {
      secretsBreached,
      cveSeverityBreached,
      cvssThresholdBreached,
      licenseBreached,
    }
  };
}
