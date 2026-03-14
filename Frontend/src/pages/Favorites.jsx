import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Clock,
  Star,
  MapPin,
  Trash2,
  ChefHat,
  Utensils,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

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

  // Optimized Filtering and Sorting
  const filteredRecipes = useMemo(() => {
    return favorites.recipes
      .filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.author_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        if (sortBy === "rating")
          return (b.avg_rating || 0) - (a.avg_rating || 0);
        if (sortBy === "quick")
          return (a.preparation_time || 0) - (b.preparation_time || 0);
        return 0; // "newest" or default
      });
  }, [favorites.recipes, searchTerm, sortBy]);

  const filteredRestaurants = useMemo(() => {
    return favorites.restaurants.filter(
      (r) =>
        r.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [favorites.restaurants, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                My Favorites
              </h1>
              <p className="text-slate-500 text-lg max-w-md">
                Manage your curated collection of top-rated recipes and local
                dining spots.
              </p>
            </div>

            {/* Professional Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab("recipes")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "recipes"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Recipes{" "}
                <span className="ml-1 opacity-60">
                  ({favorites.recipes.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("restaurants")}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "restaurants"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Restaurants{" "}
                <span className="ml-1 opacity-60">
                  ({favorites.restaurants.length})
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        {/* Unified Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>
          {activeTab === "recipes" && (
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl appearance-none focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer shadow-sm font-medium text-slate-700"
              >
                <option value="newest">Sort: Newest</option>
                <option value="rating">Sort: Best Rated</option>
                <option value="quick">Sort: Fastest Prep</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Content Area */}
        {activeTab === "recipes" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={recipe.recipe_image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => removeRecipeFromFavorites(recipe.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm border border-slate-100">
                      {recipe.difficulty || "Easy"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      {recipe.avg_rating || "5.0"}
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm mb-4 flex items-center gap-1.5 font-medium">
                    <ChefHat className="w-4 h-4" />{" "}
                    {recipe.author_name || "Chef"}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />{" "}
                        {recipe.preparation_time}m
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/recipes/${recipe.id}`)}
                      className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      View <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Restaurant Cards - Slightly Different Visual Style */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRestaurants.map((res) => (
              <div
                key={res.id}
                className="flex bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="w-32 sm:w-48 bg-slate-100 flex items-center justify-center text-slate-300">
                  <Utensils className="w-12 h-12" />
                </div>
                <div className="flex-grow p-6">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-bold text-lg text-slate-900">
                      {res.restaurant_name}
                    </h3>
                    <button
                      onClick={() => removeRestaurantFromFavorites(res.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-indigo-600 text-sm font-semibold mb-3">
                    {res.cuisine_type}
                  </p>
                  <div className="flex items-center gap-4 text-slate-500 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />{" "}
                      {res.restaurant_location?.city}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-slate-900">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />{" "}
                      {res.rating_avg}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/restaurants/${res.id}`)}
                    className="w-full py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-sm font-bold transition-colors border border-slate-100"
                  >
                    Visit Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Improved Empty State */}
        {((activeTab === "recipes" && filteredRecipes.length === 0) ||
          (activeTab === "restaurants" &&
            filteredRestaurants.length === 0)) && (
          <div className="bg-white rounded-[40px] border border-dashed border-slate-300 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No results found
            </h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
              We couldn't find any favorites matching your current search or
              filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSortBy("newest");
              }}
              className="text-indigo-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
