import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  FlaskConical,
  Flag,
  Languages,
  Sigma,
  Sprout,
  Sparkles,
  Timer,
  TrendingUp,
} from 'lucide-react';
import LandingNav from '../components/landing/LandingNav.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import { REGISTER_PATH } from '../features/auth/paths.js';
import './landing.css';

const STATS = [
  ['1,500+', 'Questions in the bank'],
  ['1,300+', 'Students practicing'],
  ['500+', 'Tests completed'],
  ['50+', 'Courses covered'],
];

const SUBJECTS = [
  { name: 'MTH101 · Mathematics', topics: 'Algebra · Calculus · Statistics', Icon: Sigma },
  { name: 'GST101 · Use of English', topics: 'Grammar · Comprehension · Usage', Icon: Languages },
  { name: 'BIO101 · Biology', topics: 'Cells · Genetics · Ecology', Icon: Sprout },
  { name: 'CHM101 · Chemistry', topics: 'Atoms · Reactions · Equations', Icon: FlaskConical },
];

const STEPS = [
  { Icon: Flag, title: 'Pick a goal', text: 'Tell us which courses and exams you’re preparing for and the grade you want.' },
  { Icon: CalendarDays, title: 'Get a study plan', text: 'Find a clear path through your topics, shaped around your time.' },
  { Icon: Timer, title: 'Practise in short sessions', text: 'Make a little space for focused questions and helpful explanations.' },
  { Icon: TrendingUp, title: 'Track your progress', text: 'See what’s clicking, spot what needs work and celebrate each win.' },
];

const FAQS = [
  ['How does Testflow help me prepare for my university exams?', 'Practise your courses topic by topic, try timed CBT questions and learn from clear explanations. Your study plan helps you focus on the areas that need the most attention.'],
  ['How much time should I study each day?', 'Start with 15–20 focused minutes. Short, regular sessions are easier to build into your day; you can adjust your plan as your semester exams get closer.'],
  ['Can I practise on my phone?', 'Yes. Study in your mobile browser, on a tablet or on a laptop. No download is needed, so your next session can fit around lectures, labs and life.'],
  ['What if I’m starting from scratch?', 'That’s a good place to begin. Start with the basics, use the explanations to close gaps and build up at your own pace. You don’t need to know it all already.'],
];

const PLAN_BARS = [['MTH101', 72], ['GST101', 64], ['BIO101', 48]];
const WEEK_COLS = [28, 50, 42, 70, 40, 62, 100];
const GROWTH_BARS = [20, 30, 25, 45, 55, 75, 100];

function HomePage() {
  const { hash } = useLocation();
  const [openFaq, setOpenFaq] = useState(() => new Set(FAQS.map((_, i) => i)));

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  const toggleFaq = (i) =>
    setOpenFaq((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <>
      <div className="tfl tfl-page">
        <LandingNav />

        <main>
          <section className="container hero">
            <div className="hero-copy">
              <p className="eyebrow">A better way to get semester-exam ready</p>
              <h1>
                Your next chapter starts <em>here.</em>
              </h1>
              <p className="lead">
                Big goals start with small, focused steps. Build exam confidence with a study plan that fits your
                course load, purposeful practice and progress you can see.
              </p>
              <div className="btn-row">
                <Link to={REGISTER_PATH} className="btn btn-primary">
                  Start learning <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
                <Link to="/#how-it-works" className="btn btn-ghost">
                  See how it works
                </Link>
              </div>
              <p className="note">
                <Check size={12} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-1px' }} /> Built
                for university students. Ready when you are.
              </p>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="blob" />
              <svg className="orbit orbit-a" viewBox="0 0 400 400" fill="none">
                <ellipse cx="200" cy="200" rx="190" ry="120" transform="rotate(-38 200 200)" />
              </svg>
              <svg className="orbit orbit-b" viewBox="0 0 400 400" fill="none">
                <ellipse cx="200" cy="200" rx="185" ry="95" transform="rotate(28 200 200)" />
              </svg>
              <span className="dot" />
              <span className="chip chip-streak">
                <Sparkles size={14} /> 5-day study streak
              </span>
              <div className="plan-card">
                <div className="plan-head">
                  <small>Testflow / My study plan</small>
                  <span className="plan-icon" />
                </div>
                <div className="plan-top">
                  <div>
                    <small>MONDAY, 5 OCTOBER</small>
                    <h3>You’ve got this, Eddyrus.</h3>
                    <small>A little focus. A big step forward.</small>
                  </div>
                  <div className="ring">
                    <span>75%</span>
                  </div>
                </div>
                {PLAN_BARS.map(([code, pct]) => (
                  <div className="bar" key={code}>
                    <span>{code}</span>
                    <i>{pct}%</i>
                    <b style={{ '--w': `${pct}%` }} />
                  </div>
                ))}
                <div className="week">
                  <small>Your week in focus</small>
                  <small>2h 15m</small>
                </div>
                <div className="cols">
                  {WEEK_COLS.map((h, i) => (
                    <div className="col" key={i}>
                      <u className={i === 3 ? 'lime' : i === 6 ? 'blue' : ''} style={{ '--h': `${h}%`, '--i': i }} />
                      <em>{'MTWTFSS'[i]}</em>
                    </div>
                  ))}
                </div>
              </div>
              <span className="chip chip-better">
                <TrendingUp size={15} /> A little better, every day.
              </span>
            </div>
          </section>

          <div className="ticker" role="region" aria-label="Testflow in numbers">
            <div className="ticker-track">
              {[0, 1].map((copy) =>
                STATS.map(([value, label]) => (
                  <span key={`${copy}-${label}`} aria-hidden={copy === 1 ? 'true' : undefined}>
                    <b>{value}</b> {label}
                  </span>
                )),
              )}
            </div>
          </div>

          <section id="approach" className="container section">
            <div className="split-head">
              <div>
                <p className="eyebrow">Less cramming. More growing.</p>
                <h2>
                  Built for how you <em>actually study.</em>
                </h2>
              </div>
              <p className="side">
                Learning is personal. Your prep should be too. Turn the big picture into little wins you can
                build on.
              </p>
            </div>
            <div className="feature-grid">
              <article className="feature lavender">
                <div className="feature-head">
                  <h3>A plan that gets you.</h3>
                  <span className="num">01</span>
                </div>
                <p>A clear, flexible study plan built around your goal, your starting point and your everyday life.</p>
                <div className="chart" aria-hidden="true">
                  <div className="stat">
                    <small>THIS WEEK</small>
                    <b>+18%</b>
                    <small>Practice accuracy</small>
                  </div>
                  <div className="chart-bars">
                    {GROWTH_BARS.map((h, i) => (
                      <u key={i} className={i === 6 ? 'blue' : ''} style={{ '--h': `${h}%` }} />
                    ))}
                  </div>
                </div>
              </article>
              <article className="feature sage">
                <div className="feature-head">
                  <h3>Make every practice count.</h3>
                  <span className="num">02</span>
                </div>
                <p>Focused questions, useful explanations and study materials that help the ideas really stick.</p>
                <div className="qcard-wrap" aria-hidden="true">
                  <div className="qcard">
                    <small>
                      <BookOpenCheck size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> BIOLOGY / CELL
                      STRUCTURE
                    </small>
                    <b>Small questions. Big light-bulb moments.</b>
                    <small>
                      <Check size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> Answer explained, not
                      just marked.
                    </small>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section id="subjects" className="subjects">
            <div className="container">
              <div className="split-head light">
                <div>
                  <p className="eyebrow lime">Your courses. Your starting point.</p>
                  <h2>Practise what’s on your course list.</h2>
                </div>
                <p className="side">
                  Build a stronger foundation, one topic at a time. Choose a course and find your next step.
                </p>
              </div>
              <div className="subject-grid">
                {SUBJECTS.map(({ name, topics, Icon }) => (
                  <Link key={name} to={REGISTER_PATH} className="subject">
                    <span className="ic">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <ArrowUpRight className="arrow" size={14} aria-hidden="true" />
                    <h3>{name}</h3>
                    <small>{topics}</small>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section id="how-it-works" className="container section">
            <p className="eyebrow">A little progress goes a long way</p>
            <div className="how-head">
              <h2>
                From “where do I start?” to <em>“I’ve got this.”</em>
              </h2>
              <Link to={REGISTER_PATH} className="btn btn-ghost">
                Find your first step
              </Link>
            </div>
            <ol className="steps">
              {STEPS.map(({ Icon, title, text }, i) => (
                <li key={title}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="si">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
            <figure className="testimonial">
              <img
                src="/photos/student.webp"
                alt="Smiling student holding a blue folder"
                width="357"
                height="410"
                loading="lazy"
              />
              <figcaption>
                <p className="eyebrow">Confidence, one session at a time</p>
                <blockquote>
                  “I used to revise everything and hope for the best. Now I know what to focus on. By exam week, I
                  feel <em>prepared, not panicked.</em>”
                </blockquote>
                <p className="who">A student’s next chapter</p>
                <small>Illustrative student story — not a verified testimonial.</small>
              </figcaption>
            </figure>
          </section>

          <section id="faq" className="faq">
            <div className="container faq-grid">
              <div>
                <p className="eyebrow">A little clarity before you begin</p>
                <h2>
                  Good questions. <em>Clear answers.</em>
                </h2>
                <p className="side">Getting started shouldn’t feel like another test. Here’s what you need to know.</p>
                <a className="link" href="mailto:hello@testflow.com.ng">
                  Still have a question? Get in touch ↗
                </a>
              </div>
              <div className="accordion">
                {FAQS.map(([q, a], i) => (
                  <details
                    key={q}
                    open={openFaq.has(i)}
                    onToggle={(e) => {
                      if (e.currentTarget.open !== openFaq.has(i)) toggleFaq(i);
                    }}
                  >
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="container cta-wrap">
            <div className="cta">
              <div>
                <p className="eyebrow lime">You don’t have to do it all today</p>
                <h2>
                  Your next chapter starts with <em>one small step.</em>
                </h2>
                <p>A clear plan. A little practice. A more confident you.</p>
              </div>
              <div className="cta-action">
                <Link to={REGISTER_PATH} className="btn btn-lime">
                  Get started with Testflow <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
                <small>Find your pace. Start where you are.</small>
              </div>
            </div>
          </section>
        </main>
      </div>
      <LandingFooter />
    </>
  );
}

export default HomePage;
