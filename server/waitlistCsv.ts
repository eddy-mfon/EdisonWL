import type { WaitlistSubmission } from "../drizzle/schema";

const headings = [
  "id",
  "submitted_at_utc",
  "email",
  "full_name",
  "role",
  "problem",
  "current_process",
  "wants_beta_access",
  "suggestion",
  "notification_status",
];

function cell(value: string | number | Date | null) {
  const normalized = value instanceof Date ? value.toISOString() : String(value ?? "");
  return `"${normalized.replace(/"/g, '""')}"`;
}

/** Create a standards-compliant CSV without exposing data outside the admin-only route. */
export function buildWaitlistCsv(submissions: WaitlistSubmission[]) {
  const rows = submissions.map(submission => [
    submission.id,
    submission.createdAt,
    submission.email,
    submission.fullName,
    submission.role,
    submission.problem,
    submission.currentProcess,
    submission.betaAccess ? "yes" : "no",
    submission.indispensableFeature,
    submission.notificationStatus,
  ].map(cell).join(","));

  return `${headings.join(",")}\n${rows.join("\n")}\n`;
}
