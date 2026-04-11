import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FormInput, FormButton, Alert } from "../../components/FormComponents";
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
  Phone,
  MapPin,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, logout, loading, error } =
    useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [localError, setLocalError] = useState(null);

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    location: "",
    bio: "",
    profile_photo: "",
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize profile data from user when user loads
  useEffect(() => {
    if (user?.profile) {
      setProfileData({
        first_name: user.profile.first_name || "",
        last_name: user.profile.last_name || "",
        phone_number: user.profile.phone_number || "",
        location: user.profile.location || "",
        bio: user.profile.bio || "",
        profile_photo: user.profile.profile_photo || "",
      });
      if (user.profile.profile_photo) {
        setPhotoPreview(user.profile.profile_photo);
      }
    }
  }, [
    user?.profile?.first_name,
    user?.profile?.last_name,
    user?.profile?.phone_number,
    user?.profile?.location,
    user?.profile?.bio,
  ]);

  const validateProfile = () => {
    const errors = {};
    if (
      profileData.phone_number &&
      !/^[0-9\s\-\+\(\)]{7,15}$/.test(profileData.phone_number)
    ) {
      errors.phone_number = "Invalid phone number";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.oldPassword) {
      errors.oldPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(passwordData.newPassword)) {
      errors.newPassword = "Password must contain uppercase letter";
    } else if (!/[a-z]/.test(passwordData.newPassword)) {
      errors.newPassword = "Password must contain lowercase letter";
    } else if (!/[0-9]/.test(passwordData.newPassword)) {
      errors.newPassword = "Password must contain a digit";
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setLocalError(
        "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setLocalError("Image size must be less than 5MB");
      return;
    }

    setPhotoFile(file);
    setPhotoRemoved(false);
    setLocalError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setPhotoRemoved(true);
    setProfileData((prev) => ({ ...prev, profile_photo: "" }));
    const fileInput = document.getElementById("photo-input");
    if (fileInput) fileInput.value = "";
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    try {
      setLocalError(null);

      const dataToSend = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone_number: profileData.phone_number,
        location: profileData.location,
        bio: profileData.bio,
        ...(photoRemoved && !photoFile ? { profile_photo: null } : {}),
      };

      const response = await updateProfile(dataToSend, photoFile);

      // Update local state with the response data to ensure it persists
      if (response?.profile) {
        setProfileData({
          first_name: response.profile.first_name || "",
          last_name: response.profile.last_name || "",
          phone_number: response.profile.phone_number || "",
          location: response.profile.location || "",
          bio: response.profile.bio || "",
          profile_photo: response.profile.profile_photo || "",
        });
        if (response.profile.profile_photo) {
          setPhotoPreview(response.profile.profile_photo);
          setPhotoFile(null); // Clear the file after successful upload
          setPhotoRemoved(false);
        } else {
          setPhotoRemoved(false);
        }
      }

      setSuccessMessage("✅ Profile updated successfully!");
      setEditMode(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail || err.message || "Failed to update profile";
      setLocalError(errorMsg);
      setSuccessMessage("");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      await changePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmPassword,
      );
      setSuccessMessage("Password changed successfully!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      // Error is already in context
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCancel = () => {
    if (user?.profile) {
      setProfileData({
        first_name: user.profile.first_name || "",
        last_name: user.profile.last_name || "",
        phone_number: user.profile.phone_number || "",
        location: user.profile.location || "",
        bio: user.profile.bio || "",
        profile_photo: user.profile.profile_photo || "",
      });
    }
    setPhotoPreview(user?.profile?.profile_photo || null);
    setPhotoFile(null);
    setEditMode(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const fullName = `${user.profile?.first_name || ""} ${user.profile?.last_name || ""}`.trim() || user.email?.split("@")[0];
  const userAvatar = user.profile?.profile_photo || photoPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`;

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
                  src={userAvatar}
                  alt={fullName}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-2xl object-cover"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 border-2 border-white rounded-full"></div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-white truncate">
                  {fullName}
                </h1>
                <p className="text-gray-300 text-sm sm:text-base mt-1 truncate">
                  {user.email}
                </p>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500/20 text-blue-300 rounded-full text-xs sm:text-sm font-medium border border-blue-400/30 backdrop-blur-sm capitalize">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    {user.role}
                  </span>
                  {user.is_email_verified && (
                    <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 text-green-300 rounded-full text-xs sm:text-sm font-medium border border-green-400/30 backdrop-blur-sm">
                      <CheckCircle size={14} />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 w-full sm:w-auto">
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Edit2 size={18} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 mb-8 overflow-x-auto mx-6 sm:mx-8 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "security", label: "Security", icon: Lock },
              { id: "settings", label: "Settings", icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setEditMode(false);
                }}
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
      </div>

      {/* Main Content */}
      <div className="px-6 sm:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {(error || localError) && (
            <div className="mb-6">
              <Alert
                message={error || localError}
                type="error"
                onClose={() => setLocalError(null)}
              />
            </div>
          )}
          {successMessage && (
            <div className="mb-6">
              <Alert
                message={successMessage}
                type="success"
                onClose={() => setSuccessMessage("")}
              />
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Information Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
                  <div className="px-6 sm:px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Profile Information
                    </h2>
                    {!editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium text-sm flex items-center gap-2"
                      >
                        <Edit2 size={16} />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="px-6 sm:px-8 py-6 space-y-6">
                    {editMode ? (
                      <form onSubmit={handleSaveProfile} className="space-y-6">
                        {/* Form Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {/* First Name Field */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              First Name
                            </label>
                            <div className="relative">
                              <User
                                size={18}
                                className="absolute left-3.5 top-3.5 text-gray-400"
                              />
                              <input
                                type="text"
                                name="first_name"
                                value={profileData.first_name}
                                onChange={handleProfileChange}
                                placeholder="John"
                                className={`w-full pl-11 pr-4 py-2.5 text-gray-900 border rounded-lg font-medium focus:outline-none transition-all duration-200 ${
                                  validationErrors.first_name
                                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                                }`}
                              />
                            </div>
                            {validationErrors.first_name && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors.first_name}
                              </p>
                            )}
                          </div>

                          {/* Last Name Field */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Last Name
                            </label>
                            <div className="relative">
                              <User
                                size={18}
                                className="absolute left-3.5 top-3.5 text-gray-400"
                              />
                              <input
                                type="text"
                                name="last_name"
                                value={profileData.last_name}
                                onChange={handleProfileChange}
                                placeholder="Doe"
                                className={`w-full pl-11 pr-4 py-2.5 text-gray-900 border rounded-lg font-medium focus:outline-none transition-all duration-200 ${
                                  validationErrors.last_name
                                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                                }`}
                              />
                            </div>
                            {validationErrors.last_name && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors.last_name}
                              </p>
                            )}
                          </div>

                          {/* Email Field (read-only) */}
                          <div className="sm:col-span-2">
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
                                value={user.email}
                                disabled
                                className="w-full pl-11 pr-4 py-2.5 text-gray-600 border border-gray-200 rounded-lg font-medium bg-gray-50 cursor-not-allowed"
                              />
                            </div>
                          </div>

                          {/* Phone Field */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone
                                size={18}
                                className="absolute left-3.5 top-3.5 text-gray-400"
                              />
                              <input
                                type="tel"
                                name="phone_number"
                                value={profileData.phone_number}
                                onChange={handleProfileChange}
                                placeholder="+1 (555) 000-0000"
                                className={`w-full pl-11 pr-4 py-2.5 text-gray-900 border rounded-lg font-medium focus:outline-none transition-all duration-200 ${
                                  validationErrors.phone_number
                                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                                }`}
                              />
                            </div>
                            {validationErrors.phone_number && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors.phone_number}
                              </p>
                            )}
                          </div>

                          {/* Location Field */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Location
                            </label>
                            <div className="relative">
                              <MapPin
                                size={18}
                                className="absolute left-3.5 top-3.5 text-gray-400"
                              />
                              <input
                                type="text"
                                name="location"
                                value={profileData.location}
                                onChange={handleProfileChange}
                                placeholder="City, Country"
                                className={`w-full pl-11 pr-4 py-2.5 text-gray-900 border rounded-lg font-medium focus:outline-none transition-all duration-200 ${
                                  validationErrors.location
                                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                                }`}
                              />
                            </div>
                            {validationErrors.location && (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Photo Upload Section */}
                        <div className="border-t border-gray-100 pt-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-4">
                            Profile Photo
                          </label>
                          <div className="flex flex-col sm:flex-row gap-6">
                            {/* Photo Preview */}
                            <div className="flex-shrink-0">
                              <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                                {photoPreview ? (
                                  <img
                                    src={photoPreview}
                                    alt="Profile preview"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={40} className="text-gray-500" />
                                )}
                              </div>
                            </div>

                            {/* Upload Area */}
                            <div className="flex-1">
                              <label
                                htmlFor="photo-input"
                                className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                              >
                                <div className="text-center">
                                  <p className="text-sm font-medium text-gray-700">
                                    Click to upload photo
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, GIF, WebP up to 5MB
                                  </p>
                                </div>
                              </label>
                              <input
                                id="photo-input"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                              />

                              {photoPreview && (
                                <button
                                  type="button"
                                  onClick={handleRemovePhoto}
                                  className="mt-3 w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  Remove Photo
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bio Field */}
                        <div className="border-t border-gray-100 pt-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            value={profileData.bio}
                            onChange={handleProfileChange}
                            rows="4"
                            placeholder="Tell us about yourself..."
                            className={`w-full px-4 py-3 text-gray-900 border rounded-lg font-medium focus:outline-none transition-all duration-200 resize-none ${
                              validationErrors.bio
                                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                            }`}
                          />
                          {validationErrors.bio && (
                            <p className="text-red-500 text-xs mt-1">
                              {validationErrors.bio}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {loading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditMode(false);
                              handleCancel();
                            }}
                            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                              First Name
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {profileData.first_name || "—"}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                              Last Name
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {profileData.last_name || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Email Address
                          </p>
                          <p className="text-base font-semibold text-gray-900 break-all">
                            {user.email}
                          </p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Phone Number
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {profileData.phone_number || "Not set"}
                          </p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Location
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {profileData.location || "Not set"}
                          </p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Bio
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {profileData.bio || "No bio information yet."}
                          </p>
                        </div>
                      </div>
                    )}
              </div>
            </div>
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
                    {user.is_email_verified ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <AlertCircle size={18} className="text-yellow-500" />
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200/50">
                    <span className="text-sm font-medium text-gray-700">
                      Account Type
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-3">
                    Member since{" "}
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </p>
                  <button className="w-full px-4 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg transition-colors duration-200 text-sm">
                    Upgrade Plan
                  </button>
                </div>
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
                  Change Password
                </h2>
              </div>

              <div className="px-6 sm:px-8 py-6 space-y-6">
                <form onSubmit={handleChangePassword} className="space-y-6">
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
                        type={showOldPassword ? "text" : "password"}
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        className={`w-full pl-11 pr-12 py-2.5 text-gray-900 border rounded-lg font-medium focus:outline-none transition-all duration-200 ${
                          validationErrors.oldPassword
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showOldPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {validationErrors.oldPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.oldPassword}
                      </p>
                    )}
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
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                        className={`w-full pl-11 pr-12 py-2.5 text-gray-900 border rounded-lg font-medium focus:outline-none transition-all duration-200 ${
                          validationErrors.newPassword
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {validationErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.newPassword}
                      </p>
                    )}
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
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm your new password"
                        className={`w-full pl-11 pr-12 py-2.5 text-gray-900 border rounded-lg font-medium focus:outline-none transition-all duration-200 ${
                          validationErrors.confirmPassword
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-3">
                      Password Requirements:
                    </p>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-blue-600" />
                        Minimum 8 characters
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-blue-600" />
                        At least one uppercase letter (A-Z)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-blue-600" />
                        At least one lowercase letter (a-z)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-blue-600" />
                        At least one number (0-9)
                      </li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
              <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Account Settings
                </h2>
              </div>

              <div className="p-6 sm:p-8">
                <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <LogOut size={18} className="text-red-600" />
                    Logout
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Sign out from your account on this device
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      
    </div>
    </div>
  );
};

export default Profile;
