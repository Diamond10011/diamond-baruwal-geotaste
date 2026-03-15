import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Alert } from "../components/FormComponents";

const API_BASE_URL = "http://localhost:8000/api";

const Stores = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/stores/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setStores(response.data.stores || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load stores");
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter((s) => {
      const name = (s.store_name || "").toLowerCase();
      const address = (s.store_address || "").toLowerCase();
      const desc = (s.store_description || "").toLowerCase();
      return name.includes(q) || address.includes(q) || desc.includes(q);
    });
  }, [stores, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
              Stores
            </h1>
            <p className="text-gray-600 text-lg">
              Browse stores and shop ingredients from store owners
            </p>
          </div>
          <button
            onClick={fetchStores}
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-white border-2 border-emerald-100 text-emerald-700 font-bold hover:bg-emerald-50 transition disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <Alert message={error} type="error" onClose={() => setError(null)} />
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 mb-10">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Search stores
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, address, description..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-600 font-semibold">
            Loading stores...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-emerald-100">
            <p className="text-gray-600 text-lg font-medium">
              No stores found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.01] transition-all border border-emerald-50"
              >
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                  <h3 className="text-xl font-extrabold leading-tight">
                    {s.store_name || "Store"}
                  </h3>
                  {s.store_address && (
                    <p className="text-emerald-100 text-sm mt-2 line-clamp-2">
                      {s.store_address}
                    </p>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {s.store_description || "No description provided yet."}
                  </p>

                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() =>
                        navigate("/orders", { state: { storeId: s.id } })
                      }
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold hover:shadow-lg transition"
                    >
                      Shop Products
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stores;

