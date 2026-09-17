# Product Requirements Document (PRD)
## Product Name: GateSentry (CI/CD Security Scanner)
**Document Version:** 1.0.0  
**Status:** Approved for MVP Development  
**Author:** Senior Technical Product Manager (DevSecOps & Platform Security)  
**Target Delivery:** Q1 MVP  

---

## 1. Executive Summary & Project Overview

### 1.1 Executive Summary
**GateSentry** is a lightweight, developer-first CI/CD security scanner and policy enforcement engine. It operates natively inside continuous integration workflows (GitHub Actions, GitLab CI, Bitbucket Pipelines, Jenkins) and developer pre-commit hooks to automatically:
1. Detect and prevent committed secrets and credentials.
2. Analyze third-party dependencies for known vulnerabilities (CVEs) and license non-compliance.
3. Enforce custom organizational security policies.
4. Block deployments and break builds when policy-violating risks exceed defined thresholds.

By shifting security left to the developer commit and merge request lifecycle, GateSentry stops vulnerabilities before they enter production artifact repositories or staging environments.

### 1.2 Strategic Value & Industry Relevance
- **Direct Industry Relevance:** Modern engineering organizations are aggressively adopting DevSecOps principles, shifting security from annual audits to automated pipeline guardrails.
- **Attack Surface Reduction:** 80%+ of modern breaches originate via compromised API keys, cloud credentials, or software supply chain exploits (e.g., Log4j, vulnerable npm/PyPI packages).
- **Developer Experience (DevEx):** Eliminates opaque security gates by providing remediation steps, exact line numbers, and actionable CLI output directly within developer tools.

---

## 2. Target Users & Personas

| Persona | Role & Context | Pain Points | Primary Needs |
| :--- | :--- | :--- | :--- |
| **DevOps / Platform Engineer** ("Alex") | Manages CI/CD runners, build automation, release velocity. | Pipelines are slowed down by clunky enterprise security scanners; hard to maintain complex configs across 50+ repositories. | Zero-config drop-in CI action, sub-60-second scans, reproducible exit codes (`exit 1` on criticals), minimal false positives. |
| **Software Engineer** ("Maya") | Writes features in Python, Node.js, and Go; uses Git daily. | Annoyed when security tickets appear weeks after code is merged; cryptic error logs that don't explain how to fix the issue. | Fast pre-commit / PR checks with clean inline diffs, specific CVE IDs, remediation steps (e.g., "Upgrade lodash to >= 4.17.21"). |
| **AppSec / Security Engineer** ("David") | Defines security policies, ensures compliance (SOC2, ISO 27001). | Developers accidentally leaking cloud keys in repos; uncontrolled open-source vulnerabilities reaching staging/prod. | Centralized security ruleset, audit logs, SARIF report outputs for GitHub Security tab, configurable severity fail thresholds. |

---

## 3. Problem Statement

### 3.1 The Problem
1. **Secret Sprawl:** Developers frequently paste API tokens, SSH keys, AWS credentials, and database URIs into code, configuration files, or commit histories. Once pushed to remote git repositories, revocation and rotation are expensive and disruptive.
2. **Software Supply Chain Risks:** Modern software applications consist of up to 80-90% third-party dependencies. Vulnerabilities in open-source packages introduce severe zero-day risks if not actively scanned on every pull request.
3. **Delayed Security Feedback:** Traditional security reviews happen right before deployment or asynchronously via quarterly penetration tests, resulting in expensive context switching and emergency hotfixes.
4. **Lack of Automated Enforcement:** Without hard CI/CD build gates, security guidelines become mere suggestions that are bypassed during tight sprint deadlines.

---

## 4. Product Goals & Objectives

1. **Deterministic Build Gating:** Provide reliable exit code conventions (`0` for pass, `1` for policy violation, `2` for configuration/scanner runtime error) to reliably halt CI/CD jobs.
2. **High-Accuracy Scanning:** High precision on secret detection using entropy calculation + regex fingerprinting to keep false-positive rates below 3%.
3. **Comprehensive Supply Chain Inspection:** Parse lockfiles (`package-lock.json`, `poetry.lock`, `requirements.txt`, `go.sum`, `pom.xml`) and cross-reference authoritative vulnerability advisory databases (OSV, GitHub Advisory Database, NVD).
4. **Frictionless Integration:** Single-command local execution (`gatesentry scan`) and a ready-to-use GitHub Action / container image.
5. **Standardized Reporting:** Support human-readable terminal output, structured JSON, and OASIS SARIF (Static Analysis Results Interchange Format) for native integration into GitHub Code Scanning.

---

## 5. Core Features & Functional Requirements

### 5.1 Secret & Credential Detection
- **Entropy & Pattern Analysis:** Detects high-entropy strings combined with signature regexes for 50+ common provider tokens (AWS, GCP, Azure, GitHub PATs, Slack Webhooks, OpenAI API keys, Stripe, Private Keys/Certificates).
- **Git History & Staged Changes Scanning:**
  - Fast mode: Scan git diff / staged changes (`HEAD~1` to `HEAD` or between target branches in PRs).
  - Deep mode: Full history traversal for detecting leaked secrets committed in prior commits.
- **Allowlisting & Suppressions:** Support an in-repo `.gatesentryignore` file and inline comments (`// gatesentry:ignore <rule-id>`) with mandatory expiration dates and rationale.

### 5.2 Dependency Vulnerability & License Scanning (SCA)
- **Lockfile Ecosystem Support:**
  - Node.js (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`)
  - Python (`requirements.txt`, `Pipfile.lock`, `poetry.lock`)
  - Go (`go.sum`)
- **Advisory Database Sync:** Queries the Open Source Vulnerability (OSV.dev) API and offline cached databases for CVE details, CVSS v3 scores, and fixed versions.
- **License Compliance Verification:** Flags restrictive licenses (e.g., AGPL-3.0, GPL-3.0) against an organizational whitelist/blacklist policy.

### 5.3 Policy Engine & Pre-Deploy Enforcement
- **Configurable Risk Thresholds:** Configured via a `.gatesentry.yml` in repository root.
  - Fail build if secrets detected: `severity >= HIGH` (Default: `CRITICAL | HIGH`).
  - Fail build if vulnerability detected: `cvss >= 7.0` (or `severity >= HIGH`).
  - Fail build on unapproved dependency license.
- **Grace Periods & Exceptions:** Configurable time-bound waivers for low-risk vulnerabilities awaiting vendor upstream patches.

### 5.4 CI/CD Build Breaking & Reporting
- **Process Termination & Gating:** Immediate non-zero exit code upon policy threshold violation.
- **Rich Terminal UI:** Formatted ANSI colored table displaying:
  - Finding Type (Secret vs Vulnerability vs License)
  - Severity Badge (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
  - Location (File, Line Number, Column)
  - CVE Identifier & CVSS Score
  - Clear Remediation Advice (e.g., "Rotate key immediately and purge from git history" or "Bump package X to >= v2.4.1").
- **Export Formats:**
  - Terminal stdout (formatted text)
  - Structured JSON (`--format=json --output=report.json`)
  - SARIF v2.1.0 (`--format=sarif --output=results.sarif`) for GitHub Code Scanning UI integration.

---

## 6. User Stories & Acceptance Criteria

### User Story 1: Developer Commits AWS Secret Key
> **As a** Software Developer,  
> **I want** the scanner to catch an unencrypted AWS Access Key in my staged files before or during PR checks,  
> **So that** I don't expose production infrastructure or compromise cloud credentials.

**Acceptance Criteria:**
- Scanner detects pattern `AKIA[0-9A-Z]{16}` and high Shannon entropy.
- Masked output displays in logs: `AKIA****************` (never prints raw secret in plain text).
- Build terminates with exit code `1`.
- Log provides link to AWS credential rotation guidelines.

---

### User Story 2: CI Pipeline Identifies High-Severity CVE
> **As a** DevOps Engineer,  
> **I want** the CI pipeline to scan `package-lock.json` on pull requests,  
> **So that** dependencies with known remote code execution (RCE) vulnerabilities cannot be merged to `main`.

**Acceptance Criteria:**
- Given a `package-lock.json` containing `axios@0.21.1` (affected by CVE-2021-3749).
- Scanner flags CVE-2021-3749 (Severity: High).
- PR check fails and lists recommended upgrade target (`>= 0.21.2`).
- Report is uploaded as an artifact or posted as a PR summary comment.

---

### User Story 3: AppSec Enforces Custom Policy
> **As a** Security Engineer,  
> **I want** to enforce a configuration policy that forbids `CRITICAL` CVEs and licenses matching `AGPL-3.0`,  
> **So that** our code complies with security and legal requirements.

**Acceptance Criteria:**
- Scanner evaluates `.gatesentry.yml`.
- If an AGPL dependency is found, scanner issues an error: `License Violation: <package-name> is licensed under AGPL-3.0`.
- Scanner exits with code `1`.

---

## 7. Scope & Roadmap

### 7.1 In-Scope for MVP (P0)
- [x] **CLI Core Engine:** Standalone binary/script (Go or Python) runnable in any Linux/macOS/Windows runner.
- [x] **Secret Detection:** 25+ top secret signatures (AWS, GitHub, Slack, Private Keys, generic high-entropy strings).
- [x] **SCA Scanner:** Python (`requirements.txt`) & Node.js (`package-lock.json`) lockfile parsing against OSV API.
- [x] **Config Parser:** Simple `.gatesentry.yml` supporting severity threshold and ignore rules.
- [x] **Outputs:** ANSI formatted CLI output + JSON output + exit code enforcement.
- [x] **GitHub Action Packaging:** Custom GitHub Action (`action.yml`) for instant pipeline integration.

### 7.2 Post-MVP / V2 (P1)
- [ ] Container image scanning (Docker SBOM & image vulnerability scanning).
- [ ] Automated PR comments with auto-fix / pull request suggestions (e.g., Dependabot-like PR generation).
- [ ] Full Git commit history deep-scan with automated git-filter-repo remediation scripts.
- [ ] SAST (Static Application Security Testing) rules for common OWASP Top 10 code anti-patterns.
- [ ] Central dashboard / SaaS web UI for multi-repo compliance aggregation.

### 7.3 Out of Scope
- Runtime Application Self-Protection (RASP).
- Cloud security posture management (CSPM / live AWS account scanning).
- Network / dynamic application penetration testing (DAST).

---

## 8. Technical Architecture & CI/CD Pipeline Flow

```
[ Developer Git Push / PR ]
           │
           ▼
[ CI Runner: GitHub Actions / GitLab CI ]
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│              GateSentry Engine Execution                │
│                                                         │
│  ┌───────────────────────┐   ┌───────────────────────┐  │
│  │   Secret Scanner      │   │  Dependency Scanner   │  │
│  │  - Entropy Check      │   │  - Lockfile Parser    │  │
│  │  - Pattern Matching   │   │  - OSV / NVD Query    │  │
│  └──────────┬────────────┘   └───────────┬───────────┘  │
│             │                            │              │
│             └────────────┬───────────────┘              │
│                          ▼                              │
│              ┌───────────────────────┐                  │
│              │   Policy Evaluator    │                  │
│              │   (.gatesentry.yml)   │                  │
│              └───────────┬───────────┘                  │
└──────────────────────────┼──────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             │ Violations > Threshold?   │
             └─────────────┬─────────────┘
                    │             │
                   YES            NO
                    │             │
                    ▼             ▼
       ┌────────────────────────┐  ┌────────────────────────┐
       │ - Exit Code 1          │  │ - Exit Code 0          │
       │ - Break Build          │  │ - Pass Build           │
       │ - Print Remediation    │  │ - Proceed to Deploy    │
       │ - Post PR Block        │  └────────────────────────┘
       └────────────────────────┘
```

### 8.1 Configuration Specification (`.gatesentry.yml`)
```yaml
version: "1"
fail_on:
  secrets: true # Any secret fails the build
  vulnerability_severity: "HIGH" # LOW | MEDIUM | HIGH | CRITICAL
  licenses:
    - "AGPL-3.0"
    - "GPL-3.0"

scanner:
  secrets:
    entropy_threshold: 4.5
    scan_git_history: false # default false for speed in CI diffs
  dependencies:
    ecosystems:
      - npm
      - pypi

ignore:
  paths:
    - "tests/**"
    - "docs/**"
  advisories:
    - "GHSA-xxxx-xxxx-xxxx" # Document reason: Temporary patch in place
```

---

## 9. Success Metrics & Key Performance Indicators (KPIs)

### 9.1 Product & Engineering Metrics
- **Scan Latency:** P95 scan time < 45 seconds on a repository with 5,000 files and 500 dependencies.
- **False Positive Rate:** Secret false positive rate < 3% measured by user ignore directives.
- **Detection Accuracy:** 100% detection rate on OWASP Benchmark secrets and known benchmark test suites.
- **Reliability:** 0 crashing pipeline runs on valid git workspaces (`exit code 2` < 0.1%).

### 9.2 DevSecOps & Security Impact
- **Mean Time to Remediate (MTTR):** Reduction of secret revocation time from days to minutes (caught pre-merge).
- **Zero Secret Leaks to Production:** 0 verified production credentials merged into target deployment branches.
- **Vulnerability Density:** 80% reduction in high/critical vulnerabilities deployed to staging/prod environments.

### 9.3 Portfolio & Recruiter Appeal
- **Demonstration of Real-World Engineering:** Proves mastery in CI/CD pipelines, Docker, GitHub Actions, application security (OWASP, CVSS, CVEs), and systems programming.
- **Immediate Utility:** Clean documentation, functional demo repo, and reproducible test cases that can be verified in under 2 minutes.

---

## 10. Non-Functional Requirements & Edge Cases

| Area | Requirement / Consideration |
| :--- | :--- |
| **Security & Privacy** | Scanner executes locally in the runner. **Zero source code or sensitive tokens leave the customer's CI environment.** Only public package names and hashes are checked against advisory feeds. |
| **Masking** | Secrets MUST be redacted in logs and stdout (`AKIA************`). Pipeline logs must never accidentally expose discovered credentials. |
| **Network Resiliency** | In offline or air-gapped CI environments, scanner should gracefully fall back to local vulnerability databases with clear advisory warnings rather than crashing. |
| **Performance** | Multi-threaded file walking and concurrent lockfile parsing to minimize CI run duration and cloud runner costs. |

