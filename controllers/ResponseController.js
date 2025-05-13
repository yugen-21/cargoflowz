require("dotenv").config();
const axios = require("axios");
const Response = require("../models/responses");
const Enquiry = require("../models/enquiries");
const filterMatchingResponses = require("../utils/filterResponses");
const endpoint = process.env.ENDPOINT;
let rankedResponses;
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

  static async fetchTopResponses(req, res) {
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
      });
      const filtered = filterMatchingResponses(responses, enquiry);
      if (filtered.length == 0) {
        return res.send({
          message: "No matching responses for this enquiry",
        });
      }
      const plainResponses = filtered.map((r) => r.toJSON());
      try {
        const response = await axios.post(
          `${endpoint}/rank-top5`,
          plainResponses
        );

        const rankedIds = response.data;

        console.log("Mistral AI response: ", rankedIds);
        const responses = await Response.findAll({
          where: { id: rankedIds },
        });
        const responseMap = {};
        responses.forEach((r) => {
          responseMap[r.id] = r.toJSON();
        });

        rankedResponses = rankedIds.map((id) => responseMap[id]);
        return res.status(200).json({
          message: "Top ranked responses",
          results: rankedResponses,
        });
      } catch (err) {
        console.log("Error fetching top 5: ", err.message);
        return res.status(500).send("Failed to rank and return responses");
      }
    } catch (err) {
      console.error("Enquiry fetch error:", err.message);
      return res.status(500).send("Server error");
    }
  }
}
module.exports = ResponseController;
