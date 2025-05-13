require("dotenv").config();
const Enquiry = require("../models/enquiries");
const Users = require("../models/users");
const { sendEnquiryEmail } = require("../utils/sendEnquiryEmail");
const jwt = require("jsonwebtoken");

const endpoint = process.env.ENDPOINT;

class EnquiryController {
  /**
   * Creates a new enquiry and sends it to matched providers via email.
   *
   * 1. Verifies JWT token from Authorization header
   * 2. Validates required fields in request body
   * 3. Checks if the user exists
   * 4. Saves enquiry in DB
   * 5. Finds providers by origin location
   * 6. Sends email using SendGrid dynamic template
   */
  static async create(req, res) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send("Token missing");

    try {
      await Enquiry.sync();
      let decoded;

      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        if (err === "TokenExpiredError") {
          return res.status(401).send("Token Expired!");
        }
        return res.status(401).send("Invalid Token");
      }
      const user_id = decoded.sub;

      const { origin, destination, size, pickup_date, cargo_type } = req.body;

      // Basic validations
      if (
        !origin ||
        !destination ||
        !size ||
        parseFloat(size) <= 0 ||
        !pickup_date
      ) {
        return res.status(400).send("Missing or invalid fields");
      }

      //now we will verify if user_id exists or not
      const user = await Users.findByPk(user_id);
      if (!user) {
        return res.status(404).send("User not found!");
      }

      const enquiry = await Enquiry.create({
        user_id,
        name: user.company_name,
        email: user.email,
        origin,
        destination,
        size,
        status: "pending",
        created_at: new Date(),
        pickup_date,
        cargo_type,
      });

      try {
        const response = await fetch(
          `${endpoint}/match?location=${encodeURIComponent(origin)}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch providers: ${response.statusText}`);
        }

        const matchedProviders = await response.json();
        console.log("Matched Providers:", matchedProviders);
        if (matchedProviders.length === 0) {
          console.log("No matching providers found for:", origin);
          return res
            .status(404)
            .send("No matching providers found for: ", origin);
        }
        for (let i = 0; i < matchedProviders.length; i++) {
          var counter = matchedProviders[i];
          console.log("Sending email to:", counter.email);
          await sendEnquiryEmail(counter.email, {
            provider_name: counter.name,
            company_name: user.company_name,
            company_email: user.email,
            origin: origin,
            destination: destination,
            weight: size,
            enquiry_id: enquiry.id,
            provider_email: counter.email,
          });
        }
        enquiry.status = "sent";
        await enquiry.save();
      } catch (err) {
        console.error("Error fetching or sending emails:", err);
      }
      return res
        .status(201)
        .json({ message: "Enquiry submitted and mails sent.", enquiry });
    } catch (err) {
      console.error("Enquiry error:", err);
      return res.status(500).send("Server error");
    }
  }

  /**
   * Lists all enquiries made by the authenticated user.
   *
   * 1. Verifies JWT token
   * 2. Retrieves all enquiries by user_id
   * 3. Returns them sorted by latest first
   */
  static async listUserEnquiries(req, res) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send("Token missing");

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user_id = decoded.sub;

      // Fetch all enquiries for this user
      const enquiries = await Enquiry.findAll({
        where: { user_id },
        order: [["created_at", "DESC"]],
      });

      return res.json(enquiries);
    } catch (err) {
      console.error("Error fetching user enquiries:", err);
      return res.status(500).send("Server error");
    }
  }

  /**
   * Fetches a single enquiry by its ID.
   *
   * 1. Checks if ID is provided in params
   * 2. Finds the enquiry in DB
   * 3. Returns it if found
   */
  static async fetchSingleEnquiry(req, res) {
    const { id } = req.params;

    if (!id) return res.status(400).send("Enquiry ID is required");

    try {
      const enquiry = await Enquiry.findOne({ where: { id } });
      if (!enquiry) return res.status(404).send("Enquiry not found");

      return res.json(enquiry);
    } catch (err) {
      console.error("Error fetching enquiry:", err);
      return res.status(500).send("Server error");
    }
  }
}
module.exports = EnquiryController;
