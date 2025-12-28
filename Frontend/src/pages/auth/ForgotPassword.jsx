import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await forgotPassword({ email });
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || 'Failed to send OTP.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
          Forgot Password
        </h2>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />

        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium
                     hover:bg-indigo-700 transition-colors"
        >
          Send OTP
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
