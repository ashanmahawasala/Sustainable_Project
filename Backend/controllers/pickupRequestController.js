import PickupRequest from "../models/pickupRequestModel.js";
import { sendStatusEmail } from "../services/emailService.js";
import EwasteItem from "../models/EwasteItem.js";
import User from "../models/User.model.js"; // ✅ ADD THIS

// 🔥 NEW IMPORTS
import ImpactLog from "../models/ImpactLog.js";
import Settings from "../models/Settings.js";


// 🔥 helper function for CO2 settings
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};


// CREATE request (AUTO from ewaste item)
export const createRequest = async (req, res) => {
  try {
    const { ewasteItemId, quantity, preferredDate } = req.body;

    const userId = req.user._id;

    // 🔹 Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔹 Get ewaste item
    const item = await EwasteItem.findById(ewasteItemId);
    if (!item) {
      return res.status(404).json({ message: "E-waste item not found" });
    }

    // 🔥 Decide address
    // Decide pickup address
    let finalAddress = "";

    if (item.pickupAddress && item.pickupAddress.trim() !== "") {
      // User entered a different address in e-waste item form
      finalAddress = item.pickupAddress.trim();
    } else {
      // Use address from user profile
      const addr = user.address || {};

      finalAddress = [
        addr.street,
        addr.city,
        addr.district,
        addr.province,
        addr.country,
      ]
        .filter(Boolean)
        .join(", ")
        .trim();
    }
    // 🔹 Create pickup request
    const request = await PickupRequest.create({
      userId,
      email: user.email,
       userName: user.fullName, // ✅ ADD THIS
      ewasteItemId: item._id,
      itemName: `${item.brand} ${item.deviceType}`,
      // ===== NEW: ewaste item details saved into request =====
      condition: item.condition,
      age: item.age,
      weight: item.weight,
      disposalType: item.disposalType,

      quantity: quantity || 1,
      address: finalAddress,
      preferredDate: preferredDate || new Date(),
      status: "Pending",
    });

    // 🔹 Update item status (important)
    item.status = "requested";
    await item.save();

    return res.status(201).json(request);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const getAllRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let requests = [];

    if (role === "ADMIN") {
      requests = await PickupRequest.find().sort({ createdAt: -1 });
    } else if (role === "RECYCLER") {
      requests = await PickupRequest.find({
        $or: [
          { status: "Pending", recyclerId: null },
          { recyclerId: userId.toString() },
        ],
      }).sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// GET single request
export const getRequestById = async (req, res) => {
  try {
    const request = await PickupRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });

    return res.json(request);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// Recycler ACCEPT request
export const acceptRequest = async (req, res) => {
  try {
    const recyclerId = req.user._id;

    const request = await PickupRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });

    if (request.status !== "Pending" || request.recyclerId) {
      return res.status(400).json({ message: "Request already accepted" });
    }

    request.recyclerId = recyclerId;
    request.status = "Accepted";
    request.acceptedAt = new Date();

    const updated = await request.save();

    await sendStatusEmail({
      to: updated.email,
      itemName: updated.itemName,
      status: updated.status,
    });

    return res.json(updated);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// 🔥 UPDATE status (Admin/Recycler)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const request = await PickupRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Not found" });
    }

    // ✅ Update PickupRequest
    request.status = status;
    const updated = await request.save();

    // 🔥 IMPORTANT: Sync EwasteItem
    const item = await EwasteItem.findById(request.ewasteItemId);

    if (item) {
      if (status === "Accepted") {
        item.status = "requested";
      } else if (status === "Collected") {
        item.status = "picked-up";
      } else if (status === "Completed") {
        item.status = "recycled";
      }

      await item.save();
    }

    // 🔥 IMPACT LOG (keep your logic)
    if (status === "Completed") {
      const settings = await getOrCreateSettings();
      const factor = settings.co2FactorPerKg ?? 3;

      const weightKg = request.quantity * 0.5;
      const co2SavedKg = weightKg * factor;

      await ImpactLog.create({
        userId: request.userId, // customer
        userName: request.userName,

        recyclerId: req.user._id.toString(), // 🔥 IMPORTANT

        actionType: "RECYCLE",
        category: "EWASTE",
        weightKg,
        co2SavedKg,
      });
    }

    // 📧 Email
    await sendStatusEmail({
      to: updated.email,
      itemName: updated.itemName,
      status: updated.status,
    });

    return res.json(updated);

  } catch (error) {
    console.log("updateStatus error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};


// GET accepted requests (Recycler)
export const getAcceptedRequests = async (req, res) => {
  try {
    const recyclerId = req.user._id;

    const requests = await PickupRequest.find({
      recyclerId,
      status: "Accepted",
    }).sort({ acceptedAt: -1 });

    return res.json(requests);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// DELETE request (Admin)
export const deleteRequest = async (req, res) => {
  try {
    const deleted = await PickupRequest.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Not found" });

    return res.json({ message: "Deleted successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};