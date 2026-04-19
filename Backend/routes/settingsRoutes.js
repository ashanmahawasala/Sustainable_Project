import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";

import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Allow logged-in users to read settings (if you want admin-only, add authorizeRoles("admin") here too)
router.get("/", protect, getSettings);

// Admin only update
router.put("/", protect, authorizeRoles("ADMIN"), updateSettings);

export default router;