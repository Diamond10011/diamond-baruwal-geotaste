import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/FormComponents";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const RestaurantProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [newRating, setNewRating] = useState({
    rating: 5,
    comment: "",
  });
  const [ratingError, setRatingError] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const [restaurantRes, menuRes, ratingsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/restaurants/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/restaurants/${id}/menu/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/restaurants/${id}/rating/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRestaurant(restaurantRes.data);
      setMenu(menuRes.data.menu || []);
      setRatings(ratingsRes.data.ratings || []);
      setError(null);
    } catch (err) {
      setError("Failed to load restaurant details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!newRating.comment.trim()) {
      setRatingError("Please enter a comment");
      return;
    }
    if (newRating.rating < 1 || newRating.rating > 5) {
      setRatingError("Rating must be between 1 and 5");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/restaurants/${id}/rating/`,
        newRating,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchRestaurantDetails();
      setNewRating({ rating: 5, comment: "" });
      setRatingError("");
    } catch (err) {
      setRatingError(err.response?.data?.message || "Failed to submit rating");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-2xl mb-4">❌</p>
          <p className="text-gray-600 text-lg mb-6">
            {error || "Restaurant not found"}
          </p>
          <button
            onClick={() => navigate("/restaurants")}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate("/restaurants")}
          className="text-orange-600 hover:text-orange-700 font-medium mb-6 flex items-center gap-2"
        >
          ← Back to Restaurants
        </button>

        {/* Restaurant Hero */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {restaurant.restaurant_name}
          </h1>
          <p className="text-orange-100 text-lg mb-4">
            {restaurant.cuisine_type || "Restaurant"}
          </p>

          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-orange-100 text-sm">Rating</p>
              <p className="text-3xl font-bold">
                ⭐ {restaurant.rating_avg || "N/A"}
              </p>
              <p className="text-orange-100 text-sm">
                ({restaurant.number_of_ratings || 0} reviews)
              </p>
            </div>

            {restaurant.restaurant_location && (
              <>
                <div>
                  <p className="text-orange-100 text-sm">Location</p>
                  <p className="text-xl font-semibold">
                    {restaurant.restaurant_location.city},{" "}
                    {restaurant.restaurant_location.country}
                  </p>
                </div>

                {restaurant.restaurant_location.phone && (
                  <div>
                    <p className="text-orange-100 text-sm">Phone</p>
                    <p className="text-xl font-semibold">
                      {restaurant.restaurant_location.phone}
                    </p>
                  </div>
                )}

                {restaurant.restaurant_location.hours && (
                  <div>
                    <p className="text-orange-100 text-sm">Hours</p>
                    <p className="text-xl font-semibold">
                      {restaurant.restaurant_location.hours}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b-2 border-gray-300">
          {["details", "menu", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-colors border-b-4 -mb-2 ${
                activeTab === tab
                  ? "text-orange-600 border-orange-600"
                  : "text-gray-600 border-transparent hover:text-orange-500"
              }`}
            >
              {tab === "details" && "📍 Details"}
              {tab === "menu" && "🍽️ Menu"}
              {tab === "reviews" && "⭐ Reviews"}
            </button>
          ))}
        </div>

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            {restaurant.restaurant_location && (
              <>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    📍 Location Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">City</p>
                      <p className="text-lg font-semibold">
                        {restaurant.restaurant_location.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Country</p>
                      <p className="text-lg font-semibold">
                        {restaurant.restaurant_location.country}
                      </p>
                    </div>
                    {restaurant.restaurant_location.postal_code && (
                      <div>
                        <p className="text-gray-600 text-sm">Postal Code</p>
                        <p className="text-lg font-semibold">
                          {restaurant.restaurant_location.postal_code}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    📞 Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurant.restaurant_location.phone && (
                      <div>
                        <p className="text-gray-600 text-sm">Phone</p>
                        <p className="text-lg font-semibold">
                          {restaurant.restaurant_location.phone}
                        </p>
                      </div>
                    )}
                    {restaurant.restaurant_location.website && (
                      <div>
                        <p className="text-gray-600 text-sm">Website</p>
                        <a
                          href={restaurant.restaurant_location.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                    {restaurant.restaurant_location.hours && (
                      <div className="md:col-span-2">
                        <p className="text-gray-600 text-sm">Hours</p>
                        <p className="text-lg font-semibold">
                          {restaurant.restaurant_location.hours}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {restaurant.description && (
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {restaurant.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {menu.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                No menu items available
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menu.map((item) => (
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
                        <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                          {item.category}
                        </span>
                      )}
                      {item.dietary_info && (
                        <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          {item.dietary_info}
                        </span>
                      )}
                      {item.is_available === false && (
                        <span className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-8">
            {/* Add Review Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Leave a Review
              </h3>

              <form onSubmit={handleSubmitRating} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating (1-5 stars)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating((prev) => ({ ...prev, rating: star }))}
                        className={`text-3xl transition-transform ${
                          newRating.rating >= star
                            ? "text-yellow-400 scale-110"
                            : "text-gray-300"
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Comment
                  </label>
                  <textarea
                    value={newRating.comment}
                    onChange={(e) =>
                      setNewRating((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    placeholder="Share your experience..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows="4"
                  ></textarea>
                </div>

                {ratingError && (
                  <div className="p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-sm">
                    {ratingError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                >
                  Submit Review
                </button>
              </form>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                All Reviews ({ratings.length})
              </h3>

              {ratings.length === 0 ? (
                <p className="text-center text-gray-600 py-8">
                  No reviews yet. Be the first to leave a review!
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
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantProfile;
