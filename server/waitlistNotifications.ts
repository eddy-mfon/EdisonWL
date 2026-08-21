import nodemailer from "nodemailer";

export type WaitlistAlert = {
  id: number;
  email: string;
  suggestion?: string | null;
};

export function getSmtpTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_FROM_EMAIL,
      pass: process.env.SMTP_APP_PASSWORD?.replace(/\s/g, ""),
    },
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);
}

export function formatWaitlistEmail(alert: WaitlistAlert) {
  const suggestion = alert.suggestion?.trim() ? escapeHtml(alert.suggestion) : "<em>No suggestion provided</em>";
  return `
    <div style="background:#080706;color:#fffdf9;padding:36px;font-family:Arial,sans-serif;max-width:720px">
      <p style="color:#ffb27a;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 12px">Edison / New signal #${alert.id}</p>
      <h1 style="font-size:28px;line-height:1.15;margin:0 0 25px">A new signal joined the waitlist.</h1>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr><td style="border-top:1px solid #3b332d;padding:13px 0;color:#bdb5ac;width:170px">Email</td><td style="border-top:1px solid #3b332d;padding:13px 0">${escapeHtml(alert.email)}</td></tr>
        <tr><td style="border-top:1px solid #3b332d;padding:13px 0;color:#bdb5ac;vertical-align:top">Suggestion</td><td style="border-top:1px solid #3b332d;padding:13px 0;line-height:1.55">${suggestion}</td></tr>
      </table>
      <p style="color:#81776e;font-size:11px;margin:28px 0 0">Information is everywhere. Execution is rare.</p>
    </div>`;
}

export function formatTelegramAlert(alert: WaitlistAlert) {
  return [
    "<b>Edison / New waitlist signal</b>",
    `<a href=\"mailto:${escapeHtml(alert.email)}\">${escapeHtml(alert.email)}</a>`,
    "",
    `<b>Suggestion</b>\n${alert.suggestion?.trim() ? escapeHtml(alert.suggestion) : "No suggestion provided"}`,
  ].filter(Boolean).join("\n");
}

export async function notifyWaitlistSubmission(alert: WaitlistAlert) {
  const deliveryErrors: string[] = [];
  let emailSent = false;
  let telegramSent = false;

  try {
    await getSmtpTransport().sendMail({
      from: `Edison Waitlist <${process.env.SMTP_FROM_EMAIL}>`,
      to: process.env.WAITLIST_RECIPIENT_EMAIL,
      subject: "Edison waitlist — new signal",
      html: formatWaitlistEmail(alert),
      text: `A new email joined the Edison waitlist: ${alert.email}. Suggestion: ${alert.suggestion || "No suggestion provided"}`,
      replyTo: alert.email,
    });
    emailSent = true;
  } catch (error) {
    console.error("[Waitlist notifications] Email failed", error);
    deliveryErrors.push("email");
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: formatTelegramAlert(alert), parse_mode: "HTML", disable_web_page_preview: true }),
    });
    const body = (await response.json()) as { ok?: boolean };
    if (!response.ok || !body.ok) throw new Error("Telegram rejected the alert");
    telegramSent = true;
  } catch (error) {
    console.error("[Waitlist notifications] Telegram failed", error);
    deliveryErrors.push("telegram");
  }

  return { emailSent, telegramSent, deliveryErrors };
}
