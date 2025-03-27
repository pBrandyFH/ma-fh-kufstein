import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { UserRole } from "../../types";
import { isAuthenticated, getCurrentUser } from "../../services/authService";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  if (!authenticated) {
    return (
      <Navigate to={`/login${location.search}`} state={{ from: location }} />
    );
  }

  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    console.log("Redirecting to dashboard");
    // Preserve search params when redirecting to dashboard
    return <Navigate to={`/results${location.search}`} />;
  }

  return <>{children}</>;
}
