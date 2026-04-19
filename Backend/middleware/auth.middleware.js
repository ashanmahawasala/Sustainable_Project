import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import RevokedToken from "../models/RevokedToken.model.js";

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 * Checks for token revocation and account status
 */
export async function protect(req, res, next) {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized (no token)" });
    }

    const token = auth.split(" ")[1];

    // blacklist check (logout)
    const isRevoked = await RevokedToken.findOne({ token });
    if (isRevoked) {
      return res.status(401).json({ message: "Token revoked. Please login again." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.deletedAt) return res.status(401).json({ message: "Account deleted" });
    if (user.isBlocked) return res.status(403).json({ message: "Account blocked" });

    req.user = user;
    next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * Role Authorization Middleware
 * Checks if user has one of the required roles
 * Must be used after protect middleware
 */
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Authentication required" });

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(", ")}`
      });
    }

    next();
  };
}