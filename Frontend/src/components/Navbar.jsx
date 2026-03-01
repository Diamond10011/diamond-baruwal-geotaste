import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/Image/GeoTasteLogo.png"
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

  // Centralized Navigation Config
  const allLinks = [
    { to: "/recipes", label: "Recipes", roles: ["admin", "restaurant", "chef", "normal", "customer"] },
    { to: "/favorites", label: "⭐ Favorites", roles: ["admin", "restaurant", "chef", "normal", "customer"] },
    { to: "/recommendations", label: "🤖  Recommendations", roles: ["admin", "restaurant", "chef", "normal", "customer"] },
    { to: "/restaurants", label: "Restaurants", roles: ["admin", "restaurant", "chef", "normal", "customer"] },
    { to: "/stores", label: "Browse Stores", roles: ["normal", "customer"], color: "text-green-600" },
    { to: "/orders", label: "My Orders", roles: ["normal", "customer"], color: "text-green-600" },
    { to: "/admin-dashboard", label: "Dashboard", roles: ["admin"], color: "text-red-600" },
    { to: "/restaurant-profile", label: "Manage Restaurant", roles: ["restaurant"], color: "text-orange-600" },
    { to: "/store-profile", label: "Manage Store", roles: ["store"], color: "text-blue-600" },
  ];

  const visibleLinks = allLinks.filter(link => link.roles.includes(user?.role));

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-700 border-red-200";
      case "restaurant": return "bg-orange-100 text-orange-700 border-orange-200";
      case "store": return "bg-blue-100 text-blue-700 border-blue-200";
      case "chef": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const navLinkStyling = ({ isActive }) => 
    `px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1 ${
      isActive 
        ? "bg-orange-50 text-orange-600 shadow-sm" 
        : "text-gray-600 hover:bg-gray-50 hover:text-orange-600"
    }`;

  return (
    <nav className="bg-amber-100 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo */}
          <Link to="/home" className="flex items-center gap-2 group">

            {/* <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
              🍽️
            </div> */}
             <div className="flex items-center pt-2 ml-8">
                          <img src={logo} alt="GeoTaste Logo" className="h-16 rounded-full" />
                        </div>
            {/* <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              GeoTaste
            </span> */}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-1 mr-4 border-r border-gray-100 pr-4">
                  {visibleLinks.map((link) => (
                    <NavLink key={link.to} to={link.to} className={navLinkStyling}>
                      {link.label}
                    </NavLink>
                  ))}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center font-bold shadow-md">
                      {user?.profile?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-xs font-bold text-gray-900 leading-none mb-1">
                        {user?.profile?.first_name || "User"}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${getRoleBadgeColor(user?.role)}`}>
                        {user?.role}
                      </span>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                        <span className="text-lg">👤</span> My Profile
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-semibold">
                        <span className="text-lg">🚪</span> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-6 py-2.5 text-gray-700 font-bold hover:text-orange-600 transition-colors">Login</Link>
                <Link to="/register" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200">Join Now</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2.5 bg-gray-50 rounded-xl text-gray-600">
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Slide Down */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 p-4 space-y-2 shadow-xl animate-in slide-in-from-top w-full">
          {isAuthenticated ? (
            <>
              {visibleLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-gray-50" />
              <Link to="/profile" className="block px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>👤 Profile</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50">🚪 Logout</button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/login" className="text-center py-3 font-bold text-gray-700 bg-gray-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" className="text-center py-3 font-bold text-white bg-orange-600 rounded-xl" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;