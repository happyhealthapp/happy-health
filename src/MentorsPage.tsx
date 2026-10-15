import { useMemo } from "react";
import {
  ASSIGNMENTS_URL,
  FOUNDER,
  FOUNDER_EMAIL,
  STARTUP,
  assignmentUrl,
  byDate,
  dayLabel,
  formatDayMonth,
  sessions,
  type Session,
} from "./data/sessions";
import { buildIcs, downloadIcs } from "./lib/ics";

const BASE = import.meta.env.BASE_URL;
const ICS_FILENAME = "happy-health-seic-schedule.ics";

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

function AssignmentRow({ session }: { session: Session }) {
  const url = assignmentUrl(session);
  return (
    <tr>
      <td className="assignment-date">
        <span className="day-chip">{dayLabel(session.date)}</span>
        {formatDayMonth(session.date)}
      </td>
      <td className="assignment-mentor">
        {session.mentor || "To be announced"}
      </td>
      <td className="assignment-cell">
        <span className="assignment-topic">{session.topic}</span>
        {url ? (
          <a className="assignment-link" href={url}>
            Open assignment <Icon name="external" />
          </a>
        ) : (
          <span className="assignment-pending">To be linked</span>
        )}
      </td>
    </tr>
  );
}

export default function MentorsPage() {
  const sorted = useMemo(() => [...sessions].sort(byDate), []);

  return (
    <>
      <header className="site-header">
        <a className="brand" href={BASE}>
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          <span className="brand-name">{STARTUP}</span>
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href={ASSIGNMENTS_URL}>GitHub</a>
        </nav>
      </header>

      <main id="top">
        <section className="mentor-hero" aria-labelledby="hero-title">
          <h1 id="hero-title">{STARTUP}</h1>
          <dl className="identity">
            <div className="identity-item">
              <dt>Founder</dt>
              <dd>{FOUNDER}</dd>
            </div>
            <div className="identity-item">
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${FOUNDER_EMAIL}`}>{FOUNDER_EMAIL}</a>
              </dd>
            </div>
            <div className="identity-item">
              <dt>Startup</dt>
              <dd>{STARTUP}</dd>
            </div>
          </dl>
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
          </div>
        </section>

        <section className="assignments" aria-labelledby="assignments-title">
          <h2 id="assignments-title">Assignments</h2>
          {sorted.length === 0 ? (
            <p className="empty">No assignments yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="assignment-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Mentor</th>
                    <th scope="col">Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((session) => (
                    <AssignmentRow
                      key={`${session.date}-${session.n}`}
                      session={session}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <p>
          <strong>{STARTUP}</strong> · {FOUNDER} ·{" "}
          <a href={`mailto:${FOUNDER_EMAIL}`}>{FOUNDER_EMAIL}</a>
        </p>
        <p className="muted">
          © {new Date().getFullYear()} {STARTUP}
        </p>
      </footer>
    </>
  );
}
