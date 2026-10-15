/**
 * SEIC session data — the single source of truth for the mentor hub.
 *
 * Sessions run every Mon / Wed / Fri, and each one is led by a different
 * guest mentor. Add one entry per confirmed session and the calendar, the
 * week grouping, and the downloadable .ics all stay in sync automatically.
 */

export type SessionStatus = "done" | "draft" | "upcoming";

export type Session = {
  /** 1-based session number within the program. */
  n: number;
  /** ISO session date, program-local: YYYY-MM-DD. */
  date: string;
  /** Topic the guest mentor taught. */
  topic: string;
  /** Guest mentor who ran the session. "" means "to be announced". */
  mentor: string;
  /** Assignment folder under assignments/ in the repo, if one exists. */
  folder?: string;
  status: SessionStatus;
};

export const FOUNDER = "Theo";
export const FOUNDER_EMAIL = "happy_health_startup_theo@tutamail.com";
export const STARTUP = "Happy Health";
export const PROGRAM = "SEIC";
export const CADENCE = "Mon · Wed · Fri";

export const VISION =
  "Karachi's home-care agencies are expensive and piecemeal. Happy Health puts it all on one doorstep — licensed nurses, doctor home visits, and equipment like electric beds — so patients get quality care, families get peace of mind, and nurses keep more of what they earn.";

export const REPO_URL = "https://github.com/happyhealthapp/happy-health";
export const ASSIGNMENTS_URL = `${REPO_URL}/tree/main/assignments`;
export const PITCH_URL = `${import.meta.env.BASE_URL}pitch/happy-health-pitch.pdf`;

/** Confirmed sessions (any order — rendered sorted by date). */
export const sessions: Session[] = [
  {
    n: 1,
    date: "2026-09-14",
    topic: "Accounts & Finance",
    mentor: "Dr. Mohsin Ali",
    folder: "2026-09-28-accounts-and-finance",
    status: "done",
  },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}

export function byDate(a: Session, b: Session): number {
  return a.date.localeCompare(b.date);
}

export function dayLabel(iso: string): string {
  return WEEKDAYS[parseIso(iso).getUTCDay()] ?? "";
}

export function formatDate(iso: string): string {
  return parseIso(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDayMonth(iso: string): string {
  return parseIso(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** ISO date of the Monday that begins the week containing `iso`. */
export function weekStart(iso: string): string {
  const dt = parseIso(iso);
  dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
  return dt.toISOString().slice(0, 10);
}

export function assignmentUrl(s: Session): string | undefined {
  return s.folder ? `${ASSIGNMENTS_URL}/${s.folder}` : undefined;
}

export function initials(name: string): string {
  return name
    .replace(/[^A-Za-z\s.]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
