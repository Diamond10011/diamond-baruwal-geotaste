import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Alert } from "../components/FormComponents";

const API_BASE_URL = "http://localhost:8000/api";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user,
    isFavoriteRecipe,
    addRecipeToFavorites,
    removeRecipeFromFavorites,
    favorites,
  } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingForm, setRatingForm] = useState(null);
  const [ratingData, setRatingData] = useState({ rating: 5, comment: "" });
  const [userRating, setUserRating] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [ratingSort, setRatingSort] = useState("recent");

  useEffect(() => {
    fetchRecipeDetails();
  }, [id]);

  const fetchRecipeDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recipes/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setRecipe(response.data);
      setUserRating(response.data.user_rating);
      setError(null);
    } catch (err) {
      setError("Failed to load recipe details");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (recipe) => {
    if (isFavoriteRecipe(recipe.id)) {
      removeRecipeFromFavorites(recipe.id);
    } else {
      addRecipeToFavorites(recipe);
    }
  };

  const handleLikeRecipe = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/recipes/${id}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      fetchRecipeDetails();
    } catch (err) {
      setError("Failed to like recipe");
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/recipes/${id}/rating/`, ratingData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setSuccessMessage("Rating saved successfully!");
      setRatingData({ rating: 5, comment: "" });
      setRatingForm(null);
      fetchRecipeDetails();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to save rating");
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await axios.delete(`${API_BASE_URL}/recipes/${recipeId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setSuccessMessage("Recipe deleted successfully!");
      setTimeout(() => navigate("/recipes"), 2000);
    } catch (err) {
      setError("Failed to delete recipe");
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;

    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("v=")[1]?.split("&")[0];
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // Vimeo
    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading recipe details...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Alert
          message={error || "Recipe not found"}
          type="error"
          onClose={() => {}}
        />
        <button
          onClick={() => navigate("/recipes")}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Back to Recipes
        </button>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(recipe.recipe_video);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-red-700 text-white py-12 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => navigate("/recipes")}
            className="text-white hover:text-orange-100 mb-4 flex items-center gap-2 transition-colors hover:scale-105"
          >
            ← Back to Recipes
          </button>
          <h1 className="text-5xl font-bold mb-2">{recipe.title}</h1>
          <p className="text-orange-100 text-lg">👨‍🍳 by {recipe.author_name}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <Alert message={error} type="error" onClose={() => setError(null)} />
        )}
        {successMessage && (
          <Alert
            message={successMessage}
            type="success"
            onClose={() => setSuccessMessage("")}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            {/* Recipe Image */}
            {recipe.recipe_image && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow">
                <img
                  src={recipe.recipe_image}
                  alt={recipe.title}
                  className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}

            {/* Recipe Video */}
            {recipe.recipe_video && embedUrl && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow border-2 border-orange-100">
                <div className="bg-black aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    title={recipe.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-orange-50 hover:shadow-xl transition-shadow">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                📖 About this Recipe
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {recipe.description}
              </p>
            </div>

            {/* Ingredients */}
            <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-orange-50 hover:shadow-xl transition-shadow">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                🛒 Ingredients
              </h2>
              <div className="space-y-3">
                {recipe.ingredients.split("\n").map(
                  (ingredient, index) =>
                    ingredient.trim() && (
                      <div key={index} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-gray-300 w-5 h-5 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-700 text-base flex-grow">
                          {ingredient.trim()}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-orange-50 hover:shadow-xl transition-shadow">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                👨‍🍳 Instructions
              </h2>
              <div className="space-y-4">
                {recipe.instructions.split("\n").map(
                  (instruction, index) =>
                    instruction.trim() && (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold text-lg shadow-md">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="text-gray-700 text-base leading-relaxed">
                            {instruction.trim()}
                          </p>
                        </div>
                      </div>
                    ),
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-orange-50 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  ⭐ Reviews & Ratings ({recipe.ratings.length})
                </h2>
                {recipe.ratings.length > 0 && (
                  <select
                    value={ratingSort}
                    onChange={(e) => setRatingSort(e.target.value)}
                    className="px-4 py-2 text-sm border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 font-medium bg-white"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                )}
              </div>

              {recipe.ratings.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 rounded-2xl border-2 border-orange-100 shadow-md">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-orange-600">
                        {recipe.avg_rating}
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        Average Rating
                      </p>
                    </div>
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = recipe.ratings.filter(
                        (r) => r.rating === stars,
                      ).length;
                      const percentage =
                        recipe.ratings.length > 0
                          ? Math.round((count / recipe.ratings.length) * 100)
                          : 0;
                      return (
                        <div key={stars} className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            {[...Array(stars)].map((_, i) => (
                              <span key={i} className="text-lg">
                                ⭐
                              </span>
                            ))}
                            {[...Array(5 - stars)].map((_, i) => (
                              <span
                                key={i + stars}
                                className="text-lg text-gray-300"
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-700 font-bold">
                            {percentage}%
                          </p>
                          <p className="text-xs text-gray-600">({count})</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {user && !ratingForm && (
                <button
                  onClick={() => setRatingForm(true)}
                  className="mb-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-bold"
                >
                  ✍️ Write a Review
                </button>
              )}

              {ratingForm && user && (
                <form
                  onSubmit={handleRatingSubmit}
                  className="mb-6 p-6 bg-white rounded-2xl border-2 border-orange-200 shadow-lg"
                >
                  <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                    ⭐ Share Your Experience
                  </h3>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() =>
                            setRatingData({
                              ...ratingData,
                              rating: num,
                            })
                          }
                          className={`text-4xl transition-transform ${
                            ratingData.rating >= num
                              ? "text-yellow-500 scale-125"
                              : "text-gray-300 hover:text-yellow-300 hover:scale-110"
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      📝 Your Review
                    </label>
                    <textarea
                      value={ratingData.comment}
                      onChange={(e) =>
                        setRatingData({
                          ...ratingData,
                          comment: e.target.value,
                        })
                      }
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Share your thoughts about this recipe..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-bold"
                    >
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingForm(false)}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {recipe.ratings
                  .sort((a, b) => {
                    if (ratingSort === "recent")
                      return new Date(b.created_at) - new Date(a.created_at);
                    if (ratingSort === "highest") return b.rating - a.rating;
                    if (ratingSort === "lowest") return a.rating - b.rating;
                    return 0;
                  })
                  .map((rating) => (
                    <div
                      key={rating.id}
                      className="pb-4 border-b last:border-b-0 hover:bg-orange-50 p-4 -mx-4 px-4 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900">
                            {rating.user_email}
                          </p>
                          <p className="text-lg flex gap-1">
                            {[...Array(rating.rating)].map((_, i) => (
                              <span key={i}>⭐</span>
                            ))}
                            {[...Array(5 - rating.rating)].map((_, i) => (
                              <span
                                key={i + rating.rating}
                                className="text-gray-300"
                              >
                                ⭐
                              </span>
                            ))}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(rating.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      {rating.comment && (
                        <p className="text-gray-700 text-sm mt-3 leading-relaxed">
                          {rating.comment}
                        </p>
                      )}
                    </div>
                  ))}
              </div>

              {recipe.ratings.length === 0 && !ratingForm && (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4 text-lg font-medium">
                    📝 Be the first to review this recipe!
                  </p>
                  {user && (
                    <button
                      onClick={() => setRatingForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-bold"
                    >
                      Write First Review
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-orange-50 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <div className="text-4xl font-bold text-orange-600">
                  {recipe.avg_rating}⭐
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {recipe.ratings.length} ratings
                </p>
              </div>

              <div className="space-y-4 mb-6 border-y py-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-bold">🎯 Difficulty</span>
                  <span className="font-bold text-gray-900 capitalize bg-blue-100 px-3 py-1 rounded-full text-xs">
                    {recipe.difficulty}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-bold">⏱️ Prep Time</span>
                  <span className="font-bold text-gray-900">
                    {recipe.preparation_time}m
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-bold">🍳 Cook Time</span>
                  <span className="font-bold text-gray-900">
                    {recipe.cooking_time}m
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-bold">👥 Servings</span>
                  <span className="font-bold text-gray-900">
                    {recipe.servings}
                  </span>
                </div>
                {recipe.calories && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-bold">🔥 Calories</span>
                    <span className="font-bold text-gray-900">
                      {recipe.calories}
                    </span>
                  </div>
                )}
              </div>

              {recipe.cuisine_type && (
                <div className="mb-4">
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                    🗺️ {recipe.cuisine_type}
                  </span>
                </div>
              )}

              {recipe.dietary_tags && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-bold mb-3">
                    🥗 Dietary Info
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.dietary_tags.split(",").map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-green-100 to-green-50 text-green-700 text-xs rounded-full font-bold border border-green-200"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm text-gray-600 font-bold">
                  👁️ {recipe.views_count} views
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3 border border-orange-50">
              <button
                onClick={handleLikeRecipe}
                className={`w-full py-3 rounded-lg font-bold transition-all hover:scale-105 ${
                  recipe.user_liked
                    ? "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200"
                }`}
              >
                ❤️ {recipe.likes_count} {recipe.user_liked ? "Liked" : "Like"}
              </button>

              <button
                onClick={() => handleToggleFavorite(recipe)}
                className={`w-full py-3 rounded-lg font-bold transition-all hover:scale-105 ${
                  isFavoriteRecipe(recipe.id)
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200"
                }`}
              >
                ⭐ {isFavoriteRecipe(recipe.id) ? "Saved" : "Save Recipe"}
              </button>

              {user?.email === recipe.author_email && (
                <>
                  <button
                    onClick={() => navigate(`/recipes/${id}/edit`)}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-bold"
                  >
                    ✏️ Edit Recipe
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this recipe?",
                        )
                      ) {
                        handleDeleteRecipe(id);
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-bold"
                  >
                    🗑️ Delete Recipe
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
