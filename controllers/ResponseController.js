const Response = require("../models/responses");
const Enquiry = require("../models/enquiries");
const rankResponses = require("../utils/rankResponses");
const filterMatchingResponses = require("../utils/filterResponses");
class ResponseController {
  /**
   * Creates a response (quote) for an enquiry.
   * - Validates required fields.
   * - Checks if enquiry exists.
   * - Saves the response in DB.
   * - If valid match (origin, destination, size), marks enquiry as 'responded'.
   */
  static async createResponse(req, res) {
    const {
      enquiry_id,
      provider_email,
      provider_name,
      quotation,
      approx_delivery_date,
      origin,
      destination,
      size,
    } = req.body;

    if (
      !enquiry_id ||
      !provider_email ||
      !provider_name ||
      !quotation ||
      !approx_delivery_date ||
      !origin ||
      !destination ||
      !size
    ) {
      return res.status(401).send("Missing fields!");
    }

    try {
      await Response.sync();
      const enquiry = await Enquiry.findByPk(enquiry_id);
      if (!enquiry) {
        return res.status(404).send("Enquiry not found!");
      }

      const response = await Response.create({
        enquiry_id,
        price: quotation,
        origin,
        destination,
        size,
        delivery_date: approx_delivery_date,
        provider_company: provider_name,
        provider_email,
      });
      if (response.delivery_date < enquiry.pickup_date) {
        return res.status(401).send("Invalid delivery date!");
      }
      if (
        response.size >= enquiry.size &&
        response.origin.toLowerCase().trim() ==
          enquiry.origin.toLowerCase().trim() &&
        response.destination.toLowerCase().trim() ==
          enquiry.destination.toLowerCase().trim()
      ) {
        enquiry.status = "responded";
        await enquiry.save();
      }
      return res.status(201).send({ message: "Response submitted", response });
    } catch (err) {
      console.error("Response error: ", err);
      return res.send(500).send("Server error");
    }
  }

  /**
   * Fetches top 5 ranked responses for a specific enquiry.
   * - Filters by matching origin, destination, and size.
   * - Ranks them based on price and delivery date using a scoring algorithm.
   */
  static async fetchResponses(req, res) {
    const { enquiry_id } = req.params;
    if (!enquiry_id) {
      return res.status(401).send("Missing enquiry ID");
    }

    try {
      const enquiry = await Enquiry.findOne({ where: { id: enquiry_id } });

      if (!enquiry) {
        return res.status(404).send("Enquiry not found");
      }

      const pickup_date = enquiry.pickup_date;

      const responses = await Response.findAll({
        where: { enquiry_id },
      });
      const filtered = filterMatchingResponses(responses, enquiry);
      if (filtered.length == 0) {
        return res.send({
          message: "No matching responses for this enquiry",
        });
      }

      const plainResponses = filtered.map((r) => r.toJSON());
      const topRanked = rankResponses(plainResponses, pickup_date);

      res.send({ message: "Here are the top 5 responses:", topRanked });
    } catch (err) {
      console.error("Error fetching responses:", err);
      res.status(500).send("Internal server error");
    }
  }

  /**
   * Fetches top 5 responses sorted by lowest price.
   */
  static async fetchResponsesPrice(req, res) {
    const { enquiry_id } = req.params;
    if (!enquiry_id) {
      return res.status(401).send("Missing enquiry ID");
    }

    try {
      const enquiry = await Enquiry.findOne({ where: { id: enquiry_id } });

      if (!enquiry) {
        return res.status(404).send("Enquiry not found");
      }

      const responses = await Response.findAll({
        where: { enquiry_id },
        order: [["price", "ASC"]],
      });

      const filtered = filterMatchingResponses(responses, enquiry);
      if (filtered.length === 0) {
        return res.status(200).send("No matching responses for this enquiry.");
      }

      // Limit to top 5
      const top5 = filtered.slice(0, 5);

      res.send({
        message: "Here are the top 5 responses based on price:",
        responses: top5,
      });
    } catch (err) {
      console.error("Error fetching responses:", err);
      res.status(500).send("Internal server error");
    }
  }

  /**
   * Fetches top 5 responses sorted by earliest delivery date.
   */
  static async fetchResponsesDates(req, res) {
    const { enquiry_id } = req.params;
    if (!enquiry_id) {
      return res.status(401).send("Missing enquiry ID");
    }

    try {
      const enquiry = await Enquiry.findOne({ where: { id: enquiry_id } });

      if (!enquiry) {
        return res.status(404).send("Enquiry not found");
      }

      const responses = await Response.findAll({
        where: { enquiry_id },
        order: [["delivery_date", "ASC"]],
      });

      const filtered = filterMatchingResponses(responses, enquiry);
      if (filtered.length === 0) {
        return res.status(200).send("No matching responses for this enquiry.");
      }

      // Limit to top 5
      const top5 = filtered.slice(0, 5);

      res.send({
        message: "Here are the top 5 responses based on dates:",
        responses: top5,
      });
    } catch (err) {
      console.error("Error fetching responses:", err);
      res.status(500).send("Internal server error");
    }
  }
}
module.exports = ResponseController;
