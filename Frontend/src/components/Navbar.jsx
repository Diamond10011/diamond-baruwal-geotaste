import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsUserMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "text-red-600";
      case "restaurant":
        return "text-orange-600";
      case "store":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/home"
            className="flex items-center gap-2 text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <span className="text-3xl">🍽️</span>
            <span>GeoTaste</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/home"
                  className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                >
                  Home
                </Link>

                {(user?.role === "chef" || user?.role === "restaurant" || user?.role === "admin" || user?.role === "normal" || user?.role === "customer") && (
                  <Link
                    to="/recipes"
                    className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                  >
                    Recipes
                  </Link>
                )}

                {(user?.role === "chef" || user?.role === "restaurant" || user?.role === "admin" || user?.role === "normal" || user?.role === "customer") && (
                  <Link
                    to="/favorites"
                    className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center gap-1"
                  >
                    ⭐ Favorites
                  </Link>
                )}

                {(user?.role === "chef" || user?.role === "restaurant" || user?.role === "admin" || user?.role === "normal" || user?.role === "customer") && (
                  <Link
                    to="/restaurants"
                    className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                  >
                    Restaurants
                  </Link>
                )}

                {(user?.role === "normal" || user?.role === "customer") && (
                  <Link
                    to="/stores"
                    className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                  >
                    Browse Stores
                  </Link>
                )}

                {(user?.role === "normal" || user?.role === "customer") && (
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                  >
                    My Orders
                  </Link>
                )}

                {user?.role === "admin" && (
                  <Link
                    to="/admin-dashboard"
                    className="text-red-600 hover:text-red-700 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                )}

                {user?.role === "restaurant" && (
                  <Link
                    to="/restaurant-profile"
                    className="text-orange-600 hover:text-orange-700 transition-colors font-medium"
                  >
                    My Restaurant
                  </Link>
                )}

                {user?.role === "store" && (
                  <Link
                    to="/store-profile"
                    className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    My Store
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {user?.profile?.first_name?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </div>
                    <span className="text-gray-700 font-medium hidden sm:block">
                      {user?.profile?.first_name || user?.email}
                    </span>
                    <span
                      className={`text-xs font-semibold ${getRoleColor(user?.role)}`}
                    >
                      {user?.role?.toUpperCase()}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        👤 My Profile
                      </Link>
                      <div className="border-t border-gray-200"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/home"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={handleNavClick}
                >
                  Home
                </Link>

                {(user?.role === "chef" || user?.role === "restaurant" || user?.role === "admin" || user?.role === "normal" || user?.role === "customer") && (
                  <Link
                    to="/recipes"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={handleNavClick}
                  >
                    Recipes
                  </Link>
                )}

                {(user?.role === "chef" || user?.role === "restaurant" || user?.role === "admin" || user?.role === "normal" || user?.role === "customer") && (
                  <Link
                    to="/favorites"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={handleNavClick}
                  >
                    ⭐ Favorites
                  </Link>
                )}

                {(user?.role === "chef" || user?.role === "restaurant" || user?.role === "admin" || user?.role === "normal" || user?.role === "customer") && (
                  <Link
                    to="/restaurants"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={handleNavClick}
                  >
                    Restaurants
                  </Link>
                )}

                {(user?.role === "normal" || user?.role === "customer") && (
                  <Link
                    to="/stores"
                    className="block px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors font-medium"
                    onClick={handleNavClick}
                  >
                    Browse Stores
                  </Link>
                )}

                {(user?.role === "normal" || user?.role === "customer") && (
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors font-medium"
                    onClick={handleNavClick}
                  >
                    My Orders
                  </Link>
                )}

                {user?.role === "admin" && (
                  <Link
                    to="/admin-dashboard"
                    className="block px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    onClick={handleNavClick}
                  >
                    Dashboard
                  </Link>
                )}

                {user?.role === "restaurant" && (
                  <Link
                    to="/restaurant-profile"
                    className="block px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                    onClick={handleNavClick}
                  >
                    My Restaurant
                  </Link>
                )}

                {user?.role === "store" && (
                  <Link
                    to="/store-profile"
                    className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                    onClick={handleNavClick}
                  >
                    My Store
                  </Link>
                )}

                <div className="px-4 py-2 border-t border-gray-200 mt-2 pt-4">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={handleNavClick}
                  >
                    👤 My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium mt-2"
                  >
                    🚪 Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-4">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-center"
                  onClick={handleNavClick}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors text-center font-medium"
                  onClick={handleNavClick}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
