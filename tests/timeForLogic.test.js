const { convertTimeBetweenUsers } = require('../commands/timeForLogic');

describe("convertTimeBetweenUsers()", () => {
  test("converts time correctly between time zones", () => {
    const result = convertTimeBetweenUsers({
      timeVal: "3PM",
      fromTz: "America/New_York",
      toTz: "Europe/London",
      toUserName: "Firstname",
    });

    expect(result).toHaveProperty("output_message");
    expect(result.output_message).toMatch(/➡/);
    expect(result.output_message).toMatch(/in Firstname's time zone/);
  });

  test("returns error when time string is invalid", () => {
    const res = convertTimeBetweenUsers({
      timeVal: "xyz",
      fromTz: "America/New_York",
      toTz: "Europe/London",
      toUserName: "Firstname",
    });

    expect(res).toEqual({
      error: "Invalid time provided. Please check the time format.",
    });
  });

  test("handles time in 24-hour format like 15:30", () => {
    const { output_message } = convertTimeBetweenUsers({
      timeVal: "15:30",
      fromTz: "America/New_York",
      toTz: "Europe/London",
      toUserName: "Secondname",
    });

    expect(output_message).toMatch(/➡/);
    expect(output_message).toMatch(/in Secondname's time zone/);
  });

  test("includes formatted time and zone names", () => {
    const res = convertTimeBetweenUsers({
      timeVal: "12 PM",
      fromTz: "America/Los_Angeles",
      toTz: "Asia/Tokyo",
      toUserName: "Thirdname",
    });

    expect(res.output_message).toMatch(/12:00/i);
    expect(res.output_message).toMatch(/\([A-Z]{2,4}\)/g); // e.g. (PDT)
    expect(res.output_message).toMatch(/➡/);
    expect(res.output_message).toMatch(/in Thirdname's time zone/);
  });
});
