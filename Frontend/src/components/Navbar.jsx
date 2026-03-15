import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/Image/GeoTasteLogo.png";
import {
  UtensilsCrossed,
  Star,
  Bot,
  Store,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
} from "lucide-react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const allLinks = [
    { to: "/recipes", label: "Recipes", icon: <UtensilsCrossed className="w-4 h-4" />, roles: ["admin", "restaurant", "chef", "normal", "customer"] },
    { to: "/favorites", label: "Favorites", icon: <Star className="w-4 h-4" />, roles: ["admin", "restaurant", "chef", "normal", "customer"] },
    { to: "/recommendations", label: "Recommendations", icon: <Bot className="w-4 h-4" />, roles: ["admin", "normal", "customer"] },
    { to: "/restaurants", label: "Restaurants", icon: <Search className="w-4 h-4" />, roles: ["admin", "restaurant", "chef", "normal", "customer"] },
    { to: "/admin-dashboard", label: "Admin", icon: <LayoutDashboard className="w-4 h-4" />, roles: ["admin"] },
    { to: "/restaurant-profile", label: "Manage Restaurant", icon: <UtensilsCrossed className="w-4 h-4" />, roles: ["restaurant"] },
    { to: "/stores", label: "Store", icon: <Store className="w-4 h-4" />, roles: ["store", "customer", "normal"] },
  ];

  const visibleLinks = allLinks.filter((link) =>
    link.roles.includes(user?.role),
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-600 border-red-200";
      case "restaurant":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "store":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "chef":
        return "bg-purple-50 text-purple-600 border-purple-200";
      default:
        return "bg-gray-100 text-blue-600 border-gray-200";
    }
  };

  const navLinkStyling = ({ isActive }) =>
    `relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-white text-orange-600 shadow-sm"
        : "text-gray-700 hover:text-orange-600 hover:bg-white/70"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-orange-100/80 bg-gradient-to-r from-[#fff7e8] via-[#fdecc8] to-[#fff4dc] backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-3 shrink-0 group">
            <div className="rounded-2xl bg-white/80 p-2 shadow-md ring-1 ring-orange-100 transition-transform duration-300 group-hover:scale-[1.02]">
              <img
                src={logo}
                alt="GeoTaste Logo"
                className="h-12 w-auto rounded-xl object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
                Geo<span className="text-orange-600">Taste</span>
              </h1>
              <p className="text-xs font-medium text-gray-500 -mt-0.5">
                Discover flavor everywhere
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Nav Links */}
                <div className="flex items-center gap-1 mr-6 bg-black/5 p-1 rounded-2xl">
                  {visibleLinks.map((link) => (
                    <NavLink 
                      key={link.to} 
                      to={link.to} 
                      className={({ isActive }) => `
                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                        ${isActive 
                          ? "bg-white text-orange-600 shadow-sm" 
                          : "text-gray-600 hover:text-orange-600 hover:bg-white/50"}
                      `}
                    >
                      {link.icon}
                      {link.label}
                    </NavLink>
                  ))}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 rounded-2xl bg-white/60 px-3 py-2 shadow-sm ring-1 ring-orange-100 hover:bg-white transition-all duration-200"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold shadow-md">
                      {user?.profile?.first_name?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </div>

                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {user?.profile?.first_name || "User"}
                      </p>
                      <span
                        className={`inline-flex mt-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getRoleBadgeColor(
                          user?.role,
                        )}`}
                      >
                        {user?.role}
                      </span>
                    </div>

                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl">
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100/60 px-4 py-4 border-b border-orange-100">
                        <p className="text-xs font-medium text-gray-500">
                          Signed in as
                        </p>
                        <p className="mt-1 truncate text-sm font-bold text-gray-900">
                          {user?.email}
                        </p>
                      </div>

                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <span className="text-lg">👤</span>
                          My Profile
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <span className="text-lg">🚪</span>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-white/70 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-600 transition-all"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden inline-flex items-center justify-center rounded-xl bg-white/70 p-2.5 text-gray-700 shadow-sm ring-1 ring-orange-100 hover:bg-white transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-orange-100 bg-white/95 backdrop-blur-xl shadow-xl">
          <div className="px-4 py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="mb-4 rounded-2xl bg-orange-50 px-4 py-4 border border-orange-100">
                  <p className="text-sm font-bold text-gray-900">
                    {user?.profile?.first_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                  <span
                    className={`inline-flex mt-2 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getRoleBadgeColor(
                      user?.role,
                    )}`}
                  >
                    {user?.role}
                  </span>
                </div>

                {visibleLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="my-2 border-t border-gray-100"></div>

                <Link
                  to="/profile"
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  👤 Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/login"
                  className="rounded-xl bg-gray-100 py-3 text-center text-sm font-semibold text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-orange-600 py-3 text-center text-sm font-semibold text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
