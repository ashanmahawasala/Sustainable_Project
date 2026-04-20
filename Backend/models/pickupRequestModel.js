// models/pickupRequestModel.js
import mongoose from "mongoose";

// Pickup Request Schema
const pickupRequestSchema = new mongoose.Schema(
  {
    // Customer/User id who created the request (later can be ObjectId ref User)
    userId: {
      type: String,
      required: true,
      trim: true,
    },

    // Customer email (used for status notification emails)
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Customer name (for display to recycler)
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    // Related E-waste item id (from EwasteItem component)
    // This connects pickupRequest component with the E-waste item management component
    ewasteItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EwasteItem",
      default: null,
    },

    // Simple item details (can be shown to recycler)
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    // Device category from EwasteItem (e.g., Mobile/Tablet/Laptop)
    deviceType: {
      type: String,
      default: "",
      trim: true,
    },

    // ===== NEW: store ewaste item info in pickup request =====
    condition: {
      type: String,
      default: "",
      trim: true,
    },

    age: {
      type: Number,
      default: null,
    },

    weight: {
      type: Number,
      default: null,
    },

    disposalType: {
      type: String,
      default: "",
      trim: true,
    },

    // Quantity of items
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Pickup address
    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Preferred pickup date selected by customer
    preferredDate: {
      type: Date,
      required: true,
    },

    // Status flow
    // Pending -> Approved (accepted) -> Collected -> Completed
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Collected", "Completed"],
      default: "Pending",
    },

    // Recycler who accepted this request
    recyclerId: {
      type: String, // later can be ObjectId ref User
      default: null,
      trim: true, // use the trim to remove any leading/trailing whitespace from the recyclerId string
    },

    // Date/time when recycler accepted the request
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    // This tells Mongoose to automatically add createdAt and updatedAt fields to the schema, which can be useful for tracking when pickup requests were created and last updated.
    timestamps: true,
  }
);

export default mongoose.model("PickupRequest", pickupRequestSchema);