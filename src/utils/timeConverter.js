/**
 * Converts time strings like "11:00PM" to cron expressions.
 */
function timeToCron(timeStr) {
    const [timePart, period] = timeStr.split(/(?=[AP]M)/i);
    let [hours, minutes] = timePart.split(':').map(Number);
  
    // Convert to 24-hour format
    if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
    if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
  
    return `${minutes} ${hours} * * *`; // cron format: "minute hour * * *"
  }
  
  module.exports = { timeToCron };