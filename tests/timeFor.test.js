const handler = require("../commands/timeFor.js");
const { WebClient } = require("@slack/web-api");

jest.mock("@slack/web-api");

let ack, respond;

beforeEach(() => {
  ack = jest.fn();
  respond = jest.fn();
  WebClient.mockClear();
});

describe("/time_for command", () => {
  test("returns error for invalid user mention format", async () => {
    WebClient.mockImplementation(() => ({
      users: {
        info: () => Promise.resolve({
          user: { tz: "America/New_York", real_name: "User1" },
        }),
      },
    }));

    await handler({
      command: { text: "3PM invalidUser", user_id: "U1" },
      ack,
      respond,
    });

    expect(ack).toHaveBeenCalled();
    expect(respond).toHaveBeenCalledWith({
      text: "Invalid user format. Please mention a user like @username.",
    });
  });

  test("returns error for invalid time input", async () => {
    WebClient.mockImplementation(() => ({
      users: {
        info: () => Promise.resolve({
          user: { tz: "America/New_York", real_name: "User1" },
        }),
      },
    }));

    await handler({
      command: { text: "xxx <@U2>", user_id: "U1" },
      ack,
      respond,
    });

    expect(respond).toHaveBeenCalledWith({
      text: "Invalid time provided. Please check the time format.",
    });
  });

  test("returns error for missing input", async () => {
    await handler({
      command: { text: "", user_id: "U1" },
      ack,
      respond,
    });

    expect(respond).toHaveBeenCalledWith({
      text: "Invalid input format. Please use the `/time_for <time> @user`\nExample: `/time_for 3PM @username`",
    });
  });

  test("returns error when Slack provides null user", async () => {
    WebClient.mockImplementation(() => ({
      users: {
        info: ({ user }) => {
          if (user === "U1") {
            return Promise.resolve({
              user: { tz: "America/New_York", real_name: "User1" },
            });
          }
          if (user === "U9") {
            return Promise.resolve({ user: null });
          }
        },
      },
    }));

    await handler({
      command: { text: "3PM <@U9>", user_id: "U1" },
      ack,
      respond,
    });

    expect(respond).toHaveBeenCalledWith({
      text: "Unable to fetch user information from Slack.",
    });
  });

  test("throws an error if Slack API fails", async () => {
    WebClient.mockImplementation(() => ({
      users: {
        info: () => {
          throw new Error("Slack API failure");
        },
      },
    }));

    await expect(
      handler({
        command: { text: "3PM <@U2>", user_id: "U1" },
        ack,
        respond,
      })
    ).rejects.toThrow("Slack API failure");
  });
});
