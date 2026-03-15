import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Alert, Card, Container, LoadingSpinner } from "../../components/FormComponents";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const token = localStorage.getItem("access_token");
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  const API_BASE_URL = "http://localhost:8000/api";
  const TABS = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "users", label: "Users" },
      { id: "recipes", label: "Recipes" },
      { id: "restaurants", label: "Restaurants" },
      { id: "stores", label: "Stores" },
      { id: "orders", label: "Orders" },
      { id: "payments", label: "Payments" },
    ],
    [],
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [summary, setSummary] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [usersQ, setUsersQ] = useState("");
  const [usersRole, setUsersRole] = useState("");
  const [usersVerified, setUsersVerified] = useState("");
  const [usersActive, setUsersActive] = useState("");

  const [recipes, setRecipes] = useState([]);
  const [recipesCount, setRecipesCount] = useState(0);
  const [recipesQ, setRecipesQ] = useState("");
  const [recipesCuisine, setRecipesCuisine] = useState("");
  const [recipesDifficulty, setRecipesDifficulty] = useState("");

  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsCount, setRestaurantsCount] = useState(0);
  const [restaurantsQ, setRestaurantsQ] = useState("");
  const [restaurantsVerified, setRestaurantsVerified] = useState("");

  const [stores, setStores] = useState([]);
  const [storesCount, setStoresCount] = useState(0);
  const [storesQ, setStoresQ] = useState("");
  const [storesVerified, setStoresVerified] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [ordersQ, setOrdersQ] = useState("");
  const [ordersStatus, setOrdersStatus] = useState("");

  const [payments, setPayments] = useState([]);
  const [paymentsCount, setPaymentsCount] = useState(0);
  const [paymentsQ, setPaymentsQ] = useState("");
  const [paymentsStatus, setPaymentsStatus] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const fetchSummary = async () => {
    const res = await axios.get(`${API_BASE_URL}/admin/summary/`, {
      headers: authHeaders,
    });
    setSummary(res.data);
  };

  const fetchUsers = async () => {
    const params = new URLSearchParams();
    if (usersQ.trim()) params.set("q", usersQ.trim());
    if (usersRole) params.set("role", usersRole);
    if (usersVerified) params.set("verified", usersVerified);
    if (usersActive) params.set("active", usersActive);
    params.set("limit", "100");
    params.set("offset", "0");
    const res = await axios.get(`${API_BASE_URL}/admin/users/?${params.toString()}`, {
      headers: authHeaders,
    });
    setUsers(res.data.results || []);
    setUsersCount(res.data.count || 0);
  };

  const fetchRecipes = async () => {
    const params = new URLSearchParams();
    if (recipesQ.trim()) params.set("q", recipesQ.trim());
    if (recipesCuisine.trim()) params.set("cuisine_type", recipesCuisine.trim());
    if (recipesDifficulty) params.set("difficulty", recipesDifficulty);
    params.set("limit", "100");
    params.set("offset", "0");
    const res = await axios.get(`${API_BASE_URL}/admin/recipes/?${params.toString()}`, {
      headers: authHeaders,
    });
    setRecipes(res.data.results || []);
    setRecipesCount(res.data.count || 0);
  };

  const fetchRestaurants = async () => {
    const params = new URLSearchParams();
    if (restaurantsQ.trim()) params.set("q", restaurantsQ.trim());
    if (restaurantsVerified) params.set("verified", restaurantsVerified);
    params.set("limit", "100");
    params.set("offset", "0");
    const res = await axios.get(
      `${API_BASE_URL}/admin/restaurants/?${params.toString()}`,
      { headers: authHeaders },
    );
    setRestaurants(res.data.results || []);
    setRestaurantsCount(res.data.count || 0);
  };

  const fetchStores = async () => {
    const params = new URLSearchParams();
    if (storesQ.trim()) params.set("q", storesQ.trim());
    if (storesVerified) params.set("verified", storesVerified);
    params.set("limit", "100");
    params.set("offset", "0");
    const res = await axios.get(`${API_BASE_URL}/admin/stores/?${params.toString()}`, {
      headers: authHeaders,
    });
    setStores(res.data.results || []);
    setStoresCount(res.data.count || 0);
  };

  const fetchOrders = async () => {
    const params = new URLSearchParams();
    if (ordersQ.trim()) params.set("q", ordersQ.trim());
    if (ordersStatus) params.set("status", ordersStatus);
    params.set("limit", "100");
    params.set("offset", "0");
    const res = await axios.get(`${API_BASE_URL}/admin/orders/?${params.toString()}`, {
      headers: authHeaders,
    });
    setOrders(res.data.results || []);
    setOrdersCount(res.data.count || 0);
  };

  const fetchPayments = async () => {
    const params = new URLSearchParams();
    if (paymentsQ.trim()) params.set("q", paymentsQ.trim());
    if (paymentsStatus) params.set("status", paymentsStatus);
    params.set("limit", "100");
    params.set("offset", "0");
    const res = await axios.get(`${API_BASE_URL}/admin/payments/?${params.toString()}`, {
      headers: authHeaders,
    });
    setPayments(res.data.results || []);
    setPaymentsCount(res.data.count || 0);
  };

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated || user?.role !== "admin") {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        clearMessages();
        await fetchSummary();
      } catch (e) {
        setError(e.response?.data?.error || "Failed to load admin overview");
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    const loadTab = async () => {
      if (!isAuthenticated || user?.role !== "admin") return;
      try {
        setLoading(true);
        clearMessages();
        if (activeTab === "overview") await fetchSummary();
        if (activeTab === "users") await fetchUsers();
        if (activeTab === "recipes") await fetchRecipes();
        if (activeTab === "restaurants") await fetchRestaurants();
        if (activeTab === "stores") await fetchStores();
        if (activeTab === "orders") await fetchOrders();
        if (activeTab === "payments") await fetchPayments();
      } catch (e) {
        setError(e.response?.data?.error || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    loadTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  if (loading) return <LoadingSpinner />;

  if (user?.role !== "admin") {
    return (
      <Container className="pt-16">
        <div className="py-12 text-center">
          <p className="text-red-600 text-lg">
            You don&apos;t have permission to access this page
          </p>
        </div>
      </Container>
    );
  }

  const Stat = ({ label, value, hint }) => (
    <Card>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-2 text-4xl font-extrabold text-gray-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-gray-500">{hint}</p> : null}
    </Card>
  );

  return (
    <Container className="pt-16">
      <div className="py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">Admin</h1>
            <p className="text-gray-600 mt-1">
              Manage users, content, verifications, and commerce
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                setLoading(true);
                clearMessages();
                await fetchSummary();
                setSuccess("Refreshed.");
                setTimeout(() => setSuccess(""), 2000);
              } catch (e) {
                setError(e.response?.data?.error || "Refresh failed");
              } finally {
                setLoading(false);
              }
            }}
            className="px-5 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-800 font-bold hover:bg-gray-50 transition"
          >
            Refresh
          </button>
        </div>

        {error ? <Alert message={error} type="error" onClose={() => setError("")} /> : null}
        {success ? (
          <Alert message={success} type="success" onClose={() => setSuccess("")} />
        ) : null}

        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-6 py-3 font-bold transition-all border-b-4 -mb-[2px] whitespace-nowrap ${
                activeTab === t.id
                  ? "text-orange-700 border-orange-700"
                  : "text-gray-600 border-transparent hover:text-orange-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Stat label="Total Users" value={summary?.users?.total ?? 0} hint="All accounts" />
              <Stat label="Recipes" value={summary?.content?.recipes ?? 0} hint="All recipes" />
              <Stat label="Restaurants" value={summary?.content?.restaurants ?? 0} hint="Restaurant profiles" />
              <Stat label="Stores" value={summary?.content?.stores ?? 0} hint="Store profiles" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">Verifications</h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Restaurants pending</span>
                    <span className="font-bold">{summary?.verifications?.restaurants_pending ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stores pending</span>
                    <span className="font-bold">{summary?.verifications?.stores_pending ?? 0}</span>
                  </div>
                </div>
              </Card>
              <Card className="lg:col-span-2">
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">Orders</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {Object.entries(summary?.commerce?.orders_by_status || {}).map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-gray-200 p-4">
                      <p className="text-gray-500">{k}</p>
                      <p className="text-2xl font-extrabold text-gray-900 mt-1">{v}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    value={usersQ}
                    onChange={(e) => setUsersQ(e.target.value)}
                    placeholder="Email, first name, last name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={usersRole}
                    onChange={(e) => setUsersRole(e.target.value)}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl bg-white"
                  >
                    <option value="">All</option>
                    <option value="normal">normal</option>
                    <option value="store">store</option>
                    <option value="restaurant">restaurant</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Verified
                  </label>
                  <select
                    value={usersVerified}
                    onChange={(e) => setUsersVerified(e.target.value)}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl bg-white"
                  >
                    <option value="">All</option>
                    <option value="true">verified</option>
                    <option value="false">unverified</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Active
                  </label>
                  <select
                    value={usersActive}
                    onChange={(e) => setUsersActive(e.target.value)}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl bg-white"
                  >
                    <option value="">All</option>
                    <option value="true">active</option>
                    <option value="false">inactive</option>
                  </select>
                </div>
                <div className="md:col-span-3 flex items-end justify-end">
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        clearMessages();
                        await fetchUsers();
                      } catch (e) {
                        setError(e.response?.data?.error || "Failed to load users");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-orange-600 text-white font-extrabold hover:bg-orange-700 transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">
                Users ({usersCount})
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Verified</th>
                      <th className="py-2 pr-4">Active</th>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="py-3 pr-4 font-semibold text-gray-900">
                          {u.email}
                        </td>
                        <td className="py-3 pr-4">
                          <select
                            value={u.role}
                            onChange={async (e) => {
                              try {
                                setLoading(true);
                                clearMessages();
                                await axios.put(
                                  `${API_BASE_URL}/admin/users/${u.id}/`,
                                  { role: e.target.value },
                                  { headers: authHeaders },
                                );
                                await fetchUsers();
                              } catch (err) {
                                setError(err.response?.data?.error || "Failed to update user");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="px-2 py-2 border border-gray-200 rounded-lg bg-white"
                          >
                            <option value="normal">normal</option>
                            <option value="store">store</option>
                            <option value="restaurant">restaurant</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={async () => {
                              try {
                                setLoading(true);
                                clearMessages();
                                await axios.put(
                                  `${API_BASE_URL}/admin/users/${u.id}/`,
                                  { is_email_verified: !u.is_email_verified },
                                  { headers: authHeaders },
                                );
                                await fetchUsers();
                              } catch (err) {
                                setError(err.response?.data?.error || "Failed to update user");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              u.is_email_verified
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {u.is_email_verified ? "VERIFIED" : "UNVERIFIED"}
                          </button>
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={async () => {
                              try {
                                setLoading(true);
                                clearMessages();
                                await axios.put(
                                  `${API_BASE_URL}/admin/users/${u.id}/`,
                                  { is_active: !u.is_active },
                                  { headers: authHeaders },
                                );
                                await fetchUsers();
                              } catch (err) {
                                setError(err.response?.data?.error || "Failed to update user");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              u.is_active
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {u.is_active ? "ACTIVE" : "INACTIVE"}
                          </button>
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          {(u.profile?.first_name || "") + " " + (u.profile?.last_name || "")}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                if (!window.confirm("Reset password for this user?")) return;
                                try {
                                  setLoading(true);
                                  clearMessages();
                                  const res = await axios.post(
                                    `${API_BASE_URL}/admin/users/${u.id}/reset-password/`,
                                    {},
                                    { headers: authHeaders },
                                  );
                                  setSuccess(`New password: ${res.data?.new_password}`);
                                } catch (err) {
                                  setError(err.response?.data?.error || "Failed to reset password");
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-800 font-bold hover:bg-gray-50"
                            >
                              Reset
                            </button>
                            <button
                              onClick={async () => {
                                if (!window.confirm("Delete this user?")) return;
                                try {
                                  setLoading(true);
                                  clearMessages();
                                  await axios.delete(
                                    `${API_BASE_URL}/admin/users/${u.id}/`,
                                    { headers: authHeaders },
                                  );
                                  await fetchUsers();
                                  setSuccess("User deleted.");
                                  setTimeout(() => setSuccess(""), 2000);
                                } catch (err) {
                                  setError(err.response?.data?.error || "Failed to delete user");
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="px-3 py-2 rounded-lg border border-red-200 text-red-700 font-bold hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td className="py-8 text-center text-gray-600" colSpan={6}>
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "recipes" && (
          <div className="space-y-6">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    value={recipesQ}
                    onChange={(e) => setRecipesQ(e.target.value)}
                    placeholder="Title, description, author email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Cuisine
                  </label>
                  <input
                    value={recipesCuisine}
                    onChange={(e) => setRecipesCuisine(e.target.value)}
                    placeholder="Any"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={recipesDifficulty}
                    onChange={(e) => setRecipesDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white"
                  >
                    <option value="">All</option>
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      clearMessages();
                      await fetchRecipes();
                    } catch (e) {
                      setError(e.response?.data?.error || "Failed to load recipes");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-orange-600 text-white font-extrabold hover:bg-orange-700 transition"
                >
                  Apply
                </button>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">
                Recipes ({recipesCount})
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">Title</th>
                      <th className="py-2 pr-4">Author</th>
                      <th className="py-2 pr-4">Cuisine</th>
                      <th className="py-2 pr-4">Difficulty</th>
                      <th className="py-2 pr-4">Likes</th>
                      <th className="py-2 pr-4">Rating</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="py-3 pr-4 font-semibold text-gray-900">
                          {r.title}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{r.author_email}</td>
                        <td className="py-3 pr-4 text-gray-700">{r.cuisine_type || "-"}</td>
                        <td className="py-3 pr-4 text-gray-700">{r.difficulty}</td>
                        <td className="py-3 pr-4 text-gray-700">{r.likes_count}</td>
                        <td className="py-3 pr-4 text-gray-700">
                          {Number(r.avg_rating || 0).toFixed(1)} ({r.ratings_count})
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={async () => {
                              if (!window.confirm("Delete this recipe?")) return;
                              try {
                                setLoading(true);
                                clearMessages();
                                await axios.delete(
                                  `${API_BASE_URL}/admin/recipes/${r.id}/delete/`,
                                  { headers: authHeaders },
                                );
                                await fetchRecipes();
                                setSuccess("Recipe deleted.");
                                setTimeout(() => setSuccess(""), 2000);
                              } catch (e) {
                                setError(e.response?.data?.error || "Failed to delete recipe");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="px-4 py-2 rounded-lg border border-red-200 text-red-700 font-bold hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {recipes.length === 0 && (
                      <tr>
                        <td className="py-8 text-center text-gray-600" colSpan={7}>
                          No recipes found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "restaurants" && (
          <div className="space-y-6">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    value={restaurantsQ}
                    onChange={(e) => setRestaurantsQ(e.target.value)}
                    placeholder="Name, address, cuisine, owner email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Verified
                  </label>
                  <select
                    value={restaurantsVerified}
                    onChange={(e) => setRestaurantsVerified(e.target.value)}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl bg-white"
                  >
                    <option value="">All</option>
                    <option value="true">verified</option>
                    <option value="false">unverified</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      clearMessages();
                      await fetchRestaurants();
                    } catch (e) {
                      setError(e.response?.data?.error || "Failed to load restaurants");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-orange-600 text-white font-extrabold hover:bg-orange-700 transition"
                >
                  Apply
                </button>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">
                Restaurants ({restaurantsCount})
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Owner</th>
                      <th className="py-2 pr-4">Cuisine</th>
                      <th className="py-2 pr-4">Verified</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="py-3 pr-4 font-semibold text-gray-900">
                          {r.restaurant_name}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{r.user_email}</td>
                        <td className="py-3 pr-4 text-gray-700">{r.cuisine_type || "-"}</td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={async () => {
                              try {
                                setLoading(true);
                                clearMessages();
                                await axios.put(
                                  `${API_BASE_URL}/admin/restaurants/${r.id}/`,
                                  { is_verified: !r.is_verified },
                                  { headers: authHeaders },
                                );
                                await fetchRestaurants();
                              } catch (e) {
                                setError(e.response?.data?.error || "Failed to update restaurant");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              r.is_verified
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {r.is_verified ? "VERIFIED" : "UNVERIFIED"}
                          </button>
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={async () => {
                              if (!window.confirm("Delete this restaurant profile?")) return;
                              try {
                                setLoading(true);
                                clearMessages();
                                await axios.delete(
                                  `${API_BASE_URL}/admin/restaurants/${r.id}/`,
                                  { headers: authHeaders },
                                );
                                await fetchRestaurants();
                                setSuccess("Restaurant deleted.");
                                setTimeout(() => setSuccess(""), 2000);
                              } catch (e) {
                                setError(e.response?.data?.error || "Failed to delete restaurant");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="px-4 py-2 rounded-lg border border-red-200 text-red-700 font-bold hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {restaurants.length === 0 && (
                      <tr>
                        <td className="py-8 text-center text-gray-600" colSpan={5}>
                          No restaurants found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "stores" && (
          <div className="space-y-6">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    value={storesQ}
                    onChange={(e) => setStoresQ(e.target.value)}
                    placeholder="Name, address, description, owner email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Verified
                  </label>
                  <select
                    value={storesVerified}
                    onChange={(e) => setStoresVerified(e.target.value)}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl bg-white"
                  >
                    <option value="">All</option>
                    <option value="true">verified</option>
                    <option value="false">unverified</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      clearMessages();
                      await fetchStores();
                    } catch (e) {
                      setError(e.response?.data?.error || "Failed to load stores");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-orange-600 text-white font-extrabold hover:bg-orange-700 transition"
                >
                  Apply
                </button>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">
                Stores ({storesCount})
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Owner</th>
                      <th className="py-2 pr-4">Address</th>
                      <th className="py-2 pr-4">Verified</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="py-3 pr-4 font-semibold text-gray-900">
                          {s.store_name}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{s.user_email}</td>
                        <td className="py-3 pr-4 text-gray-700">{s.store_address || "-"}</td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={async () => {
                              try {
                                setLoading(true);
                                clearMessages();
                                await axios.put(
                                  `${API_BASE_URL}/admin/stores/${s.id}/`,
                                  { is_verified: !s.is_verified },
                                  { headers: authHeaders },
                                );
                                await fetchStores();
                              } catch (e) {
                                setError(e.response?.data?.error || "Failed to update store");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              s.is_verified
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {s.is_verified ? "VERIFIED" : "UNVERIFIED"}
                          </button>
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={async () => {
                              if (!window.confirm("Delete this store profile?")) return;
                              try {
                                setLoading(true);
                                clearMessages();
                                await axios.delete(
                                  `${API_BASE_URL}/admin/stores/${s.id}/`,
                                  { headers: authHeaders },
                                );
                                await fetchStores();
                                setSuccess("Store deleted.");
                                setTimeout(() => setSuccess(""), 2000);
                              } catch (e) {
                                setError(e.response?.data?.error || "Failed to delete store");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="px-4 py-2 rounded-lg border border-red-200 text-red-700 font-bold hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {stores.length === 0 && (
                      <tr>
                        <td className="py-8 text-center text-gray-600" colSpan={5}>
                          No stores found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    value={ordersQ}
                    onChange={(e) => setOrdersQ(e.target.value)}
                    placeholder="Order id, customer email, store name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={ordersStatus}
                    onChange={(e) => setOrdersStatus(e.target.value)}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl bg-white"
                  >
                    <option value="">All</option>
                    <option value="pending">pending</option>
                    <option value="payment_pending">payment_pending</option>
                    <option value="paid">paid</option>
                    <option value="processing">processing</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      clearMessages();
                      await fetchOrders();
                    } catch (e) {
                      setError(e.response?.data?.error || "Failed to load orders");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-orange-600 text-white font-extrabold hover:bg-orange-700 transition"
                >
                  Apply
                </button>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">
                Orders ({ordersCount})
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">Order</th>
                      <th className="py-2 pr-4">Customer</th>
                      <th className="py-2 pr-4">Store</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.order_id} className="border-t">
                        <td className="py-3 pr-4 font-semibold text-gray-900">
                          {o.order_id}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{o.customer_email}</td>
                        <td className="py-3 pr-4 text-gray-700">{o.store_name}</td>
                        <td className="py-3 pr-4 text-gray-700">
                          Rs. {o.total_amount}
                        </td>
                        <td className="py-3 pr-4">
                          <select
                            value={o.status}
                            onChange={async (e) => {
                              try {
                                setLoading(true);
                                clearMessages();
                                await axios.put(
                                  `${API_BASE_URL}/admin/orders/${o.order_id}/`,
                                  { status: e.target.value },
                                  { headers: authHeaders },
                                );
                                await fetchOrders();
                              } catch (err) {
                                setError(err.response?.data?.error || "Failed to update order");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="px-2 py-2 border border-gray-200 rounded-lg bg-white"
                          >
                            <option value="pending">pending</option>
                            <option value="payment_pending">payment_pending</option>
                            <option value="paid">paid</option>
                            <option value="processing">processing</option>
                            <option value="completed">completed</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{o.items_count}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td className="py-8 text-center text-gray-600" colSpan={6}>
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6">
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    value={paymentsQ}
                    onChange={(e) => setPaymentsQ(e.target.value)}
                    placeholder="Payment id, transaction id, order id, customer, store"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={paymentsStatus}
                    onChange={(e) => setPaymentsStatus(e.target.value)}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl bg-white"
                  >
                    <option value="">All</option>
                    <option value="pending">pending</option>
                    <option value="processing">processing</option>
                    <option value="completed">completed</option>
                    <option value="failed">failed</option>
                    <option value="refunded">refunded</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      clearMessages();
                      await fetchPayments();
                    } catch (e) {
                      setError(e.response?.data?.error || "Failed to load payments");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-orange-600 text-white font-extrabold hover:bg-orange-700 transition"
                >
                  Apply
                </button>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">
                Payments ({paymentsCount})
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">Payment</th>
                      <th className="py-2 pr-4">Order</th>
                      <th className="py-2 pr-4">Customer</th>
                      <th className="py-2 pr-4">Store</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Method</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.payment_id} className="border-t">
                        <td className="py-3 pr-4 font-semibold text-gray-900">
                          {p.payment_id}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{p.order_id}</td>
                        <td className="py-3 pr-4 text-gray-700">{p.customer_email}</td>
                        <td className="py-3 pr-4 text-gray-700">{p.store_name}</td>
                        <td className="py-3 pr-4 text-gray-700">Rs. {p.amount}</td>
                        <td className="py-3 pr-4 text-gray-700">{p.payment_method}</td>
                        <td className="py-3 pr-4">
                          <select
                            value={p.status}
                            onChange={async (e) => {
                              try {
                                setLoading(true);
                                clearMessages();
                                await axios.put(
                                  `${API_BASE_URL}/admin/payments/${p.payment_id}/`,
                                  { status: e.target.value },
                                  { headers: authHeaders },
                                );
                                await fetchPayments();
                              } catch (err) {
                                setError(err.response?.data?.error || "Failed to update payment");
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="px-2 py-2 border border-gray-200 rounded-lg bg-white"
                          >
                            <option value="pending">pending</option>
                            <option value="processing">processing</option>
                            <option value="completed">completed</option>
                            <option value="failed">failed</option>
                            <option value="refunded">refunded</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td className="py-8 text-center text-gray-600" colSpan={7}>
                          No payments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Container>
  );
}
