import { act, renderHook } from "@testing-library/react-native";

import type { TaxSettings } from "@/src/models/Tax";
import { useCalculatorViewModel } from "@/src/viewmodels/useCalculatorViewModel";

let mockTaxes: TaxSettings = { inss: true, irrf: true };

jest.mock("@/src/contexts/TaxSettingsContext", () => ({
  useTaxSettings: () => ({ taxes: mockTaxes }),
}));

describe("useCalculatorViewModel", () => {
  beforeEach(() => {
    mockTaxes = { inss: true, irrf: true };
  });

  it("inicia com resultado zerado", () => {
    const { result } = renderHook(() => useCalculatorViewModel());

    expect(result.current.result).toEqual({
      aliquotaInss: 0,
      aliquotaIr: 0,
      totalDescontos: 0,
      percentual: 0,
      salarioLiquido: 0,
      baseCalculo: 0,
    });
  });

  it("calcula INSS e isenção de IRRF para salário de 5000", () => {
    const { result } = renderHook(() => useCalculatorViewModel());

    act(() => result.current.handleCalculate("5.000"));

    expect(result.current.salarioCopy).toBe(5000);
    expect(result.current.inss).toBe(501.51);
    expect(result.current.imposto).toBe(0);
    expect(result.current.result.totalDescontos).toBe(501.51);
    expect(result.current.result.salarioLiquido).toBe(4498.49);
    expect(result.current.result.baseCalculo).toBe(4498.49);
    expect(result.current.result.aliquotaInss).toBeCloseTo(10.0302, 4);
    expect(result.current.result.percentual).toBeCloseTo(10.0302, 4);
  });

  it("aplica a redução da Lei 14.848/2024 na faixa intermediária", () => {
    const { result } = renderHook(() => useCalculatorViewModel());

    act(() => result.current.handleCalculate("6000"));

    expect(result.current.inss).toBe(641.51);
    expect(result.current.imposto).toBe(385.11);
    expect(result.current.desconto).toBe(179.75);
    expect(result.current.result.totalDescontos).toBe(1026.62);
    expect(result.current.result.salarioLiquido).toBe(4973.38);
  });

  it("calcula as faixas completas para salários altos", () => {
    const { result } = renderHook(() => useCalculatorViewModel());

    act(() => result.current.handleCalculate("10000"));

    expect(result.current.inss).toBe(988.09);
    expect(result.current.imposto).toBe(1569.55);
    expect(result.current.result.totalDescontos).toBe(2557.64);
    expect(result.current.result.salarioLiquido).toBe(7442.36);
    expect(result.current.result.aliquotaInss).toBeCloseTo(9.8809, 4);
    expect(result.current.result.aliquotaIr).toBeCloseTo(15.6955, 4);
    expect(result.current.result.percentual).toBeCloseTo(25.5764, 4);
  });

  it("respeita o teto do INSS", () => {
    const { result: capped } = renderHook(() => useCalculatorViewModel());
    const { result: huge } = renderHook(() => useCalculatorViewModel());

    act(() => capped.current.handleCalculate("9000"));
    act(() => huge.current.handleCalculate("50000"));

    expect(capped.current.inss).toBe(988.09);
    expect(huge.current.inss).toBe(988.09);
  });

  it("usa o valor armazenado quando nenhum valor é informado", () => {
    const { result } = renderHook(() => useCalculatorViewModel());

    act(() => result.current.setSalario("3000"));
    act(() => result.current.handleCalculate());

    expect(result.current.salarioCopy).toBe(3000);
    expect(result.current.inss).toBeGreaterThan(0);
  });

  it("ignora entradas numéricas inválidas", () => {
    const { result } = renderHook(() => useCalculatorViewModel());

    act(() => result.current.handleCalculate("5.000"));
    act(() => result.current.handleCalculate("1.2.3"));

    expect(result.current.salarioCopy).toBe(5000);
  });

  it("não cobra INSS nem IRRF quando os impostos estão desativados", () => {
    mockTaxes = { inss: false, irrf: false };
    const { result } = renderHook(() => useCalculatorViewModel());

    act(() => result.current.handleCalculate("5000"));

    expect(result.current.inss).toBe(501.51);
    expect(result.current.result.totalDescontos).toBe(0);
    expect(result.current.result.salarioLiquido).toBe(5000);
    expect(result.current.result.baseCalculo).toBe(4498.49);
  });

  it("recalcula o resultado quando os impostos mudam", () => {
    const { result, rerender } = renderHook(() => useCalculatorViewModel());

    act(() => result.current.handleCalculate("5000"));
    expect(result.current.result.totalDescontos).toBe(501.51);

    mockTaxes = { inss: false, irrf: true };
    rerender({});

    expect(result.current.result.totalDescontos).toBe(0);
    expect(result.current.result.salarioLiquido).toBe(5000);
    expect(result.current.result.baseCalculo).toBe(4498.49);
  });

  it("controla o estado de foco do campo", () => {
    const { result } = renderHook(() => useCalculatorViewModel());

    expect(result.current.focused).toBe(false);
    act(() => result.current.setFocused(true));
    expect(result.current.focused).toBe(true);
  });
});
