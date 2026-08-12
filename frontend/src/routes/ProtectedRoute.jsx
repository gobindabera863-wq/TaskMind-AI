import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreenScreenMessage="Authenticating session..." />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
