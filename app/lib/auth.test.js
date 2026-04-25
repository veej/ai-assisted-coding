import { describe, expect, it } from "vitest";
import { signIn } from "./auth.js";

describe("signIn", () => {
  it("returns the admin user when the admin credentials match", () => {
    const user = signIn("admin@foyer.local", "admin");
    expect(user).toEqual({ email: "admin@foyer.local", role: "admin" });
  });

  it("returns the regular user when the user credentials match", () => {
    const user = signIn("user@foyer.local", "user");
    expect(user).toEqual({ email: "user@foyer.local", role: "user" });
  });

  it("trims and lowercases the email before matching", () => {
    const user = signIn("  Admin@Foyer.Local  ", "admin");
    expect(user?.role).toBe("admin");
  });

  it("returns null when the password is wrong", () => {
    expect(signIn("admin@foyer.local", "nope")).toBeNull();
  });

  it("returns null when the email is unknown", () => {
    expect(signIn("ghost@foyer.local", "admin")).toBeNull();
  });

  it("returns null when arguments are not strings", () => {
    expect(signIn(undefined, "admin")).toBeNull();
    expect(signIn("admin@foyer.local", undefined)).toBeNull();
  });
});
