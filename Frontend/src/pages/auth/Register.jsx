import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChefHat,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../../assets/Image/GeoTasteLogo.png";
import { register } from "../../services/api";
export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await register(formData);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("is_admin", res.data.is_admin);
      navigate("/home");
    } catch (err) {
      if (err.response && err.response.data) {
        // Handle specific errors
        const errors = err.response.data;
        if (errors.email) {
          setError(errors.email[0]);
          console.log("This email is already registered.");
        } else if (errors.non_field_errors) {
          setError(errors.non_field_errors[0]);
        } else {
          setError("Registration failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left Side - Join Kitchen View */}
          <div className="relative bg-linear-to-br from-orange-600 via-orange-500 to-amber-600 p-12 flex flex-col justify-between min-h-[600px]">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-white"></div>
              <div className="absolute top-12 left-0 w-full h-px bg-white"></div>
              <div className="absolute top-24 left-0 w-full h-px bg-white"></div>
              <div className="absolute top-36 left-0 w-full h-px bg-white"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-8">
                <img
                  src={Logo}
                  alt="GeoTaste Logo"
                  className="w-12 h-12 rounded-full"
                />
                <span className="text-3xl font-bold text-white">GeoTaste</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Join Our Kitchen
              </h1>

              <p className="text-white/90 text-lg leading-relaxed">
                Start your delicious adventure with thousands of recipes and
                restaurant recommendations at your fingertips.
              </p>
            </div>

            {/* Feature List for New Users */}
            <div className="relative z-10 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-white/90">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">
                      Personalized recommendations
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/90">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Save your favorite dishes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/90">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm">Share with the community</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mb-32 -mr-32"></div>
            <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16"></div>
          </div>

          {/* Right Side - Register Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <Link to="/">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors mb-8">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </Link>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600">
                Fill in your details to get started
              </p>
            </div>

            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-1 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>

              <button
                onClick={handleSubmit}
                cursor="pointer"
                className="w-full bg-linear-to-r from-orange-600 to-amber-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]"
              >
                Create Account
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Or register with
                  </span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all">
                  <span className="text-sm font-medium text-gray-700">
                    Google
                  </span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all">
                  <span className="text-sm font-medium text-gray-700">
                    Facebook
                  </span>
                </button>
              </div>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                {/* Replace with <Link to="/login"> if using React Router */}
                <button
                  href="/login"
                  className="text-orange-600 hover:text-orange-700 font-semibold"
                >
                  <Link to="/login">Login</Link>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
