import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FormInput, FormButton, Alert } from '../../components/FormComponents';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword, loading, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!email) {
      errors.email = 'Email is required';
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await forgotPassword(email);
      setSuccessMessage('Password reset code sent to your email');
      setStep(2);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      // Error is already set in the context
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!otpCode) {
      errors.otpCode = 'Reset code is required';
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await resetPassword(email, otpCode, newPassword, confirmPassword);
      setSuccessMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
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
          <p className="text-gray-600 mt-2">Reset Your Password</p>
        </div>

        {error && <Alert message={error} type="error" onClose={() => {}} />}
        {successMessage && <Alert message={successMessage} type="success" onClose={() => setSuccessMessage('')} />}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <p className="text-gray-600 mb-4 text-sm">Enter your email to receive a password reset code.</p>
            
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={validationErrors.email}
              placeholder="your@email.com"
              required
            />

            <FormButton loading={loading} type="submit">
              Send Reset Code
            </FormButton>

            <p className="text-center text-gray-600 text-sm">
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Back to Login
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-gray-600 mb-4 text-sm">Enter the code sent to your email and create a new password.</p>
            
            <FormInput
              label="Reset Code"
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              error={validationErrors.otpCode}
              placeholder="000000"
              required
            />

            <FormInput
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={validationErrors.newPassword}
              placeholder="••••••••"
              required
            />

            <FormInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={validationErrors.confirmPassword}
              placeholder="••••••••"
              required
            />

            <FormButton loading={loading} type="submit">
              Reset Password
            </FormButton>

            <p className="text-center text-gray-600 text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Use Different Email
              </button>
            </p>
          </form>
        )}
      </div>
      </div>
  );
};

export default ForgotPassword;
