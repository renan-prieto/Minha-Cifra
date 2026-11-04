export function parseLocalizedNumber(value: string): number {
  const normalized = value.trim().replace(/\s/g, "");

  if (!normalized) return 0;

  const decimalNormalized = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized;

  return Number(decimalNormalized);
}
