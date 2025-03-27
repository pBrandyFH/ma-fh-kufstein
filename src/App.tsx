import { useState, useEffect } from "react";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
} from "./services/authService";
import type { UserRole, Federation, Club } from "./types";
import "./i18n";
import { getAllFederations } from "./services/federationService";
import { getAllClubs } from "./services/clubService";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./providers/ThemeProvider";
import { I18nProvider } from "./providers/I18nProvider";
import { RouterProvider } from "./providers/RouterProvider";

interface SelectOption {
  value: string;
  label: string;
}

const transformToSelectOptions = (
  items: (Federation | Club)[]
): SelectOption[] => {
  return items.map((item) => ({
    value: item._id,
    label: item.name,
  }));
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [_, setUser] = useState<{ role: UserRole } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isAuthenticated();
      setAuthenticated(isAuth);
      if (isAuth) {
        const user = getCurrentUser();
        if (user) {
          setUser(user);
        }
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    const isAuth = await isAuthenticated();
    setAuthenticated(isAuth);
    if (isAuth) {
      const user = getCurrentUser();
      if (user) {
        setUser(user);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    setAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthProvider>
      <I18nProvider>
        <ThemeProvider>
          <RouterProvider
            authenticated={authenticated}
            onLogout={handleLogout}
            onLogin={handleLogin}
          />
        </ThemeProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
