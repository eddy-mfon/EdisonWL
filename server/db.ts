import { count, desc, eq, gte } from "drizzle-orm";
import { createHash } from "node:crypto";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertWaitlistSubmission, users, waitlistConversionEvents, waitlistRateLimits, waitlistSubmissions } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/** Store one validated public early-access signal. Notification delivery is handled separately. */
export async function createWaitlistSubmission(submission: InsertWaitlistSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const result = await db.insert(waitlistSubmissions).values(submission);
  return Number(result[0].insertId);
}

/** Find an existing early-access signal by its normalized email before attempting a new write. */
export async function getWaitlistSubmissionByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const normalizedEmail = email.trim().toLowerCase();
  const result = await db.select({ id: waitlistSubmissions.id }).from(waitlistSubmissions).where(eq(waitlistSubmissions.email, normalizedEmail)).limit(1);
  return result[0] ?? null;
}

/** Retain a compact operational outcome without storing external provider responses. */
export async function updateWaitlistNotificationStatus(id: number, notificationStatus: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.update(waitlistSubmissions).set({ notificationStatus }).where(eq(waitlistSubmissions.id, id));
}

/** Return the complete submission record set for an owner-authorized CSV export. */
export async function listWaitlistSubmissions() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  return db.select().from(waitlistSubmissions).orderBy(desc(waitlistSubmissions.createdAt));
}

/** Return registered email addresses in newest-first order for owner-authorized Telegram reporting. */
export async function listWaitlistEmails() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  return db.select({ email: waitlistSubmissions.email }).from(waitlistSubmissions).orderBy(desc(waitlistSubmissions.createdAt));
}

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 3;

function rateLimitIdentifier(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

/** Consume one durable submission attempt, allowing at most three requests per email every fifteen minutes. */
export async function consumeWaitlistRateLimit(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const now = new Date();
  const identifier = rateLimitIdentifier(email);
  const existing = await db.select().from(waitlistRateLimits).where(eq(waitlistRateLimits.identifier, identifier)).limit(1);
  const record = existing[0];

  if (!record) {
    await db.insert(waitlistRateLimits).values({ identifier, attempts: 1, windowStartedAt: now });
    return { allowed: true, retryAfterSeconds: 0 } as const;
  }

  const elapsed = now.getTime() - record.windowStartedAt.getTime();
  if (elapsed >= RATE_LIMIT_WINDOW_MS) {
    await db.update(waitlistRateLimits).set({ attempts: 1, windowStartedAt: now }).where(eq(waitlistRateLimits.identifier, identifier));
    return { allowed: true, retryAfterSeconds: 0 } as const;
  }

  if (record.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((RATE_LIMIT_WINDOW_MS - elapsed) / 1000) } as const;
  }

  await db.update(waitlistRateLimits).set({ attempts: record.attempts + 1 }).where(eq(waitlistRateLimits.identifier, identifier));
  return { allowed: true, retryAfterSeconds: 0 } as const;
}

export async function recordWaitlistConversion(submissionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.insert(waitlistConversionEvents).values({ submissionId, eventType: "waitlist_joined" });
}

/** Summarize durable waitlist performance for the public counter, owner export, and Telegram reports. */
export async function getWaitlistStats() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [[allTime], [today], [week], [conversions]] = await Promise.all([
    db.select({ value: count() }).from(waitlistSubmissions),
    db.select({ value: count() }).from(waitlistSubmissions).where(gte(waitlistSubmissions.createdAt, todayStart)),
    db.select({ value: count() }).from(waitlistSubmissions).where(gte(waitlistSubmissions.createdAt, weekStart)),
    db.select({ value: count() }).from(waitlistConversionEvents).where(eq(waitlistConversionEvents.eventType, "waitlist_joined")),
  ]);

  return {
    allTimeSubmissions: Number(allTime?.value ?? 0),
    todaySubmissions: Number(today?.value ?? 0),
    weekSubmissions: Number(week?.value ?? 0),
    trackedConversions: Number(conversions?.value ?? 0),
  };
}
