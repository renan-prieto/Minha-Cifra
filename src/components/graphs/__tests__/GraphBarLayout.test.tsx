import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { GraphBarLayout } from "@/src/components/graphs/GraphBarLayout";

let mockWidth = 360;

jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: () => ({
    width: mockWidth,
    height: 800,
    scale: 1,
    fontScale: 1,
  }),
}));

jest.mock("@/src/contexts/ThemeContext", () => ({
  useTheme: () => ({ isDark: false }),
}));

const data = [
  {
    year: 2026,
    month: "Novembro",
    earn: 1234.56,
    lost: 987.65,
    investments: 100,
  },
];

function renderLayout() {
  return render(
    <GraphBarLayout
      data={data}
      maxValue={1234.56}
      receitas={1234.56}
      despesas={987.65}
      investimentos={100}
    />,
  );
}

describe("GraphBarLayout responsividade do resumo", () => {
  it("exibe os valores formatados em uma única linha", () => {
    renderLayout();

    expect(screen.getByText("Receitas")).toBeTruthy();
    expect(screen.getByText("R$ 1.234,56").props.numberOfLines).toBe(1);
    expect(screen.getByText("R$ 987,65").props.numberOfLines).toBe(1);
    expect(screen.getByText("R$ 100,00").props.numberOfLines).toBe(1);
  });

  it("reduz a fonte dos valores em telas estreitas", () => {
    const longValues = (
      <GraphBarLayout
        data={data}
        maxValue={12345678.9}
        receitas={12345678.9}
        despesas={9876543.21}
        investimentos={100}
      />
    );

    mockWidth = 280;
    const narrow = render(longValues);
    const narrowFontSize = StyleSheet.flatten(
      screen.getByText("R$ 12.345.678,90").props.style,
    ).fontSize;
    narrow.unmount();

    mockWidth = 768;
    const wide = render(longValues);
    const wideFontSize = StyleSheet.flatten(
      screen.getByText("R$ 12.345.678,90").props.style,
    ).fontSize;
    wide.unmount();

    expect(narrowFontSize).toBeLessThan(wideFontSize);
  });
});
