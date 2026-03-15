import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Alert, FormButton, FormInput } from "../../components/FormComponents";

const API_BASE_URL = "http://localhost:8000/api";

const emptyStoreProfile = {
  store_name: "",
  store_description: "",
  store_address: "",
};

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  image: "",
  is_available: true,
};

const StoreProfile = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");

  const [activeTab, setActiveTab] = useState("store");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [storeProfile, setStoreProfile] = useState(emptyStoreProfile);

  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);

  const [orders, setOrders] = useState([]);

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([loadStoreProfile(), loadProducts(), loadOrders()]);
    } finally {
      setLoading(false);
    }
  };

  const loadStoreProfile = async () => {
    const response = await axios.get(`${API_BASE_URL}/store-profile/`, {
      headers: authHeaders,
    });
    setStoreProfile({
      store_name: response.data.store_name || "",
      store_description: response.data.store_description || "",
      store_address: response.data.store_address || "",
    });
  };

  const saveStoreProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      await axios.put(`${API_BASE_URL}/store-profile/`, storeProfile, {
        headers: authHeaders,
      });
      setSuccess("Store profile updated.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update store profile");
    } finally {
      setSaving(false);
    }
  };

  const loadProducts = async () => {
    const response = await axios.get(`${API_BASE_URL}/store-products/`, {
      headers: authHeaders,
    });
    setProducts(response.data.products || []);
  };

  const startEditProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      category: product.category || "",
      stock: product.stock ?? "",
      image: product.image || "",
      is_available: product.is_available ?? true,
    });
    setError("");
    setSuccess("");
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setProductForm(emptyProduct);
    setError("");
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (productForm.price === "" || Number.isNaN(Number(productForm.price))) {
      setError("Valid price is required");
      return;
    }
    if (productForm.stock === "" || Number.isNaN(Number(productForm.stock))) {
      setError("Valid stock quantity is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: productForm.name.trim(),
        description: productForm.description || "",
        price: parseFloat(productForm.price),
        category: productForm.category || "",
        stock: parseInt(productForm.stock, 10),
        image: productForm.image || null,
        is_available: !!productForm.is_available,
      };

      if (editingProductId) {
        const response = await axios.put(
          `${API_BASE_URL}/store-products/${editingProductId}/`,
          payload,
          { headers: authHeaders },
        );
        const updated = response.data.product || response.data;
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? updated : p)),
        );
        setSuccess("Product updated.");
      } else {
        const response = await axios.post(`${API_BASE_URL}/store-products/`, payload, {
          headers: authHeaders,
        });
        const created = response.data.product || response.data;
        setProducts((prev) => [created, ...prev]);
        setSuccess("Product added.");
      }

      setTimeout(() => setSuccess(""), 3000);
      setEditingProductId(null);
      setProductForm(emptyProduct);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      setSaving(true);
      setError("");
      await axios.delete(`${API_BASE_URL}/store-products/${productId}/`, {
        headers: authHeaders,
      });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setSuccess("Product deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete product");
    } finally {
      setSaving(false);
    }
  };

  const loadOrders = async () => {
    const response = await axios.get(`${API_BASE_URL}/orders/`, {
      headers: authHeaders,
    });
    setOrders(response.data.orders || []);
  };

  const statusPill = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "paid" || s === "completed") return "bg-green-100 text-green-700";
    if (s === "payment_pending") return "bg-orange-100 text-orange-700";
    if (s === "processing") return "bg-purple-100 text-purple-700";
    if (s === "cancelled") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-gray-600 font-semibold">Loading store dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
                {storeProfile.store_name || "My Store"}
              </h1>
              <p className="text-blue-100 font-medium">
                Store Dashboard {user?.email ? ` - ${user.email}` : ""}
              </p>
            </div>
            <button
              onClick={loadAll}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 transition font-bold text-sm disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && <Alert message={error} type="error" onClose={() => setError("")} />}
        {success && (
          <Alert message={success} type="success" onClose={() => setSuccess("")} />
        )}

        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {[
            { id: "store", label: "Store Profile" },
            { id: "products", label: "Products" },
            { id: "orders", label: "Orders" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-6 py-3 font-bold transition-all border-b-4 -mb-[2px] whitespace-nowrap ${
                activeTab === t.id
                  ? "text-indigo-700 border-indigo-700"
                  : "text-gray-600 border-transparent hover:text-indigo-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "store" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-50">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
              Store Profile
            </h2>
            <form onSubmit={saveStoreProfile} className="space-y-6">
              <FormInput
                label="Store Name"
                name="store_name"
                value={storeProfile.store_name}
                onChange={(e) =>
                  setStoreProfile((p) => ({ ...p, store_name: e.target.value }))
                }
                required
              />

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Store Address
                </label>
                <input
                  value={storeProfile.store_address}
                  onChange={(e) =>
                    setStoreProfile((p) => ({ ...p, store_address: e.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Street, city, country"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Store Description
                </label>
                <textarea
                  value={storeProfile.store_description}
                  onChange={(e) =>
                    setStoreProfile((p) => ({
                      ...p,
                      store_description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="What do you sell? Any specialties?"
                />
              </div>

              <FormButton loading={saving} type="submit">
                Save Store Profile
              </FormButton>
            </form>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-50">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">
                  {editingProductId ? "Edit Product" : "Add Product"}
                </h2>
                {editingProductId && (
                  <button
                    onClick={cancelEditProduct}
                    type="button"
                    className="px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={submitProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Product Name"
                    name="name"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                  />

                  <FormInput
                    label="Category"
                    name="category"
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, category: e.target.value }))
                    }
                    placeholder="e.g., Vegetables, Fruits, Dairy"
                  />

                  <FormInput
                    label="Price"
                    name="price"
                    type="number"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, price: e.target.value }))
                    }
                    required
                  />

                  <FormInput
                    label="Stock"
                    name="stock"
                    type="number"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, stock: e.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, description: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Optional"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <FormInput
                    label="Image URL"
                    name="image"
                    type="url"
                    value={productForm.image}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, image: e.target.value }))
                    }
                    placeholder="https://..."
                  />

                  <label className="flex items-center gap-3 font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={!!productForm.is_available}
                      onChange={(e) =>
                        setProductForm((p) => ({
                          ...p,
                          is_available: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 accent-indigo-600"
                    />
                    Available for sale
                  </label>
                </div>

                <FormButton loading={saving} type="submit">
                  {editingProductId ? "Update Product" : "Add Product"}
                </FormButton>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-50">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
                Your Products ({products.length})
              </h2>

              {products.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  No products yet. Add your first product above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow bg-white"
                    >
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-extrabold text-gray-900">
                              {p.name}
                            </h3>
                            {p.category && (
                              <p className="text-sm text-gray-600 mt-1">
                                {p.category}
                              </p>
                            )}
                          </div>
                          <span
                            className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                              p.is_available
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {p.is_available ? "AVAILABLE" : "HIDDEN"}
                          </span>
                        </div>

                        {p.description && (
                          <p className="text-sm text-gray-700 mt-3 line-clamp-3">
                            {p.description}
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-lg font-extrabold text-indigo-700">
                            Rs. {p.price}
                          </div>
                          <div className="text-sm font-bold text-gray-700">
                            Stock: {p.stock}
                          </div>
                        </div>

                        <div className="mt-5 flex gap-2">
                          <button
                            onClick={() => startEditProduct(p)}
                            disabled={saving}
                            className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            disabled={saving}
                            className="px-4 py-2 rounded-xl border-2 border-red-200 text-red-600 font-bold hover:bg-red-50 transition disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-50">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Orders ({orders.length})
              </h2>
              <button
                onClick={loadOrders}
                disabled={saving}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition disabled:opacity-50"
              >
                Refresh Orders
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                No orders yet.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">
                          Order ID
                        </p>
                        <p className="font-extrabold text-gray-900">
                          {o.order_id}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-extrabold ${statusPill(
                          o.status,
                        )}`}
                      >
                        {(o.status || "pending").toUpperCase()}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 font-semibold">
                          Total
                        </p>
                        <p className="text-xl font-extrabold text-indigo-700">
                          Rs. {o.total_amount}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-sm text-gray-700">
                        <span className="font-bold">Customer:</span>{" "}
                        {o.customer_email || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-bold">Delivery:</span>{" "}
                        {o.delivery_address || "Not provided"}
                      </div>
                    </div>

                    {o.items?.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <p className="font-extrabold text-gray-900 mb-3">
                          Items
                        </p>
                        <div className="space-y-2">
                          {o.items.map((it) => (
                            <div
                              key={it.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="font-semibold text-gray-800">
                                {it.product_name} x {it.quantity}
                              </span>
                              <span className="font-bold text-gray-700">
                                Rs. {it.subtotal}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreProfile;
