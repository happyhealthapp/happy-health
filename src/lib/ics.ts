import type { Session } from "../data/sessions";

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Current time as an iCalendar UTC stamp: 20261015T035130Z */
function utcStamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/**
 * Build a VCALENDAR with one timed event per session, so mentors can add the
 * Mon / Wed / Fri training schedule straight into their own calendar.
 */
export function buildIcs(items: Session[], startHour = 9, endHour = 11): string {
  const pad = (value: number): string => String(value).padStart(2, "0");
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Happy Health//SEIC Mentor Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const s of items) {
    const d = s.date.replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:seic-${d}-${s.n}@happy-health`,
      `DTSTAMP:${utcStamp()}`,
      `DTSTART:${d}T${pad(startHour)}0000`,
      `DTEND:${d}T${pad(endHour)}0000`,
      `SUMMARY:${escapeText(`SEIC Session ${s.n} — ${s.topic}`)}`,
      `DESCRIPTION:${escapeText(`Guest mentor: ${s.mentor || "To be announced"}`)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
