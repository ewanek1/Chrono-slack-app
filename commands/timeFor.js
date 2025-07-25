const { WebClient } = require("@slack/web-api");
const { convertTimeBetweenUsers } = require("./timeForLogic.js"); 

/* The `timeForCommandText` function converts a given time
 * in the sender's timezone to the target user's timezone.
 */
async function timeForCommandText(text, senderId) {
  // Split input into time and user mention
  const parts = text.trim().split(" ");

  // User arg not given 
  if (parts.length !== 1) {
    return {
      error:
        "Invalid input format. Please use the `/timefor @user`\nExample: `/timefor @user`",
    };
  }

  if (!parts || parts.length === 0 || typeof parts[0] !== 'string') {
    return { error: 'Please mention a valid user like @username' };
  }

  const targetUserMention = parts[0];

  // Extract user ID from using a regular expression
  // E.g. <@U12345>
  const targetUserIdMatch = targetUserMention.match(/<@(\w+)\|?.*>/);
  console.log("Input text:", text);
  console.log("Target user mention:", targetUserMention);
  if (!targetUserIdMatch) {
    return {
      error: "Invalid user format. Please mention a user like @username.",
    };
  }

  const targetUserId = targetUserIdMatch[1];

  // Get sender + target user info from Slack
  const senderInfo = await client.users.info({ user: senderId });
  if (!senderInfo.user) {
    return { error: "Unable to get sender info" };
  }

  const targetInfo = await client.users.info({ user: targetUserId });
  if (!targetInfo.user) {
    return { error: "Unable to get target info" };
  }

  const senderTz = senderInfo.user.tz;
  const targetTz = targetInfo.user.tz;
  const targetUserName = targetInfo.user.real_name;

  const { output_message } = convertTimeBetweenUsers({
    fromTz: senderTz,
    toTz: targetTz,
    toUserName: targetUserName,
  });

  return { output_message };
}

const timeForCommand = async ({ command, ack, respond }) => {
  await ack();
  const { error, output_message } = await timeForCommandText(
    command.text,
    command.user_id
  );
  if (error) {
    await respond({ text: error });
  } else {
    await respond({ text: output_message });
  }
};

module.exports = timeForCommand;