import React, { useState, useEffect } from "react";

export const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  showPassword,
  onTogglePassword,
}) => {
  const isPasswordField = type === "password";

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPasswordField && showPassword ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
            isPasswordField ? "pr-10" : ""
          } ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
        />
        {isPasswordField && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 5a5 5 0 015 5 1 1 0 112 0 7 7 0 10-7 7 1 1 0 110-2 5 5 0 000-10z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export const FormButton = ({
  children,
  loading = false,
  disabled = false,
  type = "submit",
  variant = "primary",
}) => {
  const baseStyles =
    "w-full py-2 rounded-lg font-medium transition duration-300 flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white disabled:bg-gray-400",
    danger: "bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400",
  };

  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export const Alert = ({ message, type = "error", onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const bgColor =
    type === "error"
      ? "bg-red-100"
      : type === "success"
      ? "bg-green-100"
      : "bg-blue-100";
  const textColor =
    type === "error"
      ? "text-red-800"
      : type === "success"
      ? "text-green-800"
      : "text-blue-800";
  const borderColor =
    type === "error"
      ? "border-red-400"
      : type === "success"
      ? "border-green-400"
      : "border-blue-400";

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <div
      className={`${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded mb-4 flex justify-between items-center animate-fade-in`}
    >
      <span>{message}</span>
      <button
        onClick={handleClose}
        className="text-xl font-bold hover:opacity-70 transition-opacity ml-4"
        title="Close (auto-closes in 5 seconds)"
      >
        ✕
      </button>
    </div>
  );
};

export const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
    {children}
  </div>
);

export const Container = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);
