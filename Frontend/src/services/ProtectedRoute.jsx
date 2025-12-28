import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute  ({ children, isAdminRoute })  {
  const token = localStorage.getItem('access');
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  if (!token) return (<Navigate to="/login" />);
  if (isAdminRoute && !isAdmin) return (<Navigate to="/user-dashboard" />);
  if (!isAdminRoute && isAdmin) return (<Navigate to="/admin-dashboard" />);
  return children;
};