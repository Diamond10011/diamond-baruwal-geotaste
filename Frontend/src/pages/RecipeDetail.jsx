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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => navigate("/recipes")}
            className="text-white hover:text-orange-100 mb-4 flex items-center gap-2"
          >
            ← Back to Recipes
          </button>
          <h1 className="text-4xl font-bold">{recipe.title}</h1>
          <p className="text-orange-100 mt-2">by {recipe.author_name}</p>
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
              <div className="mb-8 rounded-lg overflow-hidden shadow-md">
                <img
                  src={recipe.recipe_image}
                  alt={recipe.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Recipe Video */}
            {recipe.recipe_video && embedUrl && (
              <div className="mb-8 rounded-lg overflow-hidden shadow-md">
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
            <div className="mb-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                About this Recipe
              </h2>
              <p className="text-gray-700 text-lg">{recipe.description}</p>
            </div>

            {/* Ingredients */}
            <div className="mb-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Ingredients
              </h2>
              <div className="space-y-2">
                {recipe.ingredients.split("\n").map(
                  (ingredient, index) =>
                    ingredient.trim() && (
                      <div key={index} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-gray-300"
                        />
                        <span className="text-gray-700">
                          {ingredient.trim()}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Instructions
              </h2>
              <div className="space-y-4">
                {recipe.instructions.split("\n").map(
                  (instruction, index) =>
                    instruction.trim() && (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 text-white font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="text-gray-700">{instruction.trim()}</p>
                        </div>
                      </div>
                    ),
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="mb-8 bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Reviews & Ratings ({recipe.ratings.length})
                </h2>
                {recipe.ratings.length > 0 && (
                  <select
                    value={ratingSort}
                    onChange={(e) => setRatingSort(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                )}
              </div>

              {recipe.ratings.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">
                        {recipe.avg_rating}
                      </p>
                      <p className="text-sm text-gray-600">Average Rating</p>
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
                          <div className="flex items-center mb-1">
                            {[...Array(stars)].map((_, i) => (
                              <span key={i} className="text-yellow-500">
                                ⭐
                              </span>
                            ))}
                            {[...Array(5 - stars)].map((_, i) => (
                              <span key={i + stars} className="text-gray-300">
                                ⭐
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-600">
                            {percentage}% ({count})
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {user && !ratingForm && (
                <button
                  onClick={() => setRatingForm(true)}
                  className="mb-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  ✍️ Write a Review
                </button>
              )}

              {ratingForm && user && (
                <form
                  onSubmit={handleRatingSubmit}
                  className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Share Your Experience
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          className={`text-3xl transition-transform ${
                            ratingData.rating >= num
                              ? "text-yellow-500 scale-110"
                              : "text-gray-300 hover:text-yellow-300"
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Share your thoughts about this recipe..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setRatingForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
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
                      className="pb-4 border-b last:border-b-0 hover:bg-gray-50 p-3 -mx-3 px-3 rounded transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {rating.user_email}
                          </p>
                          <p className="text-sm text-yellow-500 flex gap-1">
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
                        <p className="text-xs text-gray-500">
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
                        <p className="text-gray-700 text-sm mt-2">
                          {rating.comment}
                        </p>
                      )}
                    </div>
                  ))}
              </div>

              {recipe.ratings.length === 0 && !ratingForm && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-3">📝 Be the first to review this recipe!</p>
                  {user && (
                    <button
                      onClick={() => setRatingForm(true)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="mb-6">
                <div className="text-3xl font-bold text-orange-500">
                  {recipe.avg_rating}⭐
                </div>
                <p className="text-sm text-gray-600">
                  {recipe.ratings.length} ratings
                </p>
              </div>

              <div className="space-y-4 mb-6 border-y py-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Difficulty</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {recipe.difficulty}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Prep Time</span>
                  <span className="font-semibold text-gray-900">
                    {recipe.preparation_time}m
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Cook Time</span>
                  <span className="font-semibold text-gray-900">
                    {recipe.cooking_time}m
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Servings</span>
                  <span className="font-semibold text-gray-900">
                    {recipe.servings}
                  </span>
                </div>
                {recipe.calories && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Calories</span>
                    <span className="font-semibold text-gray-900">
                      {recipe.calories}
                    </span>
                  </div>
                )}
              </div>

              {recipe.cuisine_type && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {recipe.cuisine_type}
                  </span>
                </div>
              )}

              {recipe.dietary_tags && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Dietary Info
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.dietary_tags.split(",").map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  👁️ {recipe.views_count} views
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6 space-y-3">
              <button
                onClick={handleLikeRecipe}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  recipe.user_liked
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ❤️ {recipe.likes_count} {recipe.user_liked ? "Liked" : "Like"}
              </button>

              <button
                onClick={() => handleToggleFavorite(recipe)}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isFavoriteRecipe(recipe.id)
                    ? "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ⭐ {isFavoriteRecipe(recipe.id) ? "Saved" : "Save Recipe"}
              </button>

              {user?.email === recipe.author_email && (
                <>
                  <button
                    onClick={() => navigate(`/recipes/${id}/edit`)}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
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
                    className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
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
