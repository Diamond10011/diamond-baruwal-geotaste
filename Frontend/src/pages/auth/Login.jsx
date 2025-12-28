import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../../assets/Image/GeoTasteLogo.png";
import { login } from "../../services/api";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(formData);
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      localStorage.setItem('is_admin', res.data.is_admin);
      navigate('/home');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left Side - Welcome Back View */}
          <div className="relative bg-linear-to-br from-orange-600 via-orange-500 to-amber-600 p-12 flex flex-col justify-between min-h-[600px]">
            {/* Decorative Recipe Book Design */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-white"></div>
              <div className="absolute top-12 left-0 w-full h-px bg-white"></div>
              <div className="absolute top-24 left-0 w-full h-px bg-white"></div>
              <div className="absolute top-36 left-0 w-full h-px bg-white"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-8">
                <img src={Logo} alt="GeoTaste Logo" className="w-12 h-12 rounded-full" />
                <span className="text-3xl font-bold text-white">
                  GeoTaste
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Welcome Back!
              </h1>

              <p className="text-white/90 text-lg leading-relaxed">
                Continue your culinary journey and discover amazing recipes and
                restaurants tailored just for you.
              </p>
            </div>

            {/* Illustration */}
            <div className="relative z-10 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">
                      50,000+ Recipes
                    </p>
                    <p className="text-white/80 text-sm">
                      & 10,000+ Restaurants
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mb-32 -mr-32"></div>
            <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16"></div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <Link to="/">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors mb-8">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </Link>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
              <p className="text-gray-600">
                Enter your credentials to access your account
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <Link to="/forgot-password">
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  Forgot password?
                </button>
                </Link>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-linear-to-r from-orange-600 to-amber-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]"
              >
                Login
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all">
                  {/* Google SVG would go here */}
                  <span className="text-sm font-medium text-gray-700">
                    Google
                  </span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all">
                  {/* Facebook SVG would go here */}
                  <span className="text-sm font-medium text-gray-700">
                    Facebook
                  </span>
                </button>
              </div>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                {/* Replace with <Link to="/register"> if using React Router */}
                <a
                  href="/register"
                  className="text-orange-600 hover:text-orange-700 font-semibold"
                >
                  <Link to="/register">Sign up</Link>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
