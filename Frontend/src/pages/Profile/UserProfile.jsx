import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Settings,
  Heart,
  Shield,
  Download,
  Bell,
  LogOut,
  Edit2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Mock user data
  const [userData, setUserData] = useState({
    name: "Sarah Anderson",
    email: "sarah.anderson@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Food enthusiast and recipe curator",
    joinDate: "January 2024",
    accountType: "Premium",
    isEmailVerified: true,
    twoFactorEnabled: false,
    profilePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  });

  const [formData, setFormData] = useState(userData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUserData(formData);
    setIsEditing(false);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const navigationItems = [
    { icon: Heart, label: "Favorites", count: "24" },
    { icon: Download, label: "Downloads", count: "8" },
    { icon: Bell, label: "Notifications", count: "3" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section with Hero Background */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative px-6 sm:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={userData.profilePhoto}
                  alt={userData.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-2xl object-cover"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 border-2 border-white rounded-full"></div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-white truncate">
                  {userData.name}
                </h1>
                <p className="text-gray-300 text-sm sm:text-base mt-1 truncate">
                  {userData.email}
                </p>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/20 text-blue-300 rounded-full text-xs sm:text-sm font-medium border border-blue-400/30 backdrop-blur-sm">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    {userData.accountType}
                  </span>
                  {userData.isEmailVerified && (
                    <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 text-green-300 rounded-full text-xs sm:text-sm font-medium border border-green-400/30 backdrop-blur-sm">
                      <CheckCircle size={14} />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Edit2 size={18} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 sm:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 mb-8 overflow-x-auto">
            <div className="flex">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 px-4 sm:px-6 py-4 font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-300 whitespace-nowrap relative group ${
                    activeTab === id
                      ? "text-gray-900 bg-gray-50"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} />
                  {label}
                  {activeTab === id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Profile Information Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                    <div className="px-6 sm:px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Profile Information
                      </h2>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium text-sm flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit Profile
                        </button>
                      )}
                    </div>

                    <div className="px-6 sm:px-8 py-6 space-y-6">
                      {/* Form Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Name Field */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User
                              size={18}
                              className="absolute left-3.5 top-3.5 text-gray-400"
                            />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={`w-full pl-11 pr-4 py-2.5 text-gray-900 border rounded-lg font-medium focus:outline-none transition-all duration-200 ${
                                isEditing
                                  ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                                  : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Email Field */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail
                              size={18}
                              className="absolute left-3.5 top-3.5 text-gray-400"
                            />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={`w-full pl-11 pr-4 py-2.5 text-gray-900 border rounded-lg font-medium focus:outline-none transition-all duration-200 ${
                                isEditing
                                  ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                                  : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Phone Field */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full px-4 py-2.5 text-gray-900 border rounded-lg font-medium focus:outline-none transition-all duration-200 ${
                              isEditing
                                ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                                : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                            }`}
                          />
                        </div>

                        {/* Join Date Field */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Member Since
                          </label>
                          <input
                            type="text"
                            value={formData.joinDate}
                            disabled
                            className="w-full px-4 py-2.5 text-gray-600 border border-gray-200 rounded-lg font-medium bg-gray-50 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Bio Field */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows="4"
                          className={`w-full px-4 py-3 text-gray-900 border rounded-lg font-medium focus:outline-none transition-all duration-200 resize-none ${
                            isEditing
                              ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                              : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                          }`}
                        />
                      </div>

                      {/* Action Buttons */}
                      {isEditing && (
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                          <button
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  {/* Password Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                    <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Lock size={20} />
                        Password & Authentication
                      </h2>
                    </div>

                    <div className="px-6 sm:px-8 py-6 space-y-6">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock
                            size={18}
                            className="absolute left-3.5 top-3.5 text-gray-400"
                          />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your current password"
                            className="w-full pl-11 pr-12 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock
                            size={18}
                            className="absolute left-3.5 top-3.5 text-gray-400"
                          />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            className="w-full pl-11 pr-12 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock
                            size={18}
                            className="absolute left-3.5 top-3.5 text-gray-400"
                          />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            className="w-full pl-11 pr-12 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                          />
                        </div>
                      </div>

                      <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 mt-6">
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                    <div className="px-6 sm:px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Shield size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Two-Factor Authentication
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Add an extra layer of security
                          </p>
                        </div>
                      </div>
                      <div className="relative inline-flex w-12 h-7 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors">
                        <input
                          type="checkbox"
                          checked={userData.twoFactorEnabled}
                          className="sr-only"
                        />
                        <span
                          className={`inline-block w-6 h-6 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            userData.twoFactorEnabled
                              ? "translate-x-6 bg-green-400"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                    <div className="px-6 sm:px-8 py-4 bg-gray-50 text-xs sm:text-sm text-gray-600">
                      {userData.twoFactorEnabled
                        ? "Two-factor authentication is enabled on your account."
                        : "Enable two-factor authentication to secure your account with a second verification method."}
                    </div>
                  </div>

                  {/* Connected Devices */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                    <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Active Sessions
                      </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {[
                        {
                          device: "MacBook Pro",
                          browser: "Chrome",
                          location: "San Francisco",
                        },
                        {
                          device: "iPhone 14",
                          browser: "Safari",
                          location: "San Francisco",
                        },
                      ].map((session, idx) => (
                        <div
                          key={idx}
                          className="px-6 sm:px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {session.device}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {session.browser} • {session.location}
                            </p>
                          </div>
                          <button className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            Sign Out
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  {/* Notification Preferences */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                    <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Bell size={20} />
                        Notifications
                      </h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {[
                        {
                          title: "Email Notifications",
                          description: "Receive updates via email",
                          enabled: true,
                        },
                        {
                          title: "Recipe Updates",
                          description: "Get notified about new recipes",
                          enabled: true,
                        },
                        {
                          title: "Order Updates",
                          description: "Notifications about orders",
                          enabled: false,
                        },
                      ].map((setting, idx) => (
                        <div
                          key={idx}
                          className="px-6 sm:px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {setting.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {setting.description}
                            </p>
                          </div>
                          <div
                            className={`relative inline-flex w-12 h-7 rounded-full cursor-pointer transition-colors ${
                              setting.enabled ? "bg-green-400" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block w-6 h-6 transform rounded-full bg-white shadow transition-transform duration-200 ${
                                setting.enabled ? "translate-x-6" : ""
                              }`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                    <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Privacy & Data
                      </h2>
                    </div>

                    <div className="px-6 sm:px-8 py-6 space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200/50 rounded-lg">
                        <AlertCircle
                          size={20}
                          className="text-blue-600 flex-shrink-0 mt-0.5"
                        />
                        <p className="text-sm text-blue-900">
                          Your data is encrypted and secure. Learn more about
                          our privacy policy.
                        </p>
                      </div>

                      <button className="w-full px-6 py-3 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors duration-200 mt-6">
                        Download My Data
                      </button>

                      <button className="w-full px-6 py-3 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors duration-200">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Account Status Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200/50 p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield size={18} />
                  Account Status
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200/50">
                    <span className="text-sm font-medium text-gray-700">
                      Email Verified
                    </span>
                    {userData.isEmailVerified ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <AlertCircle size={18} className="text-yellow-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200/50">
                    <span className="text-sm font-medium text-gray-700">
                      2FA Status
                    </span>
                    {userData.twoFactorEnabled ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <AlertCircle size={18} className="text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200/50">
                    <span className="text-sm font-medium text-gray-700">
                      Account Type
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {userData.accountType}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-3">
                    Member since {userData.joinDate}
                  </p>
                  <button className="w-full px-4 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition-colors duration-200 text-sm">
                    Upgrade Plan
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid gap-4">
                {navigationItems.map(({ icon: Icon, label, count }) => (
                  <div
                    key={label}
                    className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-4 cursor-pointer hover:shadow-md hover:border-gray-300/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Icon size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-medium">
                            {label}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {count}
                          </p>
                        </div>
                      </div>
                      <div className="text-gray-300">→</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
