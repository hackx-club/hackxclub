import {
  sendRegistrationConfirmationEmail,
  type RegistrationEmailParams,
} from "@/lib/email.server";

// A saved registration remains successful even if its confirmation email fails.
export async function completeRegistrationConfirmation(params: RegistrationEmailParams) {
  try {
    const result = await sendRegistrationConfirmationEmail(params);
    return { ok: true as const, emailSent: result.ok };
  } catch (error) {
    console.error("[Register] Confirmation email failed:", error instanceof Error ? error.message : "Unknown error");
    return { ok: true as const, emailSent: false };
  }
}