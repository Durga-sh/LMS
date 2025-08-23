// DashboardPage.jsx - Updated with Navigation
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  User,
  Mail,
  Calendar,
  Shield,
  Loader2,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import authAPI from "../api/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    fetchCurrentUser();
  });

  const fetchCurrentUser = async () => {
    try {
      const result = await authAPI.getCurrentUser();
      if (result.success) {
        setCurrentUser(result.user);
      } else {
        // If user fetch fails, redirect to login
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login", { replace: true });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
      // Always redirect to login after logout attempt
      navigate("/login", { replace: true });
    }
  };

  const handleRefreshUser = async () => {
    setRefreshing(true);
    try {
      const result = await authAPI.getCurrentUser();
      if (result.success) {
        setCurrentUser(result.user);
      } else {
        // If refresh fails, user might be unauthenticated
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Refresh user error:", error);
      navigate("/login", { replace: true });
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading spinner while fetching initial user data
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Loading Dashboard...
            </h2>
            <p className="text-gray-600">Fetching user information</p>
          </div>
        </div>
      </div>
    );
  }

  // If no user data, redirect to login (this shouldn't happen with proper auth flow)
  if (!currentUser) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Welcome, {currentUser.name}!
                  </h1>
                  <p className="text-blue-100">
                    You are successfully logged in
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefreshUser}
                disabled={refreshing}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh user data"
              >
                <RefreshCw
                  className={`w-5 h-5 text-white ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* User Information Cards */}
          <div className="p-8 space-y-6">
            {/* Basic Info */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Full Name
                  </label>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-gray-800 font-medium">
                      {currentUser.name}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email Address
                  </label>
                  <div className="bg-white p-3 rounded-lg border flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-800">{currentUser.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    User ID
                  </label>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-gray-800 font-mono text-sm">
                      {currentUser.id}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Role
                  </label>
                  <div className="bg-white p-3 rounded-lg border">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        currentUser.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            {(currentUser.createdAt || currentUser.updatedAt) && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Account Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentUser.createdAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Account Created
                      </label>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-gray-800 text-sm">
                          {formatDate(currentUser.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {currentUser.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Last Updated
                      </label>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-gray-800 text-sm">
                          {formatDate(currentUser.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Logging Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Session Active
            </h3>
            <p className="text-gray-600 text-sm">
              Your session is secure and active. All data is synchronized with
              the server.
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600 text-sm font-medium">
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
