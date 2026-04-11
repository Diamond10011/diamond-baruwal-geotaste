import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/FormComponents";
import axios from "axios";
import {
  ChevronLeft,
  MapPin,
  Phone,
  Clock,
  Star,
  UtensilsCrossed,
  MessageCircle,
  Info,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

const RestaurantProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(null);
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
      const [restaurantRes, menuRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/restaurants/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/restaurants/${id}/menu/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRestaurant(restaurantRes.data);
      setMenu(menuRes.data.menu || []);
      setRatings(restaurantRes.data.ratings || []);
      setMyRating(restaurantRes.data.user_rating || null);
      if (restaurantRes.data.user_rating) {
        setNewRating({
          rating: restaurantRes.data.user_rating.rating ?? 5,
          comment: restaurantRes.data.user_rating.comment || "",
        });
      } else {
        setNewRating({ rating: 5, comment: "" });
      }
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
      await axios.post(`${API_BASE_URL}/restaurants/${id}/rating/`, newRating, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative px-6 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate("/restaurants")}
              className="flex items-center gap-2 text-white hover:text-orange-50 transition-colors mb-6 font-medium"
            >
              <ChevronLeft size={20} />
              Back to Restaurants
            </button>

            {/* Restaurant Header */}
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {restaurant.restaurant_name}
                </h1>
                <p className="text-lg text-orange-50 mb-6">
                  {restaurant.cuisine_type || "Restaurant"}
                </p>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Rating */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                    <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider mb-1">
                      Rating
                    </p>
                    <div className="flex items-center gap-2">
                      <Star
                        size={20}
                        className="text-yellow-300 fill-yellow-300"
                      />
                      <span className="text-2xl font-bold text-white">
                        {restaurant.avg_rating ?? "N/A"}
                      </span>
                    </div>
                    <p className="text-orange-100 text-xs mt-1">
                      ({(restaurant.ratings || []).length} reviews)
                    </p>
                  </div>

                  {/* Location */}
                  {restaurant.location && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider mb-1">
                        Location
                      </p>
                      <p className="text-white font-semibold text-sm">
                        {restaurant.location.city},{" "}
                        {restaurant.location.country}
                      </p>
                    </div>
                  )}

                  {/* Phone */}
                  {restaurant.location?.phone_number && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider mb-1">
                        Phone
                      </p>
                      <p className="text-white font-semibold text-sm truncate">
                        {restaurant.location.phone_number}
                      </p>
                    </div>
                  )}

                  {/* Hours */}
                  {(restaurant.location?.hours_open ||
                    restaurant.location?.hours_close) && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                      <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider mb-1">
                        Hours
                      </p>
                      <p className="text-white font-semibold text-sm">
                        {restaurant.location.hours_open || ""}-
                        {restaurant.location.hours_close || ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 sm:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex gap-2 sm:gap-8 mb-8 border-b border-gray-200 overflow-x-auto">
            {[
              { id: "details", label: "Details", icon: Info },
              { id: "menu", label: "Menu", icon: UtensilsCrossed },
              { id: "reviews", label: "Reviews", icon: MessageCircle },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 sm:px-6 py-4 font-semibold transition-all duration-300 border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap ${
                  activeTab === id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-orange-500"
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Location & Contact Cards */}
              {restaurant.location && (
                <>
                  {/* Location Details Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                      <MapPin size={28} className="text-orange-600" />
                      <h3 className="text-2xl font-bold text-gray-900">
                        Location Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* City */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          City
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {restaurant.location.city || "-"}
                        </p>
                      </div>

                      {/* Country */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                          Country
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {restaurant.location.country || "-"}
                        </p>
                      </div>

                      {/* Postal Code */}
                      {restaurant.location.postal_code && (
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                            Postal Code
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {restaurant.location.postal_code}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                      <Phone size={28} className="text-orange-600" />
                      <h3 className="text-2xl font-bold text-gray-900">
                        Contact Information
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Phone */}
                      {restaurant.location.phone_number && (
                        <div className="flex items-start gap-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                          <Phone
                            size={20}
                            className="text-orange-600 flex-shrink-0 mt-1"
                          />
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                              Phone
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {restaurant.location.phone_number}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Hours */}
                      {(restaurant.location.hours_open ||
                        restaurant.location.hours_close) && (
                        <div className="flex items-start gap-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                          <Clock
                            size={20}
                            className="text-green-600 flex-shrink-0 mt-1"
                          />
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                              Hours of Operation
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {(
                                restaurant.location.hours_open || ""
                              ).toString()}{" "}
                              -{" "}
                              {(
                                restaurant.location.hours_close || ""
                              ).toString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* About Section */}
              {restaurant.restaurant_description && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-6">
                    <Info size={28} className="text-orange-600" />
                    <h3 className="text-2xl font-bold text-gray-900">About</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {restaurant.restaurant_description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === "menu" && (
            <div>
              {menu.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 sm:p-16 text-center">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No Menu Items Available
                  </h3>
                  <p className="text-gray-600 text-lg">
                    The menu is currently empty. Please check back later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menu.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-orange-300 flex flex-col"
                    >
                      {/* Item Image Placeholder */}
                      <div className="h-40 bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center group hover:scale-105 transition-transform">
                        <UtensilsCrossed size={48} className="text-white/30" />
                      </div>

                      {/* Item Info */}
                      <div className="p-6 flex flex-col flex-1">
                        {/* Name & Price */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h4 className="text-xl font-bold text-gray-900 flex-1">
                            {item.menu_item_name}
                          </h4>
                          <span className="text-xl font-bold text-orange-600 flex-shrink-0">
                            ${item.price}
                          </span>
                        </div>

                        {/* Description */}
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 flex-1 items-start">
                          {item.category && (
                            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                              {item.category}
                            </span>
                          )}
                          {item.dietary_info && (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              {item.dietary_info}
                            </span>
                          )}
                          {item.is_available === false && (
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              Unavailable
                            </span>
                          )}
                        </div>
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
              {/* Leave A Review Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <MessageCircle size={28} className="text-orange-600" />
                  Leave a Review
                </h3>

                <form onSubmit={handleSubmitRating} className="space-y-6">
                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Your Rating
                    </label>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setNewRating((prev) => ({ ...prev, rating: star }))
                          }
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            newRating.rating >= star
                              ? "bg-yellow-100 scale-110"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          <Star
                            size={32}
                            className={
                              newRating.rating >= star
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-400"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                      placeholder="Share your dining experience..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      rows="4"
                    ></textarea>
                  </div>

                  {/* Error Message */}
                  {ratingError && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle
                        size={20}
                        className="text-red-600 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-red-700 text-sm font-medium">
                        {ratingError}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Submit Review
                  </button>
                </form>
              </div>

              {/* All Reviews Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Star size={28} className="text-orange-600" />
                  All Reviews
                  <span className="ml-auto text-lg font-semibold text-gray-600">
                    ({ratings.length})
                  </span>
                </h3>

                {ratings.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle
                      size={48}
                      className="mx-auto text-gray-300 mb-4"
                    />
                    <p className="text-gray-600 text-lg">
                      No reviews yet. Be the first to leave a review!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((rating) => (
                      <div
                        key={rating.id}
                        className="bg-gradient-to-r from-gray-50 to-orange-50/30 rounded-xl p-6 border border-gray-100 hover:border-orange-200 transition-colors"
                      >
                        {/* Review Header */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {rating.user_email}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={
                                    i < rating.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                              <span className="ml-2 text-sm font-semibold text-gray-700">
                                {rating.rating}/5
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 font-medium">
                            {new Date(rating.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>

                        {/* Review Comment */}
                        <p className="text-gray-700 leading-relaxed">
                          {rating.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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

export default RestaurantProfile;
