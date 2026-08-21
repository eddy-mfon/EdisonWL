import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Public early-access signals collected from the Edison landing page. */
export const waitlistSubmissions = mysqlTable("waitlist_submissions", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 160 }).notNull().default("Anonymous"),
  email: varchar("email", { length: 320 }).notNull(),
  role: varchar("role", { length: 64 }).notNull().default("Waitlist"),
  problem: text("problem").notNull(),
  currentProcess: text("currentProcess"),
  betaAccess: int("betaAccess").notNull().default(1),
  indispensableFeature: text("indispensableFeature"),
  notificationStatus: varchar("notificationStatus", { length: 32 }).notNull().default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WaitlistSubmission = typeof waitlistSubmissions.$inferSelect;
export type InsertWaitlistSubmission = typeof waitlistSubmissions.$inferInsert;

/** A durable, privacy-preserving submission throttle keyed by a SHA-256 email fingerprint. */
export const waitlistRateLimits = mysqlTable("waitlist_rate_limits", {
  identifier: varchar("identifier", { length: 64 }).primaryKey(),
  attempts: int("attempts").notNull().default(1),
  windowStartedAt: timestamp("windowStartedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Server-recorded conversion events provide dependable waitlist reporting without third-party analytics dependency. */
export const waitlistConversionEvents = mysqlTable("waitlist_conversion_events", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull().default("waitlist_joined"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
