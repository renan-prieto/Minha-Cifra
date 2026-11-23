import { act, renderHook } from "@testing-library/react-native";

import { useGraphicFilter } from "@/src/viewmodels/useGraphicFilter";

describe("useGraphicFilter", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("inicia no mês e ano atuais", () => {
    jest.useFakeTimers().setSystemTime(new Date(2024, 5, 15));

    const { result } = renderHook(() => useGraphicFilter());

    expect(result.current.currentMonthLabel).toBe("Junho");
    expect(result.current.currentYearLabel).toBe(2024);
    expect(result.current.currentPrevMonth).toBe("Maio");
    expect(result.current.currentNextMonth).toBe("Julho");
  });

  it("avança para o próximo mês", () => {
    jest.useFakeTimers().setSystemTime(new Date(2024, 5, 15));
    const { result } = renderHook(() => useGraphicFilter());

    act(() => result.current.nextMonth());

    expect(result.current.currentMonthLabel).toBe("Julho");
    expect(result.current.currentMonthIndex).toBe(6);
  });

  it("volta para o mês anterior", () => {
    jest.useFakeTimers().setSystemTime(new Date(2024, 5, 15));
    const { result } = renderHook(() => useGraphicFilter());

    act(() => result.current.prevMonth());

    expect(result.current.currentMonthLabel).toBe("Maio");
    expect(result.current.currentMonthIndex).toBe(4);
  });

  it("vira o ano ao avançar de dezembro", () => {
    jest.useFakeTimers().setSystemTime(new Date(2024, 11, 15));
    const { result } = renderHook(() => useGraphicFilter());

    expect(result.current.currentNextMonth).toBe("Janeiro");

    act(() => result.current.nextMonth());

    expect(result.current.currentMonthLabel).toBe("Janeiro");
    expect(result.current.currentYearLabel).toBe(2025);
  });

  it("vira o ano ao voltar de janeiro", () => {
    jest.useFakeTimers().setSystemTime(new Date(2024, 0, 15));
    const { result } = renderHook(() => useGraphicFilter());

    expect(result.current.currentPrevMonth).toBe("Dezembro");

    act(() => result.current.prevMonth());

    expect(result.current.currentMonthLabel).toBe("Dezembro");
    expect(result.current.currentYearLabel).toBe(2023);
  });

  it("mantém os labels vizinhos corretos após navegar", () => {
    jest.useFakeTimers().setSystemTime(new Date(2024, 5, 15));
    const { result } = renderHook(() => useGraphicFilter());

    act(() => result.current.nextMonth());

    expect(result.current.currentPrevMonth).toBe("Junho");
    expect(result.current.currentNextMonth).toBe("Agosto");
  });
});
