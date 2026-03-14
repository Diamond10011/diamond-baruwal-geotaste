import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Alert } from "../../components/FormComponents";
import logo from "../../assets/Image/GeoTasteLogo.png";
import { Eye, EyeOff } from "lucide-react";

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

  // Logic to check if button should be enabled
  const isFormFilled = formData.email.trim() !== "" && formData.password !== "";

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

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

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
      if (err.response?.data?.require_email_verification) {
        navigate("/verify-email", {
          state: { email: formData.email },
        });
      }
    }
  };

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
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 text-white flex-col justify-between px-12 py-14 lg:px-16 lg:py-16">
        {/* Decorative Background Blurs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

        {/* Top Content */}
        <div className="relative z-10">
          {/* Branding */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-14 h-14 bg-white/95 rounded-2xl shadow-xl flex items-center justify-center ring-1 ring-white/30">
              <img
                src={logo}
                alt="GeoTaste Logo"
                className="w-10 h-10 object-cover rounded-full"
              />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                GeoTaste
              </h1>
              <p className="text-sm text-white/80 font-medium">
                Discover flavor everywhere
              </p>
            </div>
          </div>

          {/* Hero Text */}
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-5">
              Welcome Back
            </span>

            <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-5">
              Pick up where your
              <br />
              food journey left off
            </h2>

            <p className="text-base lg:text-lg text-white/85 leading-relaxed max-w-lg">
              Continue exploring delicious recipes, trending restaurants, and
              personalized recommendations crafted for your taste.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative z-10 space-y-6">
          
          {/* <div className="max-w-md rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shadow-inner">
                👨‍🍳
              </div>

              <div>
                <h3 className="text-3xl font-extrabold leading-none">
                  50,000+
                </h3>
                <p className="text-white/85 mt-1 text-sm uppercase tracking-wide">
                  Curated Recipes
                </p>

                <div className="mt-4 h-px w-full bg-white/20"></div>

                <p className="mt-4 text-base text-white/90">
                  Plus <span className="font-bold">10,000+</span> restaurant
                  recommendations from around the world.
                </p>
              </div>
            </div>
          </div> */}

          {/* Sign Up CTA */}
          <div className="max-w-md rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md px-6 py-5">
            <p className="text-white/85 text-sm mb-3 text-center">
              Don&apos;t have an account yet?
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full rounded-xl bg-white text-orange-600 font-semibold py-3.5 px-5 shadow-md hover:bg-orange-50 hover:text-orange-700 transition-all duration-300"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full md:w-1/2 bg-gray-50 flex flex-col p-6 sm:p-8 lg:p-12">
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

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
            <p className="text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          {error && <Alert message={error} type="error" onClose={() => {}} />}

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
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
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
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${formErrors.password ? "border-red-500" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 focus:outline-none"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
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
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                name="password"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button with Hover Note */}
            <div className="relative group">
              {/* Tooltip Note */}
              {!isFormFilled && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-full max-w-[200px] bg-gray-800 text-white text-xs py-2 px-3 rounded-lg shadow-xl text-center z-20">
                  Please enter your email and password to login.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-800"></div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isFormFilled}
                className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
