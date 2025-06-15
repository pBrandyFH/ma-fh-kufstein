import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { RankingsView } from "../components/rankings/RankingsView";
import { RecordsView } from "../components/records/RecordsView";
import { MyAccount } from "../components/account/MyAccount";
import { CustomNavigate } from "../components/common/CustomNavigate";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Group, Loader } from "@mantine/core";
import { LoginForm } from "@/components/auth/LoginForm";
import OverviewPage from "@/pages/admin/OverviewPage";
import FederationDetailsPage from "@/pages/admin/FederationDetailsPage";
import { MyCompetitionsPage } from "@/pages/admin/MyCompetitionsPage";
import MyMembersPage from "@/pages/admin/MyMembersPage";
import FederationAthletesPage from "@/pages/admin/FederationAthletesPage";
import CompetitionDetailsPage from "@/pages/admin/CompetitionDetailsPage";
import CompetitionEditGroupPage from "@/pages/admin/CompetitionEditGroupPage";
import CompetitionScoreSelectFlightPage from "@/pages/admin/CompetitionScoreSelectFlightPage";
import CompetitionScorePage from "@/pages/admin/CompetitionScorePage";
import ResultsPage from "@/pages/ResultsPage";
import ResultsDetailPage from "@/pages/ResultsDetailPage";

export function RouterProvider() {
  const { authenticated, isAuthLoading, logout, login } = useAuth();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthLoading) {
      return (
        <Card>
          <Group position="center" py="xl">
            <Loader />
          </Group>
        </Card>
      );
    }

    if (!authenticated) {
      return <CustomNavigate to="/login" replace preserveSearch />;
    }

    return children;
  };

  return (
    <Router>
      <MainLayout authenticated={authenticated} onLogout={logout}>
        <Routes>
          <Route
            path="/login"
            element={
              authenticated ? (
                <CustomNavigate to="/" replace preserveSearch />
              ) : (
                <LoginForm onSuccess={login} />
              )
            }
          />

          <Route path="/dashboard">
            <Route
              index
              element={
                <ProtectedRoute>
                  <OverviewPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/fed-athletes">
            <Route
              index
              element={
                <ProtectedRoute>
                  <FederationAthletesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute>
                  <div>to do: Athlete Profile</div>
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/competitions" element={<Outlet />}>
            <Route
              index
              element={
                <ProtectedRoute>
                  <MyCompetitionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute>
                  <CompetitionDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/scores"
              element={
                <ProtectedRoute>
                  <CompetitionScoreSelectFlightPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/scores/:flightId"
              element={
                <ProtectedRoute>
                  <CompetitionScorePage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/flights/:flightId/edit"
              element={
                <ProtectedRoute>
                  <CompetitionEditGroupPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/members" element={<Outlet />}>
            <Route
              index
              element={
                <ProtectedRoute>
                  <MyMembersPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/federations" element={<Outlet />}>
            <Route
              path=":id"
              element={
                <ProtectedRoute>
                  <FederationDetailsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/account">
            <Route
              index
              element={
                <ProtectedRoute>
                  <MyAccount />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/results">
            <Route index element={<ResultsPage />} />
            <Route path=":id" element={<ResultsDetailPage />} />
          </Route>

          <Route
            path="/nominations"
            element={<div>to do: nominationsview</div>}
          />
          <Route path="/rankings" element={<RankingsView />} />
          <Route path="/records" element={<RecordsView />} />

          <Route
            path="/"
            element={
              <CustomNavigate
                to={authenticated ? "/dashboard" : "/results"}
                preserveSearch
                replace
              />
            }
          />
          <Route path="*" element={<CustomNavigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
