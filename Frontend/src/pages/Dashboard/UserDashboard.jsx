import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000/api";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchUserContent();
  }, []);

  const fetchUserContent = async () => {
    try {
      setLoading(true);
      const [recipesRes, restaurantsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/recipes/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/restaurants/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRecipes(recipesRes.data.recipes || []);
      setRestaurants(restaurantsRes.data.restaurants || []);
    } catch (err) {
      console.error("Failed to load content:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(
            `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          );
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          alert("Unable to get your location. Please enter it manually.");
        }
      );
    }
  };

  const handleFindFood = () => {
    if (!location.trim()) {
      alert("Please enter a location or use 'Use My Location'");
      return;
    }
    navigate("/restaurants");
  };

  const quickFilters = [
    { label: "Near Me", icon: "📍" },
    { label: "Vegetarian", icon: "🥗" },
    { label: "Fast Food", icon: "⚡" },
    { label: "Fine Dining", icon: "✨" },
    { label: "Delivery", icon: "🚚" },
  ];

  const cuisineTypes = [
    "Italian",
    "Chinese",
    "Indian",
    "Mexican",
    "Japanese",
    "Thai",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 via-purple-600/80 to-pink-600/80"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center w-full">
          {/* Welcome Message */}
          <div className="mb-8">
            <p className="text-indigo-100 text-lg mb-2">Welcome back!</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Discover Local
              <br />
              <span className="text-yellow-300">Flavors Near You</span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
              Personalized food recommendations based on your location, preferences, and dietary needs. Find restaurants,
              explore recipes, and plan your meals.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              {/* Location Input */}
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">📍</span>
                <input
                  type="text"
                  placeholder="Enter your location or address..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 h-12 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-600"
                />
              </div>

              {/* Location Button */}
              <button
                onClick={handleGetLocation}
                disabled={isLocating}
                className="h-12 px-6 bg-white border-2 border-indigo-500 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>🧭</span>
                {isLocating ? "Locating..." : "Use My Location"}
              </button>

              {/* Find Food Button */}
              <button
                onClick={handleFindFood}
                className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                Find Food
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              {quickFilters.map((filter) => (
                <button
                  key={filter.label}
                  className="px-4 py-2 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors font-medium"
                >
                  {filter.icon} {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Your Activity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Recipes Created */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Recipes Created</p>
                  <p className="text-4xl font-bold text-indigo-600">
                    {recipes.length}
                  </p>
                </div>
                <span className="text-4xl">📖</span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">45% profile complete</p>
              </div>
            </div>

            {/* Restaurants Visited */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Restaurants Near</p>
                  <p className="text-4xl font-bold text-orange-600">
                    {restaurants.length}
                  </p>
                </div>
                <span className="text-4xl">🍽️</span>
              </div>
              <button
                onClick={() => navigate("/restaurants")}
                className="mt-4 w-full px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
              >
                Explore →
              </button>
            </div>

            {/* Profile Status */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Profile Status</p>
                  <p className="text-4xl font-bold text-green-600">75%</p>
                </div>
                <span className="text-4xl">👤</span>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="mt-4 w-full px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
              >
                Complete Profile →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Featured Recipes */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Recent Recipes 📖
              </h2>
              <button
                onClick={() => navigate("/recipes")}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                View All →
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading recipes...</p>
              </div>
            ) : recipes.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <p className="text-gray-600 mb-4">No recipes yet</p>
                <button
                  onClick={() => navigate("/recipes")}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Your First Recipe
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.slice(0, 3).map((recipe) => (
                  <div
                    key={recipe.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    {recipe.recipe_image && (
                      <img
                        src={recipe.recipe_image}
                        alt={recipe.title}
                        className="w-full h-40 object-cover cursor-pointer"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {recipe.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        by {recipe.author_name || "You"}
                      </p>
                      <div className="flex justify-between text-sm">
                        <span>⏱️ {recipe.preparation_time}m</span>
                        <span>⭐ {recipe.avg_rating || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Restaurants */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Popular Restaurants 🍽️
              </h2>
              <button
                onClick={() => navigate("/restaurants")}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                View All →
              </button>
            </div>

            {restaurants.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <p className="text-gray-600 mb-4">No restaurants found</p>
                <button
                  onClick={() => navigate("/restaurants")}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Find Restaurants
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.slice(0, 3).map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() =>
                      navigate(`/restaurants/${restaurant.id}`)
                    }
                  >
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">
                      {restaurant.restaurant_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {restaurant.cuisine_type || "Restaurant"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-500">
                        ⭐ {restaurant.rating_avg || "N/A"}
                      </span>
                      <span className="text-sm text-gray-600">
                        {restaurant.location?.city || "Near you"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Explore More?
          </h2>
          <p className="text-indigo-100 mb-8">
            Discover amazing recipes and restaurants tailored to your taste
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/recipes")}
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Explore Recipes
            </button>
            <button
              onClick={() => navigate("/restaurants")}
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
            >
              Find Restaurants
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
