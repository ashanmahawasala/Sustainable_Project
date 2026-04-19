import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";

import ewasteRoutes from "./routes/EwasteRoutes.js";
import pickupRoutes from "./routes/pickupRequestRoutes.js";
import impactLogRoutes from "./routes/impactLogRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import holidayRoutes from "./routes/holidayRoutes.js";
import usersRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();

const clientUrls = (
  process.env.CLIENT_URL ||
  "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const isAllowedVercelOrigin = (origin) => {
  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== "https:") return false;
    return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 80,
});

app.use(express.json());
app.use(limiter);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (clientUrls.includes(origin)) return callback(null, true);
      if (isAllowedVercelOrigin(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/ewaste", ewasteRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/impact-logs", impactLogRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});