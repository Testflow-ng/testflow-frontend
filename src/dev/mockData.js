// DEV ONLY sample data, served by `mockApi.js` while `VITE_DEV_BYPASS_AUTH=true`. Edit freely to see other states
// (for example set `totalExams: 0` to see empty screens). Add a new endpoint here as each screen needs it.

export const mockUser = {
  id: 'dev-user',
  fullName: 'Feranmi Oresajo',
  email: 'dev@testflow.local',
  username: 'feranmi',
  // Dev only: everything an admin can reach (the sidebar's Admin entry, /admin/reports,
  // /admin/feedback) hangs off this role. Set it back to 'student' to see the app exactly as
  // a student does.
  role: 'admin',
  matricNumber: 'CSC/2024/001',
  showOnLeaderboard: true,
  createdAt: '2026-01-12T09:00:00Z',
  pinnedSubjects: ['s1', 's2', 's3'],
};

export const mockSubjects = [
  { id: 's1', code: 'MTH101', title: 'Elementary Mathematics I', level: 100, questionCount: 240 },
  { id: 's2', code: 'GST101', title: 'Use of English', level: 100, questionCount: 180 },
  { id: 's3', code: 'BIO101', title: 'General Biology I', level: 100, questionCount: 210 },
  { id: 's4', code: 'CHM101', title: 'General Chemistry I', level: 100, questionCount: 195 },
  { id: 's5', code: 'PHY101', title: 'General Physics I', level: 100, questionCount: 160 },
  { id: 's6', code: 'CSC101', title: 'Introduction to Computing', level: 100, questionCount: 0 },
];

export const mockStats = {
  totalExams: 14,
  averageScore: 72,
  bestScore: 94,
  perSubject: [
    { subjectCode: 'MTH101', averageScore: 68, exams: 4 },
    { subjectCode: 'GST101', averageScore: 81, exams: 3 },
    { subjectCode: 'BIO101', averageScore: 74, exams: 4 },
    { subjectCode: 'CHM101', averageScore: 59, exams: 2 },
    { subjectCode: 'PHY101', averageScore: 77, exams: 1 },
  ],
};

// Dates are relative to today so the Last 7 / 30 day ranges always have something to show.
const daysAgo = (n, hour = 15) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const done = (id, subjectCode, score, ago) => ({ id, subjectCode, status: 'submitted', score, correctCount: Math.round(score / 2), totalQuestions: 50, submittedAt: daysAgo(ago) });

export const mockSessions = [
  { id: 'e0', subjectCode: 'PHY101', status: 'in_progress', score: 0, correctCount: 0, totalQuestions: 40, submittedAt: null },
  done('e1', 'GST101', 88, 0),
  done('e2', 'MTH101', 64, 1),
  done('e3', 'BIO101', 94, 2),
  done('e4', 'CHM101', 42, 4),
  done('e5', 'GST101', 76, 6),
  done('e6', 'MTH101', 58, 9),
  done('e7', 'BIO101', 81, 12),
  done('e8', 'PHY101', 77, 15),
  done('e9', 'CHM101', 55, 19),
  done('e10', 'MTH101', 71, 24),
  done('e11', 'GST101', 85, 31),
  done('e12', 'BIO101', 62, 38),
  done('e13', 'MTH101', 48, 45),
  done('e14', 'BIO101', 69, 52),
];

/* --- Library (books, bookmarks, reading progress) ------------------------- */

const book = (code, title, subtitle, color, level, semester, pages, sizeKb, edition, topics) => ({
  id: `bk_${code.toLowerCase()}`,
  code,
  title,
  subtitle,
  color,
  level,
  semester,
  pages,
  sizeKb,
  edition,
  author: 'TestFlow Editorial',
  year: 2024,
  topics,
  description: `A ${level} level, ${semester} semester companion for ${code}, covering ${topics
    .slice(0, 3)
    .join(', ')
    .toLowerCase()} with worked examples and past-question walkthroughs.`,
  bookmarked: false,
  updatedAt: daysAgo(20, 9),
});

export const mockBooks = [
  book('MTH101', 'Elementary Mathematics I', 'Algebra, calculus and statistics', 'red', 100, 'first', 148, 4210, '2nd edition', ['Algebra', 'Calculus', 'Statistics']),
  book('GST101', 'Use of English I', 'Grammar, comprehension and usage', 'blue', 100, 'first', 96, 2860, '3rd edition', ['Grammar', 'Comprehension', 'Usage']),
  book('CHM101', 'General Chemistry I', 'Atoms, reactions and equations', 'ink', 100, 'first', 172, 5140, '2nd edition', ['Atomic structure', 'Bonding', 'Stoichiometry']),
  book('BIO101', 'General Biology I', 'Cells, genetics and ecology', 'green', 100, 'first', 164, 4980, '2nd edition', ['Cells', 'Genetics', 'Ecology']),
  book('PHY101', 'General Physics I', 'Mechanics, heat and waves', 'amber', 100, 'first', 188, 6020, '2nd edition', ['Mechanics', 'Heat', 'Waves']),
  book('CSC101', 'Introduction to Computing', 'Hardware, software and problem solving', 'violet', 100, 'first', 120, 3520, '1st edition', ['Hardware', 'Software', 'Algorithms']),
  book('STA101', 'Statistics for Science', 'Describing and presenting data', 'teal', 100, 'second', 132, 3880, '1st edition', ['Data', 'Averages', 'Charts']),
  book('MTH102', 'Elementary Mathematics II', 'Vectors, series and coordinate geometry', 'red', 100, 'second', 156, 4460, '2nd edition', ['Vectors', 'Series', 'Geometry']),
  book('GST102', 'Use of English II', 'Essay writing and comprehension', 'blue', 100, 'second', 88, 2640, '3rd edition', ['Essay', 'Summary', 'Comprehension']),
  book('CHM102', 'General Chemistry II', 'Organic and physical chemistry', 'ink', 100, 'second', 168, 5020, '2nd edition', ['Organic', 'Equilibria', 'Energetics']),
  book('BIO102', 'General Biology II', 'Form and function in living things', 'green', 100, 'second', 176, 5260, '2nd edition', ['Plants', 'Animals', 'Evolution']),
  book('PHY102', 'General Physics II', 'Electricity, magnetism and optics', 'amber', 100, 'second', 192, 6140, '2nd edition', ['Electricity', 'Magnetism', 'Optics']),
  book('CSC102', 'Programming Fundamentals', 'First steps in problem solving with code', 'violet', 100, 'second', 140, 4120, '1st edition', ['Variables', 'Control flow', 'Functions']),
  book('STA102', 'Probability', 'Chance, counting and distributions', 'teal', 200, 'first', 144, 4280, '1st edition', ['Chance', 'Counting', 'Distributions']),
  book('MTH201', 'Mathematical Methods I', 'Sequences, series and differential equations', 'red', 200, 'first', 204, 6840, '1st edition', ['Sequences', 'Series', 'ODE']),
  book('BIO201', 'Genetics', 'Inheritance from Mendel onwards', 'green', 200, 'first', 158, 4680, '1st edition', ['Inheritance', 'DNA', 'Mutation']),
  book('CHM201', 'Organic Chemistry', 'Structure, naming and reactions', 'ink', 200, 'first', 212, 7120, '1st edition', ['Structure', 'Naming', 'Reactions']),
  book('PHY201', 'Classical Mechanics', 'Motion, forces and energy', 'amber', 200, 'first', 196, 6380, '1st edition', ['Motion', 'Forces', 'Energy']),
];

/* Books already opened, newest first: what "Continue reading" reads. */
export const mockReading = [
  { bookId: 'bk_mth101', page: 42, percent: 28, updatedAt: daysAgo(0, 21) },
  { bookId: 'bk_bio101', page: 120, percent: 73, updatedAt: daysAgo(1, 20) },
  { bookId: 'bk_phy101', page: 30, percent: 16, updatedAt: daysAgo(2, 22) },
  { bookId: 'bk_gst101', page: 96, percent: 100, updatedAt: daysAgo(3, 18) },
];

/* Two already saved, so the bookmarks view has something in it. */
mockBooks.find((b) => b.code === 'MTH101').bookmarked = true;
mockBooks.find((b) => b.code === 'BIO101').bookmarked = true;
