import { describe, expect, it } from "vitest";
import { team } from "@/content/site-content";

describe("Confirmed team identities", () => {
  it("swaps the two operations coordinators' names as requested", () => {
    expect(team.find((member) => member.key === 4)).toMatchObject({
      name: "Jagankumar",
      photo: "jagankumar",
      role: "Operations Coordinator",
    });
    expect(team.find((member) => member.key === 5)).toMatchObject({
      name: "Sujith",
      photo: "sujith",
      role: "Operations Coordinator",
    });
  });

  it("lists Sriganth in social media management with his portrait", () => {
    expect(team.find((member) => member.name === "Sriganth")).toMatchObject({
      role: "Social Media Management",
      photo: "sriganth",
    });
  });
});
