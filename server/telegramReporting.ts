import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { getWaitlistStats, listWaitlistEmails } from "./db";

export const TELEGRAM_REPORT_WEBHOOK_PATH = "/api/telegram/reports";

type TelegramMessage = {
  message_id?: number;
  text?: string;
  chat?: { id?: number | string };
};

type TelegramUpdate = { message?: TelegramMessage };

function telegramToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Telegram bot token is not configured");
  return token;
}

function authorizedChatId() {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error("Telegram chat ID is not configured");
  return String(chatId);
}

/** Derives an unguessable Telegram header token without adding another user-managed secret. */
export function telegramWebhookSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Webhook signing secret is not configured");
  return createHmac("sha256", secret).update(`edison-telegram-reports:${telegramToken()}`).digest("base64url");
}

async function telegramRequest(method: string, payload: Record<string, unknown>) {
  const response = await fetch(`https://api.telegram.org/bot${telegramToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { ok?: boolean; description?: string };
  if (!response.ok || !body.ok) throw new Error(body.description || `Telegram ${method} request failed`);
}

export function isTelegramWebhookRequest(request: Request) {
  const provided = request.header("x-telegram-bot-api-secret-token") || "";
  const expected = telegramWebhookSecret();
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

function helpMessage() {
  return [
    "Edison reporting commands",
    "/emails — registered email addresses",
    "/total — total registered email addresses",
    "/help — show this guide",
  ].join("\n");
}

function number(value: number) {
  return value.toLocaleString("en-US");
}

export function formatTelegramReport(command: string, stats: Awaited<ReturnType<typeof getWaitlistStats>>, emails: string[] = []) {
  switch (command) {
    case "/total":
      return [
        "Edison / registered emails",
        `Total: ${number(stats.allTimeSubmissions)}`,
      ].join("\n");
    case "/emails":
      return emails.length ? ["Edison / registered emails", ...emails].join("\n") : "Edison / registered emails\nNo email addresses yet.";
    default:
      return helpMessage();
  }
}

function splitTelegramMessage(message: string) {
  const maximumLength = 3900;
  if (message.length <= maximumLength) return [message];

  const lines = message.split("\n");
  const chunks: string[] = [];
  let chunk = "";
  for (const line of lines) {
    const next = chunk ? `${chunk}\n${line}` : line;
    if (next.length > maximumLength && chunk) {
      chunks.push(chunk);
      chunk = line;
    } else {
      chunk = next;
    }
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

/** Reply only to the configured owner chat with deterministic waitlist summaries. */
export async function handleTelegramReportingUpdate(update: TelegramUpdate) {
  const message = update.message;
  if (!message?.chat?.id || String(message.chat.id) !== authorizedChatId()) return { handled: false } as const;

  const command = (message.text || "").trim().toLowerCase().split(/\s+/)[0]?.split("@")[0] || "/help";
  const supported = ["/emails", "/total", "/help"];
  const resolvedCommand = supported.includes(command) ? command : "/help";
  const stats = await getWaitlistStats();
  const emails = resolvedCommand === "/emails" ? (await listWaitlistEmails()).map(row => row.email) : [];
  const report = formatTelegramReport(resolvedCommand, stats, emails);

  const reportParts = splitTelegramMessage(report);
  for (let index = 0; index < reportParts.length; index += 1) {
    const text = reportParts[index];
    const messagePayload = { chat_id: authorizedChatId(), text, disable_web_page_preview: true };
    const replyToMessage = index === 0 ? message.message_id : undefined;
    try {
      await telegramRequest("sendMessage", replyToMessage ? { ...messagePayload, reply_to_message_id: replyToMessage } : messagePayload);
    } catch (error) {
      // A delayed or test-delivered update can reference a message Telegram no longer exposes.
      // Preserve the authorized report rather than silently losing it in that narrow case.
      if (!replyToMessage || !(error instanceof Error) || !error.message.toLowerCase().includes("replied not found")) throw error;
      await telegramRequest("sendMessage", messagePayload);
    }
  }
  return { handled: true } as const;
}

/** Register Telegram’s delivery URL after the app is published to a durable HTTPS origin. */
export async function configureTelegramReportingWebhook(origin: string) {
  const url = new URL(TELEGRAM_REPORT_WEBHOOK_PATH, origin).toString();
  await telegramRequest("setWebhook", {
    url,
    secret_token: telegramWebhookSecret(),
    allowed_updates: ["message"],
    drop_pending_updates: false,
  });
  return { url };
}
