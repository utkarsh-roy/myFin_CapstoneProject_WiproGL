import React, { createContext, useState, useEffect } from 'react';
import { isTokenValid, decodeToken } from '../utils/tokenUtils';

// Create AuthContext
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    token: null,
    role: null,
    userId: null,
    email: null,
    username: null,
    isAuthenticated: false,
    isAdmin: false
  });

  const [loading, setLoading] = useState(true);

  // Initialize auth state from local storage on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      if (isTokenValid(token)) {
        let role = localStorage.getItem('role');
        let userId = localStorage.getItem('userId');
        let email = localStorage.getItem('email');
        let username = localStorage.getItem('username');
        
        const decoded = decodeToken(token) || {};
        if (!userId || userId === 'undefined') userId = decoded.userId || decoded.id || decoded.sub;
        if (!role || role === 'undefined') role = decoded.role || 'USER';
        if (!email || email === 'undefined') email = decoded.email || decoded.sub;
        if (!username || username === 'undefined') username = decoded.username || decoded.name || '';
        
        setUser({
          token,
          role,
          userId,
          email,
          username,
          isAuthenticated: true,
          isAdmin: role === 'ADMIN'
        });
      } else {
        // Token expired, clear storage
        logout();
      }
    }
    setLoading(false);
  }, []);

  /**
   * Logs in a user by setting context and local storage
   */
  const login = (token, role, userId, email, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('email', email);
    localStorage.setItem('username', username || '');

    setUser({
      token,
      role,
      userId,
      email,
      username: username || '',
      isAuthenticated: true,
      isAdmin: role === 'ADMIN'
    });
  };

  /**
   * Logs out a user by clearing context and local storage
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('username');

    setUser({
      token: null,
      role: null,
      userId: null,
      email: null,
      username: null,
      isAuthenticated: false,
      isAdmin: false
    });
  };

  /**
   * Helper function to check if user is authenticated
   */
  const isAuthenticated = () => {
    return user.isAuthenticated;
  };

  /**
   * Helper function to check if user is an admin
   */
  const isAdmin = () => {
    return user.isAdmin;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      isAdmin,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
