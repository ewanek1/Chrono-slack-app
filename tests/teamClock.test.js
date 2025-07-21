const handler = require('../commands/teamClock.js');
const { WebClient } = require("@slack/web-api");

jest.mock("@slack/web-api");

let ack, respond;

beforeEach(() => {
  ack = jest.fn();
  respond = jest.fn();
  WebClient.mockClear();
});

describe("/teamclock command", () => {
  test("shows local time for each user in a channel", async () => {
    WebClient.mockImplementation(() => ({
      conversations: {
        members: () => Promise.resolve({ members: ['U1', 'U2'] }),
      },
      users: {
        info: ({ user }) => {
          if (user === 'U1') {
            return Promise.resolve({
              user: {
                real_name: 'User1',
                tz: 'America/New_York',
                is_bot: false,
                deleted: false,
              }
            });
          }
          if (user === 'U2') {
            return Promise.resolve({
              user: {
                real_name: 'User2',
                tz: 'America/Los_Angeles',
                is_bot: false,
                deleted: false,
              }
            });
          }
        },
      },
    }));

    await handler({
      command: { text: '', channel_id: 'C1' },
      ack,
      respond,
    });

    expect(ack).toHaveBeenCalled();
    const result = respond.mock.calls[0][0];
    expect(result).toContain('User1');
    expect(result).toContain('User2');
    expect(result).toMatch(/am|pm/i);
  });

  test("returns a message if no users are found", async () => {
    WebClient.mockImplementation(() => ({
      conversations: {
        members: () => Promise.resolve({ members: [] }),
      },
    }));

    await handler({
      command: { text: '', channel_id: 'C2' },
      ack,
      respond,
    });

    expect(respond).toHaveBeenCalled();
    expect(respond.mock.calls[0][0]).toMatch(/no users/i);
  });

  test("ignores bots and deleted accounts", async () => {
    WebClient.mockImplementation(() => ({
      conversations: {
        members: () => Promise.resolve({ members: ['U3', 'U4'] }),
      },
      users: {
        info: ({ user }) => {
          if (user === 'U3') {
            return Promise.resolve({
              user: {
                real_name: 'BotUser',
                is_bot: true,
                deleted: false,
                tz: 'UTC',
              }
            });
          }
          if (user === 'U4') {
            return Promise.resolve({
              user: {
                real_name: 'DeletedUser',
                is_bot: false,
                deleted: true,
                tz: 'UTC',
              }
            });
          }
        },
      },
    }));

    await handler({
      command: { text: '', channel_id: 'C3' },
      ack,
      respond,
    });

    const output = respond.mock.calls[0][0];
    expect(output).not.toContain('BotUser');
    expect(output).not.toContain('DeletedUser');
  });

  test("returns a friendly error if Slack API fails", async () => {
    WebClient.mockImplementation(() => ({
      conversations: {
        members: () => Promise.reject(new Error('Slack API failure')),
      },
    }));

    await handler({
      command: { text: '', channel_id: 'C4' },
      ack,
      respond,
    });

    expect(respond).toHaveBeenCalled();
    expect(respond.mock.calls[0][0]).toMatch(/sorry/i);
  });
});
