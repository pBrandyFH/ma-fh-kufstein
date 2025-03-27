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
  return (
    <AuthProvider>
      <I18nProvider>
        <ThemeProvider>
          <RouterProvider />
        </ThemeProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
