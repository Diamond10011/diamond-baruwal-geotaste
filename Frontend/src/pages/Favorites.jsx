import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const {
    favorites,
    removeRecipeFromFavorites,
    removeRestaurantFromFavorites,
  } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recipes");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const handleRemoveRecipe = (id) => {
    if (window.confirm("Remove from favorites?")) {
      removeRecipeFromFavorites(id);
    }
  };

  const handleRemoveRestaurant = (id) => {
    if (window.confirm("Remove from favorites?")) {
      removeRestaurantFromFavorites(id);
    }
  };

  // Filter and sort recipes
  const filteredRecipes = favorites.recipes
    .filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.author_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "newest") return 0;
      if (sortBy === "rating") return (b.avg_rating || 0) - (a.avg_rating || 0);
      if (sortBy === "quick")
        return (a.preparation_time || 0) - (b.preparation_time || 0);
      return 0;
    });

  const filteredRestaurants = favorites.restaurants.filter(
    (restaurant) =>
      restaurant.restaurant_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-indigo-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            ⭐ My Favorites
          </h1>
          <p className="text-gray-600 text-lg">
            Your saved recipes and restaurants in one beautiful place
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 border-b-2 border-gray-200">
          {["recipes", "restaurants"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-bold text-lg transition-all border-b-4 -mb-2 rounded-t-2xl ${
                activeTab === tab
                  ? "text-white bg-gradient-to-r from-indigo-600 to-blue-600 border-indigo-600 shadow-md"
                  : "text-gray-600 border-transparent hover:text-indigo-600 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {tab === "recipes" && `📖 Recipes (${filteredRecipes.length})`}
              {tab === "restaurants" &&
                `🍽️ Restaurants (${filteredRestaurants.length})`}
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        {(activeTab === "recipes" && favorites.recipes.length > 0) ||
        (activeTab === "restaurants" && favorites.restaurants.length > 0) ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-indigo-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  🔍 Search
                </label>
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              {activeTab === "recipes" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    📊 Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium"
                  >
                    <option value="newest">Newest First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="quick">Quick to Prepare</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Recipes Tab */}
        {activeTab === "recipes" && (
          <div>
            {filteredRecipes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-indigo-100">
                <p className="text-5xl mb-4">📖</p>
                <p className="text-gray-600 text-lg mb-8 font-medium">
                  {searchTerm
                    ? `No recipes match "${searchTerm}"`
                    : "No favorite recipes yet"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate("/recipes")}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-bold"
                  >
                    Browse Recipes
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all border border-indigo-50"
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
                        className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
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
                        <div className="mb-6">
                          <span className="text-xs font-bold bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-800 px-3 py-2 rounded-full capitalize border border-indigo-200">
                            🎯 {recipe.difficulty}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveRecipe(recipe.id)}
                        className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:scale-105 transition-all font-bold text-sm border-2 border-red-200"
                      >
                        💔 Remove from Favorites
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Restaurants Tab */}
        {activeTab === "restaurants" && (
          <div>
            {filteredRestaurants.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-orange-100">
                <p className="text-5xl mb-4">🍽️</p>
                <p className="text-gray-600 text-lg mb-8 font-medium">
                  {searchTerm
                    ? `No restaurants match "${searchTerm}"`
                    : "No favorite restaurants yet"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate("/restaurants")}
                    className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-bold"
                  >
                    Browse Restaurants
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all cursor-pointer border border-orange-50"
                  >
                    <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-red-500 p-6 text-white">
                      <h3
                        onClick={() =>
                          navigate(`/restaurants/${restaurant.id}`)
                        }
                        className="text-xl font-bold mb-2 hover:opacity-90 transition-opacity"
                      >
                        {restaurant.restaurant_name}
                      </h3>
                      <p className="text-orange-100 text-sm font-medium">
                        🍴 {restaurant.cuisine_type || "Restaurant"}
                      </p>
                    </div>
                    <div className="p-6">
                      {restaurant.restaurant_location && (
                        <p className="text-sm text-gray-600 mb-4 font-medium">
                          📍{" "}
                          {restaurant.restaurant_location.city ||
                            "Location unknown"}
                        </p>
                      )}
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                        <span className="text-2xl font-bold text-yellow-500">
                          ⭐ {restaurant.rating_avg || "N/A"}
                        </span>
                        <span className="text-sm text-gray-600 font-bold">
                          ({restaurant.number_of_ratings || 0} reviews)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/restaurants/${restaurant.id}`)
                          }
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 rounded-lg hover:shadow-md hover:scale-105 transition-all font-bold text-sm border-2 border-orange-200"
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRestaurant(restaurant.id);
                          }}
                          className="px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:scale-105 transition-all font-bold text-sm border-2 border-red-200"
                        >
                          💔
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
