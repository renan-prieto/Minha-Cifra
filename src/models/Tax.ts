/** Impostos que podem ser aplicados na calculadora de salário líquido. */
export type TaxKey = "inss" | "irrf";

export type TaxSettings = Record<TaxKey, boolean>;

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  inss: true,
  irrf: true,
};
