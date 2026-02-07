import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FormInput,
  FormButton,
  Alert,
} from "../../components/FormComponents";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, logout, loading, error } =
    useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    location: "",
    bio: "",
  });

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
  const [showOldPasswordTab2, setShowOldPasswordTab2] = useState(false);
  const [showNewPasswordTab2, setShowNewPasswordTab2] = useState(false);
  const [showConfirmPasswordTab2, setShowConfirmPasswordTab2] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.profile?.first_name || "",
        last_name: user.profile?.last_name || "",
        phone_number: user.profile?.phone_number || "",
        location: user.profile?.location || "",
        bio: user.profile?.bio || "",
      });
    }
  }, [user]);

  const validateProfile = () => {
    const errors = {};
    if (profileData.phone_number && !/^[0-9\s\-\+\(\)]{7,15}$/.test(profileData.phone_number)) {
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
      await updateProfile(profileData);
      setSuccessMessage("Profile updated successfully!");
      setEditMode(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      // Error is already in context
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      await changePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
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
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-end space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center border-4 border-blue-300 text-4xl font-bold">
                {user.profile?.first_name?.[0]?.toUpperCase() ||
                  user.email?.[0]?.toUpperCase() ||
                  "U"}
              </div>
              <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
            </div>

            {/* User Info */}
            <div className="pb-2">
              <h1 className="text-3xl font-bold">
                {(user.profile?.first_name + " " + user.profile?.last_name)
                  .trim() || "User Profile"}
              </h1>
              <p className="text-blue-100">{user.email}</p>
              <p className="text-blue-100 text-sm capitalize">
                {user.role} • Member since{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-8">
            {["profile", "security", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setEditMode(false);
                }}
                className={`px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && <Alert message={error} type="error" onClose={() => setError("")} />}
        {successMessage && (
          <Alert message={successMessage} type="success" onClose={() => setSuccessMessage("")} />
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Profile Information
                  </h2>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {editMode ? (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        label="First Name"
                        name="first_name"
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                        error={validationErrors.first_name}
                      />
                      <FormInput
                        label="Last Name"
                        name="last_name"
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                        error={validationErrors.last_name}
                      />
                    </div>

                    <FormInput
                      label="Phone Number"
                      name="phone_number"
                      type="tel"
                      value={profileData.phone_number}
                      onChange={handleProfileChange}
                      error={validationErrors.phone_number}
                      placeholder="+1 (555) 000-0000"
                    />

                    <FormInput
                      label="Location"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      error={validationErrors.location}
                      placeholder="City, Country"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <FormButton loading={loading} type="submit">
                        Save Changes
                      </FormButton>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {(profileData.first_name + " " + profileData.last_name)
                          .trim() || "Not set"}
                      </p>
                    </div>
                    <div className="border-b pb-4">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {user.email}
                      </p>
                    </div>
                    <div className="border-b pb-4">
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {profileData.phone_number || "Not set"}
                      </p>
                    </div>
                    <div className="border-b pb-4">
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {profileData.location || "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bio</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {profileData.bio || "Not set"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-white rounded-lg shadow-md p-8 h-fit">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Statistics</h3>
              <div className="space-y-4">
                <div className="text-center pb-4 border-b">
                  <p className="text-3xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-gray-600">Recipes Shared</p>
                </div>
                <div className="text-center pb-4 border-b">
                  <p className="text-3xl font-bold text-green-600">0</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-gray-600">Recipes Liked</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Change Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <FormInput
                  label="Current Password"
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
                  label="New Password"
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
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={validationErrors.confirmPassword}
                  placeholder="Confirm your new password"
                  required
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Password requirements:</strong>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>✓ Minimum 8 characters</li>
                      <li>✓ At least one uppercase letter</li>
                      <li>✓ At least one lowercase letter</li>
                      <li>✓ At least one number</li>
                    </ul>
                  </p>
                </div>

                <FormButton loading={loading} type="submit">
                  Update Password
                </FormButton>
              </form>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Settings
                </h3>
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Danger Zone
                </h3>
                <button
                  disabled
                  className="w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-lg cursor-not-allowed font-medium"
                >
                  Delete Account (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
 
{/* <>
      <Navbar />
      <Container className="pt-16">
        <div className="py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

          {error && (
            <Alert message={error} type="error" onClose={() => setError("")} />
          )}
          {successMessage && (
            <Alert
              message={successMessage}
              type="success"
              onClose={() => setSuccessMessage("")}
            />
          )}

          {!loading && profile && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
             // 
              <Card className="lg:col-span-1 h-fit">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Account
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      activeTab === "profile"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("password")}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      activeTab === "password"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Change Password
                  </button>
                  {user?.role === "store" && (
                    <button
                      onClick={() => setActiveTab("store")}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        activeTab === "store"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Store Details
                    </button>
                  )}
                  {user?.role === "restaurant" && (
                    <button
                      onClick={() => setActiveTab("restaurant")}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        activeTab === "restaurant"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Restaurant Details
                    </button>
                  )}
                </div>
              </Card>

           
              <Card className="lg:col-span-3">
                {activeTab === "profile" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Edit Profile
                    </h2>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <p className="text-sm text-gray-600">
                        Email:{" "}
                        <span className="font-semibold">{user?.email}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Role:{" "}
                        <span className="font-semibold capitalize">
                          {user?.role}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Email Status:{" "}
                        <span className="font-semibold text-green-600">
                          Verified
                        </span>
                      </p>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          label="First Name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleProfileChange}
                          placeholder="John"
                        />
                        <FormInput
                          label="Last Name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleProfileChange}
                          placeholder="Doe"
                        />
                      </div>

                      <FormInput
                        label="Phone Number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleProfileChange}
                        placeholder="+1 234 567 8900"
                      />

                      <FormInput
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleProfileChange}
                        placeholder="City, Country"
                      />

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleProfileChange}
                          placeholder="Tell us about yourself"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="4"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="dark_mode"
                          name="dark_mode"
                          checked={formData.dark_mode}
                          onChange={handleProfileChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <label htmlFor="dark_mode" className="text-gray-700">
                          Enable Dark Mode
                        </label>
                      </div>

                      <FormButton type="submit">Save Changes</FormButton>
                    </form>
                  </div>
                )}

                {activeTab === "password" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Change Password
                    </h2>

                    <form
                      onSubmit={handlePasswordSubmit}
                      className="space-y-4 max-w-md"
                    >
                      <FormInput
                        label="Current Password"
                        type="password"
                        name="old_password"
                        value={passwordData.old_password}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        required
                        showPassword={showOldPasswordTab2}
                        onTogglePassword={() => setShowOldPasswordTab2(!showOldPasswordTab2)}
                      />

                      <FormInput
                        label="New Password"
                        type="password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        required
                        showPassword={showNewPasswordTab2}
                        onTogglePassword={() => setShowNewPasswordTab2(!showNewPasswordTab2)}
                      />

                      <FormInput
                        label="Confirm New Password"
                        type="password"
                        name="new_password_confirm"
                        value={passwordData.new_password_confirm}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        required
                        showPassword={showConfirmPasswordTab2}
                        onTogglePassword={() => setShowConfirmPasswordTab2(!showConfirmPasswordTab2)}
                      />

                      <FormButton type="submit">Change Password</FormButton>
                    </form>
                  </div>
                )}

                {activeTab === "store" && user?.role === "store" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Store Details
                    </h2>
                    <p className="text-gray-600">
                      Store management features coming soon...
                    </p>
                  </div>
                )}

                {activeTab === "restaurant" && user?.role === "restaurant" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Restaurant Details
                    </h2>
                    <p className="text-gray-600">
                      Restaurant management features coming soon...
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </Container>
    </> */}
