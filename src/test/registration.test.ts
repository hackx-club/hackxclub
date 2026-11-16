import { describe, expect, it } from "vitest";
import { registrationSchema } from "@/routes/register";

const ok = {
  name: "Asha",
  college: "IIT",
  phone: "9876543210",
  email: "a@b.co",
  team_size: "2",
  track: "Track 1",
  event_slug: "hackx-1-0",
};

describe("registration form", () => {
  it("accepts a complete registration", () => {
    expect(registrationSchema.safeParse(ok).success).toBe(true);
  });
  it("rejects a team larger than 4", () => {
    expect(registrationSchema.safeParse({ ...ok, team_size: "5" }).success).toBe(false);
  });
  it("allows registering with no specific event", () => {
    expect(
      registrationSchema.safeParse({ ...ok, event_slug: "general", track: undefined }).success,
    ).toBe(true);
  });
  it("rejects an unknown event", () => {
    expect(registrationSchema.safeParse({ ...ok, event_slug: "hackx-9" }).success).toBe(false);
  });
  it("rejects a bad email", () => {
    expect(registrationSchema.safeParse({ ...ok, email: "nope" }).success).toBe(false);
  });
});
