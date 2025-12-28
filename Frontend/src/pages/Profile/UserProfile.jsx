import React from "react";

export default function UserProfile() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
        <h1 className="text-4xl font-bold mb-6">User Profile</h1>
        <p className="text-lg text-gray-700">
          This is a placeholder for the user profile page. User details and
          settings will be displayed here.
        </p>
      </div>
    </div>
  );
}