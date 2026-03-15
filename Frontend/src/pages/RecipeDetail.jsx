import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Alert, FormInput, FormButton } from "../components/FormComponents";
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Flame,
  Users,
  Star,
  Heart,
  Bookmark,
  Edit2,
  Trash2,
  PlayCircle,
  CheckCircle2,
  MessageSquare,
  Eye,
  UtensilsCrossed,
  Settings,
  Globe,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user,
    tokens,
    isFavoriteRecipe,
    addRecipeToFavorites,
    removeRecipeFromFavorites,
  } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Rating & Interaction States
  const [ratingForm, setRatingForm] = useState(false);
  const [ratingData, setRatingData] = useState({ rating: 5, comment: "" });
  const [ratingSort, setRatingSort] = useState("recent");

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editingLoading, setEditingLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchRecipeDetails();
  }, [id]);

  const fetchRecipeDetails = async () => {
    const accessToken = tokens?.access || localStorage.getItem("access_token");
    if (!accessToken) {
      setError("Not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    // Check if ID looks valid (UUID format)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      setError("Recipe not found. Invalid recipe ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/recipes/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRecipe(response.data);
      setError(null);
    } catch (err) {
      console.error("Recipe detail error:", err);
      if (err.response?.status === 404) {
        setError("Recipe not found. This recipe may have been deleted.");
      } else {
        setError("Failed to load recipe details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    if (isFavoriteRecipe(recipe.id)) {
      removeRecipeFromFavorites(recipe.id);
    } else {
      addRecipeToFavorites(recipe);
    }
  };

  const handleLikeRecipe = async () => {
    try {
      const accessToken =
        tokens?.access || localStorage.getItem("access_token");
      await axios.post(
        `${API_BASE_URL}/recipes/${id}/like/`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
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
      const accessToken =
        tokens?.access || localStorage.getItem("access_token");
      await axios.post(`${API_BASE_URL}/recipes/${id}/rating/`, ratingData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSuccessMessage("Review published successfully!");
      setRatingData({ rating: 5, comment: "" });
      setRatingForm(false);
      fetchRecipeDetails();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to submit review.");
    }
  };

  const handleDeleteRecipe = async () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this recipe?",
      )
    )
      return;
    try {
      const accessToken =
        tokens?.access || localStorage.getItem("access_token");
      await axios.delete(`${API_BASE_URL}/recipes/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      navigate("/recipes");
    } catch (err) {
      setError("Failed to delete recipe");
    }
  };

  const startEditing = () => {
    setEditFormData({
      title: recipe.title || "",
      description: recipe.description || "",
      ingredients: recipe.ingredients || "",
      instructions: recipe.instructions || "",
      difficulty: recipe.difficulty || "medium",
      cuisine_type: recipe.cuisine_type || "",
      preparation_time: recipe.preparation_time || 0,
      cooking_time: recipe.cooking_time || 0,
      servings: recipe.servings || 1,
      recipe_image: recipe.recipe_image || "",
      recipe_video: recipe.recipe_video || "",
      calories: recipe.calories || "",
      dietary_tags: recipe.dietary_tags || "",
    });
    setIsEditing(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!editFormData.title?.trim()) errors.title = "Title is required";
    if (!editFormData.ingredients?.trim())
      errors.ingredients = "Ingredients required";
    if (!editFormData.instructions?.trim())
      errors.instructions = "Instructions required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setEditingLoading(true);
    try {
      const accessToken =
        tokens?.access || localStorage.getItem("access_token");
      const response = await axios.put(
        `${API_BASE_URL}/recipes/${id}/`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      setRecipe(response.data.recipe || response.data);
      setIsEditing(false);
      setSuccessMessage("Recipe updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to update recipe");
    } finally {
      setEditingLoading(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v="))
      return `https://www.youtube.com/embed/${url.split("v=")[1]?.split("&")[0]}`;
    if (url.includes("youtu.be/"))
      return `https://www.youtube.com/embed/${url.split("youtu.be/")[1]?.split("?")[0]}`;
    if (url.includes("vimeo.com/"))
      return `https://player.vimeo.com/video/${url.split("vimeo.com/")[1]?.split("?")[0]}`;
    return null;
  };

  // ---------------- Loading Skeleton ----------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 animate-pulse">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="h-8 bg-slate-200 rounded w-32"></div>
          <div className="h-96 bg-slate-200 rounded-3xl w-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
            <div className="h-64 bg-slate-200 rounded-3xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Alert
          message={error || "Recipe not found"}
          type="error"
          onClose={() => {}}
        />
        <button
          onClick={() => navigate("/recipes")}
          className="mt-6 flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" /> Return to directory
        </button>
      </div>
    );
  }

  // ---------------- Edit Mode UI ----------------
  if (isEditing && user?.email === recipe.author_email) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <Settings className="w-8 h-8 text-indigo-500" /> Edit Recipe
              </h1>
              <p className="text-slate-500 mt-1">
                Refine your culinary masterpiece.
              </p>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-500 hover:text-slate-700 font-medium"
            >
              Cancel
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <FormInput
                label="Recipe Title"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                error={validationErrors.title}
                required
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ingredients (one per line)
                  </label>
                  <textarea
                    name="ingredients"
                    value={editFormData.ingredients}
                    onChange={handleEditChange}
                    rows="8"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    name="instructions"
                    value={editFormData.instructions}
                    onChange={handleEditChange}
                    rows="8"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={editFormData.difficulty}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <FormInput
                  label="Prep (min)"
                  name="preparation_time"
                  type="number"
                  value={editFormData.preparation_time}
                  onChange={handleEditChange}
                />
                <FormInput
                  label="Cook (min)"
                  name="cooking_time"
                  type="number"
                  value={editFormData.cooking_time}
                  onChange={handleEditChange}
                />
                <FormInput
                  label="Servings"
                  name="servings"
                  type="number"
                  value={editFormData.servings}
                  onChange={handleEditChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Recipe Image URL"
                  name="recipe_image"
                  value={editFormData.recipe_image}
                  onChange={handleEditChange}
                />
                <FormInput
                  label="Video Embed URL"
                  name="recipe_video"
                  value={editFormData.recipe_video}
                  onChange={handleEditChange}
                />
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <FormButton
                  loading={editingLoading}
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold transition-colors"
                >
                  Save Changes
                </FormButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Main Detail UI ----------------
  const embedUrl = getEmbedUrl(recipe.recipe_video);
  const isAuthor = user?.email === recipe.author_email;
  const isSaved = isFavoriteRecipe(recipe.id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Top Navigation */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/recipes")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
        {isAuthor && (
          <div className="flex gap-2">
            <button
              onClick={startEditing}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeleteRecipe}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {(error || successMessage) && (
          <div className="mb-6">
            {error && (
              <Alert
                message={error}
                type="error"
                onClose={() => setError(null)}
              />
            )}
            {successMessage && (
              <Alert
                message={successMessage}
                type="success"
                onClose={() => setSuccessMessage("")}
              />
            )}
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden mb-8 flex flex-col md:flex-row">
          {recipe.recipe_image && (
            <div className="md:w-1/2 relative min-h-[400px]">
              <img
                src={recipe.recipe_image}
                alt={recipe.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
          <div
            className={`p-10 flex flex-col justify-center ${recipe.recipe_image ? "md:w-1/2" : "w-full"}`}
          >
            <div className="flex gap-3 mb-4">
              {recipe.cuisine_type && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {recipe.cuisine_type}
                </span>
              )}
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full">
                {recipe.difficulty}
              </span>
              <div className="flex flex-wrap gap-2">
                {recipe.dietary_tags.split(",").map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-1"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              {recipe.title}
            </h1>

            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              {recipe.description}
            </p>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Created By
                  </p>
                  <p className="font-bold text-slate-900">
                    {recipe.author_name || "Unknown Chef"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLikeRecipe}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all border ${recipe.user_liked ? "bg-pink-50 border-pink-200 text-pink-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  <Heart
                    className={`w-5 h-5 ${recipe.user_liked ? "fill-current" : ""}`}
                  />
                  {recipe.likes_count}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all border ${isSaved ? "bg-indigo-600 border-indigo-600 text-white shadow-md" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`}
                  />
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick Stats Bar */}
            <div className="flex flex-wrap gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="grid grid-cols-4 gap-6">
                {[
                  {
                    label: "Prep",
                    val: `${recipe.preparation_time}m`,
                    icon: <Clock />,
                    color: "text-indigo-600",
                    bg: "bg-indigo-50",
                  },
                  {
                    label: "Cook",
                    val: `${recipe.cooking_time}m`,
                    icon: <UtensilsCrossed />,
                    color: "text-orange-600",
                    bg: "bg-orange-50",
                  },
                  {
                    label: "Yield",
                    val: `${recipe.servings} Serves`,
                    icon: <Users />,
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                  {
                    label: "Calories",
                    val: `${recipe.calories || 450} kcal`,
                    icon: <Flame />,
                    color: "text-rose-600",
                    bg: "bg-rose-50",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div
                      className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      {React.cloneElement(stat.icon, { className: "w-5 h-5" })}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {stat.label}
                    </p>
                    <p className="text-xl font-black text-slate-900">
                      {stat.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Player */}

            {recipe.recipe_video && embedUrl && (
              <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-slate-900">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    title="Recipe Video"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Ingredients & Instructions Split (on large screens) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              {/* Tab-like background for the Ingredients section */}
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-slate-50/50 p-10 border-r border-slate-100">
                  <h2 className="text-2xl font-black text-slate-900 mb-8">
                    Ingredients
                  </h2>
                  <ul className="space-y-4">
                    {recipe.ingredients.split("\n").map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-3 group">
                        {/* <div className="mt-1 w-5 h-5 rounded-md border-2 border-indigo-200 flex-shrink-0 group-hover:border-indigo-500 transition-colors" /> */}
                        <span className="pl-1 w-6 h-6 rounded-md border-2 border-indigo-200 flex-shrink-0 group-hover:border-indigo-500 transition-colors">
                          {idx + 1}
                        </span>
                        <span className="text-slate-600 font-medium leading-tight">
                          {ing}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:w-2/3 p-10">
                  <h2 className="text-2xl font-black text-slate-900 mb-8">
                    Preparation Steps
                  </h2>
                  <div className="space-y-10">
                    {recipe.instructions.split("\n").map((step, idx) => (
                      <div key={idx} className="relative flex gap-6">
                        <div className="flex-shrink-0">
                          <span className="flex w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black items-center justify-center shadow-lg shadow-indigo-100">
                            {idx + 1}
                          </span>
                        </div>
                        <p className="text-slate-700 text-lg leading-relaxed pt-1 font-medium">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Reviews Column */}
          <div className="lg:col-span-1 space-y-8">
            {/* Ratings Summary Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h3 className="font-bold text-xl text-slate-900 mb-6">
                Reviews & Ratings
              </h3>

              <div className="flex items-end gap-4 mb-8">
                <div className="text-6xl font-black text-slate-900 tracking-tighter">
                  {recipe.avg_rating}
                </div>
                <div className="pb-2">
                  <div className="flex text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.round(recipe.avg_rating) ? "fill-current" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    Based on {recipe.ratings.length} reviews
                  </p>
                </div>
              </div>

              {recipe.ratings.length > 0 && (
                <div className="space-y-3 mb-8">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = recipe.ratings.filter(
                      (r) => r.rating === stars,
                    ).length;
                    const percent = recipe.ratings.length
                      ? (count / recipe.ratings.length) * 100
                      : 0;
                    return (
                      <div
                        key={stars}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="w-2 font-bold text-slate-600">
                          {stars}
                        </span>
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-right text-slate-500 font-medium">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {!ratingForm ? (
                <button
                  onClick={() => setRatingForm(true)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Write a Review
                </button>
              ) : (
                <div className="mt-4 p-4 border border-slate-200 rounded-2xl bg-slate-50">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Select Rating
                  </label>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() =>
                          setRatingData({ ...ratingData, rating: num })
                        }
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${ratingData.rating >= num ? "text-amber-400 fill-current scale-110" : "text-slate-300 hover:text-amber-200"} transition-all`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={ratingData.comment}
                    onChange={(e) =>
                      setRatingData({ ...ratingData, comment: e.target.value })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 mb-3 text-sm"
                    placeholder="What did you think?"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleRatingSubmit}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setRatingForm(false)}
                      className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Reviews List */}
            {recipe.ratings.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-slate-900">Recent Reviews</h4>
                </div>
                <div className="space-y-6">
                  {recipe.ratings
                    .sort(
                      (a, b) => new Date(b.created_at) - new Date(a.created_at),
                    )
                    .slice(0, 5)
                    .map((rating) => (
                      <div
                        key={rating.id}
                        className="border-b border-slate-100 last:border-0 pb-6 last:pb-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                              {rating.user_email.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {rating.user_email.split("@")[0]}
                              </p>
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < rating.rating ? "fill-current" : "text-slate-200"}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(rating.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {rating.comment && (
                          <p className="text-sm text-slate-600 mt-2">
                            {rating.comment}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
