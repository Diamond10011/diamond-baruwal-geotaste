import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { Container, Card } from "../../components/FormComponents";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const roleMessages = {
    admin: "Administrator Dashboard",
    normal: "Welcome to GeoTaste",
    store: "Manage Your Store",
    restaurant: "Manage Your Restaurant",
  };

  const dashboardLinks = {
    admin: "/admin-dashboard",
    normal: "/user-dashboard",
    store: "/store-profile",
    restaurant: "/restaurant-profile",
  };

  return (
    <>
      <Navbar />
      <Container className="pt-16">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Main Content */}
            <Card className="md:col-span-2">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to GeoTaste!
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Hello {user?.email}, you are logged in as a {user?.role}.
              </p>
              <p className="text-gray-600 mb-8">
                GeoTaste is your ultimate guide to discovering amazing
                restaurants and ingredients nearby. Explore local culinary
                excellence and connect with food enthusiasts.
              </p>

              <div className="flex gap-4">
                <Link
                  to={dashboardLinks[user?.role || "normal"]}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                >
                  View Profile
                </Link>
              </div>
            </Card>

            {/* Quick Stats */}
            {user?.role === "admin" && (
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Admin Area
                </h3>
                <p className="text-gray-600 mb-4">
                  Manage users, roles, and system settings
                </p>
                <Link
                  to="/admin-dashboard"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Admin Dashboard
                </Link>
              </Card>
            )}

            {user?.role === "store" && (
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Store Management
                </h3>
                <p className="text-gray-600 mb-4">
                  Manage your ingredients and store details
                </p>
                <Link
                  to="/store-profile"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Manage Store
                </Link>
              </Card>
            )}

            {user?.role === "restaurant" && (
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Restaurant Management
                </h3>
                <p className="text-gray-600 mb-4">
                  Manage your restaurant details and menu
                </p>
                <Link
                  to="/restaurant-profile"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Manage Restaurant
                </Link>
              </Card>
            )}

            {user?.role === "normal" && (
              <Card>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Explore
                </h3>
                <p className="text-gray-600 mb-4">
                  Discover restaurants and ingredients near you
                </p>
                <Link
                  to="/user-dashboard"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Explore Now
                </Link>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </>
  );
};

export default Home;
