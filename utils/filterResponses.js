/**
 * Filters response objects to match the enquiry's size, origin, and destination.
 * Matching is case-insensitive and trimmed.
 *
 * @param {Array} responses - Array of response records.
 * @param {Object} enquiry - The enquiry object with origin, destination, and size.
 * @returns {Array} Filtered responses.
 */
function filterMatchingResponses(responses, enquiry) {
  if (!Array.isArray(responses)) return [];

  return responses.filter((r) => {
    const matchesSize = r.size >= enquiry.size;
    const matchesOrigin =
      r.origin?.toLowerCase().trim() === enquiry.origin?.toLowerCase().trim();
    const matchesDestination =
      r.destination?.toLowerCase().trim() ===
      enquiry.destination?.toLowerCase().trim();

    return matchesSize && matchesOrigin && matchesDestination;
  });
}

module.exports = filterMatchingResponses;
