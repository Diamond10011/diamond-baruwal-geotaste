import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import {
  Container,
  Card,
  LoadingSpinner,
  Alert,
} from "../../components/FormComponents";
import axios from "axios";

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/admin-dashboard/",
        );
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      fetchDashboard();
    }
  }, [isAuthenticated, user?.role]);

  if (loading) return <LoadingSpinner />;

  if (user?.role !== "admin") {
    return (
      <>
        <Navbar />
        <Container className="pt-16">
          <div className="py-12 text-center">
            <p className="text-red-600 text-lg">
              You don't have permission to access this page
            </p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container className="pt-16">
        <div className="py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Admin Dashboard
          </h1>

          {error && (
            <Alert
              message={error}
              type="error"
              onClose={() => setError(null)}
            />
          )}

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <Card>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Total Users
                </h3>
                <p className="text-4xl font-bold text-blue-600">
                  {stats.total_users}
                </p>
                <p className="text-xs text-gray-500 mt-2">Active accounts</p>
              </Card>

              {/* Normal Users */}
              <Card>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Normal Users
                </h3>
                <p className="text-4xl font-bold text-green-600">
                  {stats.normal_users}
                </p>
                <p className="text-xs text-gray-500 mt-2">Regular users</p>
              </Card>

              {/* Store Users */}
              <Card>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Store Users
                </h3>
                <p className="text-4xl font-bold text-yellow-600">
                  {stats.store_users}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Selling ingredients
                </p>
              </Card>

              {/* Restaurant Users */}
              <Card>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Restaurant Users
                </h3>
                <p className="text-4xl font-bold text-purple-600">
                  {stats.restaurant_users}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Managing restaurants
                </p>
              </Card>

              {/* Email Verified */}
              <Card>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Email Verified
                </h3>
                <p className="text-4xl font-bold text-indigo-600">
                  {stats.verified_emails}
                </p>
                <p className="text-xs text-gray-500 mt-2">Verified accounts</p>
              </Card>

              {/* Verification Rate */}
              <Card className="md:col-span-2 lg:col-span-3">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Verification Rate
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{
                          width: `${
                            stats.total_users > 0
                              ? (stats.verified_emails / stats.total_users) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {stats.total_users > 0
                      ? Math.round(
                          (stats.verified_emails / stats.total_users) * 100,
                        )
                      : 0}
                    %
                  </span>
                </div>
              </Card>
            </div>
          )}

          {/* Management Actions */}
          <Card className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Management Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                Manage Users
              </button>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                View Reports
              </button>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
                System Settings
              </button>
            </div>
          </Card>
        </div>
      </Container>
    </>
  );
};

export default AdminDashboard;
