import { BookOpen } from 'lucide-react';
import ComingSoonScreen from './ComingSoonScreen.jsx';

/** Shown in place of the organisation's Library until it is switched on (see flags.js). */
const LibraryComingSoon = () => (
  <ComingSoonScreen title="Library" subtitle="Share notes and books, free or for a price." icon={BookOpen} headline="Your library"
    text="Soon you will upload books and notes for your students, free or priced. Start with your exams and questions in the meantime." cta={{ to: '/workspace/exams', label: 'Go to exams' }} />
);

export default LibraryComingSoon;
