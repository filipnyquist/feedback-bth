import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

export function AuthCallback() {
  const navigate = useNavigate();
  const { i18n } = useLanguage();

  useEffect(() => {
    // The backend handles the OAuth callback and redirects to /admin with a cookie set.
    // This page is shown briefly if the frontend routing intercepts /auth/callback.
    const timer = setTimeout(() => navigate("/admin"), 500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">{i18n.loading}</p>
    </div>
  );
}
