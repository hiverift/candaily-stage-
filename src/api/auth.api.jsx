// import api from "./axios";

// // POST /api/auth/login
// export const loginUser = (data) => {
//   return api.post("/auth/login", data);
// };

// // POST /api/auth/register
// export const registerUser = (data) => {
//   return api.post("/auth/register", data);
// };

// // POST /api/auth/forgot-password
// export const forgotPassword = (data) => {
//   return api.post("/auth/forgot-password", data);
// };
import api from "./axios";

// POST /api/auth/login
export const loginUser = (data) => {
  return api.post("/auth/login", data);
};

// Google OAuth redirect
export const googleLogin = () => {
  window.location.href =
    import.meta.env.VITE_API_BASE_URL.replace("/api", "") +
    "/auth/google";
};
