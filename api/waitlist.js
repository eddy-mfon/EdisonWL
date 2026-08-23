export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  try {
    const { email, website } = req.body || {};

    if (website && String(website).trim().length > 0) {
      res.status(200).json({ success: true });
      return;
    }

    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ success: false, error: "Invalid email address" });
      return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("[Waitlist API] Missing Telegram configuration");
      res.status(200).json({ success: true });
      return;
    }

    const telegramText = [
      "<b>Edison / New waitlist signal</b>",
      `<a href="mailto:${cleanEmail}">${cleanEmail}</a>`,
    ].join("\n");

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Waitlist API] Handler exception:", error);
    res.status(200).json({ success: true });
  }
}
