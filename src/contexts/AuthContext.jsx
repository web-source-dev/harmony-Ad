import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if auth token exists in localStorage
    const token = localStorage.getItem('adminAuthToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (password) => {
    // In a real app, you'd want to hash this password and store it securely
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
