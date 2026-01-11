import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import {
  Container,
  Card,
  FormInput,
  FormButton,
  Alert,
} from "../../components/FormComponents";
import axios from "axios";

const Profile = () => {
  const { user, changePassword } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    location: "",
    bio: "",
    dark_mode: false,
  });
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/profile/");
        setProfile(response.data);
        setFormData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:8000/api/profile/",
        formData
      );
      setProfile(response.data.profile);
      setSuccessMessage("Profile updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await changePassword(
        passwordData.old_password,
        passwordData.new_password,
        passwordData.new_password_confirm
      );
      setSuccessMessage("Password changed successfully");
      setPasswordData({
        old_password: "",
        new_password: "",
        new_password_confirm: "",
      });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to change password");
    }
  };

  return (
    <>
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
              {/* Sidebar */}
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

              {/* Main Content */}
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
                      />

                      <FormInput
                        label="New Password"
                        type="password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        required
                      />

                      <FormInput
                        label="Confirm New Password"
                        type="password"
                        name="new_password_confirm"
                        value={passwordData.new_password_confirm}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        required
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
    </>
  );
};

export default Profile;
