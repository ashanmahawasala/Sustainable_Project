import { body, validationResult } from "express-validator";


/**
 * Validation Error Handler Middleware
 * Catches and formats validation errors from express-validator
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg
      }))
    });
  }

  next();
}

// ===== AUTHENTICATION VALIDATORS =====

export const registerValidation = [
  body("fullName").trim().isLength({ min: 2, max: 100 }).withMessage("fullName must be 2-100 chars"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  validate
];

export const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate
];

export const verifyOtpValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("otp").trim().isLength({ min: 4, max: 10 }).withMessage("OTP is required"),
  validate
];

export const resendOtpValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  validate
];

export const forgotPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  validate
];

export const resetPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("otp").trim().isLength({ min: 4, max: 10 }).withMessage("OTP is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  validate
];

// ===== USER VALIDATORS =====

export const updateProfileValidation = [
  body("fullName").optional().trim().isLength({ min: 2, max: 100 }).withMessage("fullName must be 2-100 chars"),
  body("phone").optional().trim().isLength({ max: 30 }).withMessage("phone too long"),
  body("address").optional().isObject().withMessage("address must be an object"),
  body("profileImage").optional().isString().withMessage("profileImage must be string"),

  // recyclerDetails optional - will be ignored for USER anyway by controller
  body("recyclerDetails").optional().isObject().withMessage("recyclerDetails must be object"),
  body("recyclerDetails.businessName").optional().isLength({ min: 2, max: 100 }).withMessage("businessName 2-100 chars"),
  body("recyclerDetails.serviceArea").optional().isArray().withMessage("serviceArea must be array"),

  validate
];

export const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("currentPassword is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("newPassword must be at least 6 characters"),
  validate
];

// ===== ADMIN VALIDATORS =====

export const updateRoleValidation = [
  body("role").isIn(["USER", "RECYCLER", "ADMIN"]).withMessage("role must be USER, RECYCLER, or ADMIN"),
  validate
];

export const blockUserValidation = [
  body("isBlocked").isBoolean().withMessage("isBlocked must be boolean"),
  validate
];


// ===== RECYCLER REQUEST VALIDATORS =====

export const recyclerRequestValidation = [
  body("businessName").trim().isLength({ min: 2, max: 100 }).withMessage("businessName must be 2-100 chars"),
  body("serviceArea").optional().isArray().withMessage("serviceArea must be an array"),
  validate
];

export const reviewRecyclerRequestValidation = [
  body("status").isIn(["APPROVED", "REJECTED"]).withMessage("status must be APPROVED or REJECTED"),
  body("adminNote").optional().trim().isLength({ max: 300 }).withMessage("adminNote max 300 chars"),
  validate
];

// ===== ADMIN AUTH VALIDATORS =====

export const adminRegisterValidation = [
  body("fullName").trim().isLength({ min: 2, max: 100 }).withMessage("fullName must be 2-100 chars"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("adminKey").trim().notEmpty().withMessage("Admin key is required"),
  validate
];

export const adminLoginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate
];

export const adminForgotPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  validate
];

export const adminResetPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("otp").trim().isLength({ min: 4, max: 10 }).withMessage("OTP is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  validate
];

export const adminVerifyEmailOtpValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("otp").trim().isLength({ min: 4, max: 10 }).withMessage("OTP is required"),
  validate
];

export const adminResendOtpValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  validate
];