import User, { type UserData } from "@/src/models/User";
import {
    clearAuthData,
    getUserData,
    isAuthenticated,
    saveUserData,
} from "@/src/repositories/authRepository";
import { loginUser, logoutUser } from "@/src/repositories/userRepository";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

export type { UserData } from "@/src/models/User";

interface UserContextType {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  signIn: (userCredentials: User) => Promise<void>;
  enterAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileImage: (imageUri: string) => void;
  updateUser: (updatedUser: UserData) => Promise<void>;
  isUserAuthenticated: () => Promise<boolean>;
  isLoading: boolean;
}

const GUEST_USER: UserData = {
  id: "-1",
  name: "Visitante",
  email: "visitante@minhacifra.app",
  isGuest: true,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const authenticated = await isAuthenticated();

        if (authenticated) {
          const userData = await getUserData();
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Erro ao restaurar sessão:", error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const signIn = async (userCredentials: User) => {
    const response = await loginUser(userCredentials);

    if (response.status === 200) {
      setUser({
        id: String(response.data.user.id),
        email: response.data.user.email,
        name:
          response.data.user.name || userCredentials.getEmail().split("@")[0],
        profileImage: response.data.user.profileImage || undefined,
      });
    }
  };

  /**
   * Entra no app com uma sessão local de teste, sem criar conta no servidor.
   * Todos os recursos continuam disponíveis; os dados financeiros ficam
   * isolados no usuário visitante deste aparelho.
   */
  const enterAsGuest = async () => {
    // Evita herdar token/dados de uma sessão real anterior.
    await clearAuthData();
    await saveUserData(GUEST_USER);
    setUser(GUEST_USER);
  };

  const signOut = async () => {
    // Encerra a sessão no servidor em segundo plano para não atrasar o logout
    // local caso a API esteja indisponível. O visitante não tem sessão remota.
    if (!user?.isGuest) {
      void logoutUser();
    }

    await clearAuthData();
    setUser(null);
  };

  const updateProfileImage = (imageUri: string) => {
    if (!user) return;

    const updatedUser = {
        ...user,
        profileImage: imageUri,
      };

    setUser(updatedUser);
    void saveUserData(updatedUser);
  };

  const updateUser = async (updatedUser: UserData) => {
    setUser(updatedUser);
    await saveUserData(updatedUser);
  };

  const isUserAuthenticated = async () => {
    return await isAuthenticated();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        signIn,
        enterAsGuest,
        signOut,
        updateProfileImage,
        updateUser,
        isUserAuthenticated,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }

  return context;
};
