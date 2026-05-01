import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("storyforge_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let ignore = false;

    async function loadMe() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        if (!ignore) setUser(response.data);
      } catch {
        localStorage.removeItem("storyforge_token");
        if (!ignore) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadMe();
    return () => {
      ignore = true;
    };
  }, [token]);

  function saveToken(nextToken) {
    localStorage.setItem("storyforge_token", nextToken);
    setToken(nextToken);
  }

  function logout() {
    localStorage.removeItem("storyforge_token");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, loading, isAdmin: user?.role === "admin", saveToken, logout, setUser }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
