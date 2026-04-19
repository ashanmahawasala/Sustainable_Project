import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    purpose: { type: String, enum: ["EMAIL_VERIFY", "RESET_PASSWORD", "ADMIN_VERIFY", "ADMIN_RESET_PASSWORD"], default: "EMAIL_VERIFY" }
  },
  { timestamps: true }
);

// auto-delete expired OTP docs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);