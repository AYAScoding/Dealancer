import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const res = await api.get("/auth/me/");
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch user, token likely expired/invalid.");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for custom token expiry event from axios interceptor
    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener("auth-expired", handleAuthExpired);

    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login/", { email, password });
      const { user, tokens } = res.data;

      localStorage.setItem("accessToken", tokens.access);
      localStorage.setItem("refreshToken", tokens.refresh);
      setUser(user);
      return { success: true, user }; // ← return user so callers can read .role
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || "Login failed.",
      };
    }
  };

  const register = async (userData) => {
    try {
      await api.post("/auth/register/", userData);
      return { success: true };
    } catch (error) {
      // Return custom validation errors mapped from DRF
      let message = "Registration failed.";
      if (error.response?.data) {
        message = Object.values(error.response.data).flat()[0] || message;
      }
      return { success: false, message };
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await api.post("/auth/logout/", { refresh: refreshToken });
      } catch (e) {
        console.error("Logout API failed, forcing local logout", e);
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
