const _ = require("lodash");

/**
 * Ranks a list of response objects based on price and delivery date proximity.
 *
 * Each response gets a score calculated from:
 * - Normalized price (lower is better)
 * - Normalized delivery date difference (earlier is better)
 * Final score = (priceWeight * normalizedPrice) + (dateWeight * normalizedDate)
 *
 * @param {Array<Object>} filtered - Array of valid response objects.
 * @param {string|Date} pickup_date - The anchor date to compare delivery dates against.
 * @param {number} weightPrice - Weight for price in scoring (default 0.5).
 * @param {number} weightDate - Weight for delivery date in scoring (default 0.5).
 * @returns {Array<Object>} Top 5 responses with lowest scores.
 */
function rankResponses(
  filtered,
  pickup_date,
  weightPrice = 0.6,
  weightDate = 0.4
) {
  if (!filtered.length) return [];

  // Normalize createdAt to date only (midnight)
  const anchorDate = new Date(pickup_date);
  anchorDate.setHours(0, 0, 0, 0);
  const anchorTime = anchorDate.getTime();

  // Extract values
  const prices = filtered.map((r) => r.price);
  const dates = filtered.map(
    (r) => new Date(r.delivery_date).getTime() - anchorTime
  );

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const dateRange = maxDate - minDate || 1;

  // Score each response
  const scored = _.map(filtered, (r, idx) => {
    const normPrice = (r.price - minPrice) / priceRange;
    const normDate = (dates[idx] - minDate) / dateRange;

    const score = normPrice * weightPrice + normDate * weightDate;

    return { ...r, score };
  });

  // Sort by score ascending, take top 5
  return _.chain(scored).orderBy("score").take(5).value();
}

module.exports = rankResponses;
