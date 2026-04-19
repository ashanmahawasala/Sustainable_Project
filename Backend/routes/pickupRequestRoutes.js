//pickupRequestRoutes.js
import express from "express";
const router = express.Router();

import {
  createRequest,
  getAllRequests,
  getRequestById,
  updateStatus,
  deleteRequest,
  acceptRequest,
  getAcceptedRequests,
} from "../controllers/pickupRequestController.js";

import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

// Customer creates pickup request
router.post("/", protect, authorizeRoles("USER"), createRequest);

// Recycler/Admin view all pickup requests
router.get("/", protect, authorizeRoles("RECYCLER", "ADMIN"), getAllRequests);

// Recycler accepted pickup requests
router.get("/accepted/my", protect, authorizeRoles("RECYCLER"), getAcceptedRequests);

// Recycler/Admin view request details
router.get("/:id", protect, authorizeRoles("RECYCLER", "ADMIN"), getRequestById);

// Admin/Recycler updates status
router.put("/:id/status", protect, authorizeRoles("ADMIN", "RECYCLER"), updateStatus);

// Recycler accepts a pickup request
router.put("/:id/accept", protect, authorizeRoles("RECYCLER"), acceptRequest);

// Admin deletes pickup request
router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteRequest);

export default router;