// Sample data shared by the previews. Plain objects only; nothing here talks to the API.
export const weekly = [{ name: 'Mon', value: 12 }, { name: 'Tue', value: 18 }, { name: 'Wed', value: 9 }, { name: 'Thu', value: 24 }, { name: 'Fri', value: 15 }, { name: 'Sat', value: 30 }, { name: 'Sun', value: 21 }];
export const split = [{ name: 'Passed', value: 62 }, { name: 'Borderline', value: 22 }, { name: 'Needs work', value: 16 }];
export const topics = [{ name: 'Algebra', value: 82 }, { name: 'Calculus', value: 55 }, { name: 'Statistics', value: 70 }, { name: 'Geometry', value: 64 }, { name: 'Trig', value: 48 }];
export const students = Array.from({ length: 19 }, (_, i) => ({ id: i + 1, name: `${['Ada', 'Tunde', 'Chioma', 'Ibrahim', 'Zainab', 'Femi', 'Ngozi'][i % 7]} ${String.fromCharCode(65 + (i % 20))}.`, level: 100 + (i % 4) * 100, score: 40 + ((i * 13) % 55), tests: 3 + ((i * 7) % 21) }));
export const courses = [
  { id: 'm', code: 'MTH101', name: 'Elementary Mathematics', questions: 480, pinned: true, p: 72 },
  { id: 'g', code: 'GST101', name: 'Use of English', questions: 320, pinned: false, p: 35 },
  { id: 'b', code: 'BIO101', name: 'General Biology I', questions: 410, pinned: true, p: 0 },
  { id: 'c', code: 'CHM101', name: 'General Chemistry I', questions: 390, pinned: false, p: 58 },
];
export const hoursOut = (n) => new Date(Date.now() + n * 3600000).toISOString();
export const daysOut = (n) => new Date(Date.now() + n * 86400000).toISOString();
export const dailyAds = Array.from({ length: 14 }, (_, i) => ({ date: `2026-10-${String(i + 1).padStart(2, '0')}`, impressions: 120 + ((i * 37) % 90), clicks: 8 + ((i * 5) % 14), whatsappClicks: 3 + ((i * 3) % 8) }));
export const adCampaigns = [
  { id: 'c1', status: 'pending_review', title: 'Campus laptop deals', description: 'Fresh stock, student prices. Chat with us today.', imageUrl: '/photos/hero-student.webp', ctaType: 'whatsapp', advertiser: 'Campus Laptops', durationDays: 7, priceKobo: 700000, keywords: ['laptops', 'oau'], destination: 'https://wa.me/2348012345678', submittedAt: '2026-10-12', history: [{ title: 'Submitted for review', time: 'Today, 10:38' }, { title: 'Payment confirmed', time: 'Today, 10:40', tone: 'primary' }] },
  { id: 'c2', status: 'pending_review', title: 'Hostel cleaning, weekly', description: 'Spotless rooms, no stress.', advertiser: 'CleanNest', durationDays: 14, priceKobo: 1400000, keywords: ['hostel'], destination: 'https://wa.me/2348098765432', submittedAt: '2026-10-13', history: [] },
  { id: 'c3', status: 'active', title: 'Print and photocopy', description: 'Cheap, fast, near the gate.', advertiser: 'QuickPrint', durationDays: 30, priceKobo: 3000000, keywords: ['printing'], destination: 'https://quickprint.example', submittedAt: '2026-10-05', history: [] },
  { id: 'c4', status: 'suspended', title: 'Textbook swap', description: 'Swap your old books.', advertiser: 'BookLoop', durationDays: 7, priceKobo: 700000, keywords: [], destination: 'https://wa.me/2348011122233', submittedAt: '2026-10-02', history: [] },
];
export const adPayments = [
  { id: 'p1', reference: 'AD-48213', advertiser: 'Campus Laptops', amountKobo: 700000, status: 'paid', paidAt: '2026-10-12', refundable: false },
  { id: 'p2', reference: 'AD-48199', advertiser: 'CleanNest', amountKobo: 1400000, status: 'paid', paidAt: '2026-10-11', refundable: true },
  { id: 'p3', reference: 'AD-48120', advertiser: 'BookLoop', amountKobo: 700000, status: 'refunded', paidAt: '2026-10-02', refundable: false },
];
export const siteTemplates = [{ key: 'classic', name: 'Classic', description: 'Header, hero and a grid' }, { key: 'modern', name: 'Modern', description: 'Bold banner and cards' }, { key: 'minimal', name: 'Minimal', description: 'Quiet and text-led' }];
export const siteBlocks = [
  { id: 'b1', type: 'hero', heading: 'Prepare with confidence at Advance Tutorials', subheading: 'Online practice exams for JAMB and WAEC.', cta: { label: 'Start a test', url: '#' } },
  { id: 'b2', type: 'about', title: 'About us', text: 'We help students across Ibadan pass the first time.' },
  { id: 'b3', type: 'features', title: 'Why choose us', items: [{ title: 'Real exam timing', text: 'Practise under the same clock.' }, { title: 'Instant marking', text: 'Scores the moment you submit.' }, { title: 'Track progress', text: 'See what to revise next.' }] },
  { id: 'b4', type: 'exams', title: 'Open exams' },
  { id: 'b5', type: 'contact', title: 'Contact', email: 'hello@advance.example', whatsapp: '2348012345678', address: '12 Ring Road, Ibadan' },
];
export const emptyQuestion = { stem: 'If $x^2 - 5x + 6 = 0$, find $x$.', options: ['2 and 3', '1 and 6', '-2 and -3', ''], correctIndex: 0, topic: 'Algebra', difficulty: 'medium', explanation: '' };
export const examInit = { title: 'Mathematics mock', instructions: '', durationMinutes: 45, window: {}, access: 'enrolled', accessCode: '', attemptsAllowed: 1, shuffleQuestions: true, shuffleOptions: true, marksPerQuestion: 1, negativeMarking: 0, resultsVisibility: 'immediate' };
export const people = [{ value: 's1', label: 'Ada Obi' }, { value: 's2', label: 'Tunde Bello' }, { value: 's3', label: 'Chioma Eze' }, { value: 's4', label: 'Ibrahim Musa' }];
