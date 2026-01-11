import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import {
  Container,
  Card,
  LoadingSpinner,
} from "../../components/FormComponents";
import axios from "axios";

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/user-dashboard/"
        );
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated]);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <Container className="pt-16">
        <div className="py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Your Dashboard
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <Card className="md:col-span-full lg:col-span-3">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.email}!
                  </h2>
                  <p className="text-gray-600">
                    Role:{" "}
                    <span className="font-semibold text-blue-600">
                      {user?.role}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p
                    className={`text-lg font-bold ${
                      user?.is_email_verified
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {user?.is_email_verified
                      ? "✓ Verified"
                      : "Pending Verification"}
                  </p>
                </div>
              </div>
            </Card>

            {/* User Activities */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Activities
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Profile Completeness</span>
                  <span className="text-2xl font-bold text-blue-600">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Recommended
              </h3>
              <p className="text-gray-600 mb-4">
                Explore new restaurants and ingredients based on your
                preferences
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Explore Now
              </button>
            </Card>

            {/* Saved Items */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Saved Items
              </h3>
              <p className="text-gray-600 text-sm">
                You haven't saved any items yet
              </p>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
};

export default UserDashboard;
