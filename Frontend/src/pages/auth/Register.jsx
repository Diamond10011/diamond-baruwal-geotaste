import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Alert,
} from "../../components/FormComponents";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/Image/GeoTasteLogo.png";

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Logic to check if button should be enabled
  const isFormFilled = 
    formData.email.trim() !== "" && 
    formData.password !== "" && 
    formData.confirmPassword !== "" && 
    formData.role !== "" && 
    agreed;

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = "Password must contain at least one digit";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.role) {
      errors.role = "Please select a role";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await registerUser(formData.email, formData.password, formData.confirmPassword, formData.role);
      setSuccessMessage("Registration successful! Redirecting to login...");
      setFormData({ email: "", password: "", confirmPassword: "", role: "" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  const roleOptions = [
    { value: "normal", label: "Normal User" },
    { value: "store", label: "Store User (Sells Ingredients)" },
    { value: "restaurant", label: "Restaurant User (Manages Restaurant)" },
  ];

  return (
    <div className="min-h-screen flex items-stretch">
      {/* Left Sidebar */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 text-white flex-col justify-between px-12 lg:px-16 lg:py-16">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-14 h-14 bg-white/95 shadow-lg rounded-2xl flex items-center justify-center ring-1 ring-white/40">
              <img src={logo} alt="GeoTaste Logo" className="w-10 h-10 object-cover rounded-full" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">GeoTaste</h1>
              <p className="text-sm text-white/80 font-medium">Discover. Taste. Explore.</p>
            </div>
          </div>
          <div className="max-w-xl">
            <h2 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">Join Our Kitchen</h2>
            <p className="text-base lg:text-lg text-white/85 leading-relaxed">Start your adventure with thousands of recipes tailored to your taste.</p>
          </div>
        </div>
        <div className="relative z-10 mt-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 lg:p-7 border border-white/20 shadow-2xl max-w-md text-center">
            <p className="text-white/90 mb-4">Already have an account?</p>
            <Link to="/login" className="inline-flex items-center justify-center w-full rounded-xl bg-white text-orange-600 font-semibold py-3.5 shadow-md hover:bg-orange-50 transition-all">Sign in</Link>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full md:w-1/2 bg-gray-50 flex flex-col p-6 sm:p-8 lg:p-12">
        <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 w-fit">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Create Account</h2>

          {error && <Alert message={error} type="error" onClose={() => {}} />}
          {successMessage && <Alert message={successMessage} type="success" onClose={() => setSuccessMessage("")} />}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@gmail.com" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${validationErrors.email ? "border-red-500" : "border-gray-300"}`} />
              {validationErrors.email && <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${validationErrors.password ? "border-red-500" : "border-gray-300"}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600">{showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}</button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${validationErrors.confirmPassword ? "border-red-500" : "border-gray-300"}`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600">{showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}</button>
              </div>
              {validationErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Select account type</option>
                {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 text-orange-600 rounded mt-0.5 cursor-pointer" />
              <label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer">I agree to the <span className="text-orange-600 font-medium">Terms & Privacy Policy</span></label>
            </div>

            {/* Submit Button with Hover Note */}
            <div className="relative group mt-6">
              {/* Tooltip Note */}
              {!isFormFilled && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-full max-w-[250px] bg-gray-800 text-white text-xs py-2 px-3 rounded-lg shadow-xl text-center z-20">
                  Please fill all fields and agree to the terms to continue.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-800"></div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isFormFilled}
                className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;