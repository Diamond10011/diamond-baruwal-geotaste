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
import GuestRoute from "./components/GuestRoute";
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
import Recommendations from "./pages/Recommendations";
import RestaurantSearch from "./pages/RestaurantSearch";
import RestaurantProfile from "./pages/RestaurantProfile";
import Stores from "./pages/Stores";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

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
          {/* Public Routes - No Navbar - Only accessible when NOT logged in */}
          <Route
            path="/"
            element={
              <GuestRoute>
                <LandingPage />
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <GuestRoute>
                <VerifyEmail />
              </GuestRoute>
            }
          />

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
            {/* Recipe Routes */}{" "}
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/recommendations" element={<Recommendations />} />
            {/* Restaurant Routes */}
            <Route path="/restaurants" element={<RestaurantSearch />} />
            <Route path="/restaurants/:id" element={<RestaurantProfile />} />
            {/* Store Routes (for normal/customer users) */}
            <Route path="/stores" element={<Stores />} />
          </Route>

          {/* Catch all - show 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
