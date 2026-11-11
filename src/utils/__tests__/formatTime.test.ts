import { formatTime } from "@/utils/formatTime";

describe("formatTime", () => {
  it("formats milliseconds as zero-padded mm:ss", () => {
    expect(formatTime(1000)).toBe("00:01");
    expect(formatTime(65_000)).toBe("01:05");
    expect(formatTime(600_000)).toBe("10:00");
  });

  it("truncates partial seconds instead of rounding", () => {
    expect(formatTime(999)).toBe("00:00");
    expect(formatTime(59_999)).toBe("00:59");
  });

  it("does not wrap minutes at one hour", () => {
    expect(formatTime(3_600_000)).toBe("60:00");
    expect(formatTime(6_005_000)).toBe("100:05");
  });

  it("returns 00:00 for 0", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("returns 00:00 for falsy input", () => {
    expect(formatTime(NaN)).toBe("00:00");
    expect(formatTime(undefined as unknown as number)).toBe("00:00");
    expect(formatTime(null as unknown as number)).toBe("00:00");
  });
});
