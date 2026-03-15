// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";


// const RoleBasedDashboardRedirect = () => {
//   const { user } = useAuth();

//   // If no user info yet, redirect to home
//   if (!user) {
//     return <Navigate to="/home" replace />;
//   }

//   // Redirect based on role
//   if (user.role === "admin") {
//     return <Navigate to="/admin-dashboard" replace />;
//   }

//   return <Navigate to="/dashboard" replace />;
// };

// export default RoleBasedDashboardRedirect;
