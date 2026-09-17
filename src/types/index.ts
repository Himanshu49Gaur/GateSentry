// GateSentry Domain TypeScript Types

export type UserRole = 'SUPER_ADMIN' | 'APPSEC_ADMIN' | 'DEVOPS_ENGINEER' | 'DEVELOPER';

export type GitProvider = 'github' | 'gitlab' | 'bitbucket' | 'custom';

export type CiProviderType = 'github-actions' | 'gitlab-ci' | 'bitbucket-pipelines' | 'jenkins' | 'cli-local';

export type FindingCategory = 'SECRET' | 'CVE' | 'LICENSE';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type WaiverStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';

export type WaiverCategory = 'FALSE_POSITIVE' | 'TEST_FIXTURE' | 'UPSTREAM_PATCH_PENDING' | 'COMPENSATING_CONTROL';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  ssoEnabled: boolean;
  ssoDomain?: string;
  settings: {
    requireMfa: boolean;
    defaultWaiverMaxDays: number;
    notifyOnCriticalSecret: boolean;
  };
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: UserRole;
  orgId: string;
}

export interface Repository {
  id: string;
  organizationId: string;
  name: string;
  provider: GitProvider;
  defaultBranch: string;
  cloneUrl: string;
  isActive: boolean;
  lastScannedAt: string | null;
  lastExitCode?: 0 | 1 | 2;
  openFindingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  createdAt: string;
}

export interface Finding {
  id: string;
  scanExecutionId: string;
  repositoryId: string;
  repositoryName?: string;
  findingType: FindingCategory;
  severity: SeverityLevel;
  fingerprint: string;
  ruleId: string;
  ruleName: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  maskedSnippet: string;
  rawSnippetPreview?: string;
  isSuppressed: boolean;
  suppressionId?: string;
  metadata: {
    cveId?: string;
    cvssScore?: number;
    cvssVector?: string;
    packageName?: string;
    installedVersion?: string;
    fixedVersion?: string;
    entropyScore?: number;
    providerDocUrl?: string;
    licenseSpdx?: string;
    remediationGuide: string;
    quickFixCommand?: string;
  };
  detectedAt: string;
}

export interface ScanExecution {
  id: string;
  repositoryId: string;
  repositoryName: string;
  commitSha: string;
  branch: string;
  ciProvider: CiProviderType;
  triggeredBy: string;
  exitCode: 0 | 1 | 2; // 0=Pass, 1=Violation, 2=Error
  scanDurationMs: number;
  secretsCount: number;
  vulnsCount: number;
  licenseViolationsCount: number;
  sarifStorageKey?: string;
  rawTerminalLogs: string;
  scannerVersion: string;
  createdAt: string;
}

export interface Policy {
  id: string;
  organizationId: string;
  repositoryId?: string | null; // null = Org Global
  version: string;
  failOnSecrets: boolean;
  minFailSeverity: SeverityLevel;
  cvssThreshold: number;
  entropyThreshold: number;
  scanGitHistory: boolean;
  licenseDenylist: string[];
  ignorePaths: string[];
  updatedAt: string;
}

export interface Suppression {
  id: string;
  organizationId: string;
  repositoryId: string;
  repositoryName: string;
  fingerprint: string;
  ruleId: string;
  findingTitle: string;
  reasonCategory: WaiverCategory;
  justification: string;
  status: WaiverStatus;
  requestedByUserId: string;
  requestedByUserName: string;
  requestedByUserAvatar: string;
  approvedByUserId?: string;
  approvedByUserName?: string;
  rejectionReason?: string;
  expiresAt: string;
  createdAt: string;
}

export interface CiRunnerToken {
  id: string;
  organizationId: string;
  repositoryId?: string | null;
  name: string;
  tokenPrefix: string;
  maskedToken: string;
  createdAt: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  isRevoked: boolean;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  actorEmail: string;
  actorName: string;
  eventCategory: string;
  resourceType: string;
  resourceId: string;
  diff: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress: string;
  createdAt: string;
}

export type ActiveView = 
  | 'dashboard'
  | 'repositories'
  | 'repo-detail'
  | 'findings'
  | 'waivers'
  | 'policies'
  | 'audit-logs'
  | 'settings'
  | 'onboarding';
