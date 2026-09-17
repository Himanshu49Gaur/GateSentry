import { useState, useEffect } from 'react';
import {
  Organization,
  User,
  Repository,
  Finding,
  ScanExecution,
  Policy,
  Suppression,
  CiRunnerToken,
  AuditLog,
  ActiveView,
  UserRole
} from '../types';
import { executeScan, FileToScan } from '../scanner/engine';

// Initial Seed Data mirroring PostgreSQL Schema from BACKEND_SCHEMA.md
const INITIAL_ORG: Organization = {
  id: 'org-acme-corp',
  name: 'Acme Global Corporation',
  slug: 'acme-corp',
  planTier: 'Enterprise DevSecOps',
  ssoEnabled: true,
  ssoDomain: 'acme.com',
  settings: {
    requireMfa: true,
    defaultWaiverMaxDays: 90,
    notifyOnCriticalSecret: true,
  },
  createdAt: '2026-01-10T08:00:00Z',
};

const INITIAL_USER: User = {
  id: 'usr-david-kim',
  email: 'david.kim@acme.com',
  fullName: 'David Kim',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&fit=crop&q=80',
  role: 'APPSEC_ADMIN',
  orgId: 'org-acme-corp',
};

const INITIAL_REPOS: Repository[] = [
  {
    id: 'repo-checkout-api',
    organizationId: 'org-acme-corp',
    name: 'checkout-api',
    provider: 'github',
    defaultBranch: 'main',
    cloneUrl: 'https://github.com/acme/checkout-api.git',
    isActive: true,
    lastScannedAt: '2026-09-15T20:45:12Z',
    lastExitCode: 1,
    openFindingsCount: {
      critical: 1,
      high: 1,
      medium: 0,
      low: 0,
    },
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'repo-payment-service',
    organizationId: 'org-acme-corp',
    name: 'payment-service',
    provider: 'github',
    defaultBranch: 'main',
    cloneUrl: 'https://github.com/acme/payment-service.git',
    isActive: true,
    lastScannedAt: '2026-09-15T21:10:00Z',
    lastExitCode: 1,
    openFindingsCount: {
      critical: 1,
      high: 0,
      medium: 1,
      low: 0,
    },
    createdAt: '2026-02-15T12:00:00Z',
  },
  {
    id: 'repo-auth-core',
    organizationId: 'org-acme-corp',
    name: 'auth-core',
    provider: 'gitlab',
    defaultBranch: 'main',
    cloneUrl: 'https://gitlab.com/acme/auth-core.git',
    isActive: true,
    lastScannedAt: '2026-09-15T19:30:00Z',
    lastExitCode: 0,
    openFindingsCount: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'repo-analytics-worker',
    organizationId: 'org-acme-corp',
    name: 'analytics-worker',
    provider: 'github',
    defaultBranch: 'main',
    cloneUrl: 'https://github.com/acme/analytics-worker.git',
    isActive: true,
    lastScannedAt: '2026-09-15T18:15:00Z',
    lastExitCode: 0, // Passed with active waiver
    openFindingsCount: {
      critical: 0,
      high: 0,
      medium: 1,
      low: 0,
    },
    createdAt: '2026-04-10T14:00:00Z',
  },
];

const INITIAL_POLICY: Policy = {
  id: 'pol-global',
  organizationId: 'org-acme-corp',
  repositoryId: null,
  version: '1.0.0',
  failOnSecrets: true,
  minFailSeverity: 'HIGH',
  cvssThreshold: 7.0,
  entropyThreshold: 4.5,
  scanGitHistory: false,
  licenseDenylist: ['AGPL-3.0', 'GPL-3.0', 'SSPL-1.0'],
  ignorePaths: ['tests/**', 'docs/**', '**/*.test.ts'],
  updatedAt: '2026-09-10T11:00:00Z',
};

const INITIAL_FINDINGS: Finding[] = [
  {
    id: 'f-aws-key-01',
    scanExecutionId: 'scan-run-101',
    repositoryId: 'repo-checkout-api',
    repositoryName: 'checkout-api',
    findingType: 'SECRET',
    severity: 'CRITICAL',
    fingerprint: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    ruleId: 'GATESENTRY-SEC-AWS-KEY',
    ruleName: 'AWS Access Key ID',
    filePath: 'src/config/aws.ts',
    lineStart: 24,
    lineEnd: 24,
    maskedSnippet: 'const AWS_ACCESS_KEY = "AKIA****************";',
    rawSnippetPreview: 'const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";',
    isSuppressed: false,
    metadata: {
      entropyScore: 4.82,
      providerDocUrl: 'https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html',
      remediationGuide: 'Immediately revoke this key in AWS IAM Console. Purge from git history using git-filter-repo, and re-inject credentials via AWS Secrets Manager or environment secrets.',
      quickFixCommand: 'git reset HEAD~1 && git checkout -- src/config/aws.ts',
    },
    detectedAt: '2026-09-15T20:45:12Z',
  },
  {
    id: 'f-cve-axios-02',
    scanExecutionId: 'scan-run-101',
    repositoryId: 'repo-checkout-api',
    repositoryName: 'checkout-api',
    findingType: 'CVE',
    severity: 'HIGH',
    fingerprint: 'cve_2021_3749_axios_checkout_api',
    ruleId: 'CVE-2021-3749',
    ruleName: 'axios CVE-2021-3749 (ReDoS)',
    filePath: 'package.json',
    lineStart: 18,
    lineEnd: 18,
    maskedSnippet: '"axios": "0.21.1"',
    isSuppressed: false,
    metadata: {
      cveId: 'CVE-2021-3749',
      cvssScore: 7.5,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
      packageName: 'axios',
      installedVersion: '0.21.1',
      fixedVersion: '>= 0.21.2',
      remediationGuide: 'Upgrade axios to version >= 0.21.2 (Run: `npm install axios@latest`)',
      quickFixCommand: 'npm install axios@latest',
    },
    detectedAt: '2026-09-15T20:45:12Z',
  },
  {
    id: 'f-openai-key-03',
    scanExecutionId: 'scan-run-102',
    repositoryId: 'repo-payment-service',
    repositoryName: 'payment-service',
    findingType: 'SECRET',
    severity: 'CRITICAL',
    fingerprint: 'sk_openai_payment_service_worker',
    ruleId: 'GATESENTRY-SEC-OPENAI-KEY',
    ruleName: 'OpenAI API Secret Key',
    filePath: 'worker/ai_agent.py',
    lineStart: 12,
    lineEnd: 12,
    maskedSnippet: 'OPENAI_KEY = "sk-proj-****************************************"',
    rawSnippetPreview: 'OPENAI_KEY = "sk-proj-4j7xK9mP1qRt8vW3yZaBcDeFgHiJkLmNoPqRsTuVwXyZ"',
    isSuppressed: false,
    metadata: {
      entropyScore: 4.95,
      providerDocUrl: 'https://platform.openai.com/api-keys',
      remediationGuide: 'Delete key immediately in OpenAI dashboard -> API Keys to prevent unauthorized API quota consumption.',
      quickFixCommand: 'git checkout HEAD~1 -- worker/ai_agent.py',
    },
    detectedAt: '2026-09-15T21:10:00Z',
  },
  {
    id: 'f-requests-cve-04',
    scanExecutionId: 'scan-run-104',
    repositoryId: 'repo-analytics-worker',
    repositoryName: 'analytics-worker',
    findingType: 'CVE',
    severity: 'MEDIUM',
    fingerprint: 'requests_cve_2023_32681_analytics',
    ruleId: 'CVE-2023-32681',
    ruleName: 'requests CVE-2023-32681 (Header Leak)',
    filePath: 'requirements.txt',
    lineStart: 7,
    lineEnd: 7,
    maskedSnippet: 'requests==2.28.1',
    isSuppressed: true, // Suppressed by active waiver
    suppressionId: 'sup-01',
    metadata: {
      cveId: 'CVE-2023-32681',
      cvssScore: 6.1,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
      packageName: 'requests',
      installedVersion: '2.28.1',
      fixedVersion: '>= 2.31.0',
      remediationGuide: 'Upgrade requests in requirements.txt to >= 2.31.0',
      quickFixCommand: 'pip install --upgrade requests>=2.31.0',
    },
    detectedAt: '2026-09-15T18:15:00Z',
  },
];

const INITIAL_SUPPRESSIONS: Suppression[] = [
  {
    id: 'sup-01',
    organizationId: 'org-acme-corp',
    repositoryId: 'repo-analytics-worker',
    repositoryName: 'analytics-worker',
    fingerprint: 'requests_cve_2023_32681_analytics',
    ruleId: 'CVE-2023-32681',
    findingTitle: 'requests CVE-2023-32681 in requirements.txt',
    reasonCategory: 'UPSTREAM_PATCH_PENDING',
    justification: 'Internal batch processing script running in isolated VPC without external redirect surfaces. Patch scheduled for Sprint 42.',
    status: 'APPROVED',
    requestedByUserId: 'usr-maya-lin',
    requestedByUserName: 'Maya Lin',
    requestedByUserAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&fit=crop&q=80',
    approvedByUserId: 'usr-david-kim',
    approvedByUserName: 'David Kim (AppSec)',
    expiresAt: '2026-10-15T00:00:00Z',
    createdAt: '2026-09-15T18:20:00Z',
  },
  {
    id: 'sup-02',
    organizationId: 'org-acme-corp',
    repositoryId: 'repo-checkout-api',
    repositoryName: 'checkout-api',
    fingerprint: 'cve_2021_3749_axios_checkout_api',
    ruleId: 'CVE-2021-3749',
    findingTitle: 'axios CVE-2021-3749 (ReDoS)',
    reasonCategory: 'TEST_FIXTURE',
    justification: 'This service validates request schemas on edge before axios is invoked. ReDoS vector is neutralized by AWS WAF regex limits.',
    status: 'PENDING_APPROVAL',
    requestedByUserId: 'usr-alex-chen',
    requestedByUserName: 'Alex Chen (DevOps)',
    requestedByUserAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&fit=crop&q=80',
    expiresAt: '2026-10-01T00:00:00Z',
    createdAt: '2026-09-15T21:05:00Z',
  }
];

const INITIAL_SCANS: ScanExecution[] = [
  {
    id: 'scan-run-101',
    repositoryId: 'repo-checkout-api',
    repositoryName: 'checkout-api',
    commitSha: '8a1f3c2b4d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a',
    branch: 'feature/checkout-v2',
    ciProvider: 'github-actions',
    triggeredBy: 'Maya Lin (PR #42)',
    exitCode: 1, // FAILED
    scanDurationMs: 4250,
    secretsCount: 1,
    vulnsCount: 1,
    licenseViolationsCount: 0,
    rawTerminalLogs: `[!] CRITICAL: AWS Access Key ID detected in src/config/aws.ts:24\n[!] HIGH: axios CVE-2021-3749 in package.json:18\n✖ BUILD BLOCKED: Security threshold exceeded. Failing CI runner step. (exit code 1)`,
    scannerVersion: '1.0.0',
    createdAt: '2026-09-15T20:45:12Z',
  },
  {
    id: 'scan-run-102',
    repositoryId: 'repo-payment-service',
    repositoryName: 'payment-service',
    commitSha: 'f1b209c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2',
    branch: 'main',
    ciProvider: 'github-actions',
    triggeredBy: 'David Kim (Push)',
    exitCode: 1, // FAILED
    scanDurationMs: 3820,
    secretsCount: 1,
    vulnsCount: 0,
    licenseViolationsCount: 0,
    rawTerminalLogs: `[!] CRITICAL: OpenAI API Secret Key in worker/ai_agent.py:12\n✖ BUILD BLOCKED: Security threshold exceeded. (exit code 1)`,
    scannerVersion: '1.0.0',
    createdAt: '2026-09-15T21:10:00Z',
  },
  {
    id: 'scan-run-103',
    repositoryId: 'repo-auth-core',
    repositoryName: 'auth-core',
    commitSha: 'c4d90ea1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
    branch: 'main',
    ciProvider: 'gitlab-ci',
    triggeredBy: 'Alex Chen (Merge Request #10)',
    exitCode: 0, // PASSED
    scanDurationMs: 2110,
    secretsCount: 0,
    vulnsCount: 0,
    licenseViolationsCount: 0,
    rawTerminalLogs: `✔ All security policies satisfied. Zero secrets or critical vulnerabilities detected.\n✔ BUILD PERMITTED: (exit code 0)`,
    scannerVersion: '1.0.0',
    createdAt: '2026-09-15T19:30:00Z',
  },
  {
    id: 'scan-run-104',
    repositoryId: 'repo-analytics-worker',
    repositoryName: 'analytics-worker',
    commitSha: '3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    branch: 'main',
    ciProvider: 'github-actions',
    triggeredBy: 'CI Scheduled Scan',
    exitCode: 0, // PASSED WITH WAIVER
    scanDurationMs: 1980,
    secretsCount: 0,
    vulnsCount: 1,
    licenseViolationsCount: 0,
    rawTerminalLogs: `[WAIVED] requests CVE-2023-32681 has active approved waiver.\n✔ BUILD PERMITTED: All policy violations covered by active waivers. (exit code 0)`,
    scannerVersion: '1.0.0',
    createdAt: '2026-09-15T18:15:00Z',
  },
];

const INITIAL_TOKENS: CiRunnerToken[] = [
  {
    id: 'tok-01',
    organizationId: 'org-acme-corp',
    name: 'GitHub-Actions-Production-Runner',
    tokenPrefix: 'gs_live_9f83a',
    maskedToken: 'gs_live_9f83a************************************************',
    createdAt: '2026-02-01T10:00:00Z',
    lastUsedAt: '2026-09-15T21:10:00Z',
    expiresAt: '2027-02-01T00:00:00Z',
    isRevoked: false,
  },
  {
    id: 'tok-02',
    organizationId: 'org-acme-corp',
    name: 'GitLab-CI-Staging-Cluster',
    tokenPrefix: 'gs_live_4b21c',
    maskedToken: 'gs_live_4b21c************************************************',
    createdAt: '2026-03-15T14:30:00Z',
    lastUsedAt: '2026-09-15T19:30:00Z',
    expiresAt: '2026-12-31T00:00:00Z',
    isRevoked: false,
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    organizationId: 'org-acme-corp',
    actorEmail: 'david.kim@acme.com',
    actorName: 'David Kim (AppSec)',
    eventCategory: 'WAIVER_APPROVED',
    resourceType: 'SUPPRESSION',
    resourceId: 'sup-01',
    diff: {
      before: { status: 'PENDING_APPROVAL' },
      after: { status: 'APPROVED', approvedBy: 'david.kim@acme.com', validDays: 30 }
    },
    ipAddress: '192.0.2.42',
    createdAt: '2026-09-15T18:25:00Z',
  },
  {
    id: 'log-02',
    organizationId: 'org-acme-corp',
    actorEmail: 'david.kim@acme.com',
    actorName: 'David Kim (AppSec)',
    eventCategory: 'POLICY_UPDATED',
    resourceType: 'POLICY',
    resourceId: 'pol-global',
    diff: {
      before: { cvssThreshold: 8.0 },
      after: { cvssThreshold: 7.0 }
    },
    ipAddress: '192.0.2.42',
    createdAt: '2026-09-10T11:00:00Z',
  }
];

export function useGateSentryStore() {
  const [org] = useState<Organization>(INITIAL_ORG);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isScanSimulatorOpen, setIsScanSimulatorOpen] = useState<boolean>(false);
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState<boolean>(false);
  const [waiverTargetFinding, setWaiverTargetFinding] = useState<Finding | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('gs_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('gs_sidebar_collapsed', JSON.stringify(next));
      return next;
    });
  };

  // Entities state
  const [repos, setRepos] = useState<Repository[]>(() => {
    const saved = localStorage.getItem('gs_repos');
    return saved ? JSON.parse(saved) : INITIAL_REPOS;
  });

  const [findings, setFindings] = useState<Finding[]>(() => {
    const saved = localStorage.getItem('gs_findings');
    return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
  });

  const [scans, setScans] = useState<ScanExecution[]>(() => {
    const saved = localStorage.getItem('gs_scans');
    return saved ? JSON.parse(saved) : INITIAL_SCANS;
  });

  const [policy, setPolicy] = useState<Policy>(() => {
    const saved = localStorage.getItem('gs_policy');
    return saved ? JSON.parse(saved) : INITIAL_POLICY;
  });

  const [suppressions, setSuppressions] = useState<Suppression[]>(() => {
    const saved = localStorage.getItem('gs_suppressions');
    return saved ? JSON.parse(saved) : INITIAL_SUPPRESSIONS;
  });

  const [tokens, setTokens] = useState<CiRunnerToken[]>(() => {
    const saved = localStorage.getItem('gs_tokens');
    return saved ? JSON.parse(saved) : INITIAL_TOKENS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('gs_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('gs_repos', JSON.stringify(repos));
    localStorage.setItem('gs_findings', JSON.stringify(findings));
    localStorage.setItem('gs_scans', JSON.stringify(scans));
    localStorage.setItem('gs_policy', JSON.stringify(policy));
    localStorage.setItem('gs_suppressions', JSON.stringify(suppressions));
    localStorage.setItem('gs_tokens', JSON.stringify(tokens));
    localStorage.setItem('gs_audit_logs', JSON.stringify(auditLogs));
  }, [repos, findings, scans, policy, suppressions, tokens, auditLogs]);

  // Actions
  const switchRole = (newRole: UserRole) => {
    setUser(prev => ({ ...prev, role: newRole }));
  };

  const triggerLiveScan = (repoId: string, files: FileToScan[], branch = 'main') => {
    const repo = repos.find(r => r.id === repoId) || repos[0];
    const commitSha = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

    const { scanExecution, findings: newFindings } = executeScan(
      files,
      repo.id,
      repo.name,
      branch,
      commitSha,
      policy,
      suppressions
    );

    // Update scans
    setScans(prev => [scanExecution, ...prev]);

    // Update findings
    setFindings(prev => {
      // Retain existing findings from other repos, merge/replace this repo's findings
      const otherFindings = prev.filter(f => f.repositoryId !== repo.id);
      return [...newFindings, ...otherFindings];
    });

    // Update repository posture
    setRepos(prev => prev.map(r => {
      if (r.id === repo.id) {
        return {
          ...r,
          lastScannedAt: scanExecution.createdAt,
          lastExitCode: scanExecution.exitCode,
          openFindingsCount: {
            critical: newFindings.filter(f => f.severity === 'CRITICAL' && !f.isSuppressed).length,
            high: newFindings.filter(f => f.severity === 'HIGH' && !f.isSuppressed).length,
            medium: newFindings.filter(f => f.severity === 'MEDIUM' && !f.isSuppressed).length,
            low: newFindings.filter(f => f.severity === 'LOW' && !f.isSuppressed).length,
          }
        };
      }
      return r;
    }));

    return scanExecution;
  };

  const submitWaiverRequest = (
    finding: Finding,
    reasonCategory: any,
    justification: string,
    validDays: number
  ) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + validDays);

    const newSuppression: Suppression = {
      id: `sup-${Date.now()}`,
      organizationId: org.id,
      repositoryId: finding.repositoryId,
      repositoryName: finding.repositoryName || 'unknown-repo',
      fingerprint: finding.fingerprint,
      ruleId: finding.ruleId,
      findingTitle: `${finding.ruleName} in ${finding.filePath}`,
      reasonCategory,
      justification,
      status: 'PENDING_APPROVAL',
      requestedByUserId: user.id,
      requestedByUserName: user.fullName,
      requestedByUserAvatar: user.avatarUrl,
      expiresAt: expiry.toISOString(),
      createdAt: new Date().toISOString(),
    };

    setSuppressions(prev => [newSuppression, ...prev]);

    // Mark finding as pending
    setFindings(prev => prev.map(f => {
      if (f.id === finding.id) {
        return { ...f, suppressionId: newSuppression.id };
      }
      return f;
    }));

    // Record audit log
    const audit: AuditLog = {
      id: `log-${Date.now()}`,
      organizationId: org.id,
      actorEmail: user.email,
      actorName: user.fullName,
      eventCategory: 'WAIVER_REQUESTED',
      resourceType: 'SUPPRESSION',
      resourceId: newSuppression.id,
      diff: { after: { finding: finding.ruleName, justification } },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const approveWaiver = (waiverId: string) => {
    setSuppressions(prev => prev.map(s => {
      if (s.id === waiverId) {
        return {
          ...s,
          status: 'APPROVED',
          approvedByUserId: user.id,
          approvedByUserName: `${user.fullName} (${user.role})`
        };
      }
      return s;
    }));

    // Suppress the finding
    const sup = suppressions.find(s => s.id === waiverId);
    if (sup) {
      setFindings(prev => prev.map(f => {
        if (f.fingerprint === sup.fingerprint) {
          return { ...f, isSuppressed: true };
        }
        return f;
      }));

      // Record audit log
      const audit: AuditLog = {
        id: `log-${Date.now()}`,
        organizationId: org.id,
        actorEmail: user.email,
        actorName: user.fullName,
        eventCategory: 'WAIVER_APPROVED',
        resourceType: 'SUPPRESSION',
        resourceId: waiverId,
        diff: { before: { status: 'PENDING_APPROVAL' }, after: { status: 'APPROVED' } },
        ipAddress: '127.0.0.1',
        createdAt: new Date().toISOString(),
      };
      setAuditLogs(prev => [audit, ...prev]);
    }
  };

  const rejectWaiver = (waiverId: string, reason: string) => {
    setSuppressions(prev => prev.map(s => {
      if (s.id === waiverId) {
        return {
          ...s,
          status: 'REJECTED',
          rejectionReason: reason
        };
      }
      return s;
    }));

    const audit: AuditLog = {
      id: `log-${Date.now()}`,
      organizationId: org.id,
      actorEmail: user.email,
      actorName: user.fullName,
      eventCategory: 'WAIVER_REJECTED',
      resourceType: 'SUPPRESSION',
      resourceId: waiverId,
      diff: { after: { rejectionReason: reason } },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const updatePolicy = (updated: Policy) => {
    const oldPolicy = policy;
    setPolicy(updated);

    const audit: AuditLog = {
      id: `log-${Date.now()}`,
      organizationId: org.id,
      actorEmail: user.email,
      actorName: user.fullName,
      eventCategory: 'POLICY_UPDATED',
      resourceType: 'POLICY',
      resourceId: updated.id,
      diff: {
        before: { cvssThreshold: oldPolicy.cvssThreshold, failOnSecrets: oldPolicy.failOnSecrets },
        after: { cvssThreshold: updated.cvssThreshold, failOnSecrets: updated.failOnSecrets }
      },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const generateCiToken = (name: string, repositoryId?: string | null) => {
    const randHex = Math.random().toString(36).substring(2, 10);
    const tokenPrefix = `gs_live_${randHex.slice(0, 5)}`;
    const fullToken = `${tokenPrefix}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    const newToken: CiRunnerToken = {
      id: `tok-${Date.now()}`,
      organizationId: org.id,
      repositoryId: repositoryId || null,
      name,
      tokenPrefix,
      maskedToken: `${tokenPrefix}************************************************`,
      createdAt: new Date().toISOString(),
      isRevoked: false,
    };

    setTokens(prev => [newToken, ...prev]);

    const audit: AuditLog = {
      id: `log-${Date.now()}`,
      organizationId: org.id,
      actorEmail: user.email,
      actorName: user.fullName,
      eventCategory: 'TOKEN_CREATED',
      resourceType: 'CI_TOKEN',
      resourceId: newToken.id,
      diff: { after: { name, tokenPrefix } },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs(prev => [audit, ...prev]);

    return fullToken;
  };

  const revokeCiToken = (tokenId: string) => {
    setTokens(prev => prev.map(t => {
      if (t.id === tokenId) {
        return { ...t, isRevoked: true };
      }
      return t;
    }));

    const audit: AuditLog = {
      id: `log-${Date.now()}`,
      organizationId: org.id,
      actorEmail: user.email,
      actorName: user.fullName,
      eventCategory: 'TOKEN_REVOKED',
      resourceType: 'CI_TOKEN',
      resourceId: tokenId,
      diff: { after: { isRevoked: true } },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const connectRepository = (name: string, provider: any = 'github', defaultBranch = 'main') => {
    const newRepo: Repository = {
      id: `repo-${Math.random().toString(36).substring(2, 8)}`,
      organizationId: org.id,
      name,
      provider,
      defaultBranch,
      cloneUrl: `https://${provider}.com/acme/${name}.git`,
      isActive: true,
      lastScannedAt: null,
      openFindingsCount: { critical: 0, high: 0, medium: 0, low: 0 },
      createdAt: new Date().toISOString(),
    };

    setRepos(prev => [newRepo, ...prev]);

    const audit: AuditLog = {
      id: `log-${Date.now()}`,
      organizationId: org.id,
      actorEmail: user.email,
      actorName: user.fullName,
      eventCategory: 'REPO_CONNECTED',
      resourceType: 'REPOSITORY',
      resourceId: newRepo.id,
      diff: { after: { name, provider } },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs(prev => [audit, ...prev]);

    return newRepo;
  };

  const openWaiverModalForFinding = (finding: Finding) => {
    setWaiverTargetFinding(finding);
    setIsWaiverModalOpen(true);
  };

  return {
    org,
    user,
    switchRole,
    activeView,
    setActiveView,
    selectedRepoId,
    setSelectedRepoId,
    selectedFindingId,
    setSelectedFindingId,
    selectedScanId,
    setSelectedScanId,
    searchQuery,
    setSearchQuery,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isScanSimulatorOpen,
    setIsScanSimulatorOpen,
    isWaiverModalOpen,
    setIsWaiverModalOpen,
    waiverTargetFinding,
    openWaiverModalForFinding,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar,
    // Entities
    repos,
    findings,
    scans,
    policy,
    suppressions,
    tokens,
    auditLogs,
    // Methods
    triggerLiveScan,
    submitWaiverRequest,
    approveWaiver,
    rejectWaiver,
    updatePolicy,
    generateCiToken,
    revokeCiToken,
    connectRepository,
  };
}
