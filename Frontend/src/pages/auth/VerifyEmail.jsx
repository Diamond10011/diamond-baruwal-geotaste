import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FormInput, FormButton, Alert } from "../../components/FormComponents";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Get email from location state if available
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!email) {
      errors.email = "Email is required";
    }

    if (!otpCode) {
      errors.otpCode = "Verification code is required";
    } else if (otpCode.length !== 6) {
      errors.otpCode = "Code must be 6 digits";
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await verifyEmail(email, otpCode);
      setSuccessMessage("Email verified successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      // Error is already set in the context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">GeoTaste</h2>
          <p className="text-gray-600 mt-2">Verify Your Email</p>
        </div>

        {error && <Alert message={error} type="error" onClose={() => {}} />}
        {successMessage && (
          <Alert
            message={successMessage}
            type="success"
            onClose={() => setSuccessMessage("")}
          />
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              We've sent a verification code to your email. Please check your
              inbox and enter the 6-digit code below.
            </p>
          </div>

          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={validationErrors.email}
            placeholder="your@email.com"
            required
          />

          <FormInput
            label="Verification Code"
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
            error={validationErrors.otpCode}
            placeholder="000000"
            required
            maxLength="6"
          />

          <FormButton loading={loading} type="submit">
            Verify Email
          </FormButton>

          <p className="text-center text-gray-600 text-sm">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={() => setSuccessMessage("Code resent to your email")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Resend
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
