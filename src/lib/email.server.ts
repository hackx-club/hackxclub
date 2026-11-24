import nodemailer from "nodemailer";
import { hackx1, socials } from "@/content/site-content";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[character] ?? character;
  });
}

export function getEmailTransporter() {
  const user = process.env["SMTP_USER"] || "clubhackx@gmail.com";
  const pass = process.env["SMTP_PASS"]?.replace(/\s+/g, ""); // strip any spaces from app password
  if (!user || !pass) {
    console.warn("[Email] SMTP_USER or SMTP_PASS not set. Automated emails are disabled.");
    return null;
  }

  const port = Number(process.env["SMTP_PORT"] || 465);
  const secure = (process.env["SMTP_SECURE"] ?? "true") === "true" || port === 465;

  return nodemailer.createTransport({
    host: process.env["SMTP_HOST"] || "smtp.gmail.com",
    port,
    secure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user,
      pass,
    },
  });
}

export interface RegistrationEmailParams {
  to: string;
  name: string;
  college: string;
  teamSize: number;
  track?: string;
  eventSlug: string;
}

export async function sendRegistrationConfirmationEmail(params: RegistrationEmailParams) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    return { ok: false, error: "SMTP not configured" };
  }

  const fromAddress = process.env["EMAIL_FROM"] || "HackX Club <clubhackx@gmail.com>";
  const isEvent = params.eventSlug === hackx1.slug;
  const eventName = isEvent ? hackx1.name : "HackX";
  const name = escapeHtml(params.name);
  const college = escapeHtml(params.college);
  const track = escapeHtml(params.track || "");

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HackX 1.0 Registration Confirmed</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #ffffff; margin: 0; padding: 24px; }
      .container { max-width: 580px; margin: 0 auto; background: #13141c; border: 1px solid #232533; border-radius: 12px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.4); }
      .header { text-align: center; border-bottom: 1px solid #232533; padding-bottom: 24px; }
      .logo { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; }
      .badge { display: inline-block; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 9999px; padding: 4px 14px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-top: 10px; }
      .content { padding: 24px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1; }
      .card { background: #1a1c26; border-radius: 8px; padding: 18px 22px; margin: 20px 0; border-left: 4px solid #3b82f6; }
      .card-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
      .card-label { color: #94a3b8; font-weight: 500; }
      .card-value { color: #f8fafc; font-weight: 600; text-align: right; }
      .btn { display: block; text-align: center; background: #2563eb; color: #ffffff !important; padding: 13px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; margin: 24px 0; font-size: 15px; }
      .footer { font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #232533; padding-top: 20px; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
         <div class="logo">${eventName}</div>
        <div class="badge">Registration Confirmed</div>
      </div>
      <div class="content">
         <p>Hey <strong>${name}</strong>,</p>
         <p>${isEvent ? `You're officially registered for <strong>${eventName}</strong>!` : "We've saved your registration with no specific event selected."}</p>
        
        <div class="card">
          <div class="card-row">
            <span class="card-label">Participant:</span>
             <span class="card-value">${name}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Institution:</span>
             <span class="card-value">${college}</span>
          </div>
          <div class="card-row">
            <span class="card-label">Team Size:</span>
            <span class="card-value">${params.teamSize} Member(s)</span>
          </div>
          ${
             isEvent && track
              ? `<div class="card-row">
            <span class="card-label">Track:</span>
             <span class="card-value">${track}</span>
          </div>`
              : ""
          }
           ${isEvent ? `<div class="card-row">
            <span class="card-label">Event Date:</span>
             <span class="card-value">${hackx1.date}</span>
           </div>` : ""}
        </div>

         <p>For questions about your registration, contact the HackX team:</p>
         <a href="https://wa.me/919715803110" class="btn">Contact on WhatsApp</a>

        <p>If you have any questions or want to update your team members, feel free to reply directly to this email (<a href="mailto:clubhackx@gmail.com" style="color: #60a5fa;">clubhackx@gmail.com</a>).</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} HackX Club • All Rights Reserved</p>
        <p><a href="https://hackx.club" style="color: #94a3b8; text-decoration: none;">hackx.club</a> • Coimbatore, Tamil Nadu, India</p>
      </div>
    </div>
  </body>
</html>
`;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      replyTo: socials.email,
      to: params.to,
      subject: `Registration Confirmed: ${eventName}`,
      text: `Hey ${params.name},\n\n${isEvent ? `You are officially registered for ${eventName}!` : "We've saved your registration with no specific event selected."}\n\nInstitution: ${params.college}\nTeam Size: ${params.teamSize}${isEvent ? `\nTrack: ${params.track || "Not selected"}\nEvent Date: ${hackx1.date}` : ""}\n\nFor questions, reply directly to this email or reach us at ${socials.email}.\n\nBest,\nHackX Club Team`,
      html: htmlContent,
    });
    console.log(
      "[Email] Registration confirmation accepted by mail server",
    );
    return { ok: true, messageId: info.messageId };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Failed to send registration confirmation:", errorMessage);
    return { ok: false, error: errorMessage };
  }
}
