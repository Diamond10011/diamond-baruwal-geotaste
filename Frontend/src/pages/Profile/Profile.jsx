import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FormInput, FormButton, Alert } from "../../components/FormComponents";

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
        // Convert relative path to absolute URL
        const photoUrl = user.profile.profile_photo.startsWith("http")
          ? user.profile.profile_photo
          : `http://localhost:8000${user.profile.profile_photo}`;
        setPhotoPreview(photoUrl);
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
      const response = await updateProfile(profileData, photoFile);

      // Update local state with the response data to ensure it persists
      if (response?.profile) {
        const updatedProfile = {
          first_name: response.profile.first_name || "",
          last_name: response.profile.last_name || "",
          phone_number: response.profile.phone_number || "",
          location: response.profile.location || "",
          bio: response.profile.bio || "",
          profile_photo: response.profile.profile_photo || "",
        };
        setProfileData(updatedProfile);

        // Handle photo URL - convert relative path to absolute
        if (response.profile.profile_photo) {
          const photoUrl = response.profile.profile_photo.startsWith("http")
            ? response.profile.profile_photo
            : `http://localhost:8000${response.profile.profile_photo}`;
          setPhotoPreview(photoUrl);
        }
      }

      setPhotoFile(null);
      setSuccessMessage("✅ Profile updated successfully!");
      setEditMode(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.profile_photo?.[0] ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to update profile";
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const initials =
    `${user.profile?.first_name?.[0] || ""}${user.profile?.last_name?.[0] || ""}`.toUpperCase() ||
    "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48"></div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center border-4 border-white shadow-xl">
                <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {initials}
                </span>
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-white">
              <h1 className="text-4xl font-bold mb-2">
                {`${user.profile?.first_name || ""} ${user.profile?.last_name || ""}`.trim() ||
                  "Welcome"}
              </h1>
              <p className="text-lg text-blue-100 mb-1">{user.email}</p>
              <div className="flex flex-wrap gap-4 text-sm text-blue-50">
                <span className="flex items-center gap-1">
                  🎯 <span className="capitalize font-medium">{user.role}</span>
                </span>
                <span className="flex items-center gap-1">
                  📅 Member since{" "}
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                </span>
                {user.is_email_verified && (
                  <span className="flex items-center gap-1 text-green-300">
                    ✓ Verified Account
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {[
              { id: "profile", label: "👤 Profile", icon: "👤" },
              { id: "security", label: "🔒 Security", icon: "🔒" },
              { id: "settings", label: "⚙️ Settings", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setEditMode(false);
                }}
                className={`px-6 py-4 font-medium text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {(error || localError) && (
          <Alert
            message={error || localError}
            type="error"
            onClose={() => setLocalError(null)}
          />
        )}
        {successMessage && (
          <Alert
            message={successMessage}
            type="success"
            onClose={() => setSuccessMessage("")}
          />
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Profile Information Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Profile Information
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Manage your personal information
                    </p>
                  </div>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                    >
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>

                {editMode ? (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Photo Upload Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-dashed border-blue-300">
                      <p className="text-sm font-semibold text-gray-900 mb-4">
                        📷 Profile Photo
                      </p>

                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Photo Preview */}
                        <div className="flex-shrink-0">
                          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                            {photoPreview ? (
                              <img
                                src={photoPreview}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-500 text-4xl">📷</span>
                            )}
                          </div>
                        </div>

                        {/* Upload Area */}
                        <div className="flex-1">
                          <label
                            htmlFor="photo-input"
                            className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
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
                              🗑️ Remove Photo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormInput
                        label="First Name"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                        error={validationErrors.first_name}
                        placeholder="John"
                      />
                      <FormInput
                        label="Last Name"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                        error={validationErrors.last_name}
                        placeholder="Doe"
                      />
                    </div>

                    <FormInput
                      label="📧 Email"
                      type="email"
                      value={user.email}
                      disabled
                      placeholder="your.email@example.com"
                    />

                    <FormInput
                      label="📱 Phone Number"
                      name="phone_number"
                      type="tel"
                      value={profileData.phone_number}
                      onChange={handleProfileChange}
                      error={validationErrors.phone_number}
                      placeholder="+1 (555) 000-0000"
                    />

                    <FormInput
                      label="📍 Location"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      error={validationErrors.location}
                      placeholder="City, Country"
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        ✍️ Bio
                      </label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                      <FormButton loading={loading} type="submit">
                        💾 Save Changes
                      </FormButton>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          First Name
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {profileData.first_name || "—"}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          Last Name
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {profileData.last_name || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        Email Address
                      </p>
                      <p className="text-lg font-semibold text-gray-900 break-all">
                        {user.email}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        Phone Number
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {profileData.phone_number || "Not set"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        Location
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {profileData.location || "Not set"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        Bio
                      </p>
                      <p className="text-base text-gray-700 leading-relaxed">
                        {profileData.bio || "No bio information yet."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics & Account Info Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Account Status Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  🔐 Account Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                    <span className="font-medium text-gray-700">
                      Email Verified
                    </span>
                    <span className="text-2xl">✓</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="font-medium text-gray-700">
                      Account Type
                    </span>
                    <span className="font-bold text-blue-600 capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  📊 Statistics
                </h3>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <p className="text-4xl font-bold text-blue-600">0</p>
                    <p className="text-sm text-gray-600 mt-2">Recipes Shared</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <p className="text-4xl font-bold text-green-600">0</p>
                    <p className="text-sm text-gray-600 mt-2">Followers</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <p className="text-4xl font-bold text-purple-600">0</p>
                    <p className="text-sm text-gray-600 mt-2">Saved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="mb-8 pb-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  Change Password
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Update your password to keep your account secure
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <FormInput
                  label="🔓 Current Password"
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  error={validationErrors.oldPassword}
                  placeholder="Enter your current password"
                  required
                  showPassword={showOldPassword}
                  onTogglePassword={() => setShowOldPassword(!showOldPassword)}
                />

                <FormInput
                  label="🔐 New Password"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  error={validationErrors.newPassword}
                  placeholder="Enter your new password"
                  required
                  showPassword={showNewPassword}
                  onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                />

                <FormInput
                  label="✓ Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={validationErrors.confirmPassword}
                  placeholder="Confirm your new password"
                  required
                  showPassword={showConfirmPassword}
                  onTogglePassword={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                  <p className="text-sm font-semibold text-blue-900 mb-3">
                    🔒 Password Requirements:
                  </p>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <span className="text-lg">✓</span> Minimum 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-lg">✓</span> At least one uppercase
                      letter (A-Z)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-lg">✓</span> At least one lowercase
                      letter (a-z)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-lg">✓</span> At least one number
                      (0-9)
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-100">
                  <FormButton loading={loading} type="submit">
                    🔄 Update Password
                  </FormButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6">
              <div className="pb-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  Account Settings
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Manage your account access
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    🚪 Logout
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Sign out from your account on this device
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                  >
                    🚪 Logout
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-300">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    ⚠️ Danger Zone
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed font-medium opacity-75"
                  >
                    🗑️ Delete Account (Coming Soon)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
