import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FormInput,
  FormButton,
  Alert,
} from "../components/FormComponents";

const API_BASE_URL = "http://localhost:8000/api";

const Recipes = () => {
  const { user, loading, error, favorites, addRecipeToFavorites, removeRecipeFromFavorites, isFavoriteRecipe, addRecipeSearch, searchHistory } = useAuth();
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
      filtered = filtered.filter(r => r.difficulty === filterDifficulty);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.ingredients.trim()) errors.ingredients = "Ingredients are required";
    if (!formData.instructions.trim()) errors.instructions = "Instructions are required";
    if (formData.preparation_time < 0) errors.preparation_time = "Invalid time";
    if (formData.cooking_time < 0) errors.cooking_time = "Invalid time";
    if (formData.servings < 1) errors.servings = "Servings must be at least 1";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
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
        editingId ? "Recipe updated successfully!" : "Recipe created successfully!"
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
      await axios.post(`${API_BASE_URL}/recipes/${id}/like/`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      fetchRecipes();
    } catch (err) {
      console.error("Failed to like recipe");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Recipe Sharing Community</h1>
          <p className="text-orange-100">Discover and share delicious recipes</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && <Alert message={error} type="error" onClose={() => {}} />}
        {listError && <Alert message={listError} type="error" onClose={() => setListError(null)} />}
        {successMessage && <Alert message={successMessage} type="success" onClose={() => setSuccessMessage("")} />}

        {/* Create Recipe Button */}
        {user && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
            }}
            className="mb-8 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            {showForm ? "Cancel" : "Share a Recipe"}
          </button>
        )}

        {/* Recipe Form */}
        {showForm && user && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                  <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
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
                  <p className="mt-1 text-sm text-red-600">{validationErrors.ingredients}</p>
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
                  <p className="mt-1 text-sm text-red-600">{validationErrors.instructions}</p>
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSearchHistory(searchHistory.recipes.length > 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                {showSearchHistory && searchHistory.recipes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {searchHistory.recipes.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchHistoryClick(term)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg border-b last:border-b-0 text-sm text-gray-700"
                      >
                        🕐 {term}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Recipe Image */}
                {recipe.recipe_image && (
                  <img
                    src={recipe.recipe_image}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {recipe.title}
                  </h3>

                  {/* Author */}
                  <p className="text-sm text-gray-600 mb-3">
                    by {recipe.author_name || recipe.author_email}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      {recipe.difficulty}
                    </span>
                    {recipe.cuisine_type && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {recipe.cuisine_type}
                      </span>
                    )}
                  </div>

                  {/* Time & Servings */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4 pb-4 border-b">
                    <div>
                      <p className="font-semibold text-gray-700">
                        {recipe.preparation_time}m
                      </p>
                      <p>Prep</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">
                        {recipe.cooking_time}m
                      </p>
                      <p>Cook</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">
                        {recipe.servings}
                      </p>
                      <p>Servings</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        ⭐ {recipe.avg_rating} ({recipe.rating_count} reviews)
                      </p>
                      <p className="text-gray-600">
                        👁️ {recipe.views_count} views
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleLikeRecipe(recipe.id)}
                        className={`${
                          recipe.user_liked
                            ? "text-red-600"
                            : "text-gray-400 hover:text-red-600"
                        } transition-colors text-lg whitespace-nowrap`}
                      >
                        ❤️ {recipe.likes_count}
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(recipe)}
                        className={`transition-colors text-lg whitespace-nowrap ${
                          isFavoriteRecipe(recipe.id)
                            ? "text-yellow-500"
                            : "text-gray-400 hover:text-yellow-500"
                        }`}
                      >
                        ⭐ Save
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                      View Details
                    </button>

                    {user?.id === recipe.author && (
                      <>
                        <button
                          onClick={() => setEditingId(recipe.id)}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                        >
                          Delete
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
