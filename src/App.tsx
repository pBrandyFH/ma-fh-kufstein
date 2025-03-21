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
import { ResultsView } from "./components/results/ResultsView";
import { AthleteProfile } from "./components/athletes/AthleteProfile";
import { AthleteForm } from "./components/athletes/AthleteForm";
import { CompetitionForm } from "./components/competitions/CompetitionForm";
import { FederationForm } from "./components/federations/FederationForm";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
} from "./services/authService";
import type { UserRole } from "./types";
import "./i18n";
import { FederationList } from "./components/federations/FederationList";
import { FederationDetail } from "./components/federations/FederationDetail";
import { FederationEditPage } from "./components/federations/FederationEditPage";
import { createFederation } from "./services/federationService";
import { ClubList } from "./components/clubs/ClubList";
import { ClubForm } from "./components/clubs/ClubForm";
import { ClubDetail } from "./components/clubs/ClubDetail";
import { ClubEditPage } from "./components/clubs/ClubEditPage";
import { ClubAthletes } from "./components/clubs/ClubAthletes";
import { createClub } from "./services/clubService";
import { InvitationList } from "./components/invitations/InvitationList";
import { InvitationForm } from "./components/invitations/InvitationForm";

export default function App() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);

      if (isAuth) {
        const user = getCurrentUser();
        if (user) {
          setUserRole(user.role);
        }
      }
    };

    checkAuth();
  }, []);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme =
      value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(nextColorScheme);
    localStorage.setItem("colorScheme", nextColorScheme);
  };

  const handleLogin = () => {
    setAuthenticated(true);
    const user = getCurrentUser();
    if (user) {
      setUserRole(user.role);
    }
  };

  const handleLogout = async () => {
    await logout();
    setAuthenticated(false);
    setUserRole(null);
  };

  // Define role-based access for routes
  const adminRoles: UserRole[] = [
    "clubAdmin",
    "federalStateAdmin",
    "stateAdmin",
    "continentalAdmin",
    "internationalAdmin",
  ];
  const federationAdminRoles: UserRole[] = [
    "federalStateAdmin",
    "stateAdmin",
    "continentalAdmin",
    "internationalAdmin",
  ];
  const nationalAdminRoles: UserRole[] = [
    "stateAdmin",
    "continentalAdmin",
    "internationalAdmin",
  ];
  const continentalAdminRoles: UserRole[] = [
    "continentalAdmin",
    "internationalAdmin",
  ];
  const internationalAdminRoles: UserRole[] = ["internationalAdmin"];

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        <Notifications />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <AuthLayout>
                  <WelcomePage />
                </AuthLayout>
              }
            />
            <Route path="/results" element={<ResultsView />} />
            <Route
              path="/results/live"
              element={<ResultsView isLive={true} />}
            />
            <Route path="/rankings" element={<div>Rankings Page</div>} />
            <Route path="/records" element={<div>Records Page</div>} />
            <Route
              path="/athletes/:id"
              element={<AthleteProfile athleteId="1" />}
            />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                authenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <AuthLayout>
                    <LoginForm onSuccess={handleLogin} />
                  </AuthLayout>
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                authenticated ? (
                  <MainLayout onLogout={handleLogout}>
                    <Routes>
                      <Route path="/dashboard" element={<DashboardRouter />} />
                      <Route
                        path="/nominations"
                        element={<div>Nominations Page</div>}
                      />
                      <Route
                        path="/competitions"
                        element={<div>Competitions Page</div>}
                      />
                      <Route
                        path="/competitions/create"
                        element={
                          <ProtectedRoute allowedRoles={federationAdminRoles}>
                            <CompetitionForm
                              onSubmit={async (values) => console.log(values)}
                              federations={[]}
                              clubs={[]}
                            />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/competitions/:id"
                        element={<div>Competition Details</div>}
                      />
                      <Route
                        path="/competitions/:id/edit"
                        element={
                          <ProtectedRoute allowedRoles={federationAdminRoles}>
                            <div>Edit Competition</div>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/athletes"
                        element={<div>Athletes Page</div>}
                      />
                      <Route
                        path="/athletes/create"
                        element={
                          <ProtectedRoute allowedRoles={adminRoles}>
                            <AthleteForm
                              onSubmit={async (values) => console.log(values)}
                              clubs={[]}
                              federations={[]}
                            />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/athletes/:id/edit"
                        element={
                          <ProtectedRoute allowedRoles={adminRoles}>
                            <div>Edit Athlete</div>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/federations"
                        element={
                          <ProtectedRoute
                            allowedRoles={[
                              "stateAdmin",
                              "continentalAdmin",
                              "internationalAdmin",
                            ]}
                          >
                            <FederationList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/federations/create"
                        element={
                          <ProtectedRoute
                            allowedRoles={[
                              "stateAdmin",
                              "continentalAdmin",
                              "internationalAdmin",
                            ]}
                          >
                            <FederationForm
                              onSubmit={async (values) => {
                                await createFederation(values);
                              }}
                              parentFederations={[]}
                            />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/federations/:id"
                        element={
                          <ProtectedRoute>
                            <FederationDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/federations/:id/edit"
                        element={
                          <ProtectedRoute
                            allowedRoles={[
                              "federalStateAdmin",
                              "stateAdmin",
                              "continentalAdmin",
                              "internationalAdmin",
                            ]}
                          >
                            <FederationEditPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/clubs"
                        element={
                          <ProtectedRoute>
                            <ClubList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/clubs/create"
                        element={
                          <ProtectedRoute
                            allowedRoles={[
                              "federalStateAdmin",
                              "stateAdmin",
                              "continentalAdmin",
                              "internationalAdmin",
                            ]}
                          >
                            <ClubForm
                              onSubmit={async (values) => {
                                await createClub(values);
                              }}
                              federations={[]}
                            />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/clubs/:id"
                        element={
                          <ProtectedRoute>
                            <ClubDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/clubs/:id/edit"
                        element={
                          <ProtectedRoute
                            allowedRoles={[
                              "clubAdmin",
                              "federalStateAdmin",
                              "stateAdmin",
                              "continentalAdmin",
                              "internationalAdmin",
                            ]}
                          >
                            <ClubEditPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/clubs/:id/athletes"
                        element={
                          <ProtectedRoute>
                            <ClubAthletes />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/invitations"
                        element={
                          <ProtectedRoute
                            allowedRoles={[
                              "clubAdmin",
                              "federalStateAdmin",
                              "stateAdmin",
                              "continentalAdmin",
                              "internationalAdmin",
                            ]}
                          >
                            <InvitationList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/invitations/new"
                        element={
                          <ProtectedRoute
                            allowedRoles={[
                              "clubAdmin",
                              "federalStateAdmin",
                              "stateAdmin",
                              "continentalAdmin",
                              "internationalAdmin",
                            ]}
                          >
                            <InvitationForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/account" element={<div>My Account</div>} />
                      <Route
                        path="*"
                        element={<Navigate to="/dashboard" replace />}
                      />
                    </Routes>
                  </MainLayout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Router>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
