import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert } from "../../components/FormComponents";

const API_BASE_URL = "http://localhost:8000/api";

const AdminVerifications = () => {
  const token = localStorage.getItem("access_token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [items, setItems] = useState([]);

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE_URL}/admin/verifications/`, {
        headers: authHeaders,
      });
      setItems(res.data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const review = async (id, action) => {
    try {
      setError("");
      setSuccess("");
      let rejection_reason = "";
      if (action === "reject") {
        rejection_reason = window.prompt("Rejection reason (optional):", "") || "";
      }
      await axios.post(
        `${API_BASE_URL}/admin/verifications/${id}/review/`,
        { action, rejection_reason },
        { headers: authHeaders },
      );
      setSuccess(`Verification ${action}d.`);
      await load();
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to review verification");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-gray-600 font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Verification Requests
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Review pending store/restaurant verification submissions.
            </p>
          </div>
          <button
            onClick={load}
            className="px-4 py-2 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-4">
            <Alert message={error} type="error" onClose={() => setError("")} />
          </div>
        )}
        {success && (
          <div className="mt-4">
            <Alert
              message={success}
              type="success"
              onClose={() => setSuccess("")}
            />
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-6 text-gray-600 font-semibold">
            No pending verifications.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {items.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border border-gray-200 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">
                      {v.email}
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">
                      Role: {v.role} • Status: {v.status}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => review(v.id, "approve")}
                      className="px-4 py-2 rounded-xl bg-green-600 text-white font-extrabold hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => review(v.id, "reject")}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {v.document1 && (
                    <a
                      href={v.document1}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
                    >
                      Document 1
                    </a>
                  )}
                  {v.document2 && (
                    <a
                      href={v.document2}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl border border-gray-200 font-bold hover:bg-gray-50"
                    >
                      Document 2
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerifications;

