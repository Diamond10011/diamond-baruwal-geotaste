import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000/api";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token");
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
      setError(null);
    } catch (err) {
      setError("Failed to load feed");
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
          alert("Unable to get your location. Please enable location services.");
        }
      );
    }
  };

  const handleFindFood = () => {
    if (!location.trim()) {
      alert("Please enter a location or use 'Use My Location'");
      return;
    }
    // Redirect based on user role
    if (user?.role === "normal" || user?.role === "customer") {
      navigate("/stores");
    } else if (user?.role === "chef" || user?.role === "restaurant" || user?.role === "admin") {
      navigate("/restaurants");
    }
  };

  const quickFilters = [
    { label: "Near Me", icon: "📍" },
    { label: "Vegetarian", icon: "🥗" },
    { label: "Fast Food", icon: "⚡" },
    { label: "Fine Dining", icon: "✨" },
    { label: "Delivery", icon: "🚚" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/50 z-0"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center w-full">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Discover Local Flavors <br />
            <span className="text-orange-500">Near You</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Personalized food recommendations based on your location, preferences, and dietary needs. Find restaurants, explore recipes, and plan your meals.
          </p>

          {/* Search Card */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-3xl mx-auto">
            {/* Search Inputs */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              {/* Location Input */}
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">📍</span>
                <input
                  type="text"
                  placeholder="Enter your location or address..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-600 font-medium"
                />
              </div>

              {/* Location Button */}
              <button
                onClick={handleGetLocation}
                disabled={isLocating}
                className="px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                <span>🧭</span>
                {isLocating ? "Locating..." : "Use My Location"}
              </button>

              {/* Find Food Button */}
              <button
                onClick={handleFindFood}
                className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
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
                  className="px-4 py-2 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition-colors font-medium"
                >
                  {filter.icon} {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Featured Recipes (for all users) */}
          {(user?.role === "chef" || user?.role === "restaurant" || user?.role === "admin" || user?.role === "normal" || user?.role === "customer") && (
            <div className="mb-16">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Latest Recipes 🔥</h2>
                <Link to="/recipes" className="text-orange-600 hover:text-orange-700 font-semibold">
                  View All →
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading recipes...</p>
                </div>
              ) : recipes.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <p className="text-gray-600 mb-4">No recipes yet. Be the first to share!</p>
                  <Link to="/recipes" className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    Share a Recipe
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.slice(0, 6).map((recipe) => (
                    <div
                      key={recipe.id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/recipes/${recipe.id}`)}
                    >
                      {recipe.recipe_image && (
                        <img
                          src={recipe.recipe_image}
                          alt={recipe.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">by {recipe.author_name || recipe.author_email}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">⏱️ {(recipe.preparation_time || 0) + (recipe.cooking_time || 0)}m</span>
                          <span className="text-yellow-500">⭐ {recipe.avg_rating || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Featured Restaurants (for all users) */}
          {(user?.role === "chef" || user?.role === "restaurant" || user?.role === "admin" || user?.role === "normal" || user?.role === "customer") && (
            <div className="mb-16">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Popular Restaurants 🍽️</h2>
                <Link to="/restaurants" className="text-orange-600 hover:text-orange-700 font-semibold">
                  View All →
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading restaurants...</p>
                </div>
              ) : restaurants.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <p className="text-gray-600 mb-4">No restaurants available yet.</p>
                  <Link to="/restaurants" className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    Explore Restaurants
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restaurants.slice(0, 6).map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      to={`/restaurants/${restaurant.id}`}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-6">
                        <h3 className="font-bold text-gray-900 mb-2">{restaurant.restaurant_name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{restaurant.cuisine_type || "Restaurant"}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-500">⭐ {restaurant.rating_avg || "N/A"}</span>
                          <span className="text-gray-600 text-sm">{restaurant.location?.city || "Location"}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Admin Dashboard */}
          {user?.role === "admin" && (
            <Link
              to="/admin-dashboard"
              className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 text-center transition-shadow border-l-4 border-red-500"
            >
              <div className="text-4xl mb-2">⚙️</div>
              <h3 className="font-semibold text-gray-900">Admin Dashboard</h3>
              <p className="text-sm text-gray-600">Manage all systems</p>
            </Link>
          )}

          {/* Browse Stores (Normal/Customer users) */}
          {(user?.role === "normal" || user?.role === "customer") && (
            <Link
              to="/stores"
              className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 text-center transition-shadow border-l-4 border-green-500"
            >
              <div className="text-4xl mb-2">🏪</div>
              <h3 className="font-semibold text-gray-900">Browse Stores</h3>
              <p className="text-sm text-gray-600">Find food & order</p>
            </Link>
          )}

          {/* My Orders (Normal/Customer users) */}
          {(user?.role === "normal" || user?.role === "customer") && (
            <Link
              to="/orders"
              className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 text-center transition-shadow border-l-4 border-green-500"
            >
              <div className="text-4xl mb-2">📦</div>
              <h3 className="font-semibold text-gray-900">My Orders</h3>
              <p className="text-sm text-gray-600">Track your orders</p>
            </Link>
          )}

          {/* My Store (Store & Admin only) */}
          {(user?.role === "store" || user?.role === "admin") && (
            <Link
              to="/store-profile"
              className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 text-center transition-shadow border-l-4 border-blue-500"
            >
              <div className="text-4xl mb-2">🏬</div>
              <h3 className="font-semibold text-gray-900">My Store</h3>
              <p className="text-sm text-gray-600">Manage your store</p>
            </Link>
          )}

          {/* My Restaurant (Restaurant & Admin only) */}
          {(user?.role === "restaurant" || user?.role === "admin") && (
            <Link
              to="/restaurant-profile"
              className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 text-center transition-shadow border-l-4 border-orange-500"
            >
              <div className="text-4xl mb-2">🍽️</div>
              <h3 className="font-semibold text-gray-900">My Restaurant</h3>
              <p className="text-sm text-gray-600">Manage your business</p>
            </Link>
          )}

          {/* My Recipes (Chef, Restaurant & Admin only - NOT normal users) */}
          {(user?.role === "chef" || user?.role === "restaurant" || user?.role === "admin") && (
            <Link
              to="/recipes"
              className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 text-center transition-shadow border-l-4 border-indigo-500"
            >
              <div className="text-4xl mb-2">📖</div>
              <h3 className="font-semibold text-gray-900">My Recipes</h3>
              <p className="text-sm text-gray-600">View & create recipes</p>
            </Link>
          )}

          {/* Find Restaurants (Chef, Restaurant & Admin only - NOT normal users) */}
          {(user?.role === "chef" || user?.role === "restaurant" || user?.role === "admin") && (
            <Link
              to="/restaurants"
              className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 text-center transition-shadow border-l-4 border-purple-500"
            >
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="font-semibold text-gray-900">Find Restaurants</h3>
              <p className="text-sm text-gray-600">Search nearby</p>
            </Link>
          )}

          {/* Favorites (Chef, Restaurant & Admin only - NOT normal users) */}
          {(user?.role === "chef" || user?.role === "restaurant" || user?.role === "admin") && (
            <Link
              to="/favorites"
              className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 text-center transition-shadow border-l-4 border-yellow-500"
            >
              <div className="text-4xl mb-2">⭐</div>
              <h3 className="font-semibold text-gray-900">Favorites</h3>
              <p className="text-sm text-gray-600">Your saved items</p>
            </Link>
          )}

          {/* Profile (All roles) */}
          <Link
            to="/profile"
            className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 text-center transition-shadow border-l-4 border-gray-500"
          >
            <div className="text-4xl mb-2">👤</div>
            <h3 className="font-semibold text-gray-900">Profile</h3>
            <p className="text-sm text-gray-600">Manage your profile</p>
          </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Join Our Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold mb-2">{recipes.length}+</p>
              <p className="text-sm">Recipes Shared</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">{restaurants.length}+</p>
              <p className="text-sm">Restaurants Listed</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">5★</p>
              <p className="text-sm">Average Rating</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
