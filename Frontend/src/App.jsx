import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Main Pages
import Home from "./pages/common/Home";
import Profile from "./pages/Profile/Profile";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Favorites from "./pages/Favorites";
import RestaurantSearch from "./pages/RestaurantSearch";
import RestaurantProfile from "./pages/RestaurantProfile";
import Stores from "./pages/Stores";
import Orders from "./pages/Orders";
import LandingPage from "./pages/LandingPage";

// Dashboard Pages
import UserDashboard from "./pages/Dashboard/UserDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";

// Profile Management Pages
import StoreProfile from "./pages/Profile/StoreProfile";
import RestaurantProfileManagement from "./pages/Profile/RestaurantProfileManagement";

// Layout Component
const ProtectedLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <Outlet />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - No Navbar */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Routes - With Navbar Layout */}
          <Route
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<UserDashboard />} />

            {/* Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Profile Routes */}
            <Route path="/profile" element={<Profile />} />

            {/* Store User Routes */}
            <Route
              path="/store-profile"
              element={
                <ProtectedRoute requiredRole="store">
                  <StoreProfile />
                </ProtectedRoute>
              }
            />

            {/* Restaurant User Routes */}
            <Route
              path="/restaurant-profile"
              element={
                <ProtectedRoute requiredRole="restaurant">
                  <RestaurantProfileManagement />
                </ProtectedRoute>
              }
            />

            {/* Recipe Routes */}
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/favorites" element={<Favorites />} />

            {/* Restaurant Routes */}
            <Route path="/restaurants" element={<RestaurantSearch />} />
            <Route path="/restaurants/:id" element={<RestaurantProfile />} />

            {/* Store Routes (for normal/customer users) */}
            <Route path="/stores" element={<Stores />} />
            <Route path="/orders" element={<Orders />} />
          </Route>

          {/* Catch all - redirect to home or login */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
