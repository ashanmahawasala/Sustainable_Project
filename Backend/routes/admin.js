import express from "express";

/**
 * Admin Routes
 * - Public routes: Register, Verify Email, Resend OTP, Login, Forgot Password, Reset Password
 * - Protected routes: Profile, Logout, User Management, Recycler Management
 * 
 * Routes:
 *   - POST /register - Register new admin (requires admin key)
 *   - POST /verify-email - Verify email with OTP sent during registration
 *   - POST /resend-otp - Resend OTP to email
 *   - POST /login - Login admin (requires email verification first)
 *   - POST /forgot-password - Request password reset
 *   - POST /reset-password - Reset password with OTP
 *   - GET /me - Get admin profile (requires auth)
 *   - POST /logout - Logout admin (requires auth)
 *   - GET /users - Get all users (requires auth)
 *   - PATCH /users/:id/role - Update user role (requires auth)
 *   - PATCH /users/:id/block - Block/unblock user (requires auth)
 *   - DELETE /users/:id - Delete user (requires auth)
 *   - GET /recycler-requests - Get all recycler requests (requires auth)
 *   - PATCH /recycler-requests/:id - Review recycler request (requires auth)
 */

// Controllers
import {
  adminRegister,
  adminVerifyEmailOtp,
  adminResendOtp,
  adminLogin,
  adminLogout,
  getAdminProfile,
  adminForgotPassword,
  adminResetPassword,
  updateAdminProfile,
  changeAdminPassword,
  deleteAdminProfile,
  getAllUsers,
  updateUserRole,
  blockUser,
  deleteUser,
  getRecyclerRequests,
  reviewRecyclerRequest
} from "../controllers/admin.controller.js";

// Middleware
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

// Validations
import { 
  adminRegisterValidation,
  adminLoginValidation,
  adminVerifyEmailOtpValidation,
  adminResendOtpValidation,
  adminForgotPasswordValidation,
  adminResetPasswordValidation,
  updateRoleValidation, 
  blockUserValidation,
  reviewRecyclerRequestValidation 
} from "../middleware/validators.js";

const router = express.Router();

// ===== PUBLIC ADMIN AUTH ROUTES (No authentication required) =====
router.post("/register", adminRegisterValidation, adminRegister);
router.post("/verify-email", adminVerifyEmailOtpValidation, adminVerifyEmailOtp);
router.post("/resend-otp", adminResendOtpValidation, adminResendOtp);
router.post("/login", adminLoginValidation, adminLogin);
router.post("/forgot-password", adminForgotPasswordValidation, adminForgotPassword);
router.post("/reset-password", adminResetPasswordValidation, adminResetPassword);

// ===== PROTECTED ADMIN ROUTES (Authentication & ADMIN role required) =====
router.use(protect);
router.use(authorizeRoles("ADMIN"));

// Admin Profile Routes
router.get("/me", getAdminProfile);
router.patch("/update-profile", updateAdminProfile);
router.post("/change-password", changeAdminPassword);
router.delete("/profile", deleteAdminProfile);
router.post("/logout", adminLogout);

// ===== ADMIN USER MANAGEMENT ROUTES =====
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateRoleValidation, updateUserRole);
router.patch("/users/:id/block", blockUserValidation, blockUser);
router.delete("/users/:id", deleteUser);

// ===== ADMIN RECYCLER MANAGEMENT ROUTES =====
router.get("/recycler-requests", getRecyclerRequests);
router.patch("/recycler-requests/:id", reviewRecyclerRequestValidation, reviewRecyclerRequest);

export default router;