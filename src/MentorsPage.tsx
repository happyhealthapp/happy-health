import { useMemo } from "react";
import {
  FOUNDER,
  FOUNDER_EMAIL,
  STARTUP,
  VISION,
  assignmentUrl,
  byDate,
  dayLabel,
  formatDayMonth,
  sessions,
  type Session,
} from "./data/sessions";

const BASE = import.meta.env.BASE_URL;
const HOME_URL = `${BASE}home/`;

function Icon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width={18}
      height={18}
    >
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
            Open assignment <Icon />
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
          <a href={HOME_URL}>Happy Health website</a>
        </nav>
      </header>

      <main id="top">
        <section className="mentor-hero" aria-labelledby="hero-title">
          <h1 id="hero-title">{STARTUP}</h1>
          <p className="vision-statement mentor-vision">{VISION}</p>
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
