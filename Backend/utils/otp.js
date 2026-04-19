/**
 * Generate OTP
 * Creates a random 6-digit one-time password
 */
export function generateOtp() {
  // 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate OTP Expiry Date
 * Returns the expiration time for OTP based on env variable
 */
export function otpExpiryDate() {
  const mins = parseInt(process.env.OTP_EXPIRES_MIN || "10", 10);
  return new Date(Date.now() + mins * 60 * 1000);
}