import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FormInput, FormButton, Alert } from "../components/FormComponents";

const API_BASE_URL = "http://localhost:8000/api";

const Recipes = () => {
  const {
    user,
    loading,
    error,
    favorites,
    addRecipeToFavorites,
    removeRecipeFromFavorites,
    isFavoriteRecipe,
    addRecipeSearch,
    searchHistory,
    clearSearchHistory,
  } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [listError, setListError] = useState(null);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
    difficulty: "medium",
    cuisine_type: "",
    preparation_time: 30,
    cooking_time: 30,
    servings: 4,
    recipe_image: "",
    recipe_video: "",
    calories: "",
    dietary_tags: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [ratingForm, setRatingForm] = useState(null);
  const [ratingData, setRatingData] = useState({ rating: 5, comment: "" });

  // Fetch all recipes
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Filter recipes when search or filter changes
  useEffect(() => {
    let filtered = recipes;

    if (filterDifficulty !== "all") {
      filtered = filtered.filter((r) => r.difficulty === filterDifficulty);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredRecipes(filtered);
  }, [recipes, filterDifficulty, searchTerm]);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recipes/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setRecipes(response.data.recipes || []);
      setListError(null);
    } catch (err) {
      setListError("Failed to load recipes");
    } finally {
      setRecipesLoading(false);
    }
  };

  const handleToggleFavorite = (recipe) => {
    if (isFavoriteRecipe(recipe.id)) {
      removeRecipeFromFavorites(recipe.id);
    } else {
      addRecipeToFavorites(recipe);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSearchHistory(true);
  };

  const handleSearchHistoryClick = (term) => {
    setSearchTerm(term);
    addRecipeSearch(term);
    setShowSearchHistory(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.ingredients.trim())
      errors.ingredients = "Ingredients are required";
    if (!formData.instructions.trim())
      errors.instructions = "Instructions are required";
    if (formData.preparation_time < 0) errors.preparation_time = "Invalid time";
    if (formData.cooking_time < 0) errors.cooking_time = "Invalid time";
    if (formData.servings < 1) errors.servings = "Servings must be at least 1";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = editingId
        ? `${API_BASE_URL}/recipes/${editingId}/`
        : `${API_BASE_URL}/recipes/`;

      const method = editingId ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setSuccessMessage(
        editingId
          ? "Recipe updated successfully!"
          : "Recipe created successfully!",
      );
      setFormData({
        title: "",
        description: "",
        ingredients: "",
        instructions: "",
        difficulty: "medium",
        cuisine_type: "",
        preparation_time: 30,
        cooking_time: 30,
        servings: 4,
        recipe_image: "",
        recipe_video: "",
        calories: "",
        dietary_tags: "",
      });
      setEditingId(null);
      setShowForm(false);
      fetchRecipes();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setListError(err.response?.data?.message || "Failed to save recipe");
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/recipes/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setSuccessMessage("Recipe deleted successfully!");
      fetchRecipes();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setListError("Failed to delete recipe");
    }
  };

  const handleLikeRecipe = async (id) => {
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
      fetchRecipes();
    } catch (err) {
      console.error("Failed to like recipe");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white py-16 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-3 tracking-tight">
            🍳 Recipe Sharing Community
          </h1>
          <p className="text-orange-100 text-lg">
            Discover and share delicious recipes with the world
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && <Alert message={error} type="error" onClose={() => {}} />}
        {listError && (
          <Alert
            message={listError}
            type="error"
            onClose={() => setListError(null)}
          />
        )}
        {successMessage && (
          <Alert
            message={successMessage}
            type="success"
            onClose={() => setSuccessMessage("")}
          />
        )}

        {/* Create Recipe Button */}
        {user && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
            }}
            className="mb-8 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-bold text-lg shadow-lg"
          >
            {showForm ? "✕ Cancel" : "+ Share a Recipe"}
          </button>
        )}

        {/* Recipe Form */}
        {showForm && user && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12 border border-orange-100">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-8 tracking-tight">
              {editingId ? "Edit Recipe" : "Create New Recipe"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInput
                label="Recipe Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={validationErrors.title}
                placeholder="e.g., Chocolate Chip Cookies"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Tell us about your recipe..."
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients (one per line)
                </label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="2 cups flour&#10;1 cup sugar&#10;3 eggs&#10;..."
                />
                {validationErrors.ingredients && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.ingredients}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Step 1: ...&#10;Step 2: ...&#10;..."
                />
                {validationErrors.instructions && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.instructions}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <FormInput
                  label="Prep Time (min)"
                  name="preparation_time"
                  type="number"
                  value={formData.preparation_time}
                  onChange={handleChange}
                  error={validationErrors.preparation_time}
                />

                <FormInput
                  label="Cook Time (min)"
                  name="cooking_time"
                  type="number"
                  value={formData.cooking_time}
                  onChange={handleChange}
                  error={validationErrors.cooking_time}
                />

                <FormInput
                  label="Servings"
                  name="servings"
                  type="number"
                  value={formData.servings}
                  onChange={handleChange}
                  error={validationErrors.servings}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Cuisine Type"
                  name="cuisine_type"
                  value={formData.cuisine_type}
                  onChange={handleChange}
                  placeholder="e.g., Italian, Asian"
                />

                <FormInput
                  label="Calories (optional)"
                  name="calories"
                  type="number"
                  value={formData.calories}
                  onChange={handleChange}
                />
              </div>

              <FormInput
                label="Recipe Image URL"
                name="recipe_image"
                type="url"
                value={formData.recipe_image}
                onChange={handleChange}
                placeholder="https://..."
              />

              <FormInput
                label="Recipe Video URL (optional)"
                name="recipe_video"
                type="url"
                value={formData.recipe_video}
                onChange={handleChange}
                placeholder="https://youtube.com/... or https://vimeo.com/..."
              />

              <FormInput
                label="Dietary Tags"
                name="dietary_tags"
                value={formData.dietary_tags}
                onChange={handleChange}
                placeholder="e.g., vegan, gluten-free, low-carb"
              />

              <div className="flex gap-4">
                <FormButton loading={loading} type="submit">
                  {editingId ? "Update Recipe" : "Create Recipe"}
                </FormButton>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 border border-orange-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🔍</span> Search Recipes
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() =>
                    setShowSearchHistory(searchHistory.recipes.length > 0)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowSearchHistory(false), 200)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                {showSearchHistory && searchHistory.recipes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <div className="p-2 bg-gray-50 border-b sticky top-0">
                      <p className="text-xs font-semibold text-gray-600 uppercase">
                        Recent Searches
                      </p>
                    </div>
                    {searchHistory.recipes.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchHistoryClick(term)}
                        className="w-full text-left px-4 py-2 hover:bg-orange-50 border-b last:border-b-0 text-sm text-gray-700 flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-gray-400">🕐</span>
                          {term}
                        </span>
                        <span className="text-gray-300 group-hover:text-gray-400">
                          ↵
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>⚡</span> Difficulty Level
              </label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex items-end">
              <p className="text-sm text-gray-600">
                Found {filteredRecipes.length} recipe(s)
              </p>
            </div>
          </div>
        </div>

        {/* Recent Searches Section */}
        {searchHistory.recipes.length > 0 && !searchTerm && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl shadow-lg p-8 mb-12 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900">
                  🕐 Recent Searches
                </h3>
                <span className="text-sm text-white bg-orange-500 px-3 py-1 rounded-full font-semibold">
                  {searchHistory.recipes.length}
                </span>
              </div>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Clear all search history? This cannot be undone.",
                    )
                  ) {
                    clearSearchHistory();
                  }
                }}
                className="text-sm px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.recipes.map((term, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(term);
                    addRecipeSearch(term);
                  }}
                  className="px-4 py-2 bg-white text-gray-700 rounded-full border-2 border-orange-200 hover:border-orange-500 hover:text-orange-600 hover:shadow-md transition-all text-sm font-medium flex items-center gap-2 group"
                >
                  <span>🔍</span>
                  {term}
                  <span className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        {recipesLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {recipes.length === 0
                ? "No recipes yet. Be the first to share!"
                : "No recipes match your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 border border-gray-100 hover:border-orange-200"
              >
                {/* Image Container with Overlay */}
                <div className="relative h-72 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
                  {recipe.recipe_image ? (
                    <>
                      <img
                        src={recipe.recipe_image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">
                      🍳
                    </div>
                  )}

                  {/* Difficulty Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg backdrop-blur-md ${
                        recipe.difficulty === "easy"
                          ? "bg-green-500/90 text-white"
                          : recipe.difficulty === "medium"
                            ? "bg-yellow-500/90 text-white"
                            : "bg-red-500/90 text-white"
                      }`}
                    >
                      {recipe.difficulty === "easy"
                        ? "🟢 Easy"
                        : recipe.difficulty === "medium"
                          ? "🟡 Medium"
                          : "🔴 Hard"}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-full px-3 py-2 shadow-lg">
                    <div className="flex items-center gap-1">
                      <span className="text-lg">⭐</span>
                      <span className="font-bold text-gray-900">
                        {recipe.avg_rating}
                      </span>
                    </div>
                  </div>

                  {/* Like and Favorite Buttons (on hover) */}
                  <div className="absolute bottom-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => handleLikeRecipe(recipe.id)}
                      className={`backdrop-blur-md rounded-full p-3 transition-all hover:scale-110 ${
                        recipe.user_liked
                          ? "bg-red-500/90 text-white"
                          : "bg-white/90 text-gray-700 hover:bg-red-500/90 hover:text-white"
                      }`}
                      title="Like recipe"
                    >
                      ❤️
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(recipe)}
                      className={`backdrop-blur-md rounded-full p-3 transition-all hover:scale-110 ${
                        isFavoriteRecipe(recipe.id)
                          ? "bg-yellow-500/90 text-white"
                          : "bg-white/90 text-gray-700 hover:bg-yellow-500/90 hover:text-white"
                      }`}
                      title="Save to favorites"
                    >
                      ⭐
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <button onClick={() => navigate(`/recipes/${recipe.id}`)} className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 cursor-pointer hover:text-orange-600  transition-colors">
                    {recipe.title}
                  </button>

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      {recipe.author_name
                        ? recipe.author_name.charAt(0).toUpperCase()
                        : recipe.author_email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Shared by Author</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {recipe.author_name || recipe.author_email}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>

                  {/* Cuisine & Dietary Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recipe.cuisine_type && (
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-xs rounded-full font-semibold shadow-sm hover:shadow-md transition-shadow">
                        🌍 {recipe.cuisine_type}
                      </span>
                    )}
                    {recipe.dietary_tags &&
                      recipe.dietary_tags
                        .split(",")
                        .slice(0, 2)
                        .map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs rounded-full font-semibold shadow-sm hover:shadow-md transition-shadow"
                          >
                            🌱 {tag.trim()}
                          </span>
                        ))}
                  </div>

                  {/* Time & Servings Grid */}
                  <div className="grid grid-cols-3 gap-3 my-5 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <div className="text-center">
                      <p className="text-2xl mb-1">⏱️</p>
                      <p className="font-bold text-gray-800 text-sm">
                        {recipe.preparation_time}m
                      </p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">
                        Prep
                      </p>
                    </div>
                    <div className="text-center border-l border-r border-gray-200">
                      <p className="text-2xl mb-1">🔥</p>
                      <p className="font-bold text-gray-800 text-sm">
                        {recipe.cooking_time}m
                      </p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">
                        Cook
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl mb-1">👥</p>
                      <p className="font-bold text-gray-800 text-sm">
                        {recipe.servings}
                      </p>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">
                        Serves
                      </p>
                    </div>
                  </div>

                  {/* Calories if available */}
                  {recipe.calories && (
                    <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-sm font-semibold text-amber-900">
                        🔥 {recipe.calories} cal per serving
                      </p>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="flex justify-between items-center mb-5 py-3 border-t border-b border-gray-100">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-gray-800 flex items-center gap-1">
                        <span>({recipe.rating_count})</span>
                        reviews
                      </span>
                      <span className="text-gray-500 flex items-center gap-1">
                        👁️ {recipe.views_count}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-red-500 flex items-center gap-1">
                      ❤️ {recipe.likes_count}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => navigate(`/recipes/${recipe.id}`)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg hover:from-orange-600 hover:to-red-700 transition-all text-sm font-bold transform hover:scale-105 active:scale-95"
                    >
                      👀 View Details
                    </button>

                    {user?.email === recipe.author_email && (
                      <>
                        <button
                          onClick={() => setEditingId(recipe.id)}
                          className="px-4 py-3 border-2 border-blue-400 text-blue-600 rounded-xl hover:bg-blue-50 text-sm font-bold transition-all hover:shadow-md active:scale-95"
                          title="Edit recipe"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="px-4 py-3 border-2 border-red-400 text-red-600 rounded-xl hover:bg-red-50 text-sm font-bold transition-all hover:shadow-md active:scale-95"
                          title="Delete recipe"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipes;
