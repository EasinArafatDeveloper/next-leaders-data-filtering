/**
 * Smart phone prefix regex builder for Bangladeshi & International mobile numbers.
 * Supports:
 * - 88017 / 017 / 17 -> GP (Matches 017..., 88017..., +88017..., 17...)
 * - 88018 / 018 / 18 -> Robi (Matches 018..., 88018..., +88018..., 18...)
 * - 88019 / 019 / 19 -> Banglalink (Matches 019..., 88019..., +88019..., 19...)
 * - 88015 / 015 / 15 -> Teletalk (Matches 015..., 88015..., +88015..., 15...)
 * - 88016 / 016 / 16 -> Airtel (Matches 016..., 88016..., +88016..., 16...)
 * - 88013 / 013 / 13 -> GP (Matches 013..., 88013..., +88013..., 13...)
 * - 88014 / 014 / 14 -> BL (Matches 014..., 88014..., +88014..., 14...)
 * - Any custom or international prefix
 */
export function buildPhonePrefixRegex(prefix: string): string {
  if (!prefix) return '';
  const clean = prefix.trim().replace(/[+\s\-()]/g, '');
  if (!clean) return '';

  // If user provided 88017... (starts with 880)
  if (clean.startsWith('880')) {
    const localPart = clean.slice(3); // e.g. "17" or "171"
    const escapedLocal = localPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return `^(\\+)?(880|0)?${escapedLocal}`;
  }

  // If user provided 017... (starts with 0)
  if (clean.startsWith('0')) {
    const localPart = clean.slice(1); // e.g. "17"
    const escapedLocal = localPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return `^(\\+)?(880|0)?${escapedLocal}`;
  }

  // If user provided standard 2-digit operator code like "17", "18", "19", "15", "16", "13", "14"
  if (clean.length === 2 && /^[1-9]\d$/.test(clean)) {
    return `^(\\+)?(880|0)?${clean}`;
  }

  // General fallback
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return `^(\\+)?(880|0)?${escaped}|^(\\+)?${escaped}`;
}
