import express from "express";
import {
  createEwasteItem,
  getEwasteItems,
  getEwasteItemById,
  updateEwasteItem,
  deleteEwasteItem,
} from "../controllers/EwasteController.js";

import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

//import { mockUser } from "../middleware/mockUser.js";

const router = express.Router();

// All routes protected
router.route("/")
  .post(protect, authorizeRoles("USER"),createEwasteItem)
  .get(protect, authorizeRoles("USER", "RECYCLER", "ADMIN"),getEwasteItems);

router.route("/:id")
  .get(protect, authorizeRoles("USER", "RECYCLER", "ADMIN"),getEwasteItemById)
  .put(protect, authorizeRoles("USER", "RECYCLER", "ADMIN"), updateEwasteItem)
  .delete(protect, authorizeRoles("USER", "ADMIN"), deleteEwasteItem);

export default router;