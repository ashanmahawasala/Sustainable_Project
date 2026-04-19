import express from "express";

/**
 * User Routes
 * Handles authentication and user profile management
 * Routes:
 *   - POST /register - Register new user
 *   - POST /login - Login user
 *   - POST /verify-email - Verify email with OTP
 *   - POST /resend-otp - Resend OTP
 *   - POST /forgot-password - Initiate password reset
 *   - POST /reset-password - Reset password
 *   - POST /logout - Logout user
 *   - GET /me - Get current user profile
 *   - PATCH /me - Update user profile
 *   - PATCH /change-password - Change password
 *   - DELETE /me - Delete user account
 */

// Controllers
import {
  register,
  login,
  verifyEmailOtp,
  resendOtp,
  logout,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller.js";

import {
  getMe,
  updateMe,
  changePassword,
  deleteMe, // optional
  createRecyclerRequest,
  getMyRecyclerRequest
} from "../controllers/user.controller.js";

// Middleware
import { protect } from "../middleware/auth.middleware.js";

// Validations
import {
  registerValidation,
  loginValidation,
  verifyOtpValidation,
  resendOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  changePasswordValidation,
  recyclerRequestValidation
} from "../middleware/validators.js";


const router = express.Router();

// ===== AUTHENTICATION ROUTES =====
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/verify-email", verifyOtpValidation, verifyEmailOtp);
router.post("/resend-otp", resendOtpValidation, resendOtp);
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.post("/reset-password", resetPasswordValidation, resetPassword);
router.post("/logout", protect, logout);

// ===== PROFILE MANAGEMENT ROUTES =====
router.get("/me", protect, getMe);
router.patch("/me", protect, updateProfileValidation, updateMe);
router.patch("/change-password", protect, changePasswordValidation, changePassword);
router.delete("/me", protect, deleteMe);
router.post("/recycler-request", protect, recyclerRequestValidation, createRecyclerRequest);
router.get("/recycler-request/me", protect, getMyRecyclerRequest);

export default router;