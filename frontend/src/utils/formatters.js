// frontend/src/utils/formatters.js

/**
 * Converts a total number of hours into a human-readable string (Days and Hours).
 * @param {number} totalHours - The total number of hours.
 * @returns {string} - Formatted string (e.g., "3 Days 15 Hours")
 */
export const formatHoursToDays = (totalHours) => {
  if (totalHours <= 0) return 'N/A';
  
  const hoursPerDay = 24;
  
  const days = Math.floor(totalHours / hoursPerDay);
  const remainingHours = Math.round(totalHours % hoursPerDay);

  const parts = [];
  if (days > 0) {
    parts.push(`${days} Day${days > 1 ? 's' : ''}`);
  }
  if (remainingHours > 0) {
    parts.push(`${remainingHours} Hour${remainingHours > 1 ? 's' : ''}`);
  }
  
  if (parts.length === 0) {
      return '< 1 Hour';
  }

  return parts.join(' ');
};