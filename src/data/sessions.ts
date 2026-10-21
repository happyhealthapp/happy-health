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
  /** Fillable/printable worksheet PDFs served from public/, if any exist. */
  worksheets?: WorksheetRef[];
  status: SessionStatus;
};

export type WorksheetRef = {
  /** Human label shown above the actions, e.g. "Worksheet A — Vision-to-Goals Canvas". */
  label: string;
  /** URL of the PDF, normally built from import.meta.env.BASE_URL. */
  url: string;
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
export const PITCH_URL = `${import.meta.env.BASE_URL}assignments/happy-health-pitch.pdf`;

const WORKSHOP_BASE = `${import.meta.env.BASE_URL}assignments/2026-10-14-six-month-planning-workshop`;
const SPRINT_BASE = `${import.meta.env.BASE_URL}assignments/data-driven-sprinting`;

/** Fixed, filled-in worksheets from the Six-Month Planning Workshop (session 09). */
export const WORKSHOP_WORKSHEETS: WorksheetRef[] = [
  {
    label: "Worksheet A — Vision-to-Goals Canvas",
    url: `${WORKSHOP_BASE}/worksheet-a-vision-to-goals-canvas-fixed.pdf`,
  },
  {
    label: "Worksheet B — Goal Prioritiser",
    url: `${WORKSHOP_BASE}/worksheet-b-goal-prioritiser-fixed.pdf`,
  },
  {
    label: "Worksheet C — KPI Tree",
    url: `${WORKSHOP_BASE}/worksheet-c-kpi-tree-fixed.pdf`,
  },
  {
    label: "Worksheet D — Six-Month Plan on a Page",
    url: `${WORKSHOP_BASE}/worksheet-d-six-month-plan-on-a-page-fixed.pdf`,
  },
  {
    label: "Worksheet E — Accountability Sheet",
    url: `${WORKSHOP_BASE}/worksheet-e-accountability-sheet-fixed.pdf`,
  },
];

/** Weekly card from the Data-Driven Sprinting block (week 1: 20–24 Oct 2026). */
export const SPRINT_WORKSHEETS: WorksheetRef[] = [
  {
    label: "Weekly Card — Week 1 (20–24 Oct)",
    url: `${SPRINT_BASE}/weekly-card-week-1.pdf`,
  },
];

/** Confirmed sessions (any order — rendered sorted by date). */
export const sessions: Session[] = [
  {
    n: 1,
    date: "2026-09-25",
    topic: "Business Model Canvas",
    mentor: "Faizan Lagari",
    folder: "2026-09-25-business-model-canvas",
    status: "done",
  },
  {
    n: 2,
    date: "2026-09-28",
    topic: "Accounts & Finance",
    mentor: "Dr. Mohsin Ali",
    folder: "2026-09-28-accounts-and-finance",
    status: "done",
  },
  {
    n: 9,
    date: "2026-10-14",
    topic: "Six-Month Planning Workshop",
    mentor: "",
    folder: "2026-10-14-six-month-planning-workshop",
    worksheets: WORKSHOP_WORKSHEETS,
    status: "done",
  },
  {
    n: 10,
    date: "2026-10-20",
    topic: "Data-Driven Sprinting",
    mentor: "",
    folder: "2026-10-20-data-driven-sprinting",
    worksheets: SPRINT_WORKSHEETS,
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
