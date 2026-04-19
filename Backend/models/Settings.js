import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // CO2 saved = weightKg * co2FactorPerKg
    co2FactorPerKg: { type: Number, default: 3 },

    // monthly progress % = thisMonthWeightKg / monthlyTargetKg * 100
    monthlyTargetKg: { type: Number, default: 50 },

    // if weightKg not provided, we use this default weight
    defaultWeightByCategory: {
      type: Map,
      of: Number,
      default: {
        Laptop: 2,
        Phone: 0.3,
        Battery: 0.2,
        Cable: 0.1,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);