import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import RecyclerRequest from "../models/RecyclerRequest.model.js";
import Otp from "../models/Otp.model.js";
import RevokedToken from "../models/RevokedToken.model.js";
import { generateToken } from "../utils/generateToken.js";
import { generateOtp, otpExpiryDate } from "../utils/otp.js";
import { sendEmail } from "../utils/email.js";

/**
 * Get All Users
 * Retrieves list of all non-deleted users (admin only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    // Only return users that are NOT deleted
    const users = await User.find({ deletedAt: null }).select("-passwordHash");
    res.json({ 
      count: users.length, 
      users,
      message: "Active users retrieved successfully"
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update User Role
 * Changes the role of a user (USER, RECYCLER, ADMIN)
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowed = ["USER", "RECYCLER", "ADMIN"];

    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Use USER, RECYCLER, or ADMIN." });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.deletedAt) return res.status(400).json({ message: "Cannot modify deleted user" });

    user.role = role;
    const result = await user.save();

    const safeUser = await User.findById(result._id).select("-passwordHash");
    res.json({ message: `Role updated to ${role}`, user: safeUser });
  } catch (err) {
    next(err);
  }
};

/**
 * Block/Unblock User
 * Blocks or unblocks a user account
 * Admin can unblock users as well
 */
export const blockUser = async (req, res, next) => {
  try {
    const { isBlocked } = req.body;

    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({ message: "isBlocked must be boolean (true/false)" });
    }

    if (req.params.id === req.user._id.toString() && isBlocked === true) {
      return res.status(400).json({ message: "Cannot block your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.deletedAt) return res.status(400).json({ message: "Cannot modify deleted user" });

    user.isBlocked = isBlocked;
    const result = await user.save();

    const safeUser = await User.findById(result._id).select("-passwordHash");
    const action = isBlocked ? "blocked" : "unblocked";
    res.json({ 
      message: `User ${action} successfully`, 
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete User Account
 * Soft deletes a user account (admin only)
 * Sets deletedAt timestamp and prevents login
 */
export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (user.deletedAt) {
      return res.status(400).json({ message: "User already deleted" });
    }

    user.deletedAt = new Date();
    const result = await user.save();

    res.json({ 
      message: "User deleted successfully",
      deletedAt: result.deletedAt
    });
  } catch (err) {
    next(err);
  }
};


// ===== RECYCLER REQUESTS =====

export const getRecyclerRequests = async (req, res, next) => {
  try {
    const requests = await RecyclerRequest.find()
      .populate("userId", "fullName email role")
      .sort({ createdAt: -1 });

    res.json({ count: requests.length, requests });
  } catch (err) {
    next(err);
  }
};



// Only USER can request recycler promotion, so no need to check role here. Admin will review and approve/reject.
export const reviewRecyclerRequest = async (req, res, next) => {
  try {
    const { status, adminNote = "" } = req.body;

    const request = await RecyclerRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "PENDING") {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = status;
    request.adminNote = adminNote;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // ✅ if approved → upgrade user role + set recycler details
    if (status === "APPROVED") {
      const user = await User.findById(request.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.role = "RECYCLER";
      user.recyclerDetails.businessName = request.businessName;
      user.recyclerDetails.serviceArea = request.serviceArea;
      user.recyclerDetails.isVerifiedRecycler = true; // admin approved
      await user.save();
    }

    res.json({ message: `Request ${status.toLowerCase()}`, request });
  } catch (err) {
    next(err);
  }
};

// ===== ADMIN AUTHENTICATION =====

/**
 * Admin Registration
 * Creates a new admin account with admin key verification
 * Requires ADMIN_KEY from environment variables
 */
export const adminRegister = async (req, res, next) => {
  try {
    const { fullName, email, password, adminKey } = req.body;

    if (!fullName || !email || !password || !adminKey) {
      return res.status(400).json({ 
        message: "fullName, email, password, and adminKey are required" 
      });
    }

    const validAdminKey = process.env.ADMIN_REGISTER_KEY;
    if (!validAdminKey) {
      return res.status(500).json({ 
        message: "Admin registration is not configured" 
      });
    }

    if (adminKey !== validAdminKey) {
      return res.status(403).json({ 
        message: "Invalid admin key. Admin registration failed." 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ 
        message: "Email already registered" 
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const adminUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: "ADMIN",
      isEmailVerified: false,  // ✅ NOT auto-verified - must verify OTP first
      adminDetails: {
        permissions: [
          "user_management",
          "recycler_management",
          "analytics",
          "settings"
        ]
      }
    });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await Otp.deleteMany({ userId: adminUser._id, purpose: "ADMIN_VERIFY" });
    await Otp.create({
      userId: adminUser._id,
      otpHash,
      expiresAt: otpExpiryDate(),
      purpose: "ADMIN_VERIFY"
    });

    await sendEmail({
      to: adminUser.email,
      subject: `[ADMIN] Registration Confirmation - ${process.env.APP_NAME || "E-Waste Platform"}`,
      html: `
        <h2>Admin Account Created Successfully</h2>
        <p>Your admin account has been registered.</p>
        <p>Confirmation OTP: <b>${otp}</b></p>
        <p>This OTP expires in ${process.env.OTP_EXPIRES_MIN || 10} minutes.</p>
        <p><strong>Keep this OTP secure!</strong></p>
      `
    });

    res.status(201).json({ 
      message: "Admin account created successfully. Confirmation OTP sent to email.",
      userId: adminUser._id,
      email: adminUser.email
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Verify Email OTP
 * Verifies the OTP sent to admin's email during registration
 * Must be done before admin can login
 */
export const adminVerifyEmailOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        message: "Email and OTP are required" 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ 
      email: normalizedEmail,
      role: "ADMIN"
    });
    
    if (!user) {
      return res.status(404).json({ 
        message: "Admin account not found" 
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ 
        message: "Email is already verified. You can now login.",
        email: user.email 
      });
    }
  
    const otpDoc = await Otp.findOne({ userId: user._id, purpose: "ADMIN_VERIFY" });
    if (!otpDoc) {
      return res.status(400).json({ 
        message: "No OTP found. Please register again." 
      });
    }

    if (otpDoc.expiresAt < new Date()) {
      return res.status(400).json({ 
        message: "OTP has expired. Please request a new OTP." 
      });
    }

    const isValidOtp = await bcrypt.compare(otp.toString().trim(), otpDoc.otpHash);
    if (!isValidOtp) {
      return res.status(400).json({ 
        message: "Incorrect OTP. Please try again." 
      });
    }

    user.isEmailVerified = true;
    await user.save();
    await Otp.deleteMany({ userId: user._id, purpose: "ADMIN_VERIFY" });

    const token = generateToken({ id: user._id, role: user.role });

    res.json({
      message: "Admin email verified successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Resend OTP
 * Generates a new OTP and sends it to admin's registered email
 */
export const adminResendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({ 
        message: "Email is required" 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ 
      email: normalizedEmail,
      role: "ADMIN"
    });
    
    if (!user) {
      return res.status(404).json({ 
        message: "Admin account not found" 
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ 
        message: "Email is already verified. You can now login." 
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await Otp.deleteMany({ userId: user._id, purpose: "ADMIN_VERIFY" });
    await Otp.create({
      userId: user._id,
      otpHash,
      expiresAt: otpExpiryDate(),
      purpose: "ADMIN_VERIFY"
    });

    await sendEmail({
      to: user.email,
      subject: `[ADMIN] Resend OTP - ${process.env.APP_NAME || "E-Waste Platform"}`,
      html: `
        <h2>Admin Email Verification</h2>
        <p>Your OTP is: <b>${otp}</b></p>
        <p>This OTP expires in ${process.env.OTP_EXPIRES_MIN || 10} minutes.</p>
        <p>Use this OTP to verify your email and activate your admin account.</p>
      `
    });

    res.json({ 
      message: "OTP resent to admin email",
      email: user.email
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Login
 * Authenticates admin user and returns JWT token
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role: "ADMIN"
    });

    if (!user) {
      return res.status(401).json({ 
        message: "Invalid admin credentials" 
      });
    }

    if (user.deletedAt) {
      return res.status(401).json({ 
        message: "Admin account has been deleted" 
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ 
        message: "Admin account is blocked" 
      });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const mins = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      return res.status(429).json({ 
        message: `Account locked. Try again in ${mins} minute(s).` 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.loginAttempts = 0;
      }

      await user.save();
      return res.status(401).json({ 
        message: "Invalid admin credentials" 
      });
    }

    // ✅ CHECK EMAIL VERIFICATION - Must verify before login
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: "Email not verified. Please verify OTP first." 
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });

    res.json({
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: user.adminDetails?.permissions,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Logout
 * Revokes JWT token by adding it to blacklist
 */
export const adminLogout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ 
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await RevokedToken.create({
      token,
      userId: decoded.id,
      revokedAt: new Date(),
      expiresAt: new Date(decoded.exp * 1000)
    });

    res.json({ 
      message: "Admin logout successful" 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Admin Profile
 * Retrieves current admin's profile information
 */
export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user._id).select("-passwordHash");

    if (!admin || admin.role !== "ADMIN") {
      return res.status(404).json({ 
        message: "Admin not found" 
      });
    }

    res.json({
      message: "Admin profile retrieved",
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
        address: admin.address || {},
        profileImage: admin.profileImage,
        isEmailVerified: admin.isEmailVerified,
        permissions: admin.adminDetails?.permissions || [],
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Forgot Password
 * Initiates password reset for admin
 */
export const adminForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: "Email is required" 
      });
    }

    const admin = await User.findOne({ 
      email: email.toLowerCase(),
      role: "ADMIN"
    });

    if (!admin) {
      return res.status(404).json({ 
        message: "Admin account not found" 
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await Otp.deleteMany({ userId: admin._id, purpose: "ADMIN_RESET_PASSWORD" });
    await Otp.create({
      userId: admin._id,
      otpHash,
      expiresAt: otpExpiryDate(),
      purpose: "ADMIN_RESET_PASSWORD"
    });

    await sendEmail({
      to: admin.email,
      subject: `[ADMIN] Password Reset OTP - ${process.env.APP_NAME || "E-Waste Platform"}`,
      html: `
        <h2>Admin Password Reset</h2>
        <p>Your password reset OTP is: <b>${otp}</b></p>
        <p>This OTP expires in ${process.env.OTP_EXPIRES_MIN || 10} minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    res.json({ 
      message: "Password reset OTP sent to admin email",
      email: admin.email
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin Reset Password
 * Resets admin password using OTP
 */
export const adminResetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        message: "Email, OTP, and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters" 
      });
    }

    const admin = await User.findOne({ 
      email: email.toLowerCase(),
      role: "ADMIN"
    });

    if (!admin) {
      return res.status(404).json({ 
        message: "Admin account not found" 
      });
    }

    const otpDoc = await Otp.findOne({ 
      userId: admin._id, 
      purpose: "ADMIN_RESET_PASSWORD" 
    });

    if (!otpDoc) {
      return res.status(400).json({ 
        message: "No OTP found. Please request password reset." 
      });
    }

    if (otpDoc.expiresAt < new Date()) {
      return res.status(400).json({ 
        message: "OTP has expired. Please request a new OTP." 
      });
    }

    const isValidOtp = await bcrypt.compare(otp.toString().trim(), otpDoc.otpHash);
    if (!isValidOtp) {
      return res.status(400).json({ 
        message: "Incorrect OTP. Please try again." 
      });
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    await admin.save();

    await Otp.deleteMany({ userId: admin._id, purpose: "ADMIN_RESET_PASSWORD" });

    res.json({ 
      message: "Admin password reset successfully" 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Admin Profile
 * Updates admin's own profile information (fullName, phone, address)
 */
export const updateAdminProfile = async (req, res, next) => {
  try {
    const { fullName, phone, address } = req.body;
    const adminId = req.user._id;

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update profile fields
    if (fullName) admin.fullName = fullName;
    if (phone) admin.phone = phone;
    if (address) {
      admin.address = {
        street: address.street || admin.address?.street || '',
        city: address.city || admin.address?.city || '',
        province: address.province || admin.address?.province || '',
        postalCode: address.postalCode || admin.address?.postalCode || ''
      };
    }

    const result = await admin.save();
    const safeUser = await User.findById(result._id).select("-passwordHash");

    res.json({
      message: "Admin profile updated successfully",
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Change Admin Password
 * Changes admin's password with current password verification
 */
export const changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters" 
      });
    }

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Current password is incorrect" 
      });
    }

    // Hash and update new password
    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    await admin.save();

    // Revoke all existing tokens for this admin (force re-login)
    await RevokedToken.deleteMany({ userId: adminId });

    res.json({
      message: "Password changed successfully. Please login again."
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Admin Profile
 * Soft deletes admin's own account
 */
export const deleteAdminProfile = async (req, res, next) => {
  try {
    const adminId = req.user._id;

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Soft delete by setting deletedAt timestamp
    admin.deletedAt = new Date();
    await admin.save();

    // Revoke all tokens
    await RevokedToken.deleteMany({ userId: adminId });

    res.json({
      message: "Admin account deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};