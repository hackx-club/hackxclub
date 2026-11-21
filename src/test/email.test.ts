import { describe, expect, it, vi, beforeEach } from "vitest";
import { getEmailTransporter, sendRegistrationConfirmationEmail } from "@/lib/email.server";
import nodemailer from "nodemailer";

vi.mock("nodemailer");

describe("Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env["SMTP_USER"] = "clubhackx@gmail.com";
    process.env["SMTP_PASS"] = "mockpass12345678";
    process.env["SMTP_HOST"] = "smtp.gmail.com";
    process.env["SMTP_PORT"] = "465";
  });

  it("returns null transporter when credentials are missing", () => {
    delete process.env["SMTP_USER"];
    delete process.env["SMTP_PASS"];
    expect(getEmailTransporter()).toBeNull();
  });

  it("creates a nodemailer transporter when credentials exist", () => {
    const mockCreateTransport = vi
      .spyOn(nodemailer, "createTransport")
      .mockReturnValue({} as unknown as ReturnType<typeof nodemailer.createTransport>);
    getEmailTransporter();
    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "clubhackx@gmail.com",
          pass: "mockpass12345678",
        },
      }),
    );
  });

  it("sends confirmation email with correct participant details", async () => {
    const sendMailMock = vi.fn().mockResolvedValue({ messageId: "msg-123" });
    vi.spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail: sendMailMock,
    } as unknown as ReturnType<typeof nodemailer.createTransport>);

    const result = await sendRegistrationConfirmationEmail({
      to: "participant@example.com",
      name: "Aarav",
      college: "PSG Tech",
      teamSize: 3,
      track: "AI / ML",
      eventSlug: "hackx-1-0",
    });

    expect(result.ok).toBe(true);
    expect(result.messageId).toBe("msg-123");
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "participant@example.com",
        subject: expect.stringContaining("Registration Confirmed"),
      }),
    );
  });

  it("handles email dispatch errors gracefully", async () => {
    vi.spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail: vi.fn().mockRejectedValue(new Error("Network failure")),
    } as unknown as ReturnType<typeof nodemailer.createTransport>);

    const result = await sendRegistrationConfirmationEmail({
      to: "fail@example.com",
      name: "Dev",
      college: "CIT",
      teamSize: 1,
      eventSlug: "hackx-1-0",
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Network failure");
  });
});
