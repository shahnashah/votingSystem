import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set axios defaults
  axios.defaults.withCredentials = true;

  useEffect(() => {
    // Check if user is already logged in on component mount
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/auth/check");

        if (response.data.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function to be used by login component
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = async () => {
    try {
      // Direct axios call to logout endpoint
      await axios.post("/api/auth/logout");

      // Update state
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
