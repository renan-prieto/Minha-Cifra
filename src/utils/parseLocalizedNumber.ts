/**
 * Converte valores digitados em formato brasileiro para número.
 *
 * Exemplos:
 * - "1.234,56" -> 1234.56
 * - "1.234"    -> 1234   (ponto como separador de milhar)
 * - "10,50"    -> 10.5
 * - "10.50"    -> 10.5   (ponto como separador decimal)
 * - "R$ 2.500" -> 2500
 */
export function parseLocalizedNumber(value: string): number {
  if (typeof value !== "string") return NaN;

  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(/[^\d.,-]/g, "");

  if (!normalized) return 0;

  const isNegative = normalized.startsWith("-");
  const unsigned = normalized.replace(/-/g, "");

  let numeric: string;

  if (unsigned.includes(",")) {
    // Formato brasileiro: pontos são milhares e a vírgula é decimal.
    numeric = unsigned.replace(/\./g, "").replace(",", ".");
  } else if (unsigned.includes(".")) {
    const parts = unsigned.split(".");
    const lastPart = parts[parts.length - 1];

    // "1.234" / "1.234.567" usam ponto como milhar; "10.50" é decimal.
    numeric =
      parts.length > 1 && lastPart.length === 3
        ? parts.join("")
        : unsigned;
  } else {
    numeric = unsigned;
  }

  const parsed = Number(numeric);

  if (!Number.isFinite(parsed)) return NaN;

  return isNegative ? -parsed : parsed;
}