import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { LoginForm } from "../components/auth/LoginForm";
import { DashboardRouter } from "../components/dashboard/DashboardRouter";
import { ResultsRouter } from "../components/results/ResultsRouter";
import { AthleteProfile } from "../components/athletes/AthleteProfile";
import { AthleteForm } from "../components/athletes/AthleteForm";
import { CompetitionForm } from "../components/competitions/CompetitionForm";
import { FederationForm } from "../components/federations/FederationForm";
import { FederationList } from "../components/federations/FederationList";
import { FederationDetail } from "../components/federations/FederationDetail";
import { FederationEditPage } from "../components/federations/FederationEditPage";
import { ClubList } from "../components/clubs/ClubList";
import { ClubForm } from "../components/clubs/ClubForm";
import { ClubDetail } from "../components/clubs/ClubDetail";
import { ClubEditPage } from "../components/clubs/ClubEditPage";
import { ClubAthletes } from "../components/clubs/ClubAthletes";
import { InvitationList } from "../components/invitations/InvitationList";
import { InvitationForm } from "../components/invitations/InvitationForm";
import { NominationsView } from "../components/nominations/NominationsView";
import { CompetitionDetails } from "../components/competitions/CompetitionDetails";
import { EditCompetition } from "../components/competitions/EditCompetition";
import { RankingsView } from "../components/rankings/RankingsView";
import { RecordsView } from "../components/records/RecordsView";
import { AthletesView } from "../components/athletes/AthletesView";
import { EditAthlete } from "../components/athletes/EditAthlete";
import { MyAccount } from "../components/account/MyAccount";
import { AuthProvider } from "../contexts/AuthContext";
import type { Federation, Club } from "../types";
import { createFederation } from "../services/federationService";
import { CompetitionsPage } from "../pages/CompetitionsPage";

interface SelectOption {
  value: string;
  label: string;
}

interface RouterProviderProps {
  authenticated: boolean;
  onLogout: () => void;
  onLogin: () => void;
  federations: Federation[];
  clubs: Club[];
}

const transformToSelectOptions = (
  items: (Federation | Club)[]
): SelectOption[] => {
  return items.map((item) => ({
    value: item._id,
    label: item.name,
  }));
};

export function RouterProvider({
  authenticated,
  onLogout,
  onLogin,
  federations,
  clubs,
}: RouterProviderProps) {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!authenticated) {
      return <Navigate to="/auth/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <AuthProvider>
        <MainLayout authenticated={authenticated} onLogout={onLogout}>
          <Routes>
            <Route
              path="/"
              element={
                <Navigate
                  to={authenticated ? "/dashboard" : "/results"}
                  replace
                />
              }
            />

            <Route
              path="/login"
              element={
                authenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginForm onSuccess={onLogin} />
                )
              }
            />

            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />

            <Route path="/athletes">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <AthletesView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="create"
                element={
                  <ProtectedRoute>
                    <AthleteForm
                      federations={transformToSelectOptions(federations)}
                      clubs={transformToSelectOptions(clubs)}
                      onSubmit={async (values) => console.log(values)}
                    />
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

            <Route path="/competitions">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <CompetitionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="create"
                element={
                  <ProtectedRoute>
                    <CompetitionForm
                      federations={transformToSelectOptions(federations)}
                      clubs={transformToSelectOptions(clubs)}
                      onSubmit={async (values) => console.log(values)}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <CompetitionDetails />
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

            <Route path="/federations">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <FederationList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="create"
                element={
                  <ProtectedRoute>
                    <FederationForm
                      onSubmit={async (values) => {
                        await createFederation(values);
                      }}
                      parentFederations={transformToSelectOptions(federations)}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <FederationDetail />
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
                    <ClubForm
                      federations={transformToSelectOptions(federations)}
                      onSubmit={async (values) => console.log(values)}
                    />
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

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </AuthProvider>
    </Router>
  );
}
