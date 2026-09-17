/**
 * Shannon Entropy calculation for secret detection.
 * Computes bits of entropy per character.
 * High entropy indicates randomly generated keys/tokens rather than natural language.
 */

export function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;

  const charCounts: Record<string, number> = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    charCounts[char] = (charCounts[char] || 0) + 1;
  }

  let entropy = 0;
  const len = str.length;

  for (const char in charCounts) {
    const p = charCounts[char] / len;
    entropy -= p * Math.log2(p);
  }

  return Number(entropy.toFixed(3));
}

/**
 * Heuristics to exclude false positives like UUIDs, git commit SHAs, base64 images, or md5 hashes
 */
export function isLikelyFalsePositive(token: string): boolean {
  // UUID pattern (8-4-4-4-12)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return true;
  }
  // Git 40-char or 64-char hex commit hash
  if (/^[0-9a-f]{40}$/i.test(token) || /^[0-9a-f]{64}$/i.test(token)) {
    return true;
  }
  // Common placeholders or test values
  const lower = token.toLowerCase();
  if (
    lower.includes('example') ||
    lower.includes('placeholder') ||
    lower.includes('dummy') ||
    lower.includes('your_api_key') ||
    lower.includes('changeme') ||
    lower.includes('insert_key')
  ) {
    return true;
  }

  return false;
}
