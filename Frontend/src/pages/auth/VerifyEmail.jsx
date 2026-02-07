import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/FormComponents';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerificationOTP, loading, error } = useAuth();

  // ============================================================================
  // STATE
  // ============================================================================
  const [email, setEmail] = useState(location.state?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateOTP = (otp) => {
    if (!otp.trim()) {
      return 'OTP is required';
    }
    if (otp.length !== 6) {
      return 'OTP must be 6 digits';
    }
    if (!/^\d{6}$/.test(otp)) {
      return 'OTP must contain only numbers';
    }
    return '';
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpError = validateOTP(otpCode);
    if (otpError) {
      setFormErrors({ otp: otpError });
      return;
    }

    setFormErrors({});

    try {
      const result = await verifyEmail(email, otpCode);
      // Redirect to login with success message
      navigate('/login', {
        state: { message: 'Email verified successfully. Please login.' },
      });
    } catch (err) {
      console.error('Email verification error:', err);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendVerificationOTP(email);
      setResendMessage('Verification code resent to your email');
      startResendTimer();
      setTimeout(() => setResendMessage(''), 3000);
    } catch (err) {
      console.error('Error resending OTP:', err);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GeoTaste</h1>
          <p className="text-gray-600">Verify your email address</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            We sent a 6-digit verification code to:
            <br />
            <strong>{email}</strong>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert message={error} type="error" />
        )}

        {/* Success Message */}
        {resendMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">{resendMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              value={otpCode}
              onChange={(e) => {
                const value = e.target.value.slice(0, 6);
                setOtpCode(value);
                if (formErrors.otp) {
                  setFormErrors((prev) => ({ ...prev, otp: '' }));
                }
              }}
              placeholder="000000"
              maxLength="6"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-3xl tracking-widest font-mono ${
                formErrors.otp ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.otp && (
              <p className="mt-1 text-sm text-red-600">{formErrors.otp}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Resend OTP Section */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Didn't receive the code?</p>
          {resendTimer > 0 ? (
            <p className="text-sm font-medium text-gray-500">
              Resend code in <strong>{resendTimer}s</strong>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend verification code
            </button>
          )}
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-4 text-sm">
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Back to Login
          </Link>
          <span className="text-gray-300">•</span>
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
