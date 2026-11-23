import { useMemo, useState } from "react";

import { useTaxSettings } from "@/src/contexts/TaxSettingsContext";
import type { TaxSettings } from "@/src/models/Tax";
import { parseLocalizedNumber } from "@/src/utils/parseLocalizedNumber";

export interface CalculatorResult {
  aliquotaInss: number;
  aliquotaIr: number;
  totalDescontos: number;
  percentual: number;
  salarioLiquido: number;
  baseCalculo: number;
}

function calculateInss(salarioBruto: number): number {
  const teto = 8475.55;
  let base = Math.min(salarioBruto, teto);
  let calculado = 0;

  if (base > 4354.28) {
    calculado += (base - 4354.28) * 0.14;
    base = 4354.28;
  }
  if (base > 2902.85) {
    calculado += (base - 2902.85) * 0.12;
    base = 2902.85;
  }
  if (base > 1621.0) {
    calculado += (base - 1621.0) * 0.09;
    base = 1621.0;
  }
  calculado += base * 0.075;

  return Number(calculado.toFixed(2));
}

function calculateImposto(
  salarioBruto: number,
  inssValue: number,
): { imposto: number; desconto: number } {
  const baseOriginal = salarioBruto - inssValue;
  let baseCalculo = baseOriginal;
  let impostoCalculado = 0;
  let descontoCalculado = 0;

  if (baseOriginal <= 5000) {
    return { imposto: 0, desconto: 0 };
  }

  if (baseCalculo > 4664.69) {
    impostoCalculado += (baseCalculo - 4664.69) * 0.275;
    baseCalculo = 4664.69;
  }
  if (baseCalculo > 3751.06) {
    impostoCalculado += (baseCalculo - 3751.06) * 0.225;
    baseCalculo = 3751.06;
  }
  if (baseCalculo > 2826.66) {
    impostoCalculado += (baseCalculo - 2826.66) * 0.15;
    baseCalculo = 2826.66;
  }
  if (baseCalculo > 2428.81) {
    impostoCalculado += (baseCalculo - 2428.81) * 0.075;
  }

  if (baseOriginal <= 7350) {
    
    descontoCalculado = Math.max(0, 978.62 - 0.133145 * salarioBruto);
    impostoCalculado = Math.max(0, impostoCalculado - descontoCalculado);
  }

  return {
    imposto: Number(impostoCalculado.toFixed(2)),
    desconto: Number(descontoCalculado.toFixed(2)),
  };
}

function buildResult(
  salarioBruto: number,
  inss: number,
  imposto: number,
  taxes: TaxSettings,
): CalculatorResult {
  const selectedInss = taxes.inss ? inss : 0;
  const selectedIncomeTax = taxes.irrf ? imposto : 0;
  const aliquotaInss = salarioBruto > 0 ? (selectedInss / salarioBruto) * 100 : 0;
  const aliquotaIr =
    salarioBruto > 0 ? (selectedIncomeTax / salarioBruto) * 100 : 0;
  const totalDescontos = selectedIncomeTax + selectedInss;
  const percentual = salarioBruto > 0 ? (totalDescontos / salarioBruto) * 100 : 0;
  const salarioLiquido = salarioBruto - selectedInss - selectedIncomeTax;

  return {
    aliquotaInss,
    aliquotaIr,
    totalDescontos,
    percentual,
    salarioLiquido,
    baseCalculo: salarioBruto - inss,
  };
}

/**
 * ViewModel da calculadora de salário líquido.
 *
 * Concentra o estado do formulário, as regras de INSS/IRRF e a exposição
 * dos valores já formatados para a View.
 */
export function useCalculatorViewModel() {
  const { taxes } = useTaxSettings();
  const [salario, setSalario] = useState("");
  const [salarioCopy, setSalarioCopy] = useState(0);
  const [inss, setInss] = useState(0);
  const [imposto, setImposto] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [focused, setFocused] = useState(false);

  const handleCalculate = (rawValue: string = salario) => {
    const salarioBruto = parseLocalizedNumber(rawValue);

    if (!Number.isFinite(salarioBruto)) return;

    const valorInss = calculateInss(salarioBruto);
    const { imposto: valorImposto, desconto: valorDesconto } = calculateImposto(
      salarioBruto,
      valorInss,
    );

    setInss(valorInss);
    setImposto(valorImposto);
    setDesconto(valorDesconto);
    setSalarioCopy(salarioBruto);
  };

  const result = useMemo(
    () => buildResult(salarioCopy, inss, imposto, taxes),
    [imposto, inss, salarioCopy, taxes],
  );

  return {
    taxes,
    salario,
    setSalario,
    salarioCopy,
    inss,
    imposto,
    desconto,
    focused,
    setFocused,
    handleCalculate,
    result,
  };
}
