import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Alert } from "../components/FormComponents";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const RestaurantSearch = () => {
  const {
    user,
    favorites,
    addRestaurantToFavorites,
    removeRestaurantFromFavorites,
    isFavoriteRestaurant,
    addRestaurantSearch,
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

  // Get user's location
  const handleGetLocation = () => {
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setSearchParams((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));
        setUseLocation(true);
        searchNearbyRestaurants(latitude, longitude);
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
  const searchNearbyRestaurants = async (lat, lng) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/restaurants/nearby/`,
        {
          latitude: lat,
          longitude: lng,
          radius: searchParams.radius,
          cuisine_type: searchParams.cuisineType || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setRestaurants(response.data.restaurants || []);
      setFilteredRestaurants(response.data.restaurants || []);
      setError(null);
    } catch (err) {
      setError("Failed to load nearby restaurants");
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all restaurants (non-geolocation search)
  const loadAllRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/restaurants/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      searchNearbyRestaurants(searchParams.latitude, searchParams.longitude);
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
    "Italian",
    "Chinese",
    "Indian",
    "Mexican",
    "Japanese",
    "Thai",
    "French",
    "American",
    "Pakistani",
    "Turkish",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Restaurants 🍽️
          </h1>
          <p className="text-lg text-gray-600">
            Discover amazing restaurants near you or browse all available
            restaurants
          </p>
        </div>

        {/* Search Controls */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Location Button */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Find Nearby
              </label>
              <button
                onClick={handleGetLocation}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                <span>📍</span>
                {userLocation
                  ? `Using Your Location (${searchParams.radius}km)`
                  : "Use My Location"}
              </button>
              {userLocation && (
                <p className="text-sm text-gray-600 mt-2">
                  📍 Latitude: {userLocation.latitude.toFixed(4)}, Longitude:{" "}
                  {userLocation.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {/* Radius Slider */}
            {userLocation && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Radius: {searchParams.radius} km
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={searchParams.radius}
                  onChange={handleRadiusChange}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            )}

            {/* View All Button */}
            {useLocation && (
              <div className="md:col-span-2">
                <button
                  onClick={loadAllRestaurants}
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  View All Restaurants
                </button>
              </div>
            )}
          </div>

          {/* Cuisine Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Filter by Cuisine Type
            </label>
            <div className="relative mb-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSearchChange("")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    searchParams.cuisineType === ""
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  All
                </button>
                {cuisineTypes.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => handleSearchChange(cuisine)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      searchParams.cuisineType === cuisine
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
              {favorites.searchHistory?.restaurants &&
                favorites.searchHistory.restaurants.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Recent Searches:
                    </p>
                    <div className="space-y-1">
                      {favorites.searchHistory.restaurants
                        .slice(0, 10)
                        .map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSearchHistoryClick(item)}
                            className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
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
            <div className="mt-4">
              <Alert
                message={error}
                type="error"
                onClose={() => setError(null)}
              />
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {useLocation ? "Nearby Restaurants" : "All Restaurants"}
              <span className="text-lg text-gray-600 font-normal ml-2">
                ({filteredRestaurants.length})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600">Loading restaurants...</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-2xl mb-4">🔍</p>
              <p className="text-gray-600 text-lg mb-4">
                No restaurants found. Try adjusting your filters or enabling
                location services.
              </p>
              {useLocation && (
                <button
                  onClick={() =>
                    setSearchParams((prev) => ({ ...prev, radius: 50 }))
                  }
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Restaurant Header */}
                  <div className="bg-gradient-to-r from-orange-400 to-red-400 p-4 text-white">
                    <h3 className="text-xl font-bold mb-1">
                      {restaurant.restaurant_name}
                    </h3>
                    <p className="text-orange-100 text-sm">
                      {restaurant.cuisine_type || "Restaurant"}
                    </p>
                  </div>

                  {/* Restaurant Info */}
                  <div className="p-4 space-y-3">
                    {/* Rating */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">⭐</span>
                      <span className="text-xl font-bold text-gray-900">
                        {restaurant.rating_avg || "N/A"}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({restaurant.number_of_ratings || 0} ratings)
                      </span>
                    </div>

                    {/* Location */}
                    {restaurant.restaurant_location && (
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-1">📍 Location</p>
                        <p>
                          {restaurant.restaurant_location.city},{" "}
                          {restaurant.restaurant_location.country}
                        </p>
                        {restaurant.restaurant_location.postal_code && (
                          <p className="text-gray-600">
                            {restaurant.restaurant_location.postal_code}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Distance (if using location) */}
                    {useLocation && restaurant.distance_km !== undefined && (
                      <div className="text-sm font-semibold text-orange-600">
                        📏 {restaurant.distance_km.toFixed(2)} km away
                      </div>
                    )}

                    {/* Contact */}
                    {restaurant.restaurant_location?.phone && (
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold">
                          📞 {restaurant.restaurant_location.phone}
                        </p>
                      </div>
                    )}

                    {/* Hours */}
                    {restaurant.restaurant_location?.hours && (
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold">🕐 Hours</p>
                        <p>{restaurant.restaurant_location.hours}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleToggleFavorite(restaurant)}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                          isFavoriteRestaurant(restaurant.id)
                            ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {isFavoriteRestaurant(restaurant.id)
                          ? "⭐ Saved"
                          : "☆ Save"}
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/restaurants/${restaurant.id}`)
                        }
                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                      >
                        View Menu & Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Info */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mt-12">
          <p className="text-gray-700">
            <strong>💡 Tip:</strong> Click "Use My Location" to find restaurants
            near you. Adjust the search radius slider to find restaurants within
            your desired distance. Filter by cuisine type to narrow down your
            search.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSearch;
