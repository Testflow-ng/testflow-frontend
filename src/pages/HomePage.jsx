import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle2, Plus } from 'lucide-react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { publicApi } from '../api/public.js';
import { buttonClasses } from '../components/ui/index.js';
import { useAuth } from '../features/auth/useAuth.js';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import LogoLoop from '../components/landing/LogoLoop.jsx';
import WhatsAppIcon from '../components/icons/WhatsAppIcon.jsx';
import { WHATSAPP_CHANNEL_URL, WHATSAPP_GREEN } from '../constants/social.js';

import CardSwap, { Card } from '../components/react-bits/CardSwap/CardSwap.jsx';
import DriftWall from '../components/react-bits/DriftWall/DriftWall.jsx';
import AccordionGallery from '../components/react-bits/AccordionGallery/AccordionGallery.jsx';
import MagicBento from '../components/react-bits/MagicBento/MagicBento.jsx';
import LineSidebar from '../components/react-bits/LineSidebar/LineSidebar.jsx';

function SectionLabel({ children }) {
  return (
    <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-primary">
      {children}
    </span>
  );
}

function SectionHeading({ children, className = '' }) {
  return (
    <h2
      className={`mt-3 font-heading text-3xl font-extrabold tracking-tight text-foreground-strong sm:text-4xl lg:text-5xl ${className}`}
    >
      {children}
    </h2>
  );
}

function Reveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const ACCORDION_ITEMS = [
  {
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    title: 'MTH101',
    subtitle: 'Elementary Mathematics I',
  },
  {
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    title: 'PHY101',
    subtitle: 'General Physics I',
  },
  {
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
    title: 'CHM101',
    subtitle: 'General Chemistry I',
  },
  {
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    title: 'ECO101',
    subtitle: 'Principles of Economics I',
  },
  {
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    title: 'CSC101',
    subtitle: 'Intro to Computer Science',
  },
];

const HERO_CARDS = [
  {
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80',
    label: 'Study groups',
  },
  {
    image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=500&q=80',
    label: 'Focused practice',
  },
  {
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&q=80',
    label: 'Lecture halls',
  },
  {
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&q=80',
    label: 'Campus life',
  },
];

const DRIFT_ITEMS = [
  'photo-1522202176988-66273c2fd55f',
  'photo-1571260899304-425eee4c7efc',
  'photo-1541339907198-e08756dedf3f',
  'photo-1427504494785-3a9ca7044f45',
  'photo-1546410531-bb4caa6b424d',
  'photo-1456513080510-7bf3a84b82f8',
  'photo-1503676260728-1c00da094a0b',
  'photo-1532094349884-543bc11b234d',
  'photo-1434030216411-0b793f4b4173',
  'photo-1523240795612-9a054b0db644',
  'photo-1513475382585-d06e58bcb0e0',
  'photo-1509062522246-3755977927d7',
].map((id) => ({ image: `https://images.unsplash.com/${id}?w=400&q=60` }));

const BENTO_ITEMS = [
  {
    color: '#f8f9fa',
    title: 'Timed practice',
    description: 'Sit mock exams under real CBT conditions with a live countdown and auto-submit.',
    label: 'Core',
  },
  {
    color: '#f8f9fa',
    title: 'Instant corrections',
    description: 'See your score and full explanations the moment you submit.',
    label: 'Results',
  },
  {
    color: '#f8f9fa',
    title: 'Progress tracking',
    description: 'Track scores across subjects and find exactly where to focus.',
    label: 'Analytics',
  },
  {
    color: '#f8f9fa',
    title: 'Randomized every time',
    description:
      'Questions and options are shuffled on every attempt. Each run is genuinely different.',
    label: 'Fair',
  },
  {
    color: '#f8f9fa',
    title: 'Share your results',
    description: 'Download your score as a clean card or a Naija meme. Flex on your group chat.',
    label: 'Social',
  },
];

const FAQS = [
  {
    q: 'Is TestFlow really free?',
    a: 'Yes. You can create an account and start practicing without paying anything or entering card details.',
  },
  {
    q: 'Will it work on my phone?',
    a: 'It runs in the browser and is built to stay usable on a 1GB RAM Android phone. There is nothing to download.',
  },
  {
    q: 'Where do the questions come from?',
    a: 'They are written and reviewed against the actual OAU course outlines, so the style matches what you will meet in the hall.',
  },
  {
    q: 'Do I get the same questions every time?',
    a: 'No. Questions and their options are shuffled on every attempt, so repeating a test is genuinely new practice.',
  },
  {
    q: 'Which courses are covered?',
    a: 'First-year OAU courses today, with new subjects added every semester. Check the Courses section above for the current list.',
  },
];

const SECTION_IDS = ['hero', 'features', 'subjects', 'how-it-works', 'why-testflow'];
const SECTION_LABELS = ['Start', 'Features', 'Courses', 'How it works', 'FAQ'];

const STEPS = [
  {
    num: '01',
    title: 'Pick your course',
    desc: 'Choose from your exact OAU course combination. Set how many questions you want.',
  },
  {
    num: '02',
    title: 'Set the clock',
    desc: 'Practice at real exam pace or take your time. The timer is yours to control.',
  },
  {
    num: '03',
    title: 'Take the test',
    desc: 'A clean, distraction-free interface that works even on a 1GB RAM phone.',
  },
  {
    num: '04',
    title: 'See your results instantly',
    desc: 'Full corrections with explanations for every question. Share your score as a meme.',
  },
];

function useIsNarrow() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = (e) => setNarrow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

function Counter({ value, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1200;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(ease * value));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function HomePage() {
  const { isAuthenticated } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ['publicStats'],
    queryFn: publicApi.getStats,
    staleTime: 60 * 60 * 1000,
  });

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const totalStudents = stats?.totalStudents ?? 1300;
  const totalQuestions = stats?.totalQuestions ?? 1500;
  const totalExams = stats?.totalExams ?? 500;
  const totalSubjects = stats?.totalSubjects ?? 50;

  const STAT_ITEMS = [
    { value: totalQuestions, label: 'Questions in the bank' },
    { value: totalStudents, label: 'Students practicing' },
    { value: totalExams, label: 'Tests completed' },
    { value: totalSubjects, label: 'Courses covered' },
  ];

  const ctaPath = isAuthenticated ? '/dashboard' : '/register';
  const ctaLabel = isAuthenticated ? 'Go to dashboard' : 'Start practicing free';

  const isNarrow = useIsNarrow();

  const scrollToSection = (index) => {
    const el = document.getElementById(SECTION_IDS[index]);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex w-full flex-col bg-background">
      <nav
        aria-label="Page sections"
        className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
      >
        <LineSidebar
          items={SECTION_LABELS}
          accentColor="var(--color-primary)"
          textColor="var(--color-muted)"
          markerColor="var(--color-border)"
          showIndex={false}
          proximityRadius={90}
          maxShift={18}
          markerLength={34}
          itemGap={16}
          fontSize={0.78}
          onItemClick={scrollToSection}
        />
      </nav>

      {/* ── HERO ── */}
      <section
        id="hero"
        ref={heroRef}
        className="relative flex items-center overflow-hidden bg-background pb-16 pt-10 sm:pb-20 sm:pt-14 lg:min-h-screen lg:pt-24"
      >
        <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
          <DriftWall
            items={isNarrow ? DRIFT_ITEMS.slice(0, 6) : DRIFT_ITEMS}
            columns={isNarrow ? 3 : 6}
            tileWidth={isNarrow ? 130 : 200}
            tileHeight={isNarrow ? 88 : 132}
            gap={18}
            radius={14}
            tilt={16}
            turn={-14}
            perspective={1200}
            depth={120}
            speed={30}
            direction="up"
            variance={0.45}
            parallax={0}
            lift={0}
            fade={0.5}
            dim={0.85}
            grayscale
            overlayColor="#f8fafc"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,var(--color-background)_18%,transparent_78%)] lg:bg-[linear-gradient(to_right,var(--color-background)_0%,var(--color-background)_32%,transparent_62%)]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8"
        >
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-20">
            <div className="flex-1">
              {/* <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-bold text-primary"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Live for OAU students
              </motion.span> */}

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 font-heading text-[2.5rem] font-extrabold leading-[1.04] tracking-tight text-foreground-strong sm:text-5xl lg:text-7xl"
              >
                Practice until
                <br className="hidden sm:block" /> the exam feels{' '}
                <span className="text-primary">easy</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg"
              >
                The CBT practice platform built for excellence. Timed mock exams, instant corrections,
                progress tracking.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <Link
                  to={ctaPath}
                  className={buttonClasses({ size: 'lg', className: 'w-full gap-2 sm:w-auto' })}
                >
                  {ctaLabel}
                  <ArrowRight size={18} />
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="py-1 text-sm font-semibold text-muted transition-colors hover:text-foreground-strong sm:px-5 sm:py-3"
                  >
                    Sign in
                  </Link>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="mt-6 flex items-center gap-5 text-sm text-muted"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-success" />
                  Free to use
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-success" />
                  No download needed
                </span>
              </motion.div>
            </div>

            {/* Hero visual - CardSwap (desktop only) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 lg:max-w-lg"
            >
              <div className="relative h-[290px] sm:h-[360px] lg:h-[480px]">
                <CardSwap
                  cardDistance={isNarrow ? 32 : 50}
                  verticalDistance={isNarrow ? 38 : 60}
                  delay={4000}
                  pauseOnHover={false}
                  width={isNarrow ? 250 : 360}
                  height={isNarrow ? 180 : 280}
                  skewAmount={4}
                  easing="elastic"
                >
                  {HERO_CARDS.map((card) => (
                    <Card key={card.label} customClass="overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.label}
                        className="h-full w-full object-cover"
                        loading="eager"
                      />
                      <span className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8 text-sm font-semibold text-white">
                        {card.label}
                      </span>
                    </Card>
                  ))}
                </CardSwap>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-y border-border bg-surface">
        <div className="py-9">
          <LogoLoop
            logos={STAT_ITEMS.map((item) => ({
              node: (
                <span className="flex items-baseline gap-2.5 whitespace-nowrap">
                  <span className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong sm:text-3xl">
                    {item.value.toLocaleString()}+
                  </span>
                  <span className="text-sm text-muted">{item.label}</span>
                </span>
              ),
              title: item.label,
              ariaLabel: `${item.value}+ ${item.label}`,
            }))}
            speed={44}
            direction="left"
            logoHeight={36}
            gap={56}
            fadeOut
            fadeOutColor="var(--color-surface)"
            ariaLabel="TestFlow by the numbers"
          />
        </div>
      </section>

      {/* ── FEATURES - MagicBento ── */}
      <section id="features" className="scroll-mt-24 bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <SectionLabel>What TestFlow does</SectionLabel>
            <SectionHeading>Built for how you actually study</SectionHeading>
            <p className="mt-4 max-w-lg text-muted">
              Not another generic quiz app. Every feature exists because OAU students asked for it.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-14">
            <MagicBento
              items={BENTO_ITEMS}
              glowColor="37, 99, 235"
              spotlightRadius={350}
              enableSpotlight={false}
              enableStars={false}
              enableBorderGlow={false}
            />
          </Reveal>
        </div>
      </section>

      {/* ── SUBJECTS - AccordionGallery ── */}
      <section id="subjects" className="scroll-mt-24 border-y border-border bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <SectionLabel>Your exact courses</SectionLabel>
            <SectionHeading>Practice what is on your timetable</SectionHeading>
            <p className="mt-4 max-w-lg text-muted">
              Full question banks for first-year OAU courses. New subjects every semester.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-14">
            <div className="h-[300px] sm:h-[400px] lg:h-[460px]">
              <AccordionGallery
                items={ACCORDION_ITEMS}
                collapsedWidth={60}
                gap={8}
                radius={20}
                parallaxAmount={50}
                grayscale
                tiltAmount={0}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="scroll-mt-24 bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <SectionLabel>How it works</SectionLabel>
            <SectionHeading>From first tap to full score</SectionHeading>
            <p className="mt-4 max-w-lg text-muted">
              Four steps. No setup, no card details, no waiting for anyone to approve you.
            </p>
          </Reveal>

          <ol className="mt-14">
            {STEPS.map((step, i) => (
              <li
                key={step.num}
                className="sticky mb-6 h-[17rem] sm:h-[18rem]"
                style={{
                  top: `calc(50vh - 9rem + ${i * 16}px)`,
                  zIndex: i + 1,
                }}
              >
                <div className="flex h-full flex-col justify-center rounded-3xl border border-border bg-surface px-7 shadow-[0_18px_40px_-28px_rgb(0_0_0/0.35)] sm:px-10">
                  <span className="font-heading text-4xl font-extrabold leading-none text-primary/30 sm:text-5xl">
                    {step.num}
                  </span>
                  <h3 className="mt-5 font-heading text-2xl font-extrabold tracking-tight text-foreground-strong sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-md leading-relaxed text-muted">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <Reveal delay={0.1}>
            <Link
              to={ctaPath}
              className={buttonClasses({ size: 'lg', className: 'mt-4 w-full gap-2 sm:w-auto' })}
            >
              {ctaLabel}
              <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── BUILT FOR OAU ── */}
      <section id="why-testflow" className="scroll-mt-24 border-y border-border bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <SectionLabel>FAQ</SectionLabel>
              <SectionHeading>Questions students ask</SectionHeading>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
                Built by OAU students for OAU students. If something is not answered here, reach us
                on WhatsApp and we will sort it out.
              </p>
            </Reveal>

            <div className="lg:col-span-7">
              <dl>
                {FAQS.map((faq, i) => (
                  <Reveal key={faq.q} delay={i * 0.05}>
                    <details className="group border-b border-border first:border-t">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-semibold text-foreground-strong [&::-webkit-details-marker]:hidden">
                        {faq.q}
                        <Plus
                          size={18}
                          className="shrink-0 text-muted transition-transform duration-300 group-open:rotate-45"
                        />
                      </summary>
                      <p className="max-w-xl pb-5 pr-8 leading-relaxed text-muted">{faq.a}</p>
                    </details>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-background py-20 sm:py-28">
        <Reveal className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="rounded-3xl bg-primary px-6 py-14 text-center sm:px-12 sm:py-16">
            <h2 className="mx-auto max-w-xl font-heading text-3xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
              Your next exam starts with one practice test
            </h2>
            <p className="mx-auto mt-4 max-w-lg leading-relaxed text-primary-foreground/80">
              Join {totalStudents.toLocaleString()}+ students already preparing with TestFlow. Setup
              takes under a minute.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to={ctaPath}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-background px-8 text-base font-semibold text-primary transition-transform active:scale-95 sm:w-auto"
              >
                {isAuthenticated ? 'Go to dashboard' : 'Create free account'}
                <ArrowRight size={18} />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-primary-foreground/30 px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 sm:w-auto"
                >
                  Sign in
                </Link>
              )}
            </div>

            <div className="mt-14 flex flex-col items-center gap-5 border-t border-primary-foreground/20 pt-8 sm:flex-row sm:justify-between sm:text-left">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: WHATSAPP_GREEN }}
                >
                  <WhatsAppIcon />
                </span>
                <div>
                  <h3 className="font-bold text-primary-foreground">
                    Follow EDDYRUS MEDIA on WhatsApp
                  </h3>
                  <p className="mt-1 text-sm text-primary-foreground/75">
                    Exam tips, study updates, and launch news, straight to your phone.
                  </p>
                </div>
              </div>

              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition-transform active:scale-95 sm:w-auto"
                style={{ backgroundColor: WHATSAPP_GREEN }}
              >
                <WhatsAppIcon size={18} />
                Follow channel
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <LandingFooter />
    </div>
  );
}

export default HomePage;
