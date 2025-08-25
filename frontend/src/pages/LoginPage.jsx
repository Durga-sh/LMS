import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authAPI from "../api/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("LoginPage: Checking if user is already authenticated...");
        const result = await authAPI.getCurrentUser();
        console.log("LoginPage checkAuthStatus result:", result);
        if (result.success) {
          const from = location.state?.from?.pathname || "/leads";
          console.log("User already authenticated, redirecting to:", from);
          navigate(from, { replace: true });
        }
      } catch (error) {
        console.log("User not authenticated on mount:", error.message);
      }
    };

    checkAuthStatus();
  }, [navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    setLoading(true);
    setErrors([]);
    setMessage("");

    try {
      const result = await authAPI.login(formData);

      if (result.success) {
        setMessage(result.message);
        const redirectPath = location.state?.from?.pathname || "/leads";
        const verifyAndRedirect = async (attempt = 1, maxAttempts = 5) => {
          try {
            console.log(`Verification attempt ${attempt}/${maxAttempts}`);

            const delay =
              import.meta.env.MODE === "production" ? attempt * 200 : 100;
            await new Promise((resolve) => setTimeout(resolve, delay));

            const authCheck = await authAPI.getCurrentUser();
            if (authCheck.success) {
              console.log(
                "Authentication verified, navigating to:",
                redirectPath
              );
              navigate(redirectPath, { replace: true });
            } else if (attempt < maxAttempts) {
              return verifyAndRedirect(attempt + 1, maxAttempts);
            } else {
              console.error(
                "Max verification attempts reached, forcing redirect"
              );
              window.location.href = redirectPath;
            }
          } catch (verifyError) {
            console.error(
              `Verification attempt ${attempt} failed:`,
              verifyError
            );
            if (attempt < maxAttempts) {
              return verifyAndRedirect(attempt + 1, maxAttempts);
            } else {
              window.location.href = redirectPath;
            }
          }
        };

        verifyAndRedirect();
      } else {
        console.error("Login failed:", result);
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors([result.message || "Login failed. Please try again."]);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors([
        `Network error: ${error.message}. Please check your connection and try again.`,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">{message}</span>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-red-700"
                >
                  <XCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            Secure login with HTTP-only cookies
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
