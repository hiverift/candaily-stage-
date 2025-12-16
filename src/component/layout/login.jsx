// SignInPage.jsx - FULLY WORKING WITH GOOGLE + EMAIL LOGIN

import React, { useState } from "react";
import { Chrome, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/config";

export default function LogIn() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE = API_URL.BASE_URL;

  // ✔ GOOGLE LOGIN (Frontend → Backend → Google OAuth)
  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  // ✔ NORMAL EMAIL LOGIN
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed");

      // if (data?.statusCode === 200) {
      //   localStorage.setItem("token", data?.result?.access_token);
      //   localStorage.setItem("user", JSON.stringify(data?.result?.user));

      //   navigate("/dashboard", { replace: true });
      //       if (data?.statusCode === 200) {
      //   localStorage.setItem("token", data?.result?.access_token);
      //   localStorage.setItem("user", JSON.stringify(data?.result?.user));

      //   // Add this line to save userId separately:
      //   // if (data?.result?.user?._id) {
      //   //   localStorage.setItem("user
      //   // ", data.result.user._id);
      //   // }
      //   if (data?.result?.user?._id) {
      //   localStorage.setItem("userId", data.result.user._id);
      // }


      //   navigate("/dashboard", { replace: true });
      // }
      if (data?.statusCode === 200) {
        
        localStorage.setItem("token", data?.result?.access_token);
        localStorage.setItem("user", JSON.stringify(data?.result?.user));
        console.log('data',data)
        if (data?.result?.user?._id) {
          localStorage.setItem("userId", data.result.user._id); // important for ProfilePage
        }

        navigate("/dashboard", { replace: true });
      }

      else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo & Heading */}
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
            <Mail className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Login to your account to continue
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Social Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-gray-700 dark:text-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all outline-none disabled:opacity-60"
                />
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all outline-none disabled:opacity-60 select-none"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot your password?
            </button>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-600 font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// import React, { useState } from "react";
// import { Chrome, Mail, Lock, Eye, EyeOff } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { loginUser , googleLogin } from "../../api/auth.api";

// export default function LogIn() {
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = useState(false);

//   // ✔ NORMAL EMAIL LOGIN (API Gateway)
//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const res = await loginUser({
//         email: email.trim(),
//         password,
//       });

//       const data = res.data;

//       if (data?.statusCode === 200) {
//         localStorage.setItem("token", data?.result?.access_token);
//         localStorage.setItem("user", JSON.stringify(data?.result?.user));

//         navigate("/dashboard", { replace: true });
//       } else {
//         throw new Error("Invalid response");
//       }
//     } catch (err) {
//       setError(
//         err?.response?.data?.message ||
//           "Invalid email or password. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     /* 🔥 UI SAME AS YOUR CODE 🔥 */
//     <button onClick={googleLogin}>
//       <Chrome /> Continue with Google
//     </button>
//   );
// }
