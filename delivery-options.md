# Waitlist Delivery Assessment

## Verified delivery capabilities

Telegram’s Bot API is an HTTPS API that accepts `GET` and `POST` requests and returns JSON responses. A bot token is required to call its methods, so a production implementation must keep that token out of browser code. [Telegram Bot API](https://core.telegram.org/bots/api)

Google Apps Script can expose a browser-accessible web application through `doPost(e)` and can send formatted email through `MailApp.sendEmail`, including an HTML body. This makes it a light route for email delivery, but the deployed endpoint must be protected carefully if it accepts public form traffic. [Google Web Apps](https://developers.google.com/apps-script/guides/web) · [MailApp](https://developers.google.com/apps-script/reference/mail/mail-app)

WhatsApp Cloud API is suitable for a production messaging integration but has more setup: it uses an access token, business assets, and a business phone number. The official platform also notes that template messages are generally required outside the customer service window and its pricing is message-based. It is not the free, low-friction path for internal waitlist alerts. [WhatsApp Business Platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform)

## Viable approaches

| Approach | What happens after a submission | Tradeoffs | Cost | Setup complexity |
| --- | --- | --- | --- | --- |
| Stored waitlist + email + Telegram alert | Edison stores each response, then a protected server action sends a formatted email and a Telegram notification. | Durable, searchable records and secure secrets; requires a recipient email, Telegram bot token, and destination chat ID. | Can begin without a per-submission platform fee; email delivery depends on the selected relay/account quota. | Medium |
| Lightweight Google relay + Telegram alert | The browser posts the submission to a Google Apps Script web app, which forwards formatted email and Telegram messages. | Fastest and no application database, but a public endpoint needs anti-spam controls and there is no built-in Edison submission history. | Free within Google account quotas and Telegram usage. | Low |
| Stored waitlist + WhatsApp Business alert | Edison stores the record and sends the owner an alert through WhatsApp Cloud API. | Official and scalable, but business setup, templates, and message charges make it heavier than Telegram for owner notifications. | Message-based pricing may apply. | High |
