import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import API from '../BackendAPi/ApiProvider';

// Admin login, checked by the server (ADMIN_PASSWORD in the backend .env). The server returns a
// session token ("adm.…"), kept in localStorage and sent with every request by ApiProvider.
// One login opens every admin page, door check-in included.

const TOKEN_KEY = 'adminAuthToken';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const readToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY) || '';
    // Logins from before the server check stored just "authenticated": those need a fresh login
    return token.startsWith('adm.') ? token : '';
  } catch {
    return '';
  }
};

const saveToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private browsing: the login lasts until the page is closed
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(readToken()));

  const logout = useCallback(() => {
    saveToken('');
    setIsAuthenticated(false);
  }, []);

  // A saved login stops working when it expires or the password changes; ask the server once on load.
  // Offline or server errors keep the login, so the dashboard still opens without internet.
  useEffect(() => {
    if (!readToken()) {
      saveToken('');
      return;
    }
    API.get('/api/auth/session').catch((error) => {
      if (error?.response?.status === 401) logout();
    });
  }, [logout]);

  // Resolves to { success: true } or { success: false, message }
  const login = async (password) => {
    try {
      const { data } = await API.post('/api/auth/login', { password });
      saveToken(data.token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Could not reach the server. Check the internet connection.',
      };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
