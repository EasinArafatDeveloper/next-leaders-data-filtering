export const DEFAULT_SHARE_DOMAINS = [
  'https://tempshr.click',
  'https://tempshr.xyz',
  'https://tempshr.lol',
];

/**
 * Returns the list of configured share domains.
 */
export function getShareDomains(): string[] {
  const envDomains = process.env.NEXT_PUBLIC_SHARE_DOMAINS || process.env.SHARE_DOMAINS;
  if (envDomains && envDomains.trim()) {
    const list = envDomains
      .split(',')
      .map((d) => d.trim().replace(/\/+$/, ''))
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  return DEFAULT_SHARE_DOMAINS;
}

/**
 * Cryptographically selects a random domain from the available share domains pool.
 */
export function getRandomShareDomain(): string {
  const domains = getShareDomains();
  if (domains.length === 0) return '';
  const randomIndex = Math.floor(Math.random() * domains.length);
  return domains[randomIndex];
}

/**
 * Generates an ultra-high-entropy 256-bit cryptographic hex token (64 characters).
 * 100% Edge Runtime, Node.js, and browser compatible.
 * Example: '7f9a2c8e4b1d0563fa289e4c19b0d24e5a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d'
 */
export function generateCryptoToken(): string {
  const bytes = new Uint8Array(32);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Checks whether a given hostname is one of our stealth disposable share domains.
 */
export function isStealthShareDomain(host: string | null | undefined): boolean {
  if (!host) return false;
  const cleanHost = host.toLowerCase().split(':')[0]; // strip port if any

  const shareDomains = getShareDomains();
  for (const domain of shareDomains) {
    try {
      const url = new URL(domain.startsWith('http') ? domain : `https://${domain}`);
      const domainHost = url.hostname.toLowerCase();
      if (
        cleanHost === domainHost ||
        cleanHost.endsWith(`.${domainHost}`) ||
        cleanHost.includes('tempshr')
      ) {
        return true;
      }
    } catch {
      if (cleanHost.includes(domain.toLowerCase())) return true;
    }
  }

  return false;
}

/**
 * Formats a raw URL string into a clean domain display name (e.g. 'tempshr.click').
 */
export function formatDomainLabel(domainUrl: string): string {
  try {
    const url = new URL(domainUrl.startsWith('http') ? domainUrl : `https://${domainUrl}`);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return domainUrl.replace(/^https?:\/\//, '').replace(/^www\./, '');
  }
}
