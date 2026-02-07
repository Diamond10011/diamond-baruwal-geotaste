import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Alert } from "../../components/FormComponents";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const RestaurantProfileManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [restaurantData, setRestaurantData] = useState({
    restaurant_name: "",
    cuisine_type: "",
    description: "",
  });
  const [locationData, setLocationData] = useState({
    latitude: "",
    longitude: "",
    city: "",
    country: "",
    postal_code: "",
    phone: "",
    website: "",
    hours: "",
  });
  const [menuItems, setMenuItems] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState({
    menu_item_name: "",
    description: "",
    price: "",
    category: "",
    dietary_info: "",
    is_available: true,
  });
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    loadRestaurantData();
  }, []);

  const loadRestaurantData = async () => {
    try {
      // Load restaurant details (placeholder - adjust based on your API)
      setRestaurantData({
        restaurant_name: user?.profile?.first_name || "My Restaurant",
        cuisine_type: "Italian",
        description: "A wonderful restaurant",
      });

      setLocationData({
        latitude: "40.7128",
        longitude: "-74.0060",
        city: "New York",
        country: "USA",
        postal_code: "10001",
        phone: "+1-555-0000",
        website: "https://example.com",
        hours: "Mon-Fri 10AM-10PM, Sat-Sun 11AM-11PM",
      });
    } catch (err) {
      setError("Failed to load restaurant data");
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Update restaurant details
      setSuccess("Restaurant details updated!");
      setIsEditingDetails(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!newMenuItem.menu_item_name || !newMenuItem.price) {
      setError("Please fill in required fields");
      return;
    }

    try {
      setLoading(true);
      setMenuItems([
        ...menuItems,
        {
          id: Date.now(),
          ...newMenuItem,
        },
      ]);
      setNewMenuItem({
        menu_item_name: "",
        description: "",
        price: "",
        category: "",
        dietary_info: "",
        is_available: true,
      });
      setSuccess("Menu item added!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {restaurantData.restaurant_name}
              </h1>
              <p className="text-orange-100 text-lg">
                🍽️ Restaurant Management Dashboard
              </p>
            </div>
            <div className="text-right">
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
          <Alert message={success} type="success" onClose={() => setSuccess("")} />
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
                  </div>

                  <textarea
                    value={restaurantData.description}
                    onChange={(e) =>
                      setRestaurantData((prev) => ({
                        ...prev,
                        description: e.target.value,
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
                      {restaurantData.restaurant_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm">Cuisine Type</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {restaurantData.cuisine_type}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm">Description</p>
                    <p className="text-lg text-gray-900 leading-relaxed">
                      {restaurantData.description || "No description"}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm">City</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {locationData.city}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Country</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {locationData.country}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Postal Code</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {locationData.postal_code}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {locationData.phone}
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
                    {locationData.website}
                  </a>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Hours</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {locationData.hours}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-gray-600 text-sm">Coordinates</p>
                <p className="text-lg font-semibold text-gray-900">
                  {locationData.latitude}, {locationData.longitude}
                </p>
              </div>

              <button className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold">
                Edit Location
              </button>
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div className="space-y-8">
            {/* Add Menu Item Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Add Menu Item
              </h3>

              <form onSubmit={handleAddMenuItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={newMenuItem.menu_item_name}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        menu_item_name: e.target.value,
                      }))
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Category"
                    value={newMenuItem.category}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <textarea
                  placeholder="Item Description"
                  value={newMenuItem.description}
                  onChange={(e) =>
                    setNewMenuItem((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                ></textarea>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="number"
                    placeholder="Price"
                    value={newMenuItem.price}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Dietary Info (Vegan, Gluten-Free)"
                    value={newMenuItem.dietary_info}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        dietary_info: e.target.value,
                      }))
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  <select
                    value={newMenuItem.is_available}
                    onChange={(e) =>
                      setNewMenuItem((prev) => ({
                        ...prev,
                        is_available: e.target.value === "true",
                      }))
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
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
                Menu Items ({menuItems.length})
              </h3>

              {menuItems.length === 0 ? (
                <p className="text-center text-gray-600 py-8">
                  No menu items added yet
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900">
                          {item.menu_item_name}
                        </h4>
                        <span className="text-lg font-bold text-orange-600">
                          ${item.price}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3">
                          {item.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {item.category && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            {item.category}
                          </span>
                        )}
                        {item.dietary_info && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {item.dietary_info}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            item.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.is_available ? "Available" : "Unavailable"}
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
              Customer Reviews ({ratings.length})
            </h3>

            {ratings.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                No ratings yet. Your first customer review will appear here!
              </p>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div
                    key={rating.id}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {rating.user_email}
                        </p>
                        <p className="text-yellow-500">
                          {"⭐".repeat(rating.rating)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-700">{rating.comment}</p>
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
