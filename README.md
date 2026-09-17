# GateSentry 
### CI/CD Security Scanner & Enterprise Policy Enforcement Engine

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/gatesentry/scanner)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Exit Code Standard](https://img.shields.io/badge/deterministic%20gating-exit%200%20%7C%201%20%7C%202-indigo.svg)](TRD.md)
[![SARIF Standard](https://img.shields.io/badge/SARIF-OASIS%20v2.1.0-orange.svg)](https://sarifweb.azurewebsites.net/)
[![Compliance](https://img.shields.io/badge/SOC%202-Type%20II%20Ready-emerald.svg)](BACKEND_SCHEMA.md)

**GateSentry** is a lightweight, developer-first CI/CD security scanner, policy enforcement engine, and centralized governance dashboard. Operating directly inside developer pre-commit hooks and continuous integration workflows (GitHub Actions, GitLab CI, Jenkins, Bitbucket), GateSentry detects unencrypted secrets, analyzes third-party dependencies for known vulnerabilities (CVEs), verifies open-source license compliance, and deterministically halts builds before policy-violating risks reach production.

---

## 🌟 Key Capabilities

### 1. Two-Tier Secret & Credential Detection
- **Shannon Entropy Scoring:** Evaluates character randomness ($H \ge 4.5$) with heuristic filters excluding UUIDs, Git commit hashes, and test placeholders.
- **25+ Signature Heuristics:** Pinpoints AWS access keys (`AKIA...`), GitHub Personal Access Tokens (`ghp_...`, `github_pat_...`), Slack webhooks, OpenAI API keys, Stripe secret keys, and asymmetric private keys.
- **Zero-Disclosure Masking:** Secrets are permanently masked in memory (`AKIA****************`) before rendering to logs, terminal stdout, or SARIF files.

### 2. Software Composition Analysis (SCA) & License Compliance
- **Multi-Ecosystem Lockfile Parsing:** Inspects `package.json`, `package-lock.json`, and `requirements.txt`.
- **Advisory Database Sync:** Queries Open Source Vulnerabilities (OSV.dev) and NVD feeds for exact CVSS v3.1 scores and safe version remediation targets.
- **License Denylisting:** Automatically flags restrictive copyleft licenses (e.g., `AGPL-3.0`, `GPL-3.0`, `SSPL-1.0`).

### 3. Deterministic Build Gating & Output Standardization
- **Process Exit Codes:**
  - `0` — **PASS:** Zero policy violations or all findings covered by active approved waivers.
  - `1` — **BUILD BROKEN:** Policy threshold exceeded (hard deployment halt).
  - `2` — **ERROR:** Configuration syntax or scanner runtime failure.
- **Dual Reporting:** Emits human-readable ANSI colored terminal output and **OASIS SARIF v2.1.0** reports for native integration into GitHub Code Scanning.

### 4. Enterprise Governance & Management Portal
- **Executive Security Posture Dashboard:** 4 KPI cards, 30-day multi-area exposure trends, threat distribution, and real-time live CI scan feeds.
- **Collapsible Platform Navigation:** Full-screen dashboard access with a 1-click toggle button and `Ctrl+B` / `Cmd+B` shortcut.
- **Finding Triage Drawer:** Deep-dive code inspector highlighting masked snippets with step-by-step remediation playbooks.
- **Waiver Approval Workflow:** Time-bound security exceptions with mandatory justification audit trails and 1-click AppSec approvals.
- **Policy Engine Studio:** Interactive Rule Builder with two-way live `.gatesentry.yml` synchronization and historical dry-run simulations.
- **SOC 2 Audit Trail:** Tamper-evident event log with JSONB state diffs and CSV export.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js:** v18.0.0 or later (v24 LTS tested)
- **npm:** v9.0.0 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/gatesentry/scanner.git
cd "CICD Scanner"

# Install dependencies
npm install

# Launch the development server
npm run dev
```

The platform dashboard will start immediately at **`http://localhost:3000/`**.

### Production Build

```bash
# Run TypeScript validation and Vite production build
npm run build

# Preview production build locally
npm run preview
```

---

## 💻 CLI Usage

Execute scans locally from developer workstations or CI/CD pipelines:

```bash
# Basic scan with default settings
gatesentry scan

# Fail build on any finding with severity >= HIGH
gatesentry scan --fail-on=high

# Output structured SARIF for GitHub Code Scanning
gatesentry scan --format=sarif --output=results.sarif

# Offline / air-gapped execution against local advisory cache
gatesentry scan --offline
```

---

## ⚙️ CI/CD Pipeline Integration

### GitHub Actions (`.github/workflows/security.yml`)

```yaml
name: GateSentry CI Security Scan
on: [push, pull_request]

jobs:
  gatesentry-gate:
    name: Policy Enforcement Gate
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run GateSentry Scanner
        uses: gatesentry/action@v1
        with:
          token: ${{ secrets.GATESENTRY_TOKEN }}
          fail-on: "high"
          sarif-upload: true

      - name: Upload SARIF to GitHub Security Tab
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
```

### GitLab CI (`.gitlab-ci.yml`)

```yaml
gatesentry-scan:
  stage: test
  image: ghcr.io/gatesentry/scanner:latest
  script:
    - gatesentry scan --fail-on=high --format=sarif --output=gl-sast-report.json
  artifacts:
    reports:
      sast: gl-sast-report.json
```

---

## 📄 Configuration Specification (`.gatesentry.yml`)

Commit `.gatesentry.yml` to your repository root to configure custom rules:

```yaml
version: "1.0"

# Build-breaking thresholds
fail_on:
  secrets: true                   # Any detected secret fails build
  vulnerability_severity: "HIGH"   # LOW | MEDIUM | HIGH | CRITICAL
  cvss_threshold: 7.0             # 0.0 - 10.0
  licenses:
    - "AGPL-3.0"
    - "GPL-3.0"
    - "SSPL-1.0"

# Scanner heuristics
scanner:
  secrets:
    entropy_threshold: 4.5        # Shannon entropy cutoff
    scan_git_history: false       # Set true for deep commit traversal

# Exclusions
ignore:
  paths:
    - "tests/**"
    - "docs/**"
    - "**/*.test.ts"
```

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies & Specifications |
| :--- | :--- |
| **Frontend Dashboard** | React 19, TypeScript 5.4, Vite 6, Tailwind CSS v3.4, Recharts, Lucide Icons, Canvas-Confetti |
| **Design System** | "Precision DevSecOps" Dark Mode (`#080B11`), 4-tier surface elevation, WCAG 2.1 AAA contrast |
| **Scanner Engine** | Two-Tier Regex & Shannon Entropy Engine, Lockfile SCA Parser, OASIS SARIF v2.1.0 Generator |
| **Data Architecture** | PostgreSQL 16 DDL with Monthly Range Partitioning, Redis 7.2 L1 cache, S3 WORM storage |
| **Security & Auth** | OAuth 2.0 / OIDC (GitHub, GitLab, Google, SAML SSO), SHA-256 Hashed CI Machine Tokens (`gs_live_...`) |

---

## 📚 Complete Project Documentation Suite

- **[Product Requirements Document (PRD.md)](file:///d:/CICD%20Scanner/PRD.md):** Market context, user personas, problem statements, and MVP scope.
- **[Technical Requirements Document (TRD.md)](file:///d:/CICD%20Scanner/TRD.md):** System architecture, Shannon entropy algorithms, and C4 system models.
- **[App Flow Document (APP_FLOW.md)](file:///d:/CICD%20Scanner/APP_FLOW.md):** Complete UX flow, all screens (`SCR-01` to `SCR-11`), button behaviors, and state machines.
- **[Design Brief (DESIGN_BRIEF.md)](file:///d:/CICD%20Scanner/DESIGN_BRIEF.md):** Color tokens, typography, component styles, 8pt grid, and visual references.
- **[Backend Schema (BACKEND_SCHEMA.md)](file:///d:/CICD%20Scanner/BACKEND_SCHEMA.md):** PostgreSQL 16 DDL, monthly table partitioning, Redis models, and RBAC matrix.
- **[Implementation Plan (IMPLEMENTATION_PLAN.md)](file:///d:/CICD%20Scanner/IMPLEMENTATION_PLAN.md):** Step-by-step engineering roadmap and deliverables matrix.

---

## 🛡️ Security & Privacy Guarantee

- **Zero Source Code Exfiltration:** Only metadata, package names, hashes, and redacted single-line evidence snippets are ever evaluated. Proprietary source code never leaves the runner environment.
- **Zero-Plaintext Credentials:** Secrets are masked in volatile memory immediately upon regex detection. Database check constraints actively reject unmasked AWS credentials (`AKIA...`).

---

## 📝 License

GateSentry is open-source software licensed under the **[Apache License 2.0](LICENSE)**.
