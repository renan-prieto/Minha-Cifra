/**
 * Modelos de domínio financeiro compartilhados entre repositórios,
 * ViewModels e Views.
 */

/** Tipos persistidos no banco local. */
export type FinanceType = "earn" | "investment" | "lost";

/** Tipos usados pelo formulário de novo lançamento (nome legado "investiments"). */
export type ReleaseType = "earn" | "investiments" | "lost";

export interface ItemFinance {
  id: string;
  title: string | null;
  value: number;
  tag: string;
  year: number;
  month: string;
  /** Porcentagem de retorno para investimentos (ex.: 5 => 5%). */
  rate?: number;
  gain?: number;
}

export interface NewItemFinance {
  title: string | null;
  value: number;
  tag: string;
  rate?: number;
}

export interface FinanceCategory {
  type: FinanceType;
  title: string;
  description: string;
  tags: string[];
}
