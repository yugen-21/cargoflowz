const fs = require("fs");
const csv = require("csv-parser");

/**
 * Finds all contacts from a CSV file whose location matches or partially matches
 * the provided origin country. Matching is case-insensitive and token-based,
 * allowing flexible comparison (e.g., "Punjab" matches "Punjab, India").
 *
 * @param {string} originCountry - The origin location to match (e.g., "Punjab").
 * @param {string} [filePath="data.csv"] - Path to the CSV file.
 * @returns {Promise<Array<{ name: string, email: string }>>} List of matched providers.
 */
async function getContactsByCountry(originCountry, filePath = "data.csv") {
  const matches = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const location = row.LOCATION || row["location"];
        if (
          location &&
          location.toLowerCase().includes(originCountry.toLowerCase())
        ) {
          matches.push({
            name: row.NAME || row["Name"],
            email: row.EMAIL || row["Email"] || null,
          });
        }
      })
      .on("end", () => {
        resolve(matches); // final output as JSON string
      })
      .on("error", reject);
  });
}

module.exports = { getContactsByCountry };
