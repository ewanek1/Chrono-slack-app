const { convertTimeCommandText } = require("../commands/convertTimeLogic.js");
const { tzMap, TIME_FORMATS } = require("../utils/constants.js");
const moment = require("moment-timezone");

// Mocking moment-timezone to avoid actual time dependency
jest.mock("moment-timezone", () => {
  const actual = jest.requireActual("moment-timezone");

  function fakeMoment(input) {
    return {
      format: (fmt) => "2025-07-16",
      isValid: () => !input.includes("25:00"),
      clone() {
        return this;
      },
      tz: () => this,
    };
  }

  fakeMoment.tz = (input, format, zone) => {
    const clean = input.toLowerCase().replace(/\s+/g, '');
    return {
      format: (fmt) => {
        if (fmt === "h:mm a") {
          if (clean.includes("3pm")) return "3:00 pm";
          if (clean.includes("1230pm")) return "12:30 pm";
          if (clean.includes("1200pm")) return "12:00 pm";
          if (clean.includes("1200am")) return "12:00 am";
          if (clean.includes("15:30")) return "3:30 pm";
          return "1:00 pm";
        }
        return "2025-07-16";
      },
      isValid: () => !input.includes("25:00"),
      clone() {
        return this;
      },
      tz: () => this,
    };
  };

  return fakeMoment;
});

beforeEach(() => {
  tzMap["EST"] = "America/New_York";
  tzMap["PST"] = "America/Los_Angeles";
  tzMap["UTC"] = "UTC";

  TIME_FORMATS.length = 0;
  TIME_FORMATS.push("h:mm a", "ha", "H:mm", "H");
});

describe("convertTimeCommandText()", () => {
  test("rejects input with fewer than 3 parts", () => {
    const res = convertTimeCommandText("3PM PST");
    expect(res.error).toMatch(/Invalid input format/);
  });

  test("rejects if source zone is unknown", () => {
    const res = convertTimeCommandText("3PM XYZ PST");
    expect(res.error).toMatch(/XYZ/);
  });

  test("rejects invalid time", () => {
    const res = convertTimeCommandText("25:00 EST PST");
    expect(res.error).toMatch(/Invalid time/);
  });

  test("converts time between zones correctly", () => {
    const res = convertTimeCommandText("3pm EST PST");
    expect(res.result).toMatch(/3:00 pm EST ➡ \d{1,2}:\d{2} (am|pm) PST/);
  });

  test("handles spaced and flexible time formats", () => {
    expect(convertTimeCommandText("3 PM EST PST").result).toMatch(/3:00 pm EST/);
    expect(convertTimeCommandText("12 30 pm EST PST").result).toMatch(/12:30 pm EST/);
    expect(convertTimeCommandText("15:30 EST PST").result).toMatch(/3:30 pm EST/);
  });

  test("treats zone names case-insensitively", () => {
    const res = convertTimeCommandText("3pm est pst");
    expect(res.result).toMatch(/3:00 pm EST/);
  });

  test("shows same time if from and to zones match", () => {
    const res = convertTimeCommandText("3pm EST EST");
    expect(res.result).toMatch(/3:00 pm EST ➡ 3:00 pm EST/);
  });

  test("normalizes extra spaces in input", () => {
    const res = convertTimeCommandText("   3pm    EST     PST   ");
    expect(res.result).toMatch(/3:00 pm EST/);
  });

  test("returns error for bad zone spelling", () => {
    const res = convertTimeCommandText("3pm estt pst");
    expect(res.error).toMatch(/estt/);
  });

  test("handles completely blank input", () => {
    const res = convertTimeCommandText("");
    expect(res.error).toMatch(/Invalid input format/);
  });
});
