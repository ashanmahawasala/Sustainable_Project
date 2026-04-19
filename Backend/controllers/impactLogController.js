import ImpactLog from "../models/ImpactLog.js";
import Settings from "../models/Settings.js";

const allowedActions = ["RECYCLE", "DONATE", "SELL"];

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};

// POST /api/impact-logs
export const createImpactLog = async (req, res) => {
  try {
    const { actionType, category } = req.body;
    let { weightKg } = req.body;

    const userId = req.user._id.toString();
    const userName = req.user.name || req.user.fullName || req.user.email || "USER";

    if (!actionType || !category) {
      return res.status(400).json({
        message: "actionType and category are required",
      });
    }

    if (!allowedActions.includes(actionType)) {
      return res.status(400).json({
        message: `actionType must be one of: ${allowedActions.join(", ")}`,
      });
    }

    const settings = await getOrCreateSettings();

    if (weightKg === undefined || Number(weightKg) <= 0) {
      const defaultW = settings.defaultWeightByCategory?.get?.(category);
      weightKg = defaultW ?? 0.5;
    }

    const factor = settings.co2FactorPerKg ?? 3;
    const co2SavedKg = Number(weightKg) * factor;

    const created = await ImpactLog.create({
      userId,
      userName,
      actionType,
      category,
      weightKg: Number(weightKg),
      co2SavedKg,
    });

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/impact-logs?userId=&actionType=&category=
export const getImpactLogs = async (req, res) => {
  try {
    const { userId, actionType, category } = req.query;

    const filter = {};

    if (actionType) filter.actionType = actionType;
    if (category) filter.category = category;

    if (req.user.role === "ADMIN") {
      if (userId) filter.userId = userId;
    } else {
      filter.userId = req.user._id.toString();
    }

    const logs = await ImpactLog.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(logs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/impact-logs/:id (admin only by route)
export const updateImpactLog = async (req, res) => {
  try {
    const { weightKg } = req.body;

    if (weightKg === undefined || Number(weightKg) <= 0) {
      return res.status(400).json({ message: "weightKg must be > 0" });
    }

    const settings = await getOrCreateSettings();
    const factor = settings.co2FactorPerKg ?? 3;

    const updated = await ImpactLog.findByIdAndUpdate(
      req.params.id,
      {
        weightKg: Number(weightKg),
        co2SavedKg: Number(weightKg) * factor,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Impact log not found" });

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/impact-logs/:id (admin only by route)
export const deleteImpactLog = async (req, res) => {
  try {
    const deleted = await ImpactLog.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Impact log not found" });

    return res.status(200).json({ message: "Impact log deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};