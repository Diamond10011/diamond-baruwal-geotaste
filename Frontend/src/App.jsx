import React from 'react';
import { BrowserRouter as Router, Route,Routes, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandingPage from './pages/LandingPage';
import UserProfile from './pages/Profile/UserProfile';
import  ProtectedRoute  from './services/ProtectedRoute';
import Home from './pages/common/Home';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ForgotPassword from './pages/auth/ForgotPassword';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin-dashboard" element={<ProtectedRoute isAdminRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}