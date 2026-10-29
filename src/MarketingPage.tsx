import type { ReactNode } from "react";
import { FOUNDER_EMAIL, STARTUP } from "./data/sessions";

const BASE = import.meta.env.BASE_URL;
const MENTORS_URL = `${BASE}mentors/`;
const EMAIL_HREF = `mailto:${FOUNDER_EMAIL}?subject=Home%20care%20request`;

type Service = {
  title: string;
  description: string;
  icon: ReactNode;
};

const services: Service[] = [
  {
    title: "Home nursing",
    description:
      "Nurses come to your home for wound care, injections, vitals checks, and help after surgery or a hospital stay. We discuss the need with you before anything is arranged.",
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
    title: "Doctor home visits",
    description:
      "A doctor visits your home for a consultation, a review of medicines, or a follow-up. We agree what the visit covers before it happens.",
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
    title: "Medical equipment rental",
    description:
      "Wheelchairs, hospital beds, and oxygen concentrators on rent, with delivery arranged. We check what the equipment is for and explain the terms before you commit.",
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

const checks = [
  "A current PNMC nursing licence",
  "CNIC and identity confirmation",
  "Police verification on record",
  "A reference from a hospital",
];

const steps = [
  {
    title: "Tell us the need",
    body: "Email us what is happening at home: the care needed, who it is for, and where you are in Karachi.",
  },
  {
    title: "Agree the plan",
    body: "We set out what will be provided, who will provide it, and the cost in writing. You approve before care begins.",
  },
  {
    title: "Care starts",
    body: "Once the plan is agreed, we coordinate the first visit and stay your single point of contact while care continues.",
  },
];

const faqs = [
  {
    q: "Which areas do you cover?",
    a: "Karachi. Tell us your area when you write and we will confirm whether we can reach you before you commit to anything.",
  },
  {
    q: "How soon can care start?",
    a: "It depends on the care needed and on the nurse being screened and available. We will give you a realistic start date in writing, not an estimate we cannot keep.",
  },
  {
    q: "What checks do your nurses undergo?",
    a: "Before a first shift we require a current PNMC licence, CNIC identity check, police verification, and a hospital reference. The same standard applies to every nurse we engage.",
  },
  {
    q: "Can I request equipment only?",
    a: "Yes. Equipment rental does not require nursing care. Tell us what is needed and we will quote it separately in writing.",
  },
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  );
}

export default function MarketingPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          <span className="brand-name">{STARTUP}</span>
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#how-it-works">How it works</a>
          <a href="#contact">Contact</a>
          <a className="nav-cta" href={EMAIL_HREF}>
            Email us
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Home care in Karachi</p>
            <h1 id="hero-title">
              Home nursing and doctor visits for your parents
            </h1>
            <p className="lede">
              We arrange nurses, doctor visits, and medical equipment in
              Karachi, with one person accountable for your family&rsquo;s care
              from the first call.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={EMAIL_HREF}>
                Email us about care
              </a>
              <a className="btn btn-ghost" href="#how-it-works">
                See how it works
              </a>
            </div>
          </div>

          <div className="hero-side">
            <figure className="hero-photo">
              {/* Pexels photo 7551675 — free to use, no attribution required. */}
              <img
                src={`${BASE}care-home.webp`}
                alt="A caregiver adjusting an older man's pillow in a bright bedroom at home"
                width={1200}
                height={900}
                fetchPriority="high"
              />
            </figure>

            <aside className="hero-card" aria-labelledby="screening-title">
              <p className="hero-card-eyebrow">Our screening standard</p>
              <h2 id="screening-title">Before a nurse&rsquo;s first shift</h2>
              <ul className="check-list">
                {checks.map((check) => (
                  <li key={check}>
                    <span className="check-icon">
                      <CheckIcon />
                    </span>
                    {check}
                  </li>
                ))}
              </ul>
              <p className="hero-card-note">
                You are letting someone into your parents&rsquo; home, so who
                they are matters as much as what they can do.
              </p>
            </aside>
          </div>
        </section>

        <div className="trust-bar">
          <ul aria-label="What you can expect">
            <li>One point of contact</li>
            <li>Karachi</li>
            <li>Clear pricing before care</li>
          </ul>
        </div>

        <section
          id="services"
          className="services"
          aria-labelledby="services-title"
        >
          <p className="section-eyebrow">Services</p>
          <h2 id="services-title">What we arrange</h2>
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
          id="how-it-works"
          className="how"
          aria-labelledby="how-title"
        >
          <p className="section-eyebrow">How it works</p>
          <h2 id="how-title">From first email to first visit</h2>
          <ol className="steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="step-num" aria-hidden="true">
                  {index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="pricing"
          className="pricing"
          aria-labelledby="pricing-title"
        >
          <div>
            <p className="section-eyebrow">Pricing</p>
            <h2 id="pricing-title">How pricing works</h2>
            <p>
              Every request is quoted individually, because nursing, doctor
              visits, and equipment are priced differently. You receive the
              quote in writing, and nothing starts until you agree to it.
            </p>
          </div>
          <a className="btn btn-primary" href={EMAIL_HREF}>
            Ask for a quote
          </a>
        </section>

        <section id="faq" className="faq" aria-labelledby="faq-title">
          <p className="section-eyebrow">FAQ</p>
          <h2 id="faq-title">Questions families ask</h2>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contact" className="contact" aria-labelledby="contact-title">
          <p className="section-eyebrow">Contact</p>
          <h2 id="contact-title">Talk to us about care</h2>
          <p>
            Email{" "}
            <a href={`mailto:${FOUNDER_EMAIL}`}>{FOUNDER_EMAIL}</a> with what is
            happening at home and what you think you need. A person reads every
            message, and we will tell you honestly whether we can help.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={EMAIL_HREF}>
              Email us about care
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          <strong>{STARTUP}</strong> · home care in Karachi ·{" "}
          <a href={`mailto:${FOUNDER_EMAIL}`}>{FOUNDER_EMAIL}</a>
        </p>
        <p className="footer-links">
          <a href={MENTORS_URL}>Mentor hub</a>
        </p>
        <p className="muted">
          © {new Date().getFullYear()} {STARTUP}
        </p>
      </footer>
    </>
  );
}
