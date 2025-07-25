# Chrono

Chrono is a Slack app that helps teams coordinate across time zones. It provides simple commands to convert times, check individual availability, and view current times for team members in a channel or user group.

---

## Features

### Slash Commands

- **`/convert [time] [from_timezone] [to_timezone]`**  
  Example: `/convert 3pm est pst`  
  Converts a time between two time zones. Inputs are not case sensitive.

- **`/timefor @user`**  
  Example: `/time @user`  
  Converts a time (assumed to be your current time in your local timezone) into the target user’s time zone.

- **`/teamclock` or `/teamclock @usergroup`**  
  Displays the current time for each member in the channel or user group. Indicates general availability (e.g. before 9 AM = unavailable).

### Workflows

- **Quick Convert**  
  DM-based version of `/convert`. Enter a time and time zone, receive the converted time.

- **Teammate Time**  
  DM-based version of `/time`. Enter a time and a user to receive the converted time in their zone.

---

## Setup & Installation

### 1. Create the Slack App

1. Visit: [https://api.slack.com/apps](https://api.slack.com/apps)
2. Choose "Create New App" and "From an app manifest"
3. Select a workspace and paste the contents of `manifest.json` into the JSON input field.
4. Click Next, review, and Create.
5. Click Install to Workspace and authorize the app.

### 2. Configure Environment Variables

Create a `.env` file in the project root directory with the following:

```
SLACK_BOT_TOKEN=your-bot-token
SLACK_APP_TOKEN=your-app-level-token

```

To get these:

- **Bot Token**: Found under **OAuth & Permissions** in the app settings. Copy the "Bot User OAuth Token".
- **App Token**: Found under **Basic Information > App-Level Tokens**. Create one with `connections:write` scope.

---

### 3. Run Chrono Locally

Make sure Node.js is installed.

Run:

```bash
git clone https://github.com/yourusername/chrono.git
cd chrono
npm install
node app.js
```

(Chrono uses Socket Mode)

---

### 4. Start Using Chrono

Once the app is running and installed:

- Add the bot to a channel:
  ```
  /invite @Chrono
  ```

- Try out a command:
  ```
  /convert 2pm est pst
  ```