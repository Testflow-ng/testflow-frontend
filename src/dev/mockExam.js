// DEV ONLY: sample exam papers, so the CBT runtime, the corrections review and the report
// sheet all render without a backend. Wired into `mockApi.js` the same way `mockLive.js` is.
//
// Questions come from small parametric templates rather than a long hand-written list: each
// template varies its numbers (or its word-list entry) with the question index, so a 40 or 50
// question paper reads as a paper rather than one question repeated.
//
// This is sample data. The endpoints are the real ones the app calls:
// POST /api/exam-sessions, GET/PATCH/POST /api/exam-sessions/:id(/answer|/strike|/submit|/result).
import { mockSessions } from './mockData.js';

/** A question whose correct option sits at `at`, with the three distractors filled in after it. */
const mc = (stem, correct, wrong, at, explanation, topic) => {
  const options = [];
  let w = 0;
  for (let i = 0; i < 4; i += 1) options.push(i === at ? correct : wrong[w++]);
  return { stem, options, correctOption: at, explanation, topic };
};

/** Cycle a list by the question index. */
const pick = (list, n) => list[n % list.length];

/** Three distinct entries from `list`, rotated by the index. Callers pass a pool of at least 4. */
const threeOthers = (list, n) => [0, 1, 2].map((k) => list[(n + k) % list.length]);

/* --- Year 1, first semester ------------------------------------------------ */

const PHY101 = [
  (n) => {
    const v = 4 + 2 * n;
    return mc(
      `A cyclist covers ${20 + 10 * n} m in 5 s. What is the average speed?`,
      `${v} m/s`,
      [`${v + 2} m/s`, `${v - 2} m/s`, `${v * 2} m/s`],
      n % 4,
      `Speed = distance ÷ time = ${20 + 10 * n} ÷ 5 = ${v} m/s.`,
      'Mechanics',
    );
  },
  (n) => {
    const a = 4 + n;
    return mc(
      `A bus starting from rest reaches ${8 + 2 * n} m/s in 2 s. What is its acceleration?`,
      `${a} m/s²`,
      [`${a + 1} m/s²`, `${a * 2} m/s²`, `${a + 3} m/s²`],
      (n + 1) % 4,
      `a = (v − u) ÷ t = (${8 + 2 * n} − 0) ÷ 2 = ${a} m/s².`,
      'Mechanics',
    );
  },
  (n) => {
    const force = 10 + 5 * n;
    return mc(
      `A force gives a 5 kg mass an acceleration of ${2 + n} m/s². Find the force.`,
      `${force} N`,
      [`${force + 5} N`, `${force - 5} N`, `${1 + n} N`],
      n % 4,
      `F = ma = 5 × ${2 + n} = ${force} N.`,
      'Mechanics',
    );
  },
  (n) => {
    const weight = 10 * (3 + n);
    return mc(
      `What is the weight of a ${3 + n} kg bag on Earth? Take g = 10 m/s².`,
      `${weight} N`,
      [`${3 + n} N`, `${weight + 10} N`, `${weight / 2} N`],
      (n + 2) % 4,
      `W = mg = ${3 + n} × 10 = ${weight} N.`,
      'Mechanics',
    );
  },
  (n) => {
    const speed = 40 + 20 * n;
    return mc(
      `A wave of frequency ${20 + 10 * n} Hz has a wavelength of 2 m. Find its speed.`,
      `${speed} m/s`,
      [`${speed + 20} m/s`, `${speed - 20} m/s`, `${speed * 2} m/s`],
      n % 4,
      `v = fλ = ${20 + 10 * n} × 2 = ${speed} m/s.`,
      'Waves',
    );
  },
  (n) => {
    const heat = 800 * (5 + n);
    return mc(
      `How much heat raises 2 kg of a substance (c = 400 J/kg°C) by ${5 + n} °C?`,
      `${heat} J`,
      [`${heat + 800} J`, `${400 * (5 + n)} J`, `${heat * 2} J`],
      (n + 1) % 4,
      `Q = mcΔT = 2 × 400 × ${5 + n} = ${heat} J.`,
      'Heat',
    );
  },
];

const MTH101 = [
  (n) => {
    const x = 8 + n;
    return mc(
      `Solve for $x$: $5x = ${40 + 5 * n}$.`,
      `$x = ${x}$`,
      [`$x = ${x + 1}$`, `$x = ${x - 1}$`, `$x = ${x + 3}$`],
      n % 4,
      `Divide both sides by 5: $x = ${40 + 5 * n} ÷ 5 = ${x}$.`,
      'Algebra',
    );
  },
  (n) =>
    mc(
      `Find the roots of $x^2 - ${5 + n}x + ${6 + 2 * n} = 0$.`,
      `$x = 2$ and $x = ${3 + n}$`,
      [`$x = 1$ and $x = ${6 + 2 * n}$`, `$x = -2$ and $x = -${3 + n}$`, `$x = -1$ and $x = -${6 + 2 * n}$`],
      (n + 1) % 4,
      `The factors are $(x - 2)(x - ${3 + n})$: the roots sum to ${5 + n} and multiply to ${6 + 2 * n}.`,
      'Algebra',
    ),
  (n) => {
    const term = 21 + 9 * n;
    return mc(
      `The first term of an AP is 3 and the common difference is ${2 + n}. Find the 10th term.`,
      `$${term}$`,
      [`$${term + 9}$`, `$${term - 9}$`, `$${term + 1}$`],
      (n + 2) % 4,
      `$U_{10} = a + 9d = 3 + 9(${2 + n}) = ${term}$.`,
      'Algebra',
    );
  },
  (n) => {
    const a = 2 + n;
    return mc(
      `Differentiate $y = ${a}x^3$ with respect to $x$.`,
      `$\\dfrac{dy}{dx} = ${3 * a}x^2$`,
      [`$\\dfrac{dy}{dx} = ${a}x^2$`, `$\\dfrac{dy}{dx} = ${3 * a}x^3$`, `$\\dfrac{dy}{dx} = ${a + 3}x^2$`],
      n % 4,
      `Bring the power down and reduce it by one: $${a} × 3x^2 = ${3 * a}x^2$.`,
      'Calculus',
    );
  },
  (n) => {
    const k = 1 + n;
    return mc(
      `Evaluate $\\displaystyle\\int ${2 + 2 * n}x\\,dx$.`,
      `$${k}x^2 + C$`,
      [`$${2 + 2 * n}x^2 + C$`, `$${k}x + C$`, `$${2 + n}x + C$`],
      (n + 1) % 4,
      `$\\displaystyle\\int ax\\,dx = \\dfrac{a}{2}x^2 + C$, and $${2 + 2 * n} ÷ 2 = ${k}$.`,
      'Calculus',
    );
  },
  (n) => {
    const count = 9 + 2 * n;
    const mean = 5 + n;
    return mc(
      `Find the mean of the first ${count} natural numbers.`,
      `$${mean}$`,
      [`$${count}$`, `$${4 + n}$`, `$${10 + 2 * n}$`],
      (n + 3) % 4,
      `Mean $= \\dfrac{${count}(${count} + 1)/2}{${count}} = \\dfrac{${count} + 1}{2} = ${mean}$.`,
      'Statistics',
    );
  },
];

const GST101 = [
  (n) => {
    const [subject, verb] = pick(
      [['boys', 'are'], ['girls', 'are'], ['children', 'are'], ['teachers', 'are'], ['student', 'is'], ['mango', 'is']],
      n,
    );
    return mc(
      `Choose the option that completes the sentence: "The ${subject} ____ in the hall."`,
      verb,
      [verb === 'is' ? 'are' : 'is', 'were been', 'be'],
      n % 4,
      `"${subject}" is ${verb === 'is' ? 'singular' : 'plural'}, so it takes "${verb}".`,
      'Grammar',
    );
  },
  (n) => {
    const [base, past] = pick(
      [['go', 'went'], ['write', 'wrote'], ['take', 'took'], ['see', 'saw'], ['drink', 'drank'], ['begin', 'began']],
      n,
    );
    return mc(
      `Choose the correct form: "She had already ____ before the bell rang."`,
      past,
      [`${base}ed`, base, `${past}ed`],
      (n + 1) % 4,
      `The past participle of "${base}" is "${past}".`,
      'Grammar',
    );
  },
  (n) => {
    const [word, preposition] = pick(
      [['interested', 'in'], ['afraid', 'of'], ['good', 'at'], ['married', 'to'], ['depend', 'on'], ['angry', 'with']],
      n,
    );
    const others = ['of', 'at', 'for', 'on', 'in', 'about', 'with'].filter((p) => p !== preposition);
    return mc(
      `Choose the correct preposition: "She is ${word} ____ her results."`,
      preposition,
      threeOthers(others, n),
      (n + 2) % 4,
      `"${word}" is followed by "${preposition}".`,
      'Usage',
    );
  },
  (n) => {
    const [adjective, comparative] = pick(
      [['tall', 'taller'], ['happy', 'happier'], ['bad', 'worse'], ['far', 'farther'], ['gentle', 'gentler'], ['many', 'more']],
      n,
    );
    return mc(
      `Give the comparative form of the adjective "${adjective}".`,
      comparative,
      [`more ${adjective}`, `most ${adjective}`, `${adjective}est`],
      n % 4,
      `The comparative of "${adjective}" is "${comparative}".`,
      'Grammar',
    );
  },
  (n) => {
    const [word, synonym] = pick(
      [['begin', 'commence'], ['rapid', 'swift'], ['error', 'mistake'], ['brave', 'courageous'], ['vacant', 'empty'], ['announce', 'proclaim']],
      n,
    );
    return mc(
      `Choose the option closest in meaning to "${word}".`,
      synonym,
      ['halt', 'sluggish', 'certain'],
      (n + 1) % 4,
      `"${synonym}" means the same as "${word}".`,
      'Comprehension',
    );
  },
  (n) => {
    const [word, antonym] = pick(
      [['ancient', 'modern'], ['expand', 'contract'], ['praise', 'condemn'], ['scarce', 'abundant'], ['victory', 'defeat'], ['humble', 'arrogant']],
      n,
    );
    return mc(
      `Choose the option opposite in meaning to "${word}".`,
      antonym,
      ['original', 'flexible', 'grateful'],
      (n + 2) % 4,
      `"${antonym}" is the opposite of "${word}".`,
      'Comprehension',
    );
  },
];

const BIO101 = [
  (n) => {
    const [organelle, role] = pick(
      [['mitochondrion', 'releasing energy from food'], ['ribosome', 'building proteins'], ['chloroplast', 'trapping light for photosynthesis'], ['nucleus', 'holding the genetic material'], ['vacuole', 'storing cell sap'], ['lysosome', 'digesting worn-out cell parts']],
      n,
    );
    return mc(
      `What is the main function of the ${organelle}?`,
      role,
      ['controlling what enters the cell', 'transporting oxygen in the blood', 'producing bile'],
      n % 4,
      `The ${organelle} is responsible for ${role}.`,
      'Cells',
    );
  },
  (n) => {
    const chromosome = 8 + 2 * n;
    return mc(
      `A cell with 2n = ${chromosome} chromosomes undergoes meiosis. How many chromosomes are in each gamete?`,
      `${4 + n}`,
      [`${chromosome}`, `${2 + n}`, `${chromosome + 2}`],
      (n + 1) % 4,
      `Meiosis halves the number, so each gamete has ${chromosome} ÷ 2 = ${4 + n} chromosomes.`,
      'Genetics',
    );
  },
  (n) => {
    const [cross, fraction, reply] = pick(
      [['Aa × Aa', '1/4', 'a quarter of the offspring'], ['AA × aa', '0', 'none of the offspring'], ['Aa × aa', '1/2', 'half of the offspring'], ['aa × aa', '1', 'all of the offspring']],
      n,
    );
    return mc(
      `In the cross ${cross}, what fraction of the offspring show the recessive phenotype?`,
      fraction,
      ['1/3', '3/4', '2/3'],
      (n + 2) % 4,
      `${cross} gives ${reply} with the recessive phenotype.`,
      'Genetics',
    );
  },
  (n) => {
    const [term, meaning] = pick(
      [['a producer', 'an organism that makes its own food'], ['a consumer', 'an organism that feeds on other organisms'], ['a decomposer', 'an organism that breaks down dead matter'], ['a habitat', 'the place where an organism lives'], ['a population', 'all the organisms of one species in an area']],
      n,
    );
    return mc(
      `In ecology, what is ${term}?`,
      meaning,
      ['a non-living factor in the environment', 'the variety of life in an area', 'a group of different species living together'],
      n % 4,
      `${term.charAt(0).toUpperCase() + term.slice(1)} is ${meaning}.`,
      'Ecology',
    );
  },
  (n) => {
    const [stage, event] = pick(
      [['prophase', 'the chromosomes become visible'], ['metaphase', 'the chromosomes line up at the equator'], ['anaphase', 'the chromatids move to opposite poles'], ['telophase', 'the nuclear membrane reforms']],
      n,
    );
    return mc(
      `What happens during ${stage} of mitosis?`,
      event,
      ['the cell membrane pinches in two', 'the DNA is copied', 'the cell leaves the cycle permanently'],
      (n + 1) % 4,
      `During ${stage}, ${event}.`,
      'Cells',
    );
  },
  (n) => {
    const [organism, kingdom] = pick(
      [['a mushroom', 'Fungi'], ['an amoeba', 'Protoctista'], ['a fern', 'Plantae'], ['a bacterium', 'Monera'], ['a lizard', 'Animalia']],
      n,
    );
    const others = ['Plantae', 'Animalia', 'Fungi', 'Monera', 'Protoctista'].filter((k) => k !== kingdom);
    return mc(
      `To which kingdom does ${organism} belong?`,
      kingdom,
      threeOthers(others, n),
      (n + 2) % 4,
      `${organism.charAt(0).toUpperCase() + organism.slice(1)} belongs to ${kingdom}.`,
      'Classification',
    );
  },
];

const CHM101 = [
  (n) => {
    const pH = 2 + (n % 9);
    return mc(
      `A solution has $[H^+] = 10^{-${pH}}$ mol/dm³. What is its pH?`,
      `${pH}`,
      [`${pH + 1}`, `${pH - 1}`, `${pH + 7}`],
      n % 4,
      `pH = −log[H⁺] = ${pH}.`,
      'Acids and bases',
    );
  },
  (n) => {
    const moles = 1 + n;
    return mc(
      `How many moles are in ${40 * (1 + n)} g of sodium hydroxide (NaOH, M = 40 g/mol)?`,
      `${moles} mol`,
      [`${moles * 2} mol`, `${40 * (1 + n)} mol`, `${moles + 10} mol`],
      (n + 1) % 4,
      `Moles = mass ÷ molar mass = ${40 * (1 + n)} ÷ 40 = ${moles} mol.`,
      'Stoichiometry',
    );
  },
  (n) => {
    const carbons = 2 + (n % 8);
    return mc(
      `How many hydrogen atoms are in an alkane with ${carbons} carbon atoms?`,
      `${2 * carbons + 2}`,
      [`${2 * carbons}`, `${carbons + 1}`, `${2 * carbons + 1}`],
      (n + 2) % 4,
      `The alkane formula is $C_nH_{2n+2}$, so ${2 * carbons + 2} hydrogens.`,
      'Organic chemistry',
    );
  },
  (n) => {
    const [compound, bond] = pick(
      [['sodium chloride', 'ionic'], ['methane', 'covalent'], ['magnesium oxide', 'ionic'], ['water', 'covalent'], ['hydrogen chloride gas', 'covalent']],
      n,
    );
    return mc(
      `What type of bonding holds ${compound} together?`,
      bond,
      [bond === 'ionic' ? 'covalent' : 'ionic', 'metallic', 'hydrogen'],
      n % 4,
      `${compound.charAt(0).toUpperCase() + compound.slice(1)} is held together by ${bond} bonding.`,
      'Bonding',
    );
  },
  (n) => {
    const [mixture, technique] = pick(
      [['sand and water', 'filtration'], ['salt and water', 'evaporation'], ['a mixture of dyes', 'chromatography'], ['two miscible liquids', 'distillation'], ['iron filings and sulphur', 'using a magnet']],
      n,
    );
    const others = ['sublimation', 'filtration', 'distillation', 'chromatography', 'decanting'].filter((t) => t !== technique);
    return mc(
      `Which method separates ${mixture}?`,
      technique,
      threeOthers(others, n),
      (n + 1) % 4,
      `${mixture.charAt(0).toUpperCase() + mixture.slice(1)} is separated by ${technique}.`,
      'Separation',
    );
  },
  (n) => {
    const [element, config] = pick(
      [['sodium', '2, 8, 1'], ['chlorine', '2, 8, 7'], ['magnesium', '2, 8, 2'], ['oxygen', '2, 6'], ['neon', '2, 8']],
      n,
    );
    const others = ['2, 8, 8', '2, 8, 3', '2, 7, 1', '2, 4'].filter((c) => c !== config);
    return mc(
      `What is the electron configuration of ${element}?`,
      config,
      threeOthers(others, n),
      (n + 2) % 4,
      `${element.charAt(0).toUpperCase() + element.slice(1)} has the configuration ${config}.`,
      'Atomic structure',
    );
  },
];

const BANKS = { PHY101, MTH101, GST101, BIO101, CHM101 };
const GENERIC = PHY101; // an unknown subject still renders a full paper

/** A paper of `count` unanswered questions for `code`. */
export function makeQuestions(code, count) {
  const bank = BANKS[code] ?? GENERIC;
  return Array.from({ length: count }, (_, i) => ({
    /*
      A stable id, so a question can be bookmarked or reported. It is
      `<SUBJECT>-q<position>`, which the sample data can render back exactly —
      the parametric templates vary their numbers with the position, so the id has
      to carry it. Real questions are identified by their id in the bank instead.
    */
    id: `${code}-q${i}`,
    index: i,
    selectedOption: null,
    markedForReview: false,
    ...bank[i % bank.length](i),
  }));
}

/** Deterministic 0..1 from an id, so sample times do not jitter between renders. */
const hash = (value) => {
  let h = 0;
  for (const ch of String(value)) h = (h * 31 + ch.charCodeAt(0)) % 10_000;
  return (h % 1000) / 1000;
};

const paperOf = (session) => session.questions ?? [];

/** Mark the student's own paper: exactly the answers they gave. */
export function markPaper(session) {
  const questions = paperOf(session).map((q) => ({ ...q, isCorrect: q.selectedOption === q.correctOption }));
  const correctCount = questions.filter((q) => q.isCorrect).length;
  const total = questions.length;
  return {
    id: session.id,
    subjectCode: session.subjectCode,
    score: total ? Math.round((correctCount / total) * 100) : 0,
    correctCount,
    totalQuestions: total,
    timeTakenSeconds: session.timeTakenSeconds ?? Math.round(total * 30),
    submittedAt: new Date().toISOString(),
    questions,
  };
}

/**
 * The marked paper for a session from the seeded history, which has a stored score but no
 * answers. Correct answers are spread across the paper (rather than a solid block of wins at
 * the top) and a fifth of the mistakes are left blank, so the corrections review and its
 * filters have something real to show.
 */
export function synthResult(session) {
  const total = session.totalQuestions ?? 50;
  const questions = makeQuestions(session.subjectCode, total);
  const target = Math.min(total, Math.max(0, Math.round(((session.score ?? 0) / 100) * total)));

  const correctAt = new Set();
  for (let k = 0; k < target; k += 1) correctAt.add(Math.floor((k * total) / target));

  const wrongAt = questions.map((_, i) => i).filter((i) => !correctAt.has(i));
  const blankTarget = Math.round(wrongAt.length * 0.2);

  const marked = questions.map((question, i) => {
    if (correctAt.has(i)) return { ...question, selectedOption: question.correctOption, isCorrect: true };
    const blank = wrongAt.indexOf(i) < blankTarget;
    return { ...question, selectedOption: blank ? null : (question.correctOption + 1) % 4, isCorrect: false };
  });

  const correctCount = marked.filter((q) => q.isCorrect).length;

  return {
    id: session.id,
    subjectCode: session.subjectCode,
    score: Math.round((correctCount / total) * 100),
    correctCount,
    totalQuestions: total,
    timeTakenSeconds: Math.round(total * (26 + hash(session.id) * 14)),
    submittedAt: session.submittedAt ?? new Date().toISOString(),
    questions: marked,
  };
}

/**
 * The one-line summary the history list shows. Derived from the same marked paper the result
 * page renders, so a row's score and the report behind it can never disagree.
 */
export function summaryFor(session) {
  const { score, correctCount, totalQuestions } = synthResult(session);
  return { score, correctCount, totalQuestions };
}

/** A session submitted in this session of the dev app: mark what they actually wrote. */
export const resultOf = (session) => (session.submittedLive ? markPaper(session) : synthResult(session));

/* --- Dev session store ---------------------------------------------------- */

const sessions = new Map();
let seq = 0;

const isoIn = (minutes) => new Date(Date.now() + minutes * 60_000).toISOString();

const newSession = ({ subject, questionCount = 20, durationMinutes = 15 }) => {
  seq += 1;
  const id = `dev_s${seq}`;
  const session = {
    id,
    subjectCode: subject,
    status: 'in_progress',
    strikes: 0,
    totalQuestions: questionCount,
    timeLimitSeconds: durationMinutes * 60,
    startedAt: new Date().toISOString(),
    expiresAt: isoIn(durationMinutes),
    questions: makeQuestions(subject, questionCount),
  };
  sessions.set(id, session);
  return session;
};

/**
 * A session from `mockData.js` (the dashboard's history), materialised into a real paper.
 *
 * The seed only stores the headline score, so it is carried across: `synthResult` rebuilds a
 * marked paper from it, and without it every seeded attempt would report 0%.
 */
const materialise = (seed) => {
  const totalQuestions = seed.totalQuestions ?? 20;
  const session = {
    id: seed.id,
    subjectCode: seed.subjectCode,
    status: seed.status,
    score: seed.score ?? 0,
    correctCount: seed.correctCount ?? 0,
    strikes: 0,
    totalQuestions,
    timeLimitSeconds: 45 * 60,
    startedAt: new Date(Date.now() - 20 * 60_000).toISOString(),
    expiresAt: isoIn(45),
    submittedAt: seed.submittedAt ?? null,
    questions: makeQuestions(seed.subjectCode, totalQuestions),
  };
  sessions.set(session.id, session);
  return session;
};

const getSession = (id) => {
  if (sessions.has(id)) return sessions.get(id);
  const seed = mockSessions.find((s) => s.id === id);
  return seed ? materialise(seed) : null;
};

const bad = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * A session as the student's browser is allowed to see it.
 *
 * The bank knows the answer to every question, but during a live paper the client is never
 * told: shipping `correctOption` and `explanation` here would put the whole answer key in the
 * network tab. The store keeps them so the paper can be marked; the response does not.
 */
const publicSession = (session) => ({
  ...session,
  questions: (session.questions ?? []).map((question) => {
    const safe = { ...question };
    delete safe.correctOption;
    delete safe.explanation;
    return safe;
  }),
});

/** Routes in the same shape `mockLive.js` uses. Undefined when nothing matches. */
export function examRoute(method, path, body) {
  if (method === 'POST' && path === '/api/exam-sessions') return { session: publicSession(newSession(body ?? {})) };

  const match = path.match(/^\/api\/exam-sessions\/([^/]+)(?:\/(answer|strike|submit|result|share))?$/);
  if (!match) return undefined;

  const [, id, action] = match;
  const session = getSession(id);
  if (!session) throw bad(404, 'That exam session no longer exists.');

  if (method === 'GET' && !action) return { session: publicSession(session) };

  if (method === 'PATCH' && action === 'answer') {
    const { questionIndex, ...patch } = body ?? {};
    const question = session.questions[questionIndex];
    if (question) Object.assign(question, patch);
    return { answer: { questionIndex, ...patch } };
  }

  if (method === 'POST' && action === 'strike') {
    session.strikes += 1;
    if (session.strikes >= 3) session.status = 'submitted';
    return { result: { strikes: session.strikes, status: session.status } };
  }

  if (method === 'POST' && action === 'submit') {
    session.submittedLive = true;
    session.status = 'submitted';
    const marked = markPaper(session);
    return {
      result: {
        id: session.id,
        status: 'submitted',
        score: marked.score,
        correctCount: marked.correctCount,
        totalQuestions: marked.totalQuestions,
      },
    };
  }

  if (method === 'GET' && action === 'result') return { result: resultOf(session) };

  /*
    The share link. A token, not the session id, because the link is public and revocable:
    it is served by the backend as an HTML page carrying the Open Graph tags, since WhatsApp,
    Telegram and X build the preview without running any JavaScript. The token here is
    derived from the id so a mock link stays stable across reloads.
  */
  if (method === 'POST' && action === 'share') {
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    const token = `${session.id}.${Math.floor(hash(session.id) * 1e9).toString(36)}`;
    return {
      share: {
        token,
        url: `${origin}/api/public/results/${token}/share`,
        imageUrl: `${origin}/api/public/results/${token}/og.png`,
      },
    };
  }

  return undefined;
}
