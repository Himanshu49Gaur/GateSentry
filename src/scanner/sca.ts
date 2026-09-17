/**
 * Software Composition Analysis (SCA) & License Compliance Engine.
 * Parses package.json/package-lock.json and requirements.txt against known CVE database.
 */

export interface KnownVulnerability {
  cveId: string;
  packageName: string;
  ecosystem: 'npm' | 'pypi' | 'go';
  vulnerableVersions: string[];
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore: number;
  cvssVector: string;
  fixedVersion: string;
  title: string;
  remediation: string;
}

export interface KnownLicenseViolation {
  packageName: string;
  licenseSpdx: string;
  isRestricted: boolean;
  notes: string;
}

// Curated Advisory Intelligence Database (matches OSV.dev schema)
export const KNOWN_ADVISORIES: KnownVulnerability[] = [
  {
    cveId: 'CVE-2021-3749',
    packageName: 'axios',
    ecosystem: 'npm',
    vulnerableVersions: ['0.21.1', '0.21.0', '< 0.21.2'],
    severity: 'HIGH',
    cvssScore: 7.5,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
    fixedVersion: '>= 0.21.2',
    title: 'Regular Expression Denial of Service (ReDoS) in trim method',
    remediation: 'Upgrade axios to version >= 0.21.2 (Run: `npm install axios@latest`)'
  },
  {
    cveId: 'CVE-2020-8203',
    packageName: 'lodash',
    ecosystem: 'npm',
    vulnerableVersions: ['4.17.15', '< 4.17.19'],
    severity: 'HIGH',
    cvssScore: 7.4,
    cvssVector: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H',
    fixedVersion: '>= 4.17.21',
    title: 'Prototype Pollution in zipObjectDeep function',
    remediation: 'Upgrade lodash to version >= 4.17.21 (Run: `npm install lodash@^4.17.21`)'
  },
  {
    cveId: 'CVE-2023-32681',
    packageName: 'requests',
    ecosystem: 'pypi',
    vulnerableVersions: ['2.28.1', '< 2.31.0'],
    severity: 'MEDIUM',
    cvssScore: 6.1,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N',
    fixedVersion: '>= 2.31.0',
    title: 'Unintended leak of Proxy-Authorization header during HTTPS redirects',
    remediation: 'Upgrade requests in requirements.txt to >= 2.31.0 (Run: `pip install --upgrade requests>=2.31.0`)'
  },
  {
    cveId: 'CVE-2021-33503',
    packageName: 'urllib3',
    ecosystem: 'pypi',
    vulnerableVersions: ['1.26.4', '< 1.26.5'],
    severity: 'HIGH',
    cvssScore: 7.5,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H',
    fixedVersion: '>= 1.26.5',
    title: 'Catastrophic Denial of Service in URL authority parsing',
    remediation: 'Upgrade urllib3 to >= 1.26.5'
  },
  {
    cveId: 'CVE-2022-24999',
    packageName: 'express',
    ecosystem: 'npm',
    vulnerableVersions: ['4.16.0', '< 4.18.2'],
    severity: 'MEDIUM',
    cvssScore: 5.3,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N',
    fixedVersion: '>= 4.18.2',
    title: 'qs dependency vulnerability allowing query string parameter pollution',
    remediation: 'Upgrade express to >= 4.18.2'
  }
];

export const KNOWN_PACKAGES_LICENSES: Record<string, string> = {
  'axios': 'MIT',
  'lodash': 'MIT',
  'express': 'MIT',
  'requests': 'Apache-2.0',
  'urllib3': 'MIT',
  'mongo-client-legacy': 'SSPL-1.0',
  'pdf-creator-pro': 'AGPL-3.0',
  'sharp-imaging-core': 'GPL-3.0'
};

/**
 * Parses package.json or requirements.txt content and detects vulnerable packages & licenses
 */
export function scanDependencies(
  filePath: string,
  content: string,
  licenseDenylist: string[] = ['AGPL-3.0', 'GPL-3.0', 'SSPL-1.0']
): {
  vulnerabilities: Array<{
    cve: KnownVulnerability;
    detectedVersion: string;
    line: number;
  }>;
  licenseViolations: Array<{
    packageName: string;
    license: string;
    line: number;
  }>;
} {
  const vulnerabilities: Array<{ cve: KnownVulnerability; detectedVersion: string; line: number }> = [];
  const licenseViolations: Array<{ packageName: string; license: string; line: number }> = [];

  const lines = content.split('\n');

  // Case 1: Node.js (package.json or package-lock.json)
  if (filePath.endsWith('package.json') || filePath.endsWith('package-lock.json')) {
    lines.forEach((line, index) => {
      // Look for `"package-name": "version"`
      const match = line.match(/"([^"]+)":\s*"([^"]+)"/);
      if (match) {
        const pkg = match[1];
        const rawVer = match[2].replace(/[\^~=><]/g, '');

        // Check for CVEs
        const adv = KNOWN_ADVISORIES.find(a => a.ecosystem === 'npm' && a.packageName === pkg);
        if (adv && adv.vulnerableVersions.some(v => v.includes(rawVer) || v.startsWith('<'))) {
          vulnerabilities.push({
            cve: adv,
            detectedVersion: match[2],
            line: index + 1
          });
        }

        // Check for Licenses
        const license = KNOWN_PACKAGES_LICENSES[pkg];
        if (license && licenseDenylist.includes(license)) {
          licenseViolations.push({
            packageName: pkg,
            license,
            line: index + 1
          });
        }
      }
    });
  }

  // Case 2: Python (requirements.txt)
  if (filePath.endsWith('requirements.txt')) {
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const match = trimmed.match(/^([a-zA-Z0-9_\-]+)\s*(?:==|>=|<=|~=)\s*([a-zA-Z0-9_\.\-]+)/);
      if (match) {
        const pkg = match[1];
        const ver = match[2];

        const adv = KNOWN_ADVISORIES.find(a => a.ecosystem === 'pypi' && a.packageName.toLowerCase() === pkg.toLowerCase());
        if (adv && adv.vulnerableVersions.some(v => v.includes(ver) || v.startsWith('<'))) {
          vulnerabilities.push({
            cve: adv,
            detectedVersion: ver,
            line: index + 1
          });
        }

        const license = KNOWN_PACKAGES_LICENSES[pkg];
        if (license && licenseDenylist.includes(license)) {
          licenseViolations.push({
            packageName: pkg,
            license,
            line: index + 1
          });
        }
      }
    });
  }

  return { vulnerabilities, licenseViolations };
}
