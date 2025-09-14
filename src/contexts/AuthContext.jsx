import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('adminAuthToken');
    return !!token;
  });

  useEffect(() => {
    // Log authentication state changes
    console.log('Authentication state changed:', isAuthenticated);
  }, [isAuthenticated]);

  const login = (password) => {
    const correctPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';
    
    if (password === correctPassword) {
      // Store auth token in localStorage
      localStorage.setItem('adminAuthToken', 'authenticated');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('adminAuthToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
