import EwasteItem from "../models/EwasteItem.js";
import PickupRequest from "../models/pickupRequestModel.js";

// Create new e-waste item
export const createEwasteItem = async (req, res) => {

  
  try {

    const { deviceType, brand, condition, age, weight, quantity, disposalType, pickupAddress } = req.body;

    // 🛑 Basic validation
    if (!deviceType || !brand || !condition || age == null || !weight || !quantity ||!disposalType) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const newItem = new EwasteItem({
      deviceType,
      brand,
      condition,
      age,
      weight,
      quantity,
      disposalType,
      pickupAddress: pickupAddress || null,
      owner: req.user._id,
      status: "available", // enforce default status
    });

    const savedItem = await newItem.save();

    res.status(201).json(savedItem);

  } catch (error) {
    res.status(500).json({
      message: "Server error while creating item",
      error: error.message,
    });
  }
};



// Get all e-waste items (with optional filtering)
export const getEwasteItems = async (req, res) => {
  try {
    const { deviceType } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let query = {};

    // 🔐 Role-based filtering
    if (req.user.role === "USER") {
      query.owner = req.user._id;
    }

    else if (req.user.role === "RECYCLER") {
      query.status = "available";
    }

    

    // 🔎 Optional filter
    if (deviceType) {
      query.deviceType = deviceType;
    }

    const items = await EwasteItem.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await EwasteItem.countDocuments(query);

    res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: items,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching items",
      error: error.message,
    });
  }
};




// Get single e-waste item by ID
export const getEwasteItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await EwasteItem.findById(id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Ownership rule for USER
    if (req.user.role === "USER" &&
        item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this item" });
    }

    // Recycler rule
    if (req.user.role === "RECYCLER" &&
        item.status !== "available") {
      return res.status(403).json({ message: "Recycler can only view available items" });
    }


    res.status(200).json(item);

  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching item",
      error: error.message,
    });
  }
};

// Update item
export const updateEwasteItem = async (req, res) => {
  try {
    const item = await EwasteItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // 👑 Admin → full access
    if (req.user.role === "ADMIN") {
      Object.assign(item, req.body);
      const updatedItem = await item.save();
      
      // Sync pickup requests if key fields changed
      await syncPickupRequest(updatedItem);

      return res.status(200).json(updatedItem);
    }

    // 👤 User → only own items
    if (req.user.role === "USER") {
      if (item.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Prevent user from setting status = recycled
      if (req.body.status === "recycled") {
        return res.status(403).json({ message: "Only admin can mark as recycled" });
      }

      // Allow updates to other fields
      Object.assign(item, req.body);
      const updatedItem = await item.save();

       // 🔥 SYNC pickup requests
      await syncPickupRequest(updatedItem);
      return res.status(200).json(updatedItem);
    }

    // ♻ Recycler → can only update status to picked-up
    if (req.user.role === "RECYCLER") {
      if (req.body.status !== "picked-up") {
        return res.status(403).json({ message: "Recycler can only mark items as picked-up" });
      }

      item.status = "picked-up";
      const updatedItem = await item.save();

      await syncPickupRequest(updatedItem);
      return res.status(200).json(updatedItem);
    }


  } catch (error) {
    res.status(500).json({ message: "Server error while updating item", error: error.message });
  }
};



// Delete item
export const deleteEwasteItem = async (req, res) => {
  try {
    const item = await EwasteItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // 👑 Admin → can delete any item
    if (req.user.role === "ADMIN") {
      await PickupRequest.deleteMany({ ewasteItemId: item._id });
      await item.deleteOne();
      return res.status(200).json({ message: "Item deleted successfully by admin" });
    }

    // 👤 User → can delete own items only
    if (req.user.role === "USER") {
      if (item.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to delete this item" });
      }

      await PickupRequest.deleteMany({ ewasteItemId: item._id });

      await item.deleteOne();
      return res.status(200).json({ message: "Item deleted successfully" });
    }

    // RECYCLER → no delete
    return res.status(403).json({ message: "Recycler cannot delete items" });


  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting item",
      error: error.message,
    });
  }
};

const syncPickupRequest = async (item) => {
  await PickupRequest.updateMany(
    { ewasteItemId: item._id },
    {
      itemName: `${item.brand} ${item.deviceType}`,
      condition: item.condition,
      age: item.age,
      weight: item.weight,
      quantity: item.quantity,
      disposalType: item.disposalType,
    }
  );
};