import express from "express";
import {
  getOverview,
  getMonthlyTrend,
  getCategoryDistribution,
  getLeaderboard,
  getHolidayComparison,
} from "../controllers/analyticsController.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/overview", protect, getOverview);
router.get("/monthly-trend", protect, getMonthlyTrend);
router.get("/category-distribution", protect, getCategoryDistribution);
router.get("/leaderboard", protect, getLeaderboard);
router.get("/holiday-comparison", protect, getHolidayComparison);

export default router;