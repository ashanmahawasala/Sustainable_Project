import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    district: { type: String, default: "" },
    province: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "Sri Lanka" }
  },
  { _id: false }
);

const recyclerDetailsSchema = new mongoose.Schema(
  {
    // Business Information
    businessName: { type: String, default: "" },
    companyName: { type: String, default: "" },
    businessType: { type: String, default: "" }, // e.g. "E-Waste Recycler"
    yearsInBusiness: { type: Number, default: 0 },
    licenseNumber: { type: String, default: "" },
    
    // Service Information
    serviceArea: { type: [String], default: [] }, // e.g. ["Colombo", "Gampaha"]
    isVerifiedRecycler: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    
    // Performance Metrics
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalPickups: { type: Number, default: 0 },
    totalRequests: { type: Number, default: 0 },
    approvalRate: { type: Number, default: 0, min: 0, max: 100 },

    // Location for "nearby pickups" later
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0]
      }
    }
  },
  { _id: false }
);

const adminDetailsSchema = new mongoose.Schema(
  {
    permissions: {
      type: [String],
      default: ["user_management"]
      // you can expand later: ["user_management", "request_management", "analytics"]
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // Basic identity
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"]
    },

    // Auth
    passwordHash: { type: String, required: true },

    // Role-Based Access
    role: { type: String, enum: ["USER", "RECYCLER", "ADMIN"], default: "USER" },

    // Account status
    isEmailVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    // Lockout handling (brute-force protection)
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    // Profile
    phone: { type: String, default: "" },
    address: { type: addressSchema, default: () => ({}) },
    profileImage: { type: String, default: "" },

    // Tracking / soft delete
    lastLogin: { type: Date, default: null },
    deletedAt: { type: Date, default: null },

    // Role-specific details (optional, for later modules)
    recyclerDetails: { type: recyclerDetailsSchema, default: () => ({}) },
    adminDetails: { type: adminDetailsSchema, default: () => ({}) }
  },
  { timestamps: true }
);

// Indexes
// userSchema.index({ email: 1 }); // unique index is already created by Mongoose
userSchema.index({ role: 1 });
userSchema.index({ "recyclerDetails.location": "2dsphere" }, { sparse: true });

// Helper method (if you ever need it)
userSchema.methods.comparePassword = async function (candidatePassword) {
  // candidatePassword = plain password from login
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model("User", userSchema);