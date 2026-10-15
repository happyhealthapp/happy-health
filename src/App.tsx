import type { ReactNode } from "react";

const ASSIGNMENTS_URL =
  "https://github.com/happyhealthapp/happy-health/tree/main/assignments";

type Service = {
  title: string;
  description: string;
  icon: ReactNode;
};

const services: Service[] = [
  {
    title: "Home Nursing",
    description:
      "Qualified nurses deliver wound care, injections, vitals monitoring, and post-operative support in the comfort of home.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3 5 6v6c0 4 3 6.6 7 8 4-1.4 7-4 7-8V6Z" />
        <path d="M12 9v6M9 12h6" />
      </svg>
    ),
  },
  {
    title: "Doctor Home Visits",
    description:
      "Book a verified doctor to visit your home for consultation, diagnosis, and prescriptions — no clinic queue needed.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 11 12 4l8 7" />
        <path d="M6 10v10h12V10" />
        <path d="M12 12.5v5M9.5 15h5" />
      </svg>
    ),
  },
  {
    title: "Medical Equipment Rental",
    description:
      "Rent wheelchairs, hospital beds, oxygen concentrators, and more — with delivery and pickup arranged for you.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 8 12 3 3 8v8l9 5 9-5Z" />
        <path d="m3 8 9 5 9-5" />
        <path d="M12 13v8" />
      </svg>
    ),
  },
];

export default function App() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          <span className="brand-name">Happy Health</span>
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#mentors">For mentors</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Home care in Pakistan</p>
          <h1 id="hero-title">
            Trusted medical care, <span>delivered to your door</span>.
          </h1>
          <p className="lede">
            Happy Health connects patients and families to verified nurses,
            doctors, and medical equipment — on demand, at home.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={ASSIGNMENTS_URL}>
              For mentors — view assignments
            </a>
            <a className="btn btn-ghost" href="#services">
              Explore services
            </a>
          </div>
        </section>

        <section
          id="services"
          className="services"
          aria-labelledby="services-title"
        >
          <h2 id="services-title">What we offer</h2>
          <div className="cards">
            {services.map((service) => (
              <article className="card" key={service.title}>
                <span className="card-icon">{service.icon}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="mentors"
          className="mentors"
          aria-labelledby="mentors-title"
        >
          <h2 id="mentors-title">For mentors &amp; reviewers</h2>
          <p>
            Every SEIC session&apos;s notes, assignment, and resources are
            organised by date in the repository. Open the assignments index to
            review progress.
          </p>
          <a className="btn btn-primary" href={ASSIGNMENTS_URL}>
            Open assignments on GitHub
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          Built as part of the <strong>SEIC</strong> (Sindh Enterprise
          Incubation Center) founder program ·{" "}
          <a href="mailto:info@seic.ac.pk">info@seic.ac.pk</a>
        </p>
        <p className="muted">
          © {new Date().getFullYear()} Happy Health
        </p>
      </footer>
    </>
  );
}
