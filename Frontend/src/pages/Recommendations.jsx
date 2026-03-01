import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8000/api";

const Recommendations = () => {
  const navigate = useNavigate();
  const { user, addRecipeToFavorites, isFavoriteRecipe } = useAuth();
  const [recommendations, setRecommendations] = useState({
    personalized_recipes: [],
    popular_recipes: [],
    trending_recipes: [],
    popular_restaurants: [],
    user_favorite_cuisines: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("personalized");
  const [filters, setFilters] = useState({
    cuisineType: "",
    difficulty: "",
    limit: 10,
  });

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/recommendations/summary/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      setRecommendations(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredRecommendations = async (type) => {
    try {
      setLoading(true);
      let endpoint = "";

      if (type === "personalized") {
        endpoint = `${API_BASE_URL}/recommendations/recipes/?limit=${filters.limit}`;
        if (filters.cuisineType)
          endpoint += `&cuisine_type=${filters.cuisineType}`;
        if (filters.difficulty) endpoint += `&difficulty=${filters.difficulty}`;
      } else if (type === "popular") {
        endpoint = `${API_BASE_URL}/recommendations/recipes/popular/?limit=${filters.limit}`;
      } else if (type === "trending") {
        endpoint = `${API_BASE_URL}/recommendations/recipes/trending/?limit=${filters.limit}`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setRecommendations({
        ...recommendations,
        personalized_recipes:
          type === "personalized" ? response.data.recommendations : [],
        popular_recipes: type === "popular" ? response.data.recipes : [],
        trending_recipes: type === "trending" ? response.data.recipes : [],
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching filtered recommendations:", err);
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({ ...filters, [filterType]: value });
  };

  const handleApplyFilters = () => {
    fetchFilteredRecommendations(activeTab);
  };

  const renderRecipeCard = (recipe) => (
    <div
      key={recipe.id}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all border border-orange-50"
    >
      {recipe.recipe_image && (
        <img
          src={recipe.recipe_image}
          alt={recipe.title}
          className="w-full h-48 object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
          onClick={() => navigate(`/recipes/${recipe.id}`)}
        />
      )}
      <div className="p-6">
        <h3
          onClick={() => navigate(`/recipes/${recipe.id}`)}
          className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-orange-600 transition-colors"
        >
          {recipe.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 font-medium">
          👨‍🍳 {recipe.author_name || "Unknown"}
        </p>
        <div className="flex justify-between items-center mb-4 text-sm">
          <span className="text-gray-700 font-bold">
            ⏱️ {recipe.preparation_time}m prep
          </span>
          <span className="text-lg font-bold text-yellow-500">
            ⭐ {recipe.avg_rating || "0"}
          </span>
        </div>
        {recipe.difficulty && (
          <div className="mb-4 flex gap-2">
            <span className="text-xs font-bold bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 px-3 py-2 rounded-full border border-orange-200">
              🎯 {recipe.difficulty}
            </span>
            {recipe.cuisine_type && (
              <span className="text-xs font-bold bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-3 py-2 rounded-full border border-blue-200">
                🍴 {recipe.cuisine_type}
              </span>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/recipes/${recipe.id}`)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-bold text-sm"
          >
            View Details
          </button>
          <button
            onClick={() => addRecipeToFavorites(recipe)}
            className={`px-4 py-3 rounded-lg font-bold text-sm transition-all hover:scale-105 ${
              isFavoriteRecipe(recipe.id)
                ? "bg-yellow-400 text-gray-900 hover:shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200"
            }`}
          >
            {isFavoriteRecipe(recipe.id) ? "⭐ Saved" : "☆ Save"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderRestaurantCard = (restaurant) => (
    <div
      key={restaurant.id}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all cursor-pointer border border-orange-50"
    >
      <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-red-500 p-6 text-white">
        <h3
          onClick={() => navigate(`/restaurants/${restaurant.id}`)}
          className="text-xl font-bold mb-2 hover:opacity-90 transition-opacity"
        >
          {restaurant.restaurant_name}
        </h3>
        <p className="text-orange-100 text-sm font-medium">
          🍴 {restaurant.cuisine_type || "Restaurant"}
        </p>
      </div>
      <div className="p-6">
        {restaurant.location && (
          <p className="text-sm text-gray-600 mb-4 font-medium">
            📍 {restaurant.location.city || "Location unknown"}
          </p>
        )}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <span className="text-2xl font-bold text-yellow-500">
            ⭐ {restaurant.rating_avg || "N/A"}
          </span>
          <span className="text-sm text-gray-600 font-bold">
            ({restaurant.total_ratings || 0} reviews)
          </span>
        </div>
        <button
          onClick={() => navigate(`/restaurants/${restaurant.id}`)}
          className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-bold text-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );

  if (loading && recommendations.personalized_recipes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-gray-600 text-lg font-medium">
            Loading personalized recommendations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-orange-50 to-amber-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            🤖 Smart Recommendations
          </h1>
          <p className="text-gray-600 text-lg">
            Personalized recipes and restaurants just for you, based on your
            preferences and activity
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border-2 border-red-300 text-red-700 rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-10 border-b-2 border-gray-200 overflow-x-auto">
          {[
            { id: "personalized", label: "👤 For You", icon: "🎯" },
            { id: "popular", label: "🔥 Popular", icon: "⭐" },
            { id: "trending", label: "📈 Trending", icon: "🚀" },
            { id: "restaurants", label: "🍽️ Restaurants", icon: "🏪" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 font-bold text-lg transition-all border-b-4 -mb-2 rounded-t-2xl whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white bg-gradient-to-r from-orange-600 to-red-600 border-orange-600 shadow-md"
                  : "text-gray-600 border-transparent hover:text-orange-600 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Filters for Recipe Tabs */}
        {(activeTab === "personalized" ||
          activeTab === "popular" ||
          activeTab === "trending") && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-orange-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🔍 Filter Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., Italian, Asian, Mexican"
                  value={filters.cuisineType}
                  onChange={(e) =>
                    handleFilterChange("cuisineType", e.target.value)
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Difficulty Level
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) =>
                    handleFilterChange("difficulty", e.target.value)
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium"
                >
                  <option value="">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Limit
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange("limit", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium"
                >
                  <option value="5">5 Items</option>
                  <option value="10">10 Items</option>
                  <option value="15">15 Items</option>
                  <option value="20">20 Items</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleApplyFilters}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-bold"
            >
              Apply Filters
            </button>
          </div>
        )}

        {/* Content */}
        {activeTab === "personalized" && (
          <div>
            {recommendations.personalized_recipes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-orange-100">
                <p className="text-5xl mb-4">📝</p>
                <p className="text-gray-600 text-lg mb-8 font-medium">
                  No personalized recommendations available yet. Start liking
                  and rating recipes!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.personalized_recipes.map(renderRecipeCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === "popular" && (
          <div>
            {recommendations.popular_recipes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-orange-100">
                <p className="text-5xl mb-4">🔥</p>
                <p className="text-gray-600 text-lg mb-8 font-medium">
                  No popular recipes found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.popular_recipes.map(renderRecipeCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === "trending" && (
          <div>
            {recommendations.trending_recipes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-orange-100">
                <p className="text-5xl mb-4">📈</p>
                <p className="text-gray-600 text-lg mb-8 font-medium">
                  No trending recipes at this moment
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.trending_recipes.map(renderRecipeCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === "restaurants" && (
          <div>
            {recommendations.popular_restaurants.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-orange-100">
                <p className="text-5xl mb-4">🍽️</p>
                <p className="text-gray-600 text-lg mb-8 font-medium">
                  No restaurant recommendations available
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.popular_restaurants.map(renderRestaurantCard)}
              </div>
            )}
          </div>
        )}

        {/* Favorite Cuisines Section */}
        {recommendations.user_favorite_cuisines.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-orange-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🎯 Your Favorite Cuisines
            </h3>
            <div className="flex flex-wrap gap-3">
              {recommendations.user_favorite_cuisines.map((cuisine, idx) => (
                <span
                  key={idx}
                  className="px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 rounded-full font-bold border-2 border-orange-200"
                >
                  🍴 {cuisine}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
