import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, hasAcceptedTerms } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  // Wait until we know whether terms were accepted to avoid a flash of redirect.
  if (hasAcceptedTerms === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!hasAcceptedTerms && location.pathname !== "/accept-terms") {
    return <Navigate to="/accept-terms" replace />;
  }

  return <>{children}</>;
}