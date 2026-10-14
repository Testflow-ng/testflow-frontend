// DEV ONLY sample data, served by `mockApi.js` while `VITE_DEV_BYPASS_AUTH=true`. Edit freely to see other states
// (for example set `totalExams: 0` to see empty screens). Add a new endpoint here as each screen needs it.

export const mockUser = {
  id: 'dev-user',
  fullName: 'Feranmi Oresajo',
  email: 'dev@testflow.local',
  username: 'feranmi',
  role: 'student',
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
