import { act, renderHook } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert } from "react-native";

import { useUser } from "@/src/contexts/UserContext";
import { useProfileViewModel } from "@/src/viewmodels/useProfileViewModel";

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: "images" },
}));

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock("@/src/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

describe("useProfileViewModel", () => {
  const updateProfileImage = jest.fn();
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "1", email: "renan@example.com", name: "Renan" },
      updateProfileImage,
    });
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///foto.png" }],
    });
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it("expõe o usuário do contexto", () => {
    const { result } = renderHook(() => useProfileViewModel());

    expect(result.current.user?.name).toBe("Renan");
  });

  it("pede permissão antes de abrir a galeria", async () => {
    const { result } = renderHook(() => useProfileViewModel());

    await act(async () => {
      await result.current.handlePickImageAsync();
    });

    expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    expect(updateProfileImage).toHaveBeenCalledWith("file:///foto.png");
  });

  it("avisa quando a permissão é negada", async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    });
    const { result } = renderHook(() => useProfileViewModel());

    await act(async () => {
      await result.current.handlePickImageAsync();
    });

    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      "Permissão necessária",
      "É preciso permitir o acesso à galeria para alterar a foto de perfil.",
    );
  });

  it("não atualiza a foto quando a seleção é cancelada", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: null,
    });
    const { result } = renderHook(() => useProfileViewModel());

    await act(async () => {
      await result.current.handlePickImageAsync();
    });

    expect(updateProfileImage).not.toHaveBeenCalled();
  });

  it("não atualiza quando a seleção não devolve asset", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [],
    });
    const { result } = renderHook(() => useProfileViewModel());

    await act(async () => {
      await result.current.handlePickImageAsync();
    });

    expect(updateProfileImage).not.toHaveBeenCalled();
  });

  it("navega para as configurações", () => {
    const { result } = renderHook(() => useProfileViewModel());

    act(() => result.current.handleNavigateToConfiguration());

    expect(router.push).toHaveBeenCalledWith("/(management)/configuration");
  });

  it("navega para a edição do perfil", () => {
    const { result } = renderHook(() => useProfileViewModel());

    act(() => result.current.handleEditProfile());

    expect(router.replace).toHaveBeenCalledWith("/(management)/views/editPerfil");
  });
});
