const { App } = require('@slack/bolt');

// Import slash commands
const convertCommand = require("./commands/convertTime");
const timeForCommand = require("./commands/timeFor");
const teamClockCommand = require("./commands/teamClock");

// Import workflows
const {
  handleTimeZoneConversionWF,
  handleUserConversionWF,
} = require("./workflows/conversionWorkflows.js");

// Initializing Bolt app with Socket Mode
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  //logLevel: LogLevel
});

// Handle app_mention events
app.event("app_mention", async ({ event, say }) => {
  await say(`Hello there, <@${event.user}>!`);
});

// Register slash commands
app.command("/convert", convertCommand);
app.command("/timefor", timeForCommand);
app.command("/teamclock", teamClockCommand);

// Register workflow functions
app.function("Time_zone_converted_WF", handleTimeZoneConversionWF);
app.function("Userconv", handleUserConversionWF);

// Start Bolt app
(async () => {
  await app.start();
  console.log("⚡️ Bolt app is running!");
})();
