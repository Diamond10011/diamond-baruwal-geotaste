import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/FormComponents";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000/api";

const Orders = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const [stores, setStores] = useState([]);
  const [storeProducts, setStoreProducts] = useState({});
  const [cart, setCart] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState("all");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("demo");
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetchStores();
    fetchOrders();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurants/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // For demo, we'll use restaurants as stores
      setStores(response.data.restaurants || []);
    } catch (err) {
      console.error("Failed to load stores:", err);
    }
  };

  const fetchStoreProducts = async (storeId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/store-products/?store_id=${storeId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStoreProducts((prev) => ({
        ...prev,
        [storeId]: response.data.products || [],
      }));
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  const handleSelectStore = (store) => {
    if (selectedStore?.id === store.id) {
      setSelectedStore(null);
    } else {
      setSelectedStore(store);
      if (!storeProducts[store.id]) {
        fetchStoreProducts(store.id);
      }
    }
  };

  const handleAddToCart = (product) => {
    const existingItem = cart.find(
      (item) =>
        item.product_id === product.id && item.store_id === selectedStore.id,
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id && item.store_id === selectedStore.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          store_id: selectedStore.id,
          store_name: selectedStore.restaurant_name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
    setSuccess(`${product.name} added to cart!`);
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleRemoveFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(index);
    } else {
      setCart(
        cart.map((item, i) => (i === index ? { ...item, quantity } : item)),
      );
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!deliveryAddress.trim()) {
      setError("Please enter a delivery address");
      return;
    }

    // Group items by store
    const storeId = cart[0].store_id;
    const allSameStore = cart.every((item) => item.store_id === storeId);

    if (!allSameStore) {
      setError("Please order from one store at a time");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Create order
      const orderResponse = await axios.post(
        `${API_BASE_URL}/orders/`,
        {
          store_id: storeId,
          items: cart.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          delivery_address: deliveryAddress,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const orderId = orderResponse.data.order.order_id;
      const totalAmount = orderResponse.data.order.total_amount;

      // Process payment (demo)
      const paymentResponse = await axios.post(
        `${API_BASE_URL}/payments/process/`,
        {
          order_id: orderId,
          payment_method: paymentMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSuccess("Order placed successfully! Payment processed.");
      setCart([]);
      setDeliveryAddress("");
      setActiveTab("orders");
      fetchOrders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process order");
    } finally {
      setProcessing(false);
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = cartTotal * 0.1;
  const finalTotal = cartTotal + tax;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "payment_pending":
        return "bg-orange-100 text-orange-700";
      case "paid":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status?.toLowerCase() === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            � Orders & Shopping
          </h1>
          <p className="text-gray-600">
            Browse stores, add items to cart, and manage your orders
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b-2 border-gray-300">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-6 py-3 font-semibold transition-colors border-b-4 -mb-2 ${
              activeTab === "browse"
                ? "text-green-600 border-green-600"
                : "text-gray-600 border-transparent hover:text-green-500"
            }`}
          >
            🏪 Browse Stores
          </button>
          <button
            onClick={() => setActiveTab("cart")}
            className={`px-6 py-3 font-semibold transition-colors border-b-4 -mb-2 ${
              activeTab === "cart"
                ? "text-green-600 border-green-600"
                : "text-gray-600 border-transparent hover:text-green-500"
            }`}
          >
            🛍️ Cart ({cart.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-semibold transition-colors border-b-4 -mb-2 ${
              activeTab === "orders"
                ? "text-green-600 border-green-600"
                : "text-gray-600 border-transparent hover:text-green-500"
            }`}
          >
            📦 My Orders
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert message={error} type="error" onClose={() => setError(null)} />
        )}
        {success && (
          <Alert
            message={success}
            type="success"
            onClose={() => setSuccess(null)}
          />
        )}

        {/* Browse Stores Tab */}
        {activeTab === "browse" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Available Stores
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                </div>
              ) : stores.length === 0 ? (
                <p className="text-center text-gray-600 py-8">
                  No stores available
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stores.map((store) => (
                    <div
                      key={store.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">
                          {store.restaurant_name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {store.restaurant_description ||
                            "Fresh products available"}
                        </p>

                        {selectedStore?.id === store.id &&
                          storeProducts[store.id] && (
                            <div className="mt-4 pt-4 border-t space-y-3 max-h-96 overflow-y-auto">
                              {storeProducts[store.id].length === 0 ? (
                                <p className="text-gray-600 text-sm">
                                  No products available
                                </p>
                              ) : (
                                storeProducts[store.id].map((product) => (
                                  <div
                                    key={product.id}
                                    className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900">
                                        {product.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Rs. {product.price}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Stock: {product.stock}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleAddToCart(product)}
                                      disabled={product.stock <= 0}
                                      className="ml-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:bg-gray-400"
                                    >
                                      +Add
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}

                        <button
                          onClick={() => handleSelectStore(store)}
                          className={`w-full mt-6 px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedStore?.id === store.id
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {selectedStore?.id === store.id
                            ? "✓ Viewing Items"
                            : "View Items"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === "cart" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Shopping Cart
                </h2>

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-3xl mb-4">🛒</p>
                    <p className="text-gray-600 text-lg mb-6">
                      Your cart is empty
                    </p>
                    <button
                      onClick={() => setActiveTab("browse")}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.product_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.store_name}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            Rs. {item.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(idx, item.quantity - 1)
                            }
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(idx, item.quantity + 1)
                            }
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(idx)}
                            className="ml-4 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Checkout Sidebar */}
            {cart.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-8 sticky top-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Order Summary
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span>Rs. {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax (10%):</span>
                      <span>Rs. {tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                      <span>Total:</span>
                      <span>Rs. {finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Address
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your delivery address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="demo">💳 Demo Payment</option>
                        <option value="card">💳 Credit/Debit Card</option>
                        <option value="wallet">🎁 Wallet</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={processing || cart.length === 0}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold disabled:bg-gray-400"
                  >
                    {processing ? "Processing..." : "Proceed to Checkout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                "all",
                "pending",
                "payment_pending",
                "paid",
                "processing",
                "completed",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filter === status
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {status === "all"
                    ? "All Orders"
                    : status.replace(/_/g, " ").toUpperCase()}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-3xl mb-4">📭</p>
                <p className="text-gray-600 text-lg mb-6">
                  {filter === "all" ? "No orders yet" : `No ${filter} orders`}
                </p>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Order ID</p>
                        <p className="font-semibold text-gray-900">
                          {order.order_id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Store</p>
                        <p className="font-semibold text-gray-900">
                          {order.store_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          Total Amount
                        </p>
                        <p className="font-bold text-green-600">
                          Rs. {order.total_amount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Status</p>
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Items:
                        </p>
                        <ul className="space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600">
                              • {item.product_name} x {item.quantity} @ Rs.{" "}
                              {item.price}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {order.delivery_address && (
                      <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                        📍 Delivery to: {order.delivery_address}
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

export default Orders;
