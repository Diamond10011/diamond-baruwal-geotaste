import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GuestRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();

  // Show loading state while checking authentication
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // User is authenticated - redirect to home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // User is not authenticated - allow access to guest routes (login, register, etc.)
  return children;
};

export default GuestRoute;
