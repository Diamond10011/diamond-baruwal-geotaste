import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Alert } from "../../components/FormComponents";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const RestaurantProfileManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantData, setRestaurantData] = useState({
    restaurant_name: "",
    cuisine_type: "",
    restaurant_description: "",
    restaurant_address: "",
  });
  const [locationData, setLocationData] = useState({
    latitude: "",
    longitude: "",
    city: "",
    country: "",
    postal_code: "",
    phone_number: "",
    hours_open: "",
    hours_close: "",
  });
  const [menuItems, setMenuItems] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    dietary_info: "",
    is_available: true,
  });
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    loadRestaurantData();
  }, []);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load restaurant profile
      const profileResponse = await axios.get(
        `${API_BASE_URL}/restaurant-profile/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const profileData = profileResponse.data;
      setRestaurantId(profileData.id);

      setRestaurantData({
        restaurant_name: profileData.restaurant_name || "",
        cuisine_type: profileData.cuisine_type || "",
        restaurant_description: profileData.restaurant_description || "",
        restaurant_address: profileData.restaurant_address || "",
      });

      // Load restaurant location
      try {
        const locationResponse = await axios.get(
          `${API_BASE_URL}/restaurant-location/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setLocationData({
          latitude: locationResponse.data.latitude || "",
          longitude: locationResponse.data.longitude || "",
          city: locationResponse.data.city || "",
          country: locationResponse.data.country || "",
          postal_code: locationResponse.data.postal_code || "",
          phone_number: locationResponse.data.phone_number || "",
          hours_open: locationResponse.data.hours_open || "",
          hours_close: locationResponse.data.hours_close || "",
        });
      } catch (locErr) {
        // Location might not exist yet, which is fine
        console.log("Location not set yet");
      }

      // Load menu items if restaurant exists
      if (profileData.id) {
        try {
          const menuResponse = await axios.get(
            `${API_BASE_URL}/restaurants/${profileData.id}/menu/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setMenuItems(menuResponse.data.menu || []);
        } catch (menuErr) {
          console.log("Menu items not loaded");
        }

        // Load restaurant details including ratings
        try {
          const detailResponse = await axios.get(
            `${API_BASE_URL}/restaurants/${profileData.id}/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setRatings(detailResponse.data.ratings || []);
        } catch (ratingErr) {
          console.log("Ratings not loaded");
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load restaurant data");
      setLoading(false);
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      // Update restaurant profile
      const response = await axios.put(
        `${API_BASE_URL}/restaurant-profile/`,
        {
          restaurant_name: restaurantData.restaurant_name,
          cuisine_type: restaurantData.cuisine_type,
          restaurant_description: restaurantData.restaurant_description,
          restaurant_address: restaurantData.restaurant_address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSuccess("Restaurant details updated successfully!");
      setIsEditingDetails(false);
      // Reload data to show updated values
      await loadRestaurantData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update restaurant details",
      );
      setLoading(false);
    }
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const city = (locationData.city || "").trim();
      const country = (locationData.country || "").trim();
      const postalCode = (locationData.postal_code || "").trim();
      const phoneNumber = (locationData.phone_number || "").trim();

      const response = await axios.put(
        `${API_BASE_URL}/restaurant-location/`,
        {
          latitude: locationData.latitude
            ? parseFloat(locationData.latitude)
            : null,
          longitude: locationData.longitude
            ? parseFloat(locationData.longitude)
            : null,
          // These are CharFields in DRF: send "" to clear, not null (null triggers 400).
          city,
          country,
          postal_code: postalCode,
          phone_number: phoneNumber,
          // TimeField allows null; HTML time input gives "HH:MM" (valid).
          hours_open: locationData.hours_open ? locationData.hours_open : null,
          hours_close: locationData.hours_close ? locationData.hours_close : null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSuccess("Location updated successfully!");
      setIsEditingLocation(false);
      // Reload data to show updated values
      await loadRestaurantData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.details
        ? JSON.stringify(err.response.data.details)
        : err.response?.data?.error || "Failed to update location";
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!newMenuItem.name || !newMenuItem.price) {
      setError("Please fill in required fields (Item Name and Price)");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API_BASE_URL}/restaurants/${restaurantId}/menu/`,
        {
          name: newMenuItem.name,
          description: newMenuItem.description,
          price: parseFloat(newMenuItem.price),
          category: newMenuItem.category,
          dietary_info: newMenuItem.dietary_info,
          is_available: newMenuItem.is_available,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Add the new item to the list
      setMenuItems([...menuItems, response.data.menu_item]);

      setNewMenuItem({
        name: "",
        description: "",
        price: "",
        category: "",
        dietary_info: "",
        is_available: true,
      });
      setSuccess("Menu item added successfully!");
      // Reload menu to show all items fresh from server
      await loadRestaurantData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add menu item");
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationData((prev) => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));
        setSuccess("Location captured successfully! Click Save to store it.");
        setLoading(false);
        setTimeout(() => setSuccess(""), 3000);
      },
      (error) => {
        setError(
          `Failed to get location: ${error.message}. Please enable location services.`,
        );
        setLoading(false);
      },
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {restaurantData.restaurant_name || "Restaurant"}
              </h1>
              <p className="text-orange-100 text-lg">
                🍽️ Restaurant Management Dashboard
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={loadRestaurantData}
                disabled={loading}
                className="mb-3 px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold disabled:opacity-50 text-sm"
              >
                🔄 Refresh
              </button>
              <p className="text-orange-100 text-sm">Restaurant Status</p>
              <p className="text-2xl font-bold">✅ Active</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b-2 border-gray-300 overflow-x-auto">
          {["details", "menu", "ratings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-colors border-b-4 -mb-2 whitespace-nowrap ${
                activeTab === tab
                  ? "text-orange-600 border-orange-600"
                  : "text-gray-600 border-transparent hover:text-orange-500"
              }`}
            >
              {tab === "details" && "📍 Details & Location"}
              {tab === "menu" && "🍽️ Menu"}
              {tab === "ratings" && "⭐ Ratings"}
            </button>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <Alert message={error} type="error" onClose={() => setError("")} />
        )}
        {success && (
          <Alert
            message={success}
            type="success"
            onClose={() => setSuccess("")}
          />
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 font-semibold">
              ⏳ Loading restaurant data...
            </p>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-8">
            {/* Restaurant Details */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Restaurant Information
              </h3>

              {isEditingDetails ? (
                <form onSubmit={handleUpdateDetails} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={restaurantData.restaurant_name}
                      onChange={(e) =>
                        setRestaurantData((prev) => ({
                          ...prev,
                          restaurant_name: e.target.value,
                        }))
                      }
                      placeholder="Restaurant Name"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    <input
                      type="text"
                      value={restaurantData.cuisine_type}
                      onChange={(e) =>
                        setRestaurantData((prev) => ({
                          ...prev,
                          cuisine_type: e.target.value,
                        }))
                      }
                      placeholder="Cuisine Type (e.g., Italian, Chinese)"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    <input
                      type="text"
                      value={restaurantData.restaurant_address}
                      onChange={(e) =>
                        setRestaurantData((prev) => ({
                          ...prev,
                          restaurant_address: e.target.value,
                        }))
                      }
                      placeholder="Restaurant Address"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <textarea
                    value={restaurantData.restaurant_description}
                    onChange={(e) =>
                      setRestaurantData((prev) => ({
                        ...prev,
                        restaurant_description: e.target.value,
                      }))
                    }
                    placeholder="Restaurant Description"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows="4"
                  ></textarea>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingDetails(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-gray-600 text-sm">Restaurant Name</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {restaurantData.restaurant_name || "Not set"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm">Cuisine Type</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {restaurantData.cuisine_type || "Not set"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm">Description</p>
                    <p className="text-lg text-gray-900 leading-relaxed">
                      {restaurantData.restaurant_description ||
                        "No description"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm">Address</p>
                    <p className="text-lg text-gray-900 leading-relaxed">
                      {restaurantData.restaurant_address || "No address set"}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditingDetails(true)}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                  >
                    Edit Information
                  </button>
                </div>
              )}
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                📍 Location & Contact
              </h3>

              {isEditingLocation ? (
                <form onSubmit={handleUpdateLocation} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={locationData.city}
                      onChange={(e) =>
                        setLocationData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      placeholder="City"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    <input
                      type="text"
                      value={locationData.country}
                      onChange={(e) =>
                        setLocationData((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      placeholder="Country"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    <input
                      type="text"
                      value={locationData.postal_code}
                      onChange={(e) =>
                        setLocationData((prev) => ({
                          ...prev,
                          postal_code: e.target.value,
                        }))
                      }
                      placeholder="Postal Code"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />

                    <input
                      type="tel"
                      value={locationData.phone_number}
                      onChange={(e) =>
                        setLocationData((prev) => ({
                          ...prev,
                          phone_number: e.target.value,
                        }))
                      }
                      placeholder="Phone Number"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      📍 Location (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 mb-2"
                    >
                      📌 Use My Current Location
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={locationData.latitude}
                          onChange={(e) =>
                            setLocationData((prev) => ({
                              ...prev,
                              latitude: e.target.value,
                            }))
                          }
                          placeholder="Latitude (auto-filled)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={locationData.longitude}
                          onChange={(e) =>
                            setLocationData((prev) => ({
                              ...prev,
                              longitude: e.target.value,
                            }))
                          }
                          placeholder="Longitude (auto-filled)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700">
                        Opening Time
                      </label>
                      <input
                        type="time"
                        value={locationData.hours_open}
                        onChange={(e) =>
                          setLocationData((prev) => ({
                            ...prev,
                            hours_open: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700">
                        Closing Time
                      </label>
                      <input
                        type="time"
                        value={locationData.hours_close}
                        onChange={(e) =>
                          setLocationData((prev) => ({
                            ...prev,
                            hours_close: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50"
                    >
                      Save Location
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingLocation(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 text-sm">City</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {locationData.city || "Not set"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm">Country</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {locationData.country || "Not set"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm">Postal Code</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {locationData.postal_code || "Not set"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm">Phone</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {locationData.phone_number || "Not set"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm">Website</p>
                      <a
                        href={locationData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {locationData.website || "Not set"}
                      </a>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm">Hours</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {locationData.hours_open && locationData.hours_close
                          ? `${locationData.hours_open} - ${locationData.hours_close}`
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-gray-600 text-sm">Coordinates</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {locationData.latitude && locationData.longitude
                        ? `${locationData.latitude}, ${locationData.longitude}`
                        : "Not set"}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditingLocation(true)}
                    className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                  >
                    Edit Location
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div className="space-y-8">
            {/* Add Menu Item Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                ➕ Add Menu Item
              </h3>

              <form onSubmit={handleAddMenuItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Margherita Pizza"
                      value={newMenuItem.name}
                      onChange={(e) =>
                        setNewMenuItem((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Pizza, Burger, Dessert"
                      value={newMenuItem.category}
                      onChange={(e) =>
                        setNewMenuItem((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Briefly describe the item..."
                    value={newMenuItem.description}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows="2"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Price $ *
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={newMenuItem.price}
                      onChange={(e) =>
                        setNewMenuItem((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Dietary Info
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Vegan, Gluten-Free"
                      value={newMenuItem.dietary_info}
                      onChange={(e) =>
                        setNewMenuItem((prev) => ({
                          ...prev,
                          dietary_info: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Availability
                    </label>
                    <select
                      value={newMenuItem.is_available}
                      onChange={(e) =>
                        setNewMenuItem((prev) => ({
                          ...prev,
                          is_available: e.target.value === "true",
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="true">✅ Available</option>
                      <option value="false">❌ Unavailable</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50"
                >
                  Add Menu Item
                </button>
              </form>
            </div>

            {/* Menu Items List */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                🍽️ Menu Items ({menuItems.length})
              </h3>

              {menuItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No menu items added yet
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Create your first item to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="border-2 border-orange-200 rounded-lg p-5 hover:shadow-lg transition-all bg-gradient-to-br from-white to-orange-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {item.name}
                          </h4>
                          {item.category && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.category}
                            </p>
                          )}
                        </div>
                        <span className="text-2xl font-bold text-orange-600">
                          ${parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 items-center">
                        {item.dietary_info && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                            🌱 {item.dietary_info}
                          </span>
                        )}
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            item.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.is_available
                            ? "✅ Available"
                            : "❌ Unavailable"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === "ratings" && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              ⭐ Customer Reviews ({ratings.length})
            </h3>

            {ratings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Your first customer review will appear here!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div
                    key={rating.id}
                    className="border-2 border-yellow-100 rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {rating.user_email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl">
                            {"⭐".repeat(rating.rating)}
                          </span>
                          <span className="text-sm text-gray-500 font-semibold">
                            {rating.rating}/5
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {rating.comment && (
                      <p className="text-gray-700 text-sm italic">
                        "{rating.comment}"
                      </p>
                    )}
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

export default RestaurantProfileManagement;
