import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Translations } from "@/lib/i18n";

interface ProtectedRouteProps {
  children: React.ReactNode;
  i18n: Translations;
}

export function ProtectedRoute({ children, i18n }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">{i18n.loading}</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
