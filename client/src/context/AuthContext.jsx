import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sas_user"));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("sas_token", res.data.token);
      localStorage.setItem("sas_user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name,
    email,
    password,
    role,
    accessibilityType = "standard",
  ) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
        accessibilityType,
      });
      localStorage.setItem("sas_token", res.data.token);
      localStorage.setItem("sas_user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("sas_token");
    localStorage.removeItem("sas_user");
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem("sas_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
