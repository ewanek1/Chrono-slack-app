const handler = require("../commands/teamClock.js");
const { WebClient } = require("@slack/web-api");

jest.mock("@slack/web-api");

let ack, respond;

beforeEach(() => {
  ack = jest.fn();
  respond = jest.fn();
  WebClient.mockClear();
});

describe("/teamclock command", () => {
  test("shows local time for users in the channel", async () => {
    WebClient.mockImplementation(() => ({
      conversations: {
        members: () => Promise.resolve({ members: ["U1", "U2"] }),
      },
      users: {
        info: ({ user }) => {
          if (user === "U1") {
            return Promise.resolve({
              user: {
                real_name: "User1",
                tz: "America/New_York",
                is_bot: false,
                deleted: false,
              },
            });
          }
          if (user === "U2") {
            return Promise.resolve({
              user: {
                real_name: "User2",
                tz: "America/Los_Angeles",
                is_bot: false,
                deleted: false,
              },
            });
          }
        },
      },
    }));

    await handler({
      command: { text: "", channel_id: "C1" },
      ack,
      respond,
    });

    const text = respond.mock.calls[0][0];
    expect(text).toContain("User1");
    expect(text).toContain("User2");
  });

  test("supports usergroups as input", async () => {
    WebClient.mockImplementation(() => ({
      usergroups: {
        users: {
          list: () => Promise.resolve({ users: ["U3", "U4"] }),
        },
      },
      users: {
        info: ({ user }) => {
          if (user === "U3") {
            return Promise.resolve({
              user: {
                real_name: "Olivia",
                tz: "Europe/London",
                is_bot: false,
                deleted: false,
              },
            });
          }
          if (user === "U4") {
            return Promise.resolve({
              user: {
                real_name: "Thomas",
                tz: "Asia/Tokyo",
                is_bot: false,
                deleted: false,
              },
            });
          }
        },
      },
    }));

    await handler({
      command: { text: "<!subteam^S12345>", channel_id: "C2" },
      ack,
      respond,
    });

    const out = respond.mock.calls[0][0];
    expect(out).toContain("Thomas");
    expect(out).toContain("Olivia");
  });

  test("skips deleted users and bots", async () => {
    WebClient.mockImplementation(() => ({
      conversations: {
        members: () => Promise.resolve({ members: ["U5", "U6"] }),
      },
      users: {
        info: ({ user }) => {
          if (user === "U5") {
            return Promise.resolve({
              user: { real_name: "Bot", tz: "UTC", is_bot: true, deleted: false },
            });
          }
          if (user === "U6") {
            return Promise.resolve({
              user: { real_name: "Deleted", tz: "UTC", is_bot: false, deleted: true },
            });
          }
        },
      },
    }));

    await handler({
      command: { text: "", channel_id: "C3" },
      ack,
      respond,
    });

    const result = respond.mock.calls[0][0];
    expect(result).not.toContain("Bot");
    expect(result).not.toContain("Deleted");
  });

  test("returns error if no users are found", async () => {
    WebClient.mockImplementation(() => ({
      conversations: {
        members: () => Promise.resolve({ members: [] }),
      },
    }));

    await handler({
      command: { text: "", channel_id: "C4" },
      ack,
      respond,
    });

    expect(respond).toHaveBeenCalled();
    expect(respond.mock.calls[0][0]).toMatch(/no users/i);
  });

  test("returns message if user info lookup fails", async () => {
    WebClient.mockImplementation(() => ({
      conversations: {
        members: () => Promise.resolve({ members: ["U7"] }),
      },
      users: {
        info: () => Promise.reject(new Error("API failure")),
      },
    }));

    await handler({
      command: { text: "", channel_id: "C5" },
      ack,
      respond,
    });

    expect(respond.mock.calls[0][0]).toMatch(/could not retrieve valid user/i);
  });

  test("shows error if Slack members API fails", async () => {
    WebClient.mockImplementation(() => ({
      conversations: {
        members: () => Promise.reject(new Error("fail")),
      },
    }));

    await handler({
      command: { text: "", channel_id: "C6" },
      ack,
      respond,
    });

    expect(respond.mock.calls[0][0]).toMatch(/sorry/i);
  });

  test("handles failure from usergroup API", async () => {
    WebClient.mockImplementation(() => ({
      usergroups: {
        users: {
          list: () => Promise.reject(new Error("fail")),
        },
      },
    }));

    await handler({
      command: { text: "<!subteam^S12345>", channel_id: "C7" },
      ack,
      respond,
    });

    expect(respond.mock.calls[0][0]).toMatch(/sorry/i);
  });
});
