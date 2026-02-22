import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Alert } from "../../components/FormComponents";

const Login = () => {
  const navigate = useNavigate();
  const { login: loginUser, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await loginUser(formData.email, formData.password);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Role-based redirection
      const role = response.user.role;
      switch (role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "store":
          navigate("/store-dashboard");
          break;
        case "restaurant":
          navigate("/restaurant-dashboard");
          break;
        default:
          navigate("/home");
      }
    } catch (err) {
      // Check if error is due to unverified email
      if (err.response?.data?.require_email_verification) {
        navigate("/verify-email", {
          state: { email: formData.email },
        });
      }
    }
  };

  // Load remembered email on mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
      }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-stretch">
      {/* Left Sidebar */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-orange-500 to-orange-600 text-white flex-col justify-between p-12">
        {/* Branding */}
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-xl font-bold">🍳</span>
            </div>
            <h1 className="text-2xl font-bold">GeoTaste</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Welcome Back!
            </h2>
            <p className="text-lg opacity-90">
              Continue your culinary journey and discover amazing recipes and
              restaurants tailored just for you.
            </p>
          </div>
        </div>

        {/* Stats Box */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-30">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">👨‍🍳</span>
            <div>
              <div className="text-3xl font-bold">50,000+</div>
              <div className="text-lg opacity-90">Recipes</div>
            </div>
          </div>
          <div className="text-lg opacity-90 mt-2">& 10,000+ Restaurants</div>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full md:w-1/2 bg-gray-50 flex flex-col p-6 sm:p-8 lg:p-12">
        {/* Back Link */}
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-12 w-fit"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Home
        </Link>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
            <p className="text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Error Alert */}
          {error && <Alert message={error} type="error" onClose={() => {}} />}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    formErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 5a5 5 0 015 5 1 1 0 112 0 7 7 0 10-7 7 1 1 0 110-2 5 5 0 000-10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Sign up
            </Link>
          </p>

          {/* Social Login (Optional) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm mb-4">
              Or continue with
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                Google
              </button>
              <button
                type="button"
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
