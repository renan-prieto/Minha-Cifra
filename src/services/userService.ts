import { router } from "expo-router";
import User from "../model/User";
import { api } from "./api";
import { saveAuthToken, saveUserData } from "./authService";

export const registerUser = async (user: User) => {
  try {
    const response = await api.post("/register", {
      email: user.getEmail(),
      password: user.getPassword(),
    });

    if (response.status === 202) {
      alert("Verifique seu e-mail para confirmar a criação da conta.");
      router.replace("/signIn");
    }
  } catch (error) {
    alert("Erro ao cadastrar usuário.");
  }
};

export const loginUser = async (user: User) => {
  try {
    const response = await api.post("/login", {
      email: user.getEmail(),
      password: user.getPassword(),
    });

    if (response.status === 200) {
      if (response.data.token) {
        await saveAuthToken(response.data.token);
      }

      const userData = {
        id: String(response.data.user.id),
        email: response.data.user.email,
        name: response.data.user.name || user.getEmail().split("@")[0],
        profileImage: response.data.user.profileImage || undefined,
      };
      await saveUserData(userData);
    }

    return response;
  } catch (error: any) {
    throw error;
  }
};

export const updateUserName = async (userId: string, name: string) => {
  try {
    const response = await api.put(`/user/${userId}`, { name });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId: string, password: string) => {
  try {
    const response = await api.delete(`/user/${userId}`, {
      data: {
        password,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
