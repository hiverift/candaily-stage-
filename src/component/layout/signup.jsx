// SignUpPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Github,
  Mail,
  Chrome,
  CheckCircle2,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (provider) => {
    setLoading(provider);
    setError("");
    setSuccess(false);

    if (provider === "credentials") {
      // Frontend Validations
      if (!formData.name.trim()) {
        setError("Full name is required");
        setLoading(null);
        return;
      }
      if (!formData.email.trim()) {
        setError("Email is required");
        setLoading(null);
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(null);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match!");
        setLoading(null);
        return;
      }

      try {
        const response = await fetch(
          "http://192.168.0.245:5000/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name.trim(),
              email: formData.email.trim().toLowerCase(),
              password: formData.password,
              confirmPassword: formData.confirmPassword, // ← Yeh field backend expect kar raha tha
            }),
          }
        );

        const data = await response.json();

        // if (response.ok && data.statusCode === 201) {
        //   setSuccess(true);
        //   setTimeout(() => {
        //     navigate("/login");
        //   }, 2200);
        if (response.ok && data.statusCode === 201) {
          // Save userId and token (if backend provides token)
          if (data.user && data.user._id) {
            localStorage.setItem("userId", data.user._id);
          }
          if (data.token) {
            localStorage.setItem("token", data.token);
          }

          setSuccess(true);
          setTimeout(() => {
            navigate("/login");
          }, 2200);
        } else {
          // Backend validation errors
          const errMsg = Array.isArray(data.message)
            ? data.message[0]
            : data.message || "Signup failed";
          setError(errMsg);
        }
      } catch (err) {
        console.error("Network/Error:", err);
        setError("Cannot connect to server. Please try again later.");
      } finally {
        setLoading(null);
      }
    }

    if (provider === "google") {
      setError("Google Sign Up coming soon!");
      setLoading(null);
    }
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome !
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your account has been created successfully.
          </p>
          <p className="text-sm text-gray-500 mt-6">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-5">
              <Mail className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create your account
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Start scheduling smarter today
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => handleSignUp("google")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium disabled:opacity-60 transition"
            >
              <Chrome className="w-5 h-5" />
              {loading === "google" ? "Please wait..." : "Sign up with Google"}
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                Or sign up with email
              </span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp("credentials");
            }}
            className="space-y-5"
          >
            {/* Name Field */}
            <div className="relative">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 focus:outline-none transition"
              />
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                size={20}
              />
            </div>

            {/* Email Field */}
            <div className="relative">
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 focus:outline-none transition"
              />
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                size={20}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 focus:outline-none transition select-none"
              />
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                size={20}
              />
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm Password"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 focus:outline-none transition select-none"
              />
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                size={20}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading === "credentials"}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg shadow-lg transition-all duration-200"
            >
              {loading === "credentials"
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 font-medium hover:underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
