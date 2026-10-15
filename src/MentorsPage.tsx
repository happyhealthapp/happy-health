import { useMemo } from "react";
import {
  ASSIGNMENTS_URL,
  CADENCE,
  FOUNDER,
  FOUNDER_EMAIL,
  PROGRAM,
  STARTUP,
  assignmentUrl,
  byDate,
  dayLabel,
  formatDate,
  formatDayMonth,
  initials,
  sessions,
  weekStart,
  type Session,
  type SessionStatus,
} from "./data/sessions";
import { buildIcs, downloadIcs } from "./lib/ics";

const BASE = import.meta.env.BASE_URL;
const WEBSITE_URL = BASE;
const ICS_FILENAME = "happy-health-seic-schedule.ics";

const STATUS_LABEL: Record<SessionStatus, string> = {
  done: "Completed",
  draft: "In progress",
  upcoming: "Upcoming",
};

type IconName = "print" | "download" | "external";

function Icon({ name }: { name: IconName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": "true" as const,
    width: 18,
    height: 18,
  };
  if (name === "print") {
    return (
      <svg {...common}>
        <path d="M6 9V3h12v6" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
        <path d="M6 14h12v7H6z" />
      </svg>
    );
  }
  if (name === "download") {
    return (
      <svg {...common}>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function StatusBadge({ status }: { status: SessionStatus }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>;
}

function SessionCard({ session }: { session: Session }) {
  const url = assignmentUrl(session);
  return (
    <li className="session">
      <div className="session-when" title={formatDate(session.date)}>
        <span className="day-chip">{dayLabel(session.date)}</span>
        <span className="session-date">{formatDayMonth(session.date)}</span>
      </div>
      <div className="session-body">
        <div className="session-head">
          <h3>{session.topic}</h3>
          <StatusBadge status={session.status} />
        </div>
        <p className="session-mentor">
          <span className="mentor-avatar" aria-hidden="true">
            {initials(session.mentor) || "?"}
          </span>
          <span>
            <span className="mentor-role">Guest mentor</span>{" "}
            <strong>{session.mentor || "To be announced"}</strong>
          </span>
        </p>
        {url ? (
          <a className="session-link" href={url}>
            View assignment <Icon name="external" />
          </a>
        ) : (
          <span className="session-pending">Assignment to be linked</span>
        )}
      </div>
    </li>
  );
}

export default function MentorsPage() {
  const sorted = useMemo(() => [...sessions].sort(byDate), []);

  const weeks = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const session of sorted) {
      const key = weekStart(session.date);
      const existing = map.get(key);
      if (existing) existing.push(session);
      else map.set(key, [session]);
    }
    return Array.from(map.entries());
  }, [sorted]);

  const websiteAbsolute = new URL(WEBSITE_URL, window.location.origin).toString();

  return (
    <>
      <header className="site-header">
        <a className="brand" href={WEBSITE_URL}>
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          <span className="brand-name">{STARTUP}</span>
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href={WEBSITE_URL}>Website</a>
          <a href={ASSIGNMENTS_URL}>Assignments</a>
        </nav>
      </header>

      <main id="top">
        <section className="mentor-hero" aria-labelledby="hero-title">
          <p className="eyebrow">{PROGRAM} · Founder program</p>
          <h1 id="hero-title">
            Mentor hub — session calendar &amp; assignments
          </h1>
          <p className="lede">
            Everything a mentor needs to follow <strong>{STARTUP}</strong>,
            founded by <strong>{FOUNDER}</strong>: the {CADENCE} training
            calendar, the guest mentor for each session, and the matching
            assignment.
          </p>
          <div className="hero-actions no-print">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.print()}
            >
              <Icon name="print" /> Print / Save as PDF
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => downloadIcs(ICS_FILENAME, buildIcs(sorted))}
            >
              <Icon name="download" /> Download schedule (.ics)
            </button>
            <a className="btn btn-ghost" href={WEBSITE_URL}>
              <Icon name="external" /> Visit website
            </a>
          </div>
        </section>

        <section className="facts" aria-label="At a glance">
          <div className="fact">
            <span className="fact-label">Founder</span>
            <span className="fact-value">{FOUNDER}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Startup</span>
            <span className="fact-value">{STARTUP}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Sessions</span>
            <span className="fact-value">{CADENCE}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Recorded</span>
            <span className="fact-value">
              {sorted.length} session{sorted.length === 1 ? "" : "s"}
            </span>
          </div>
        </section>

        <section className="calendar" aria-labelledby="calendar-title">
          <h2 id="calendar-title">Session calendar</h2>
          <p className="section-note">
            A new guest mentor trains us every {CADENCE}. Sessions are grouped
            by week.
          </p>

          {weeks.length === 0 ? (
            <p className="empty">No sessions recorded yet.</p>
          ) : (
            weeks.map(([week, items]) => (
              <div className="week" key={week}>
                <h3 className="week-label">Week of {formatDayMonth(week)}</h3>
                <ol className="session-list">
                  {items.map((session) => (
                    <SessionCard
                      key={`${session.date}-${session.n}`}
                      session={session}
                    />
                  ))}
                </ol>
              </div>
            ))
          )}
        </section>
      </main>

      <footer className="site-footer">
        <p>
          <strong>{STARTUP}</strong> · founded by {FOUNDER} · {PROGRAM} founder
          program ·{" "}
          <a href={`mailto:${FOUNDER_EMAIL}`}>{FOUNDER_EMAIL}</a>
        </p>
        <p className="muted">
          Website: <a href={WEBSITE_URL}>{websiteAbsolute}</a>
        </p>
      </footer>
    </>
  );
}
