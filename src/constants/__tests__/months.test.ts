import { MONTH_NAMES, MONTH_NAMES_LOWERCASE } from "@/src/constants/months";

describe("months", () => {
  it("contém os doze meses em português", () => {
    expect(MONTH_NAMES).toHaveLength(12);
    expect(MONTH_NAMES[0]).toBe("Janeiro");
    expect(MONTH_NAMES[11]).toBe("Dezembro");
  });

  it("expõe a versão em minúsculas na mesma ordem", () => {
    expect(MONTH_NAMES_LOWERCASE).toHaveLength(MONTH_NAMES.length);
    expect(MONTH_NAMES_LOWERCASE[2]).toBe("março");
    expect(MONTH_NAMES_LOWERCASE.every((month) => month === month.toLowerCase())).toBe(
      true,
    );
  });
});
