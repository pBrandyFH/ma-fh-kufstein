import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as authService from "../services/authService";
import type { User, LoginFormValues, Federation, Member } from "../types";
import {
  getCurrentUser,
  isAuthenticated,
  logout,
} from "../services/authService";
import { getFederationById } from "@/services/federationService";
import { getMemberById } from "@/services/memberService";

interface AuthContextType {
  authenticated: boolean;
  user: User | null;
  federation: Federation | null;
  member: Member | null;
  isAuthLoading: boolean;
  isMemberAdmin: boolean;
  isFedAdmin: boolean;
  setData: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [federation, setFederation] = useState<Federation | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [isMemberAdmin, setIsMemberAdmin] = useState<boolean>(false);
  const [isFedAdmin, setIsFedAdmin] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const setData = async () => {
    const isAuth = await isAuthenticated();
    setAuthenticated(isAuth);
    if (isAuth) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const fedRole = currentUser?.federationRoles[0];

        if (fedRole) {
          const { data: federation } = await getFederationById(
            fedRole.federationId ?? ""
          );

          if (federation) {
            setFederation(federation);
          }

          if ("memberId" in fedRole) {
            const { data: member } = await getMemberById(
              fedRole.memberId ?? ""
            );

            if (member) {
              setMember(member);
              setIsMemberAdmin(true);
            }
          } else {
            setIsFedAdmin(true);
          }
          setUser(currentUser);
        }
      }
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthLoading(true);
      try {
        await setData();
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    setIsAuthLoading(true);
    try {
      await setData();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setAuthenticated(false);
      setUser(null);
      setFederation(null);
      setMember(null);
      setIsFedAdmin(false);
      setIsMemberAdmin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user,
        federation,
        member,
        isAuthLoading,
        isFedAdmin,
        isMemberAdmin,
        setData,
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
