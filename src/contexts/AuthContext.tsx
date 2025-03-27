import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as authService from "../services/authService";
import type { User, LoginFormValues } from "../types";
import {
  getCurrentUser,
  isAuthenticated,
  logout,
} from "../services/authService";

interface AuthContextType {
  authenticated: boolean;
  user: User | null;
  isAuthLoading: boolean; 
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthLoading(true); // Set loading to true when checking
      try {
        const isAuth = await isAuthenticated();
        setAuthenticated(isAuth);
        if (isAuth) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsAuthLoading(false); // Set loading to false when done
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    setIsAuthLoading(true); // Set loading to true when checking
    try {
      const isAuth = await isAuthenticated();
      setAuthenticated(isAuth);
      if (isAuth) {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsAuthLoading(false); // Set loading to false when done
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user,
        isAuthLoading, // Add this to the context value
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
