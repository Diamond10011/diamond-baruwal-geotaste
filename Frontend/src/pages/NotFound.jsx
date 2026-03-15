import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6">
            <AlertCircle className="w-12 h-12 text-orange-600" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>

        {/* Error Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 text-lg mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/home")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-orange-600 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors font-semibold"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </button>
        </div>

        {/* Decorative Element */}
        <div className="mt-12 text-center">
          <span className="text-6xl">🍽️</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
