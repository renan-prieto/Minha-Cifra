import { act, renderHook } from "@testing-library/react-native";
import { router } from "expo-router";

import { useUser } from "@/src/contexts/UserContext";
import { useWelcomeViewModel } from "@/src/viewmodels/useWelcomeViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

jest.mock("@/src/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

describe("useWelcomeViewModel", () => {
  const enterAsGuest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
      enterAsGuest,
    });
  });

  it("expõe o estado da sessão", () => {
    const { result } = renderHook(() => useWelcomeViewModel());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("navega para o login", () => {
    const { result } = renderHook(() => useWelcomeViewModel());

    act(() => result.current.handleNavigateToSignIn());

    expect(router.push).toHaveBeenCalledWith("/(auth)/signIn");
  });

  it("navega para o cadastro", () => {
    const { result } = renderHook(() => useWelcomeViewModel());

    act(() => result.current.handleNavigateToSignUp());

    expect(router.push).toHaveBeenCalledWith("/(auth)/signUp");
  });

  it("entra como visitante", async () => {
    enterAsGuest.mockResolvedValue(undefined);
    const { result } = renderHook(() => useWelcomeViewModel());

    await act(async () => {
      await result.current.handleEnterAsGuest();
    });

    expect(enterAsGuest).toHaveBeenCalledTimes(1);
  });
});
