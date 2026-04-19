import express from "express";
import {
  createImpactLog,
  getImpactLogs,
  updateImpactLog,
  deleteImpactLog,
} from "../controllers/impactLogController.js";

import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Logged-in user can create logs (log is always created for the logged-in user)
router.post("/", protect, createImpactLog);

// Logged-in user can view their logs, admin can view all logs
router.get("/", protect, getImpactLogs);

// Admin only (keep your current rule)
router.put("/:id", protect, authorizeRoles("ADMIN"), updateImpactLog);
router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteImpactLog);

export default router;