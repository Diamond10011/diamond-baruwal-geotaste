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
  // ============================================================================
  // STATE
  // ============================================================================
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") === "dark" ? "dark" : "light",
  );
  const [favorites, setFavorites] = useState({
    recipes: [],
    restaurants: [],
  });
  const [searchHistory, setSearchHistory] = useState({
    recipes: [],
    restaurants: [],
  });

  // ============================================================================
  // INITIALIZE AUTH
  // ============================================================================
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setTokens({
        access: token,
        refresh: localStorage.getItem("refresh_token"),
      });
      fetchCurrentUser(token);
    } else {
      setLoading(false);
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
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

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
    [],
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

      localStorage.setItem("access_token", newTokens.access);
      localStorage.setItem("refresh_token", newTokens.refresh);
      localStorage.setItem("user", JSON.stringify(userData));

      axios.defaults.headers.common["Authorization"] =
        `Bearer ${newTokens.access}`;

      setTokens(newTokens);
      setUser(userData);
      setIsAuthenticated(true);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Login failed";
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
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("profile");

      delete axios.defaults.headers.common["Authorization"];

      setUser(null);
      setTokens(null);
      setIsAuthenticated(false);
      setProfile(null);
      setError(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // EMAIL VERIFICATION
  // ============================================================================

  const verifyEmail = useCallback(async (email, otpCode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-email/`, {
        email,
        otp_code: otpCode,
      });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Email verification failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resendVerificationOTP = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/resend-verification-otp/`,
        { email },
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to resend OTP";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // PASSWORD RESET
  // ============================================================================

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/forgot-password/`, {
        email,
      });
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

  const verifyPasswordResetOTP = useCallback(async (email, otpCode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/verify-password-reset-otp/`,
        {
          email,
          otp_code: otpCode,
        },
      );
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.non_field_errors?.[0] || "OTP verification failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email, otpCode, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/reset-password/`, {
        email,
        otp_code: otpCode,
        new_password: newPassword,
      });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Password reset failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // PROFILE
  // ============================================================================

  const getProfile = useCallback(async () => {
    if (!tokens?.access) return null;
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      setProfile(response.data);
      localStorage.setItem("profile", JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      return null;
    }
  }, [tokens]);

  const updateProfile = useCallback(
    async (profileData) => {
      if (!tokens?.access) throw new Error("Not authenticated");
      setLoading(true);
      setError(null);
      try {
        const response = await axios.put(
          `${API_BASE_URL}/profile/`,
          profileData,
          {
            headers: { Authorization: `Bearer ${tokens.access}` },
          },
        );
        setProfile(response.data.profile);
        localStorage.setItem("profile", JSON.stringify(response.data.profile));
        setUser((prevUser) => ({
          ...prevUser,
          profile: response.data.profile,
        }));
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.detail || "Failed to update profile";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tokens],
  );

  const changePassword = useCallback(
    async (oldPassword, newPassword) => {
      if (!tokens?.access) throw new Error("Not authenticated");
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/change-password/`,
          {
            old_password: oldPassword,
            new_password: newPassword,
          },
          {
            headers: { Authorization: `Bearer ${tokens.access}` },
          },
        );
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.old_password?.[0] ||
          err.response?.data?.detail ||
          "Failed to change password";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [tokens],
  );

  // ============================================================================
  // THEME
  // ============================================================================

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (isAuthenticated && profile) {
      updateProfile({ dark_mode: newTheme === "dark" }).catch(console.error);
    }
  }, [theme, isAuthenticated, profile, updateProfile]);

  // ============================================================================
  // FAVORITES MANAGEMENT
  // ============================================================================

  const addRecipeToFavorites = useCallback((recipe) => {
    setFavorites((prev) => {
      const isAlreadyFav = prev.recipes.some((r) => r.id === recipe.id);
      if (isAlreadyFav) {
        return prev;
      }
      const newFavorites = [...prev.recipes, recipe];
      localStorage.setItem("favoriteRecipes", JSON.stringify(newFavorites));
      return {
        ...prev,
        recipes: newFavorites,
      };
    });
  }, []);

  const removeRecipeFromFavorites = useCallback((recipeId) => {
    setFavorites((prev) => {
      const updated = prev.recipes.filter((r) => r.id !== recipeId);
      localStorage.setItem("favoriteRecipes", JSON.stringify(updated));
      return {
        ...prev,
        recipes: updated,
      };
    });
  }, []);

  const addRestaurantToFavorites = useCallback((restaurant) => {
    setFavorites((prev) => {
      const isAlreadyFav = prev.restaurants.some(
        (r) => r.id === restaurant.id,
      );
      if (isAlreadyFav) {
        return prev;
      }
      const newFavorites = [...prev.restaurants, restaurant];
      localStorage.setItem(
        "favoriteRestaurants",
        JSON.stringify(newFavorites),
      );
      return {
        ...prev,
        restaurants: newFavorites,
      };
    });
  }, []);

  const removeRestaurantFromFavorites = useCallback((restaurantId) => {
    setFavorites((prev) => {
      const updated = prev.restaurants.filter((r) => r.id !== restaurantId);
      localStorage.setItem("favoriteRestaurants", JSON.stringify(updated));
      return {
        ...prev,
        restaurants: updated,
      };
    });
  }, []);

  const isFavoriteRecipe = useCallback(
    (recipeId) => favorites.recipes.some((r) => r.id === recipeId),
    [favorites.recipes],
  );

  const isFavoriteRestaurant = useCallback(
    (restaurantId) =>
      favorites.restaurants.some((r) => r.id === restaurantId),
    [favorites.restaurants],
  );

  // ============================================================================
  // SEARCH HISTORY
  // ============================================================================

  const addRecipeSearch = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.recipes.filter((s) => s !== searchTerm);
      const updated = [searchTerm, ...filtered].slice(0, 10);
      localStorage.setItem("recipeSearchHistory", JSON.stringify(updated));
      return {
        ...prev,
        recipes: updated,
      };
    });
  }, []);

  const addRestaurantSearch = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.restaurants.filter((s) => s !== searchTerm);
      const updated = [searchTerm, ...filtered].slice(0, 10);
      localStorage.setItem("restaurantSearchHistory", JSON.stringify(updated));
      return {
        ...prev,
        restaurants: updated,
      };
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory({
      recipes: [],
      restaurants: [],
    });
    localStorage.removeItem("recipeSearchHistory");
    localStorage.removeItem("restaurantSearchHistory");
  }, []);

  // ============================================================================
  // RATINGS
  // ============================================================================

  const submitRecipeRating = useCallback(
    async (recipeId, rating, comment) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/recipes/${recipeId}/rating/`,
          {
            rating,
            comment,
          },
          {
            headers: { Authorization: `Bearer ${tokens?.access}` },
          },
        );
        return response.data;
      } catch (err) {
        setError("Failed to submit rating");
        throw err;
      }
    },
    [tokens],
  );

  const submitRestaurantRating = useCallback(
    async (restaurantId, rating, comment) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/restaurants/${restaurantId}/rating/`,
          {
            rating,
            comment,
          },
          {
            headers: { Authorization: `Bearer ${tokens?.access}` },
          },
        );
        return response.data;
      } catch (err) {
        setError("Failed to submit rating");
        throw err;
      }
    },
    [tokens],
  );

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = {
    // State
    user,
    tokens,
    loading,
    error,
    isAuthenticated,
    profile,
    theme,
    favorites,
    searchHistory,

    // Auth
    register,
    login,
    logout,

    // Email verification
    verifyEmail,
    resendVerificationOTP,

    // Password reset
    forgotPassword,
    verifyPasswordResetOTP,
    resetPassword,

    // Profile
    getProfile,
    updateProfile,
    changePassword,

    // Theme
    toggleTheme,

    // Favorites
    addRecipeToFavorites,
    removeRecipeFromFavorites,
    addRestaurantToFavorites,
    removeRestaurantFromFavorites,
    isFavoriteRecipe,
    isFavoriteRestaurant,

    // Search History
    addRecipeSearch,
    addRestaurantSearch,
    clearSearchHistory,

    // Ratings
    submitRecipeRating,
    submitRestaurantRating,
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
