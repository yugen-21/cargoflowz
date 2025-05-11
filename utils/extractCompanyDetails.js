const fs = require("fs");
const csv = require("csv-parser");

/**
 * Extracts company details from a CSV file by matching a given email.
 *
 * @param {string} filePath - Path to the CSV file.
 * @param {string} email - Email address to look for.
 * @returns {Promise<Object>} - Resolves with the matching company object or rejects if not found.
 */
function extractCompanyDetails(filePath, email) {
  return new Promise((resolve, reject) => {
    let found = null;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (row["EMAIL"]?.toLowerCase().trim() === email.toLowerCase().trim()) {
          found = {
            name: row["NAME"],
            company_profile: row["COMPANY_PROFILE"],
            location: row["LOCATION"],
            address: row["ADDRESS"],
            establishment_time: row["ESTABLISHMENT_TIME"],
            website: row["WEBSITE"],
            contact_name: row["CONTACT_NAME"],
            email: row["EMAIL"],
          };
        }
      })
      .on("end", () => {
        if (found) resolve(found);
        else reject(new Error("Company not found"));
      })
      .on("error", (err) => reject(err));
  });
}

module.exports = extractCompanyDetails;
