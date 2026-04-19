import jwt from "jsonwebtoken";

/**
 * Generate JWT Token
 * Creates a signed JWT token with user payload
 */
export function generateToken(payload) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES || "7d";
  if (!secret) throw new Error("JWT_SECRET missing in .env");

  return jwt.sign(payload, secret, { expiresIn });
}