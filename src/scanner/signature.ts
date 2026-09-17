/**
 * GateSentry Secret Detection Signatures & Masking Utilities.
 */

export interface SecretSignature {
  id: string;
  name: string;
  description: string;
  regex: RegExp;
  minEntropy?: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  providerDocUrl: string;
  remediationGuide: string;
}

export const SECRET_SIGNATURES: SecretSignature[] = [
  {
    id: 'GATESENTRY-SEC-AWS-KEY',
    name: 'AWS Access Key ID',
    description: 'Plaintext AWS IAM Access Key ID detected',
    regex: /\b(AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b/g,
    minEntropy: 3.5,
    severity: 'CRITICAL',
    providerDocUrl: 'https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html',
    remediationGuide: 'Immediately revoke this key in AWS IAM Console. Purge from git history using git-filter-repo, and re-inject credentials via AWS Secrets Manager or environment secrets.'
  },
  {
    id: 'GATESENTRY-SEC-AWS-SECRET',
    name: 'AWS Secret Access Key Heuristic',
    description: 'High-entropy 40-character AWS Secret Key candidate',
    regex: /(?:aws_secret_access_key|aws_sec_key|secret_key)\s*[:=]\s*['"]([0-9a-zA-Z/+]{40})['"]/gi,
    minEntropy: 4.2,
    severity: 'CRITICAL',
    providerDocUrl: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
    remediationGuide: 'Revoke and rotate AWS key pair. Check CloudTrail for unauthorized API requests.'
  },
  {
    id: 'GATESENTRY-SEC-GITHUB-PAT',
    name: 'GitHub Personal Access Token',
    description: 'Classic or Fine-Grained GitHub Personal Access Token',
    regex: /\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})\b/g,
    severity: 'CRITICAL',
    providerDocUrl: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens',
    remediationGuide: 'Revoke token in GitHub Developer Settings -> Personal access tokens. Check audit log for anomalous repository access.'
  },
  {
    id: 'GATESENTRY-SEC-GITHUB-OAUTH',
    name: 'GitHub OAuth Access Token',
    description: 'GitHub App or OAuth user access token',
    regex: /\b(gho_[a-zA-Z0-9]{36}|ghs_[a-zA-Z0-9]{36})\b/g,
    severity: 'HIGH',
    providerDocUrl: 'https://docs.github.com/en/apps/creating-github-apps',
    remediationGuide: 'Revoke token in GitHub Organization Settings and cycle the OAuth client secret.'
  },
  {
    id: 'GATESENTRY-SEC-SLACK-WEBHOOK',
    name: 'Slack Incoming Webhook URL',
    description: 'Unauthenticated Slack webhook endpoint URL',
    regex: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]{8,12}\/B[a-zA-Z0-9_]{8,12}\/[a-zA-Z0-9_]{24}/g,
    severity: 'HIGH',
    providerDocUrl: 'https://api.slack.com/messaging/webhooks',
    remediationGuide: 'Delete this webhook URL in the Slack App Management Portal and configure new webhook secrets.'
  },
  {
    id: 'GATESENTRY-SEC-SLACK-BOT-TOKEN',
    name: 'Slack Bot API Token',
    description: 'Slack Bot User OAuth Token',
    regex: /\bxoxb-[0-9]{11,13}-[0-9]{11,13}-[a-zA-Z0-9]{24}\b/g,
    severity: 'CRITICAL',
    providerDocUrl: 'https://api.slack.com/authentication/token-types',
    remediationGuide: 'Revoke token in api.slack.com and regenerate application bot scopes.'
  },
  {
    id: 'GATESENTRY-SEC-OPENAI-KEY',
    name: 'OpenAI API Secret Key',
    description: 'OpenAI platform secret key',
    regex: /\bsk-[a-zA-Z0-9]{48}\b|\bsk-proj-[a-zA-Z0-9_-]{80,120}\b/g,
    severity: 'CRITICAL',
    providerDocUrl: 'https://platform.openai.com/api-keys',
    remediationGuide: 'Delete key immediately in OpenAI dashboard -> API Keys to prevent unauthorized API quota consumption.'
  },
  {
    id: 'GATESENTRY-SEC-STRIPE-KEY',
    name: 'Stripe Live Secret Key',
    description: 'Stripe live-mode payment API key',
    regex: /\b(sk_live_[0-9a-zA-Z]{24,34}|rk_live_[0-9a-zA-Z]{24,34})\b/g,
    severity: 'CRITICAL',
    providerDocUrl: 'https://stripe.com/docs/keys',
    remediationGuide: 'Roll key in Stripe Developers Dashboard immediately. Never commit live-mode Stripe secret keys to client or backend code.'
  },
  {
    id: 'GATESENTRY-SEC-GOOGLE-API',
    name: 'Google Cloud Platform API Key',
    description: 'GCP Service API key',
    regex: /\bAIza[0-9A-Za-z\-_]{35}\b/g,
    severity: 'HIGH',
    providerDocUrl: 'https://cloud.google.com/docs/authentication/api-keys',
    remediationGuide: 'Restrict key to specific APIs and IP ranges in Google Cloud Console, or delete and replace with Service Account ADC.'
  },
  {
    id: 'GATESENTRY-SEC-PRIVATE-KEY',
    name: 'Asymmetric Private Key Block',
    description: 'Unencrypted RSA/DSA/EC/OpenSSH private key header',
    regex: /-----BEGIN (?:RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY[^-]*-----/g,
    severity: 'CRITICAL',
    providerDocUrl: 'https://owasp.org/www-community/vulnerabilities/Key_Management',
    remediationGuide: 'Regenerate cryptographic key pair immediately. Remove compromised private key from all servers and git history.'
  },
  {
    id: 'GATESENTRY-SEC-GENERIC-AUTH-BEARER',
    name: 'Hardcoded Bearer Authorization Token',
    description: 'Generic Bearer authentication token with high entropy',
    regex: /['"]Bearer\s+([a-zA-Z0-9._\-]{24,})['"]/gi,
    minEntropy: 4.5,
    severity: 'HIGH',
    providerDocUrl: 'https://owasp.org/www-project-top-ten/',
    remediationGuide: 'Extract Bearer token into an environment variable or secrets manager.'
  }
];

/**
 * Masking utility: reveals first 4 chars, masks the rest with '*', keeping total length.
 */
export function maskSecretString(secret: string): string {
  if (!secret || secret.length <= 4) return '****';
  const prefix = secret.slice(0, 4);
  const stars = '*'.repeat(secret.length - 4);
  return `${prefix}${stars}`;
}
