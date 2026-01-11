import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_BASE_URL = "http://localhost:8000/api";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Setup axios interceptor for JWT
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setTokens({
        access: token,
        refresh: localStorage.getItem("refresh_token"),
      });
      // Verify token by fetching current user
      fetchCurrentUser(token);
    }
  }, []);

  const fetchCurrentUser = useCallback(async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      // Token might be invalid
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsAuthenticated(false);
    }
  }, []);

  const register = useCallback(
    async (email, password, confirmPassword, role) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_BASE_URL}/register/`, {
          email,
          password,
          password_confirm: confirmPassword,
          role,
        });
        setError(null);
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.email?.[0] ||
          err.response?.data?.password?.[0] ||
          err.response?.data?.password_confirm?.[0] ||
          "Registration failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/login/`, {
        email,
        password,
      });

      const { tokens: newTokens, user: userData } = response.data;

      // Store tokens
      localStorage.setItem("access_token", newTokens.access);
      localStorage.setItem("refresh_token", newTokens.refresh);

      // Set axios default header
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${newTokens.access}`;

      setTokens(newTokens);
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.password?.[0] ||
        "Login failed";
      setError(errorMessage);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/logout/`);

      // Clear localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // Clear axios header
      delete axios.defaults.headers.common["Authorization"];

      setUser(null);
      setTokens(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (email, otpCode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-email/`, {
        email,
        otp_code: otpCode,
        otp_type: "email_verification",
      });
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Email verification failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password/`, {
        email,
      });
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to send reset code";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(
    async (email, otpCode, newPassword, confirmPassword) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_BASE_URL}/reset-password/`, {
          email,
          otp_code: otpCode,
          new_password: newPassword,
          new_password_confirm: confirmPassword,
        });
        setError(null);
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.error || "Password reset failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const changePassword = useCallback(
    async (oldPassword, newPassword, confirmPassword) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_BASE_URL}/change-password/`, {
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirm: confirmPassword,
        });
        setError(null);
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.error || "Password change failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const value = {
    user,
    tokens,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export { AuthProvider };
export default AuthProvider;
