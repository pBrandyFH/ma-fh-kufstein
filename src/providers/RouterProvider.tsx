import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { ResultsRouter } from "../components/results/ResultsRouter";
import { AthleteProfile } from "../components/athletes/legacy/AthleteProfile";
import { FederationList } from "../components/federations/legacy/FederationList";
import { FederationEditPage } from "../components/federations/legacy/FederationEditPage";
import { ClubList } from "../components/clubs/ClubList";
import { ClubDetail } from "../components/clubs/ClubDetail";
import { ClubEditPage } from "../components/clubs/ClubEditPage";
import { ClubAthletes } from "../components/clubs/ClubAthletes";
import { InvitationList } from "../components/invitations/InvitationList";
import { InvitationForm } from "../components/invitations/InvitationForm";
import { NominationsView } from "../components/nominations/legacy/NominationsView";
import { CompetitionDetails } from "../components/competitions/legacy/CompetitionDetails";
import { EditCompetition } from "../components/competitions/legacy/EditCompetition";
import { RankingsView } from "../components/rankings/RankingsView";
import { RecordsView } from "../components/records/RecordsView";
import { AthletesView } from "../components/athletes/legacy/AthletesView";
import { EditAthlete } from "../components/athletes/legacy/EditAthlete";
import { MyAccount } from "../components/account/MyAccount";
import { DashboardPage } from "../pages/DashboardPage";
import { CompetitionsView } from "../components/competitions/legacy/CompetitionsView";
import { CustomNavigate } from "../components/common/CustomNavigate";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Group, Loader } from "@mantine/core";
import { LoginForm } from "@/components/auth/LoginForm";
import FederationDetailsPageLegacy from "@/pages/FederationDetailsPageLegacy";
import OverviewPage from "@/pages/admin/OverviewPage";
import FederationDetailsPage from "@/pages/admin/FederationDetailsPage";
import { MyCompetitionsPage } from "@/pages/admin/MyCompetitionsPage";
import MyMembersPage from "@/pages/admin/MyMembersPage";
import FederationAthletesPage from "@/pages/admin/FederationAthletesPage";
import CompetitionDetailsPage from "@/pages/admin/CompetitionDetailsPage";
import CompetitionEditGroupPage from "@/pages/admin/CompetitionEditGroupPage";

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
              path="create"
              element={
                <ProtectedRoute>
                  {/* <AthleteForm
                    federations={federations}
                    clubs={clubs}
                    onSubmit={async (values) => console.log(values)}
                  /> */}
                  <div>Athlete Form</div>
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute>
                  <AthleteProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/edit"
              element={
                <ProtectedRoute>
                  <EditAthlete />
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
              path=":id/flights/:flightNumber/edit"
              element={
                <ProtectedRoute>
                  <CompetitionEditGroupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/edit"
              element={
                <ProtectedRoute>
                  <EditCompetition />
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
              index
              element={
                <ProtectedRoute>
                  <FederationDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="create"
              element={
                <ProtectedRoute>
                  {/* <FederationForm
                    onSubmit={async (values) => {
                      await createFederation(values);
                    }}
                    parentFederations={federations}
                  /> */}
                  <div>Federation Form</div>
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute>
                  <FederationDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/edit"
              element={
                <ProtectedRoute>
                  <FederationEditPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/clubs">
            <Route
              index
              element={
                <ProtectedRoute>
                  <ClubList />
                </ProtectedRoute>
              }
            />
            <Route
              path="create"
              element={
                <ProtectedRoute>
                  {/* <ClubForm
                        federations={federations}
                        onSubmit={async (values) => console.log(values)}
                      /> */}
                  <div>Club Form</div>
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute>
                  <ClubDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/edit"
              element={
                <ProtectedRoute>
                  <ClubEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/athletes"
              element={
                <ProtectedRoute>
                  <ClubAthletes />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/invitations">
            <Route
              index
              element={
                <ProtectedRoute>
                  <InvitationList />
                </ProtectedRoute>
              }
            />
            <Route
              path="create"
              element={
                <ProtectedRoute>
                  <InvitationForm />
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

          <Route path="/results/*" element={<ResultsRouter />} />
          <Route path="/nominations" element={<NominationsView />} />
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
