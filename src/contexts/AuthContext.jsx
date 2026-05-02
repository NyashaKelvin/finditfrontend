import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, logoutUser } from "@/lib/api";
const AuthContext = createContext(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("auth_token"));
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
      }
    }
  }, []);
  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await loginUser({ username, password });
      const { token: t, user: u } = res.data;
      setToken(t);
      setUser(u);
      localStorage.setItem("auth_token", t);
      localStorage.setItem("auth_user", JSON.stringify(u));
    } finally {
      setLoading(false);
    }
  };
  const register = async (data) => {
    setLoading(true);
    try {
      await registerUser(data);
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("_mock_users"); // Clean up mock data
  };
  
  // Safety check: remove mock tokens from previous sessions
  useEffect(() => {
    if (token && token.startsWith("mock-token-")) {
      logout();
    }
  }, [token]);

  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem("auth_user", JSON.stringify(u));
  };

  return <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>;
};
