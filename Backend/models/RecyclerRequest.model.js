import mongoose from "mongoose";

const recyclerRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    // info user submits when requesting upgrade
    businessName: { type: String, required: true, trim: true },
    serviceArea: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },

    adminNote: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("RecyclerRequest", recyclerRequestSchema);