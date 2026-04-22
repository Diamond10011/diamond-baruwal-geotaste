import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/FormComponents";

const API_BASE_URL = "http://localhost:8000/api";

const Verification = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(
    user?.verification_status || null,
  );
  const [verification, setVerification] = useState(null);

  const [doc1, setDoc1] = useState(null);
  const [doc2, setDoc2] = useState(null);

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE_URL}/verification/`, {
        headers: authHeaders,
      });
      setVerificationStatus(res.data.verification_status);
      setVerification(res.data.verification);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load verification status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!doc1 || !doc2) {
      setError("Please upload both documents");
      return;
    }
    try {
      setError("");
      setSuccess("");
      const form = new FormData();
      form.append("document1", doc1);
      form.append("document2", doc2);
      await axios.post(`${API_BASE_URL}/verification/upload/`, form, {
        headers: authHeaders,
      });
      setSuccess("Verification submitted. Waiting for admin approval.");
      setDoc1(null);
      setDoc2(null);
      await loadStatus();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit verification");
    }
  };

  const needsVerification =
    user?.role === "store" || user?.role === "restaurant";

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-gray-600 font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Account Verification
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Store/Restaurant accounts must be verified before accessing management
          features.
        </p>

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

        {!needsVerification ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 font-semibold">
            No verification is required for your account.
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-600 font-bold uppercase">
                    Status
                  </p>
                  <p className="text-lg font-extrabold text-gray-900">
                    {(verificationStatus || "pending").toUpperCase()}
                  </p>
                </div>
                {verification?.status && (
                  <div className="text-sm text-gray-700 font-semibold">
                    Review: {String(verification.status).toUpperCase()}
                  </div>
                )}
              </div>
              {verification?.rejection_reason && (
                <div className="mt-3 text-sm text-red-700 font-semibold">
                  Rejection reason: {verification.rejection_reason}
                </div>
              )}
            </div>

            {verificationStatus !== "verified" && (
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Document 1 (image/pdf)
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setDoc1(e.target.files?.[0] || null)}
                    className="w-full border border-gray-200 rounded-xl p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Document 2 (image/pdf)
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setDoc2(e.target.files?.[0] || null)}
                    className="w-full border border-gray-200 rounded-xl p-3"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-xl bg-orange-600 text-white font-extrabold hover:bg-orange-700 transition"
                >
                  Submit Verification
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Verification;

