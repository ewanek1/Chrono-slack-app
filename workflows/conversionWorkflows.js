const moment = require("moment-timezone");
const { WebClient } = require("@slack/web-api");
const client = new WebClient(process.env.SLACK_BOT_TOKEN);
const { tzMap } = require("../utils/timeZoneMap.js");

// Gets user information
async function getUserInfo(userId) {
  const result = await client.users.info({ user: userId });
  if (!result.ok || !result.user) {
    throw new Error(`Failed to fetch user info for ${userId}`);
  }
  return result.user;
}

/* Formats a moment object into a time string and its timezone abbreviation
 * Example: 3pm EST
 */
function formatTimeWithAbbr(momentObject) {
  const formattedTime = momentObject.format("h:mm a");
  const abbr = momentObject.format('z'); // Get current abbreviation for the timezone
  return {formattedTime, abbr};
}

/* Handles the time zone conversion workflow
 * Converts a time in the sender's timezone to a target timezone
 */
async function handleTimeZoneConversionWF({ inputs, complete, fail }) {
  try {
    // Get sender user info and timezone
    const sender_user = inputs.user_id_using_wf;
    const sender_user_info = await getUserInfo(sender_user);
    const sender_user_tz = sender_user_info.tz;

    // Get unix timestamp and target timezone abbreviation
    const time_wanted_unix = inputs.current_time;  
    const tz_wanted = inputs.timezone_input.toUpperCase();
    const target_zone_name = tzMap[tz_wanted];

    // Format input time in sender's timezone
    const initialMoment = moment.unix(time_wanted_unix).tz(sender_user_tz);
    const { formattedTime: initialTimeFormatted, abbr: initialAbbr } = formatTimeWithAbbr(initialMoment);

    // Format output time in target timezone
    const outputMoment = moment.unix(time_wanted_unix).tz(target_zone_name);
    const { formattedTime: outputTimeFormatted, abbr: outputAbbr } = formatTimeWithAbbr(outputMoment);

    await complete({
      outputs: {
        finalop: `:wave: ${initialTimeFormatted} (${initialAbbr}) ➡️ ${outputTimeFormatted} (${outputAbbr})`,
      },
    });
  } catch (error) {
    console.error("Workflow failed unexpectedly:", error);
    await fail(`Workflow failed unexpectedly (error: ${error.message})`);
  }
}


/* Handles the user conversion workflow
 * Converts a time in the sender's timezone to another user's timezone 
 */
async function handleUserConversionWF({ inputs, complete, fail }) {
  try {
    // Gets users info
    const sender_user = inputs.user_of_wf;
    const target_user = inputs.user_id_to_conv;
    const sender_user_info = await getUserInfo(sender_user);
    const target_user_info = await getUserInfo(target_user);

    // Gets time and tz info 
    const time_wanted_unix = inputs.time_to_conv;
    const sender_user_tz = sender_user_info.tz;
    const target_user_tz = target_user_info.tz;

    // Formats input time 
    const initialMoment = moment.unix(time_wanted_unix).tz(sender_user_tz);
    const { formattedTime: initialTimeFormatted, abbr: initialAbbr } = formatTimeWithAbbr(initialMoment);

    // Formats output time 
    const outputMoment = moment.unix(time_wanted_unix).tz(target_user_tz);
    const { formattedTime: outputTimeFormatted, abbr: outputAbbr } = formatTimeWithAbbr(outputMoment);

    // Output DM message 
    await complete({
      outputs: {
        conv_time_op: `:wave: ${initialTimeFormatted} (${initialAbbr}) ➡️ ${outputTimeFormatted} in ${target_user_info.real_name}'s time zone (${outputAbbr})`,
      },
    });
  } catch (error) {
    console.error("Workflow failed unexpectedly:", error);
    await fail(`Workflow failed unexpectedly (error: ${error.message})`);
  }
}

// Export functions
module.exports = {
  handleTimeZoneConversionWF,
  handleUserConversionWF,
};