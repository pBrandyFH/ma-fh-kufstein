import { useState, useEffect } from "react";
import {
  MantineProvider,
  ColorSchemeProvider,
  type ColorScheme,
  Container,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthLayout } from "./components/auth/AuthLayout";
import { WelcomePage } from "./components/welcome/WelcomePage";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { DashboardRouter } from "./components/dashboard/DashboardRouter";
import { ResultsRouter } from "./components/results/ResultsRouter";
import { AthleteProfile } from "./components/athletes/AthleteProfile";
import { AthleteForm } from "./components/athletes/AthleteForm";
import { CompetitionForm } from "./components/competitions/CompetitionForm";
import { FederationForm } from "./components/federations/FederationForm";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
} from "./services/authService";
import type { UserRole, Federation, Club } from "./types";
import "./i18n";
import { FederationList } from "./components/federations/FederationList";
import { FederationDetail } from "./components/federations/FederationDetail";
import { FederationEditPage } from "./components/federations/FederationEditPage";
import {
  createFederation,
  getAllFederations,
} from "./services/federationService";
import { ClubList } from "./components/clubs/ClubList";
import { ClubForm } from "./components/clubs/ClubForm";
import { ClubDetail } from "./components/clubs/ClubDetail";
import { ClubEditPage } from "./components/clubs/ClubEditPage";
import { ClubAthletes } from "./components/clubs/ClubAthletes";
import { createClub, getAllClubs } from "./services/clubService";
import { InvitationList } from "./components/invitations/InvitationList";
import { InvitationForm } from "./components/invitations/InvitationForm";
import { NominationsView } from "./components/nominations/NominationsView";
import { CompetitionsView } from "./components/competitions/CompetitionsView";
import { CompetitionDetails } from "./components/competitions/CompetitionDetails";
import { EditCompetition } from "./components/competitions/EditCompetition";
import { RankingsView } from "./components/rankings/RankingsView";
import { RecordsView } from "./components/records/RecordsView";
import { AthletesView } from "./components/athletes/AthletesView";
import { EditAthlete } from "./components/athletes/EditAthlete";
import { MyAccount } from "./components/account/MyAccount";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./providers/ThemeProvider";
import { I18nProvider } from "./providers/I18nProvider";
import { RouterProvider } from "./providers/RouterProvider";
import { DashboardPage } from "./pages/DashboardPage";

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
  const [user, setUser] = useState<{ role: UserRole } | null>(null);
  const [federations, setFederations] = useState<Federation[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (authenticated) {
        try {
          const [federationsResponse, clubsResponse] = await Promise.all([
            getAllFederations(),
            getAllClubs(),
          ]);

          if (federationsResponse.success && federationsResponse.data) {
            setFederations(federationsResponse.data);
          }
          if (clubsResponse.success && clubsResponse.data) {
            setClubs(clubsResponse.data);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, [authenticated]);

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
            federations={federations}
            clubs={clubs}
          />
        </ThemeProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
