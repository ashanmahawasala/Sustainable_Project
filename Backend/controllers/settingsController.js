import Settings from "../models/Settings.js";
import ImpactLog from "../models/ImpactLog.js"; // 🔥 ADDED: We need this to update the old logs!

// Helper: ensure we always have one settings document
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};

// GET /api/settings
export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json(settings);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/settings
export const updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    const { co2FactorPerKg, monthlyTargetKg, defaultWeightByCategory } = req.body;

    let factorChanged = false; // 🔥 ADDED: Track if the admin actually changed the CO2 rate

    if (co2FactorPerKg !== undefined) {
      // Check if the new rate is different from the old rate
      if (settings.co2FactorPerKg !== Number(co2FactorPerKg)) {
        factorChanged = true;
      }
      settings.co2FactorPerKg = Number(co2FactorPerKg);
    }
    
    if (monthlyTargetKg !== undefined) settings.monthlyTargetKg = Number(monthlyTargetKg);
    if (defaultWeightByCategory !== undefined) settings.defaultWeightByCategory = defaultWeightByCategory;

    await settings.save();

    // 🔥 ADDED THE MAGIC FIX: If the CO2 factor changed, recalculate ALL existing logs!
    if (factorChanged) {
      const allLogs = await ImpactLog.find();
      
      for (const log of allLogs) {
        log.co2SavedKg = log.weightKg * settings.co2FactorPerKg;
        await log.save();
      }
      console.log(`Recalculated CO2 for ${allLogs.length} logs!`);
    }

    return res.status(200).json(settings);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};