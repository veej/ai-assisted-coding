import { beforeEach, describe, expect, it } from "vitest";
import { ACCENTS, getBanner, setBanner } from "./banner.js";

beforeEach(() => {
  localStorage.clear();
});

describe("getBanner", () => {
  it("returns the default when no banner has been saved", () => {
    expect(getBanner()).toEqual({ message: "Welcome to Foyer", accent: "sky" });
  });

  it("returns the default when the stored payload is malformed", () => {
    localStorage.setItem("foyer.banner", "not-json");
    expect(getBanner().message).toBe("Welcome to Foyer");
  });

  it("returns the default when the stored accent is unknown", () => {
    localStorage.setItem(
      "foyer.banner",
      JSON.stringify({ message: "Hi", accent: "neon" }),
    );
    expect(getBanner().accent).toBe("sky");
  });

  it("round-trips a saved banner", () => {
    setBanner({ message: "All hands at 10", accent: "amber" });
    expect(getBanner()).toEqual({
      message: "All hands at 10",
      accent: "amber",
    });
  });
});

describe("setBanner", () => {
  it("trims whitespace from the message", () => {
    setBanner({ message: "  hi  ", accent: "sky" });
    expect(getBanner().message).toBe("hi");
  });

  it("rejects an empty or whitespace-only message", () => {
    expect(() => setBanner({ message: "", accent: "sky" })).toThrow();
    expect(() => setBanner({ message: "   ", accent: "sky" })).toThrow();
  });

  it("rejects an unknown accent", () => {
    expect(() => setBanner({ message: "hi", accent: "neon" })).toThrow();
  });

  it("accepts every accent in the palette", () => {
    for (const accent of ACCENTS) {
      setBanner({ message: "hi", accent });
      expect(getBanner().accent).toBe(accent);
    }
  });
});
