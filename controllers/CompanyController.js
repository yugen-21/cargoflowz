// Import the function that extracts company details from the CSV file
const extractCompanyDetails = require("../utils/extractCompanyDetails");

class CompanyController {
  /**
   * Handles GET request to fetch company details by email from CSV.
   * @param {Object} req - Express request object (expects `email` in route params)
   * @param {Object} res - Express response object
   * @returns {JSON} - Returns company details if found, else an error response
   */
  static async getCompanyByName(req, res) {
    const { email } = req.params;
    if (!email) {
      return res.status(400).send("Missing company name");
    }

    try {
      const company = await extractCompanyDetails("data.csv", email);
      res.status(200).json({ message: "Company found", company });
    } catch (err) {
      console.error("Company lookup error:", err);
      res.status(404).send("Company not found in CSV");
    }
  }
}

module.exports = CompanyController;
