import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Alert } from "../components/FormComponents";
import axios from "axios";
import {
  MapPin,
  Search,
  Star,
  ChevronRight,
  Heart,
  Clock,
  Phone,
  Filter,
  X,
  Loader,
  ChefHat,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

const RestaurantSearch = () => {
  const {
    user,
    favorites,
    addRestaurantToFavorites,
    removeRestaurantFromFavorites,
    isFavoriteRestaurant,
    addRestaurantSearch,
    searchHistory,
  } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useLocation, setUseLocation] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchParams, setSearchParams] = useState({
    latitude: null,
    longitude: null,
    radius: 10, // in km
    cuisineType: "",
  });
  const [userLocation, setUserLocation] = useState(null);

  const token = localStorage.getItem("access_token");

  const roundCoord = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) return value;
    return Number(value.toFixed(6));
  };

  // Get user's location
  const handleGetLocation = () => {
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const roundedLatitude = roundCoord(latitude);
        const roundedLongitude = roundCoord(longitude);
        setUserLocation({
          latitude: roundedLatitude,
          longitude: roundedLongitude,
        });
        setSearchParams((prev) => ({
          ...prev,
          latitude: roundedLatitude,
          longitude: roundedLongitude,
        }));
        setUseLocation(true);
        searchNearbyRestaurants(roundedLatitude, roundedLongitude);
      },
      (err) => {
        setError(
          "Unable to get your location. Please enable location services.",
        );
        setLoading(false);
      },
    );
  };

  // Search for nearby restaurants
  const searchNearbyRestaurants = async (lat, lng, nextCuisineType) => {
    try {
      setLoading(true);
      const cuisineType =
        typeof nextCuisineType === "string"
          ? nextCuisineType
          : searchParams.cuisineType;
      const response = await axios.post(
        `${API_BASE_URL}/restaurants/nearby/`,
        {
          latitude: roundCoord(lat),
          longitude: roundCoord(lng),
          radius: searchParams.radius,
          cuisine_type: cuisineType || undefined,
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );

      setRestaurants(response.data.restaurants || []);
      setFilteredRestaurants(response.data.restaurants || []);
      setError(null);
    } catch (err) {
      setError("Failed to load nearby restaurants");
      setRestaurants([]);
      console.error("Nearby restaurants error:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // Load all restaurants (non-geolocation search)
  const loadAllRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/restaurants/`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );

      setRestaurants(response.data.restaurants || []);
      setFilteredRestaurants(response.data.restaurants || []);
      setUseLocation(false);
      setError(null);
    } catch (err) {
      setError("Failed to load restaurants");
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter restaurants by cuisine type
  const handleCuisineFilter = (cuisine) => {
    setSearchParams((prev) => ({
      ...prev,
      cuisineType: cuisine,
    }));

    if (useLocation && searchParams.latitude && searchParams.longitude) {
      searchNearbyRestaurants(
        searchParams.latitude,
        searchParams.longitude,
        cuisine,
      );
    } else {
      let filtered = restaurants;
      if (cuisine) {
        filtered = restaurants.filter((r) =>
          r.cuisine_type?.toLowerCase().includes(cuisine.toLowerCase()),
        );
      }
      setFilteredRestaurants(filtered);
    }
  };

  // Handle radius change
  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value);
    setSearchParams((prev) => ({
      ...prev,
      radius: newRadius,
    }));
  };

  // Search when radius changes (if using location)
  useEffect(() => {
    if (
      useLocation &&
      searchParams.latitude &&
      searchParams.longitude &&
      searchParams.radius
    ) {
      searchNearbyRestaurants(searchParams.latitude, searchParams.longitude);
    }
  }, [searchParams.radius]);

  // Handle toggle favorite
  const handleToggleFavorite = (restaurant) => {
    if (isFavoriteRestaurant(restaurant.id)) {
      removeRestaurantFromFavorites(restaurant.id);
    } else {
      addRestaurantToFavorites(restaurant);
    }
  };

  // Handle cuisine search change
  const handleSearchChange = (cuisine) => {
    if (cuisine) {
      addRestaurantSearch(`Cuisine: ${cuisine}`);
    }
    handleCuisineFilter(cuisine);
  };

  // Handle search history click
  const handleSearchHistoryClick = (historyItem) => {
    const cuisineMatch = historyItem.match(/Cuisine: (.+)/);
    if (cuisineMatch) {
      handleSearchChange(cuisineMatch[1]);
    }
    setShowSearchHistory(false);
  };

  // Load all restaurants on mount
  useEffect(() => {
    loadAllRestaurants();
  }, []);

  const cuisineTypes = [
    "Nepali",
    "Indian",
    "Thai",
    "Italian",
    "Chinese",
    "Japanese",
    "Mexican",
    "French",
    "American",
    "Pakistani",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative px-6 sm:px-8 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <ChefHat size={40} className="text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Discover Amazing Restaurants
            </h1>
            <p className="text-lg sm:text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
              Find the best restaurants near you, explore menus, and order your
              favorite dishes
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 sm:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Search & Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 sm:p-8 mb-12">
            {/* Search Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Location Button */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Find Nearby Restaurants
                </label>
                <button
                  onClick={handleGetLocation}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <MapPin size={20} />
                  {userLocation
                    ? `${searchParams.radius}km Radius`
                    : "Use My Location"}
                </button>
                {userLocation && (
                  <p className="text-xs text-gray-600 mt-2 truncate">
                    📍 Active: {userLocation.latitude.toFixed(4)},{" "}
                    {userLocation.longitude.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Radius Slider */}
              {userLocation && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Search Radius
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={searchParams.radius}
                      onChange={handleRadiusChange}
                      className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="text-center text-sm font-semibold text-orange-600">
                      {searchParams.radius} km
                    </div>
                  </div>
                </div>
              )}

              {/* View All / Reset */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Browse All
                </label>
                <button
                  onClick={loadAllRestaurants}
                  className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    useLocation
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                  }`}
                >
                  <Search size={20} />
                  {useLocation ? "View All" : "All Restaurants"}
                </button>
              </div>
            </div>

            {/* Cuisine Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Filter size={18} />
                Filter by Cuisine Type
              </label>
              <div className="space-y-3">
                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSearchChange("")}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                      searchParams.cuisineType === ""
                        ? "bg-orange-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Cuisines
                  </button>
                  {cuisineTypes.map((cuisine) => (
                    <button
                      key={cuisine}
                      onClick={() => handleSearchChange(cuisine)}
                      className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                        searchParams.cuisineType === cuisine
                          ? "bg-orange-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>

                {/* Search History */}
                {searchHistory?.restaurants &&
                  searchHistory.restaurants.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        📋 Recent Searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.restaurants
                          .slice(0, 5)
                          .map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSearchHistoryClick(item)}
                              className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                            >
                              {item}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6">
                <Alert
                  message={error}
                  type="error"
                  onClose={() => setError(null)}
                />
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {useLocation ? "🎯 Nearby Restaurants" : "🍽️ All Restaurants"}
                </h2>
                <p className="text-gray-600 text-sm mt-2">
                  {filteredRestaurants.length} restaurants found
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500"></div>
                  <Loader
                    className="absolute inset-0 m-auto opacity-30"
                    size={32}
                  />
                </div>
                <p className="mt-6 text-gray-600 font-medium">
                  Loading amazing restaurants...
                </p>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 sm:p-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No Restaurants Found
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Try adjusting your filters, expanding your search radius, or
                  enabling location services
                </p>
                {useLocation && (
                  <button
                    onClick={() =>
                      setSearchParams((prev) => ({ ...prev, radius: 50 }))
                    }
                    className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    Expand Search Radius
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200/50 overflow-hidden transition-all duration-300 hover:border-orange-300"
                  >
                    {/* Image Placeholder */}
                    <div className="relative h-48 bg-gradient-to-br from-orange-200 to-red-200 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <ChefHat size={64} className="text-white/30" />
                    </div>

                    {/* Restaurant Info */}
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                            {restaurant.restaurant_name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {restaurant.cuisine_type || "Restaurant"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleFavorite(restaurant)}
                          className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                            isFavoriteRestaurant(restaurant.id)
                              ? "bg-red-100 text-red-500"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          <Heart
                            size={20}
                            fill={
                              isFavoriteRestaurant(restaurant.id)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      </div>

                      {/* Rating & Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6 py-4 border-t border-b border-gray-100">
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg">
                            <Star
                              size={16}
                              className="text-orange-500 fill-orange-500"
                            />
                            <span className="font-semibold text-gray-900">
                              {restaurant.rating_avg || "N/A"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">
                            ({restaurant.number_of_ratings || 0})
                          </span>
                        </div>

                        {/* Distance */}
                        {useLocation &&
                          typeof restaurant.distance_km === "number" && (
                            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                              <MapPin size={16} className="text-blue-600" />
                              <span className="font-semibold text-gray-900 text-sm">
                                {restaurant.distance_km.toFixed(1)} km
                              </span>
                            </div>
                          )}

                        {/* Hours */}
                        {((
                          restaurant.location || restaurant.restaurant_location
                        )?.hours_open ||
                          (
                            restaurant.location ||
                            restaurant.restaurant_location
                          )?.hours_close) && (
                          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg col-span-2">
                            <Clock size={16} className="text-green-600" />
                            <span className="text-xs font-medium text-gray-900">
                              {`${(restaurant.location || restaurant.restaurant_location).hours_open ?? "—"} - ${(restaurant.location || restaurant.restaurant_location).hours_close ?? "—"}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Location & Contact */}
                      <div className="space-y-2 mb-6 text-sm">
                        {/* Location */}
                        {(restaurant.location ||
                          restaurant.restaurant_location) && (
                          <div className="flex items-start gap-3">
                            <MapPin
                              size={16}
                              className="text-gray-400 flex-shrink-0 mt-0.5"
                            />
                            <div className="min-w-0">
                              <p className="text-gray-700 font-medium">
                                {
                                  (
                                    restaurant.location ||
                                    restaurant.restaurant_location
                                  ).city
                                }
                                ,{" "}
                                {
                                  (
                                    restaurant.location ||
                                    restaurant.restaurant_location
                                  ).country
                                }
                              </p>
                              {(
                                restaurant.location ||
                                restaurant.restaurant_location
                              ).postal_code && (
                                <p className="text-gray-500 text-xs">
                                  {
                                    (
                                      restaurant.location ||
                                      restaurant.restaurant_location
                                    ).postal_code
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Phone */}
                        {(restaurant.location || restaurant.restaurant_location)
                          ?.phone_number && (
                          <div className="flex items-center gap-3">
                            <Phone size={16} className="text-gray-400" />
                            <p className="text-gray-700 font-medium">
                              {
                                (
                                  restaurant.location ||
                                  restaurant.restaurant_location
                                ).phone_number
                              }
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <button
                        onClick={() =>
                          navigate(`/restaurants/${restaurant.id}`)
                        }
                        className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn"
                      >
                        <span>View Menu & Recipes</span>
                        <ChevronRight
                          size={18}
                          className="group-hover/btn:translate-x-1 transition-transform"
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default RestaurantSearch;
