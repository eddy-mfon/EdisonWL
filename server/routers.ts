import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { consumeWaitlistRateLimit, createWaitlistSubmission, getWaitlistStats, getWaitlistSubmissionByEmail, listWaitlistSubmissions, recordWaitlistConversion, updateWaitlistNotificationStatus } from "./db";
import { notifyWaitlistSubmission } from "./waitlistNotifications";
import { buildWaitlistCsv } from "./waitlistCsv";
import { configureTelegramReportingWebhook } from "./telegramReporting";
import { z } from "zod";

const waitlistSubmissionInput = z.object({
  email: z.string().trim().email().max(320),
  suggestion: z.string().trim().max(5000).optional(),
  website: z.string().max(200).optional().default(""),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  waitlist: router({
    submit: publicProcedure.input(waitlistSubmissionInput).mutation(async ({ input }) => {
      // Honeypot: real visitors never see this field. Return success without writing or notifying on bot activity.
      if (input.website.trim()) return { success: true } as const;

      const email = input.email.trim().toLowerCase();
      const existing = await getWaitlistSubmissionByEmail(email);
      if (existing) return { success: false, alreadyRegistered: true } as const;

      const rateLimit = await consumeWaitlistRateLimit(email);
      if (!rateLimit.allowed) return { success: false, rateLimited: true, retryAfterSeconds: rateLimit.retryAfterSeconds } as const;

      const id = await createWaitlistSubmission({
        email,
        fullName: "Anonymous",
        role: "Waitlist",
        problem: input.suggestion || "No suggestion provided",
        currentProcess: null,
        betaAccess: 1,
        indispensableFeature: input.suggestion || null,
        notificationStatus: "pending",
      });
      await recordWaitlistConversion(id);

      const delivery = await notifyWaitlistSubmission({ id, email, suggestion: input.suggestion });
      const notificationStatus = delivery.telegramSent ? "sent" : delivery.deliveryErrors.join("+");
      await updateWaitlistNotificationStatus(id, notificationStatus || "pending");

      const stats = await getWaitlistStats();
      return { success: true, totalSubmissions: stats.allTimeSubmissions } as const;
    }),
    publicStats: publicProcedure.query(async () => {
      const stats = await getWaitlistStats();
      return { totalSubmissions: stats.allTimeSubmissions };
    }),
    exportCsv: adminProcedure.query(async () => {
      const submissions = await listWaitlistSubmissions();
      return {
        filename: `edison-waitlist-${new Date().toISOString().slice(0, 10)}.csv`,
        csv: buildWaitlistCsv(submissions),
      };
    }),
  }),
  telegram: router({
    configureReporting: adminProcedure.mutation(async ({ ctx }) => {
      const host = ctx.req.header("x-forwarded-host") || ctx.req.header("host");
      const protocol = ctx.req.header("x-forwarded-proto")?.split(",")[0] || ctx.req.protocol || "https";
      if (!host || host.includes("manus.computer") || host.includes("localhost")) {
        return { activated: false, requiresPublishedDomain: true } as const;
      }
      const configured = await configureTelegramReportingWebhook(`${protocol}://${host}`);
      return { activated: true, requiresPublishedDomain: false, ...configured } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
