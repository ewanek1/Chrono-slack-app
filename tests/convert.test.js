const handler = require('../commands/convertTime.js');
const { WebClient } = require('@slack/web-api');

jest.mock('@slack/web-api'); 

let respond, ack;

beforeEach(() => {
  respond = jest.fn();
  ack = jest.fn();
});

describe("/convert command", () => {
  test("handles a standard EST to PST conversion", async () => {
    const payload = {
      command: '/convert',
      text: '3PM EST PST',
      user_id: 'U123',
      channel_id: 'C123',
    };

    await handler({ command: payload, ack, respond });

    const output = respond.mock.calls[0][0].text;
    expect(output).toContain('➡');
    expect(output).toContain('EST');
    expect(output).toContain('PST');
  });

  test("returns error when missing a time zone", async () => {
    const payload = {
      command: '/convert',
      text: '3PM',
      user_id: 'U123',
      channel_id: 'C123',
    };

    await handler({ command: payload, ack, respond });

    expect(respond).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('Invalid input format'),
      })
    );
  });

  test("returns error for unknown source zone", async () => {
    const payload = {
      command: '/convert',
      text: '3PM XYZ PST',
      user_id: 'U123',
      channel_id: 'C123',
    };

    await handler({ command: payload, ack, respond });

    expect(respond).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("don't recognize the time zone abbreviation XYZ"),
      })
    );
  });

  test("returns error for unknown target zone", async () => {
    const payload = {
      command: '/convert',
      text: '3PM EST ABC',
      user_id: 'U123',
      channel_id: 'C123',
    };

    await handler({ command: payload, ack, respond });

    expect(respond).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("don't recognize the time zone abbreviation ABC"),
      })
    );
  });
});
