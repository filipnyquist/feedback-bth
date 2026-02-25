import { useState, useEffect } from "react";
import { getMe } from "@/lib/api";
import type { MeResponse } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { user, loading, error, isAuthenticated: !!user };
}
