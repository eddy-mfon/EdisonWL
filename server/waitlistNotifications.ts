export type WaitlistAlert = {
  id: number;
  email: string;
  suggestion?: string | null;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);
}

export function formatTelegramAlert(alert: WaitlistAlert) {
  return [
    "<b>Edison / New waitlist signal</b>",
    `<a href="mailto:${escapeHtml(alert.email)}">${escapeHtml(alert.email)}</a>`,
    "",
    `<b>Suggestion</b>\n${alert.suggestion?.trim() ? escapeHtml(alert.suggestion) : "No suggestion provided"}`,
  ].filter(Boolean).join("\n");
}

export async function notifyWaitlistSubmission(alert: WaitlistAlert) {
  const deliveryErrors: string[] = [];
  let telegramSent = false;

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

  return { telegramSent, deliveryErrors };
}
