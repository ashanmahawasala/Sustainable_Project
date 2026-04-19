import express from "express";
import {
  getSriLankaHolidays,
  getNextSriLankaHoliday,
} from "../controllers/holidayController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getSriLankaHolidays);
router.get("/next", protect, getNextSriLankaHoliday);

export default router;