import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Alert } from "../components/FormComponents";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const Stores = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [useLocation, setUseLocation] = useState(false);

  const token = localStorage.getItem("access_token");

  const cuisineTypes = [
    "Fast Food",
    "Chinese",
    "Italian",
    "Pakistani",
    "Indian",
    "Thai",
    "Mexican",
    "Bakery",
    "Cafe",
    "Desserts",
  ];

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/stores/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(response.data.stores || []);
      setFilteredStores(response.data.stores || []);
      setError(null);
    } catch (err) {
      setError("Failed to load stores");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setUseLocation(true);
        },
        () => {
          alert("Unable to get your location. Please enable location services.");
        }
      );
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterStores(query, selectedCuisine);
  };

  const handleCuisineFilter = (cuisine) => {
    setSelectedCuisine(cuisine);
    filterStores(searchQuery, cuisine);
  };

  const filterStores = (query, cuisine) => {
    let filtered = stores;

    if (query) {
      filtered = filtered.filter((store) =>
        store.store_name?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (cuisine) {
      filtered = filtered.filter((store) =>
        store.store_type?.toLowerCase().includes(cuisine.toLowerCase())
      );
    }

    setFilteredStores(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🏪 Browse Stores
          </h1>
          <p className="text-lg text-gray-600">
            Discover local stores and place your delicious orders
          </p>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          {/* Search Box */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Search Stores
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by store name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                🔍
              </span>
            </div>
          </div>

          {/* Filter Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Filter by Type
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCuisineFilter("")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCuisine === ""
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All
              </button>
              {cuisineTypes.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => handleCuisineFilter(cuisine)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCuisine === cuisine
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Location Button */}
          <div className="mt-6 pt-6 border-t">
            <button
              onClick={handleGetLocation}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <span>📍</span>
              {userLocation ? "Using Your Location" : "Use My Location"}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4">
              <Alert message={error} type="error" onClose={() => setError(null)} />
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Available Stores
              <span className="text-lg text-gray-600 font-normal ml-2">
                ({filteredStores.length})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600">Loading stores...</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-2xl mb-4">🔍</p>
              <p className="text-gray-600 text-lg mb-4">
                {searchQuery || selectedCuisine
                  ? "No stores match your search"
                  : "No stores available yet"}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCuisine("");
                  setFilteredStores(stores);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => navigate(`/stores/${store.id}`)}
                >
                  {/* Store Header */}
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
                    <h3 className="text-xl font-bold mb-1">
                      {store.store_name}
                    </h3>
                    <p className="text-green-100 text-sm">
                      {store.store_type || "Store"}
                    </p>
                  </div>

                  {/* Store Info */}
                  <div className="p-4 space-y-3">
                    {/* Rating */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">⭐</span>
                      <span className="text-xl font-bold text-gray-900">
                        {store.rating_avg || "N/A"}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({store.number_of_ratings || 0} ratings)
                      </span>
                    </div>

                    {/* Location */}
                    {store.store_location && (
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-1">📍 Location</p>
                        <p>
                          {store.store_location.city},{" "}
                          {store.store_location.country}
                        </p>
                      </div>
                    )}

                    {/* Contact */}
                    {store.store_location?.phone && (
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold">📞 {store.store_location.phone}</p>
                      </div>
                    )}

                    {/* Hours */}
                    {store.store_location?.hours && (
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold">🕐 Hours</p>
                        <p>{store.store_location.hours}</p>
                      </div>
                    )}

                    {/* Action Button */}
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium mt-4">
                      View & Order →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mt-12">
          <p className="text-gray-700">
            <strong>💡 Tip:</strong> Search for your favorite stores by name or
            filter by type. Click on any store to view their menu and place an
            order. You can track your orders in "My Orders" section.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Stores;
