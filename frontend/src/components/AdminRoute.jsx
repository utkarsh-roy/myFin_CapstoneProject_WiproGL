import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * AdminRoute element wrapper for admin paths
 * Redirects to login if the user is not authenticated or not an admin
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return null; // Or return a Loader component
  }

  if (!isAuthenticated() || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
