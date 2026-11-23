import { api } from "../api";
import {
  deleteUser,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  updateUserName,
} from "../userRepository";
import User from "@/src/models/User";
import { router } from "expo-router";
import { saveAuthToken, saveUserData } from "../authRepository";

jest.mock("../api", () => ({
  api: {
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

jest.mock("../authRepository", () => ({
  saveAuthToken: jest.fn(),
  saveUserData: jest.fn(),
}));

describe("userRepository", () => {
  const alertSpy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = alertSpy;
  });

  afterAll(() => {
    // @ts-expect-error removal do stub de ambiente de teste
    delete global.alert;
  });

  describe("registerUser", () => {
    it("avisa para confirmar o e-mail e redireciona no status 202", async () => {
      (api.post as jest.Mock).mockResolvedValue({ status: 202 });

      await registerUser(new User("renan@example.com", "segredo123"));

      expect(api.post).toHaveBeenCalledWith("/register", {
        email: "renan@example.com",
        password: "segredo123",
      });
      expect(alertSpy).toHaveBeenCalledWith(
        "Verifique seu e-mail para confirmar a criação da conta.",
      );
      expect(router.replace).toHaveBeenCalledWith("/signIn");
    });

    it("não redireciona quando o status não é 202", async () => {
      (api.post as jest.Mock).mockResolvedValue({ status: 200 });

      await registerUser(new User("renan@example.com", "segredo123"));

      expect(router.replace).not.toHaveBeenCalled();
    });

    it("mostra erro de cadastro quando a API falha", async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error("falha"));

      await registerUser(new User("renan@example.com", "segredo123"));

      expect(alertSpy).toHaveBeenCalledWith("Erro ao cadastrar usuário.");
    });
  });

  describe("loginUser", () => {
    it("salva token e dados do usuário em um login bem-sucedido", async () => {
      const response = {
        status: 200,
        data: {
          token: "token-123",
          user: {
            id: 12,
            email: "renan@example.com",
            name: "Renan",
            profileImage: "foto.png",
          },
        },
      };
      (api.post as jest.Mock).mockResolvedValue(response);

      await expect(
        loginUser(new User("renan@example.com", "segredo123")),
      ).resolves.toBe(response);

      expect(api.post).toHaveBeenCalledWith("/login", {
        email: "renan@example.com",
        password: "segredo123",
      });
      expect(saveAuthToken).toHaveBeenCalledWith("token-123");
      expect(saveUserData).toHaveBeenCalledWith({
        id: "12",
        email: "renan@example.com",
        name: "Renan",
        profileImage: "foto.png",
      });
    });

    it("usa a parte local do e-mail quando o nome não vem da API", async () => {
      (api.post as jest.Mock).mockResolvedValue({
        status: 200,
        data: {
          token: "token-123",
          user: { id: 1, email: "renan@example.com" },
        },
      });

      await loginUser(new User("renan@example.com", "segredo123"));

      expect(saveUserData).toHaveBeenCalledWith(
        expect.objectContaining({ name: "renan", profileImage: undefined }),
      );
    });

    it("lança erro quando o servidor não devolve token", async () => {
      (api.post as jest.Mock).mockResolvedValue({
        status: 200,
        data: { user: { id: 1, email: "renan@example.com" } },
      });

      await expect(
        loginUser(new User("renan@example.com", "segredo123")),
      ).rejects.toThrow("O servidor não retornou uma sessão válida.");
      expect(saveAuthToken).not.toHaveBeenCalled();
    });

    it("não persiste nada quando o login não retorna 200", async () => {
      const response = { status: 401, data: {} };
      (api.post as jest.Mock).mockResolvedValue(response);

      await expect(
        loginUser(new User("renan@example.com", "segredo123")),
      ).resolves.toBe(response);

      expect(saveAuthToken).not.toHaveBeenCalled();
      expect(saveUserData).not.toHaveBeenCalled();
    });
  });

  describe("logoutUser", () => {
    it("chama a rota de logout", async () => {
      (api.post as jest.Mock).mockResolvedValue({ status: 200 });

      await logoutUser();

      expect(api.post).toHaveBeenCalledWith("/auth/logout");
    });

    it("ignora falhas de rede", async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error("sem rede"));

      await expect(logoutUser()).resolves.toBeUndefined();
    });
  });

  describe("updateUserName", () => {
    it("envia nome e senha", async () => {
      const response = { status: 200, data: { user: { name: "Renan" } } };
      (api.put as jest.Mock).mockResolvedValue(response);

      await expect(updateUserName("1", "Renan", "senha")).resolves.toBe(
        response,
      );
      expect(api.put).toHaveBeenCalledWith("/user/1", {
        name: "Renan",
        password: "senha",
      });
    });

    it("repassa o erro da API", async () => {
      const error = new Error("falha");
      (api.put as jest.Mock).mockRejectedValue(error);

      await expect(updateUserName("1", "Renan", "senha")).rejects.toBe(error);
    });
  });

  describe("requestPasswordReset", () => {
    it("retorna os dados da resposta", async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: { message: "Se houver conta, enviaremos." },
      });

      await expect(requestPasswordReset("renan@example.com")).resolves.toEqual({
        message: "Se houver conta, enviaremos.",
      });
      expect(api.post).toHaveBeenCalledWith("/request-password-reset", {
        email: "renan@example.com",
      });
    });
  });

  describe("deleteUser", () => {
    it("envia a senha no corpo da requisição DELETE", async () => {
      (api.delete as jest.Mock).mockResolvedValue({
        data: { message: "Conta deletada" },
      });

      await expect(deleteUser("1", "senha")).resolves.toEqual({
        message: "Conta deletada",
      });
      expect(api.delete).toHaveBeenCalledWith("/user/1", {
        data: { password: "senha" },
      });
    });

    it("repassa o erro da API", async () => {
      const error = new Error("falha");
      (api.delete as jest.Mock).mockRejectedValue(error);

      await expect(deleteUser("1", "senha")).rejects.toBe(error);
    });
  });
});
