import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const { favorites, removeRecipeFromFavorites, removeRestaurantFromFavorites } =
    useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recipes");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ⭐ My Favorites
          </h1>
          <p className="text-gray-600">
            Your saved recipes and restaurants in one place
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b-2 border-gray-300">
          {["recipes", "restaurants"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-colors border-b-4 -mb-2 ${
                activeTab === tab
                  ? "text-indigo-600 border-indigo-600"
                  : "text-gray-600 border-transparent hover:text-indigo-500"
              }`}
            >
              {tab === "recipes" && `📖 Recipes (${favorites.recipes.length})`}
              {tab === "restaurants" &&
                `🍽️ Restaurants (${favorites.restaurants.length})`}
            </button>
          ))}
        </div>

        {/* Recipes Tab */}
        {activeTab === "recipes" && (
          <div>
            {favorites.recipes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-3xl mb-4">📖</p>
                <p className="text-gray-600 text-lg mb-6">
                  No favorite recipes yet
                </p>
                <button
                  onClick={() => navigate("/recipes")}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Browse Recipes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {recipe.recipe_image && (
                      <img
                        src={recipe.recipe_image}
                        alt={recipe.title}
                        className="w-full h-40 object-cover cursor-pointer"
                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-indigo-600">
                        {recipe.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        by {recipe.author_name || "Unknown"}
                      </p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-700">
                          ⏱️ {recipe.preparation_time}m
                        </span>
                        <span className="text-sm text-yellow-500">
                          ⭐ {recipe.avg_rating || "N/A"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveRecipe(recipe.id)}
                        className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
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
            {favorites.restaurants.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-3xl mb-4">🍽️</p>
                <p className="text-gray-600 text-lg mb-6">
                  No favorite restaurants yet
                </p>
                <button
                  onClick={() => navigate("/restaurants")}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Browse Restaurants
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                  >
                    <div className="bg-gradient-to-r from-orange-400 to-red-400 p-4 text-white">
                      <h3 className="text-lg font-bold mb-1">
                        {restaurant.restaurant_name}
                      </h3>
                      <p className="text-orange-100 text-sm">
                        {restaurant.cuisine_type || "Restaurant"}
                      </p>
                    </div>
                    <div className="p-4">
                      {restaurant.restaurant_location && (
                        <p className="text-sm text-gray-600 mb-3">
                          📍{" "}
                          {restaurant.restaurant_location.city ||
                            "Location unknown"}
                        </p>
                      )}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-yellow-500">
                          ⭐ {restaurant.rating_avg || "N/A"}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({restaurant.number_of_ratings || 0} reviews)
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveRestaurant(restaurant.id);
                        }}
                        className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
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
      </div>
    </div>
  );
};

export default Favorites;
