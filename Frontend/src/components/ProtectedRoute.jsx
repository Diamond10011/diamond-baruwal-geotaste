import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  requiredRole = null,
  allowedRoles = null,
  requireVerified = false,
}) => {
  const { isAuthenticated, user, isInitializing } = useAuth();

  // Show loading state while checking authentication
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check for required role
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user role
    if (user?.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  // Check for allowed roles (multiple roles allowed)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  // Optional verification gate (store/restaurant only)
  if (
    requireVerified &&
    (user?.role === "store" || user?.role === "restaurant") &&
    user?.verification_status !== "verified"
  ) {
    return <Navigate to="/verification" replace />;
  }

  return children;
};

export default ProtectedRoute;
