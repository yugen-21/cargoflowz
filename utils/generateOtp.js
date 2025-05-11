/**
 * Generates a 6-digit numeric OTP (One-Time Password).
 * Ensures that the number is always between 100000 and 999999.
 *
 * @returns {string} A 6-digit OTP as a string.
 */
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
module.exports = generateOtp;
