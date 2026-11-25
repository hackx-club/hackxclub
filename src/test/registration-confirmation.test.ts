import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeRegistrationConfirmation } from "@/lib/registration-confirmation.server";
import { sendRegistrationConfirmationEmail } from "@/lib/email.server";

vi.mock("@/lib/email.server", () => ({ sendRegistrationConfirmationEmail: vi.fn() }));

const participant = {
  to: "participant@example.com",
  name: "Asha",
  college: "School",
  teamSize: 1,
  eventSlug: "hackx-1-0",
};

describe("saved registration confirmation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("waits for sending and confirms the email entered on the registration", async () => {
    let finish: ((value: { ok: true; messageId: string }) => void) | undefined;
    vi.mocked(sendRegistrationConfirmationEmail).mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    let settled = false;
    const pending = completeRegistrationConfirmation(participant).then((result) => {
      settled = true;
      return result;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    expect(sendRegistrationConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "participant@example.com" }),
    );
    if (!finish) throw new Error("Email send was not started");
    finish({ ok: true, messageId: "test-message" });
    await expect(pending).resolves.toEqual({ ok: true, emailSent: true });
  });

  it("preserves the saved registration when email sending fails", async () => {
    vi.mocked(sendRegistrationConfirmationEmail).mockResolvedValue({
      ok: false,
      error: "Authentication failed",
    });
    await expect(completeRegistrationConfirmation(participant)).resolves.toEqual({
      ok: true,
      emailSent: false,
    });
  });

  it("preserves the saved registration if sending throws", async () => {
    vi.mocked(sendRegistrationConfirmationEmail).mockRejectedValue(new Error("Connection failed"));
    await expect(completeRegistrationConfirmation(participant)).resolves.toEqual({
      ok: true,
      emailSent: false,
    });
  });
});
