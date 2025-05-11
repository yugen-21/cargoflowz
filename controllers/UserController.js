const Users = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateOtp = require("../utils/generateOtp");
const SendOtpEmail = require("../utils/sendOtpMail");

class UserController {
  /**
   * Registers a new user.
   * - Validates email and password
   * - Checks if user already exists
   * - Hashes password
   * - Generates OTP and stores it
   * - Sends OTP via email
   */
  static async register(req, res) {
    const { email, password, company_name, location, industry } = req.body;

    if (!email || !password)
      return res.status(400).send("Missing fields email and/or password!");

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) return res.status(400).send("Invalid email address!");

    try {
      await Users.sync();
      const existing = await Users.findOne({ where: { email } });
      if (existing) return res.status(409).send("Email already exists");

      const hashed = await bcrypt.hash(password, 10);
      const otp = generateOtp();

      await Users.create({
        email,
        password_hash: hashed,
        company_name,
        location,
        industry,
        otp_code: otp,
        is_verified: false,
      });

      await SendOtpEmail(email, otp);
      res.status(201).send("User registered. OTP sent.");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }

  /**
   * Verifies OTP sent to user's email.
   * - Checks if email exists
   * - Validates OTP match
   * - Checks OTP expiry (10 mins window)
   * - Marks user as verified
   */
  static async verifyOtp(req, res) {
    const { email, otp } = req.body;

    try {
      const user = await Users.findOne({ where: { email } });
      if (!user) return res.status(404).send("User not found");
      if (user.otp_code !== otp) return res.status(401).send("Invalid OTP");

      const now = new Date();
      const expiry = new Date(new Date(user.createdAt).getTime() + 10 * 60000);
      if (now > expiry) {
        user.otp_code = null;
        await user.save();
        return res.status(410).send("OTP expired");
      }

      user.is_verified = true;
      user.otp_code = null;
      await user.save();
      res.send("Email verified");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }

  /**
   * Logs in a user using email and password.
   * - Validates credentials
   * - Checks if email is verified
   * - Returns a JWT token on success
   */
  static async login(req, res) {
    const { email, password } = req.body;

    try {
      const user = await Users.findOne({ where: { email } });
      if (!user) return res.status(404).send("User not found");
      if (!user.is_verified) return res.status(403).send("Email not verified");

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).send("Invalid credentials");

      const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({ token });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).send("Server error");
    }
  }
}

module.exports = UserController;
