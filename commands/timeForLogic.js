/* Handles the /time_for slash command
 * Converts a given time from the sender's timezone to a target user's timezone 
 * Expects input: '/convert <time> @user'
 */

const moment = require("moment-timezone");

/* The `convertTimeBetweenUsers` function converts between the
 * specified to and from timezone.
 */
function convertTimeBetweenUsers({ fromTz, toTz, toUserName }) {
  if (!fromTz || !toTz) {
    throw new Error("Timezones are required for conversion");
  }

  const nowInSenderTz = moment().tz(fromTz);
  if (!nowInSenderTz.isValid()) {
    throw new Error(`Invalid fromTz: ${fromTz}`);
  }

  const nowInTargetTz = nowInSenderTz.clone().tz(toTz);
  if (!nowInTargetTz.isValid()) {
    throw new Error(`Invalid toTz: ${toTz}`);
  }

  // Format times
  const fromTimeFormatted = nowInSenderTz.format("h:mm a");
  const toTimeFormatted = nowInTargetTz.format("h:mm a");

  // Timezone abbreviations
  const fromZone = nowInSenderTz.format("z");
  const toZone = nowInTargetTz.format("z");

  // Output message
  const output_message = `${fromTimeFormatted} (${fromZone}) ➡️ ${toTimeFormatted} in ${toUserName}'s time zone (${toZone})`;

  return { output_message };
}

module.exports = { convertTimeBetweenUsers };
