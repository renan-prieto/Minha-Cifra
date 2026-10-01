import type { TaxKey } from "@/src/context/TaxSettingsContext";
import { useMemo, useState } from "react";

export function useCalculator(taxes: Record<TaxKey, boolean>) {
  const [salario, setSalario] = useState(0);
  const [salarioCopy, setSalarioCopy] = useState(0);
  const [inss, setInss] = useState(0);
  const [imposto, setImposto] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [focused, setFocused] = useState(false);

  const calculateInss = (salarioBruto: number): number => {
    const teto = 8475.55;
    salarioBruto = Math.min(salarioBruto, teto);

    let calculado = 0;

    if (salarioBruto > 4354.28) {
      calculado += (salarioBruto - 4354.28) * 0.14;
      salarioBruto = 4354.28;
    }
    if (salarioBruto > 2902.85) {
      calculado += (salarioBruto - 2902.85) * 0.12;
      salarioBruto = 2902.85;
    }
    if (salarioBruto > 1621.0) {
      calculado += (salarioBruto - 1621.0) * 0.09;
      salarioBruto = 1621.0;
    }
    calculado += salarioBruto * 0.075;

    return Number(calculado.toFixed(2));
  };

  const calculateImposto = (
    salarioBruto: number,
    inssValue: number,
  ): number => {
    const baseOriginal = salarioBruto - inssValue;
    let baseCalculo = baseOriginal;
    let impostoCalculado = 0;
    let descontoCalculado = 0;

    if (baseOriginal <= 5000) return 0;

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
      descontoCalculado = 978.62 - 0.133145 * baseOriginal;
      impostoCalculado = Math.max(0, impostoCalculado - descontoCalculado);
      setDesconto(Number(descontoCalculado.toFixed(2)));
    }

    return Number(impostoCalculado.toFixed(2));
  };

  const handleCalculate = (salarioBruto: number) => {
    const valorInss = calculateInss(salarioBruto);
    const valorImposto = calculateImposto(salarioBruto, valorInss);

    setInss(valorInss);
    setImposto(valorImposto);
    setSalarioCopy(salarioBruto);
  };

  const result = useMemo(() => {
    const selectedInss = taxes.inss ? inss : 0;
    const selectedIncomeTax = taxes.irrf ? imposto : 0;
    const aliquotaInss = salarioCopy > 0 ? (selectedInss / salarioCopy) * 100 : 0;
    const aliquotaIr = salarioCopy > 0 ? (selectedIncomeTax / salarioCopy) * 100 : 0;
    const totalDescontos = selectedIncomeTax + selectedInss;
    const percentual =
      salarioCopy > 0 ? (totalDescontos / salarioCopy) * 100 : 0;
    const salarioLiquido = salarioCopy - selectedInss - selectedIncomeTax;

    return {
      aliquotaInss,
      aliquotaIr,
      totalDescontos,
      percentual,
      salarioLiquido,
      baseCalculo: salarioCopy - inss,
    };
  }, [imposto, inss, salarioCopy, taxes]);

  return {
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
