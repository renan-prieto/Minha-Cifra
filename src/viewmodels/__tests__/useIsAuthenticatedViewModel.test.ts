import { renderHook, waitFor } from "@testing-library/react-native";

import { isAuthenticated } from "@/src/repositories/authRepository";
import { useIsAuthenticatedViewModel } from "@/src/viewmodels/useIsAuthenticatedViewModel";

jest.mock("@/src/repositories/authRepository", () => ({
  isAuthenticated: jest.fn(),
}));

describe("useIsAuthenticatedViewModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("começa carregando", () => {
    (isAuthenticated as jest.Mock).mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useIsAuthenticatedViewModel());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isLoggedIn).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("marca como autenticado quando a sessão é válida", async () => {
    (isAuthenticated as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useIsAuthenticatedViewModel());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("marca como não autenticado quando a sessão é inválida", async () => {
    (isAuthenticated as jest.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => useIsAuthenticatedViewModel());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("trata falhas como sessão inválida", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    (isAuthenticated as jest.Mock).mockRejectedValue(new Error("falha"));

    const { result } = renderHook(() => useIsAuthenticatedViewModel());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isLoggedIn).toBe(false);
    expect(consoleError).toHaveBeenCalledWith(
      "Erro ao verificar autenticação:",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });
});
