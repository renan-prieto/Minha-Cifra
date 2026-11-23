import { parseLocalizedNumber } from "@/src/utils/parseLocalizedNumber";

describe("parseLocalizedNumber", () => {
  it("retorna 0 para string vazia ou apenas símbolos", () => {
    expect(parseLocalizedNumber("")).toBe(0);
    expect(parseLocalizedNumber("   ")).toBe(0);
    expect(parseLocalizedNumber("R$")).toBe(0);
    expect(parseLocalizedNumber("abc")).toBe(0);
  });

  it("converte o formato brasileiro completo", () => {
    expect(parseLocalizedNumber("1.234,56")).toBe(1234.56);
    expect(parseLocalizedNumber("12.345,67")).toBe(12345.67);
    expect(parseLocalizedNumber("R$ 1.234,56")).toBe(1234.56);
  });

  it("trata ponto como separador de milhar quando há três dígitos após ele", () => {
    expect(parseLocalizedNumber("1.234")).toBe(1234);
    expect(parseLocalizedNumber("1.234.567")).toBe(1234567);
    expect(parseLocalizedNumber("R$ 2.500")).toBe(2500);
  });

  it("trata ponto como separador decimal quando a parte final não tem três dígitos", () => {
    expect(parseLocalizedNumber("10.50")).toBe(10.5);
    expect(parseLocalizedNumber("0.5")).toBe(0.5);
    expect(parseLocalizedNumber("10.5")).toBe(10.5);
  });

  it("converte vírgula decimal", () => {
    expect(parseLocalizedNumber("10,50")).toBe(10.5);
    expect(parseLocalizedNumber("0,5")).toBe(0.5);
  });

  it("preserva valores negativos", () => {
    expect(parseLocalizedNumber("-1.234,56")).toBe(-1234.56);
    expect(parseLocalizedNumber("-10,50")).toBe(-10.5);
    expect(parseLocalizedNumber("R$ -300")).toBe(-300);
  });

  it("remove espaços e caracteres não numéricos", () => {
    expect(parseLocalizedNumber("  R$ 1 234 , 50 ")).toBe(1234.5);
    expect(parseLocalizedNumber("R$1.000,00")).toBe(1000);
  });

  it("retorna NaN para entradas numéricas inválidas", () => {
    expect(parseLocalizedNumber("1.2.3")).toBeNaN();
    expect(parseLocalizedNumber(".")).toBeNaN();
  });

  it("retorna NaN quando o valor não é uma string", () => {
    expect(parseLocalizedNumber(123 as unknown as string)).toBeNaN();
    expect(parseLocalizedNumber(null as unknown as string)).toBeNaN();
    expect(parseLocalizedNumber(undefined as unknown as string)).toBeNaN();
  });
});
