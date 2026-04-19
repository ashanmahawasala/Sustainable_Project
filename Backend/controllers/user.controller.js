import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import RecyclerRequest from "../models/RecyclerRequest.model.js";
import { shapeUserResponse } from "../utils/shapeUser.js";

/**
 * Get Current User Profile
 * Returns the profile of the authenticated user without sensitive info like passwordHash 
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is from protect middleware
    res.json({ user: shapeUserResponse(req.user) });
  } catch (err) {
    next(err);
  }
};



/**
 * Update User Profile 
 * Updates fullName, phone, and address of the authenticated user and role-specific details if applicable 
 */
export const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ base fields everyone can update
    const { fullName, phone, address, profileImage } = req.body;

    if (typeof fullName === "string" && fullName.trim().length >= 2) {
      user.fullName = fullName.trim();
    }
    if (typeof phone === "string") user.phone = phone;
    if (typeof address === "object" && address !== null) user.address = address;
    if (typeof profileImage === "string") user.profileImage = profileImage;

    // ✅ role-specific updates
    if (user.role === "RECYCLER") {
      // allow updating recycler details ONLY if RECYCLER
      const { recyclerDetails } = req.body;

      if (recyclerDetails && typeof recyclerDetails === "object") {
        // whitelist inside recyclerDetails (safe)
        const allowedRecyclerFields = [
          "businessName",
          "serviceArea", 
          "location",
          "companyName",
          "businessType",
          "yearsInBusiness",
          "licenseNumber"
        ];
        for (const key of allowedRecyclerFields) {
          if (recyclerDetails[key] !== undefined) {
            user.recyclerDetails[key] = recyclerDetails[key];
          }
        }
      }
    }

    if (user.role === "ADMIN") {
      // optional: do you want admin to update adminDetails? usually NO from public profile route.
      // if you want, whitelist it here.
    }

    await user.save();

    const fresh = await User.findById(user._id).select("-passwordHash");
    res.json({ message: "Profile updated", user: shapeUserResponse(fresh) });
  } catch (err) {
    next(err);
  }
};



/**
 * Change User Password
 * Changes the password of the authenticated user after verifying current password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword required" });
    }
    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be 6+ chars" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Current password incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete User Account
 * Soft deletes the authenticated user's account
 * Sets deletedAt timestamp and prevents login
 */
export const deleteMe = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🚫 Prevent admin self-delete
    if (user.role === "ADMIN") {
      return res.status(403).json({
        message: "Admin account cannot be self-deleted"
      });
    }

    if (user.deletedAt) {
      return res.status(400).json({ message: "Account already deleted" });
    }

    user.deletedAt = new Date();
    const result = await user.save();

    res.json({
      message: "Account deleted successfully",
      deletedAt: result.deletedAt
    });

  } catch (err) {
    next(err);
  }
};

// ===== RECYCLER REQUESTS =====

export const createRecyclerRequest = async (req, res, next) => {
  try {
    // Only USER can request
    if (req.user.role !== "USER") {
      return res.status(400).json({ message: "Only USER can request recycler promotion" });
    }

    const { businessName, serviceArea = [] } = req.body;

    // prevent duplicates
    const existing = await RecyclerRequest.findOne({ userId: req.user._id });
    if (existing && existing.status === "PENDING") {
      return res.status(400).json({ message: "Request already pending" });
    }

    // if rejected before, allow resubmit by updating same document
    const request = await RecyclerRequest.findOneAndUpdate(
      { userId: req.user._id },
      {
        businessName,
        serviceArea,
        status: "PENDING",
        adminNote: "",
        reviewedBy: null,
        reviewedAt: null
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: "Recycler request submitted", request });
  } catch (err) {
    next(err);
  }
};


// Get My Recycler Request

export const getMyRecyclerRequest = async (req, res, next) => {
  try {
    const request = await RecyclerRequest.findOne({ userId: req.user._id });
    if (!request) return res.status(404).json({ message: "No recycler request found" });

    res.json({ request });
  } catch (err) {
    next(err);
  }
};