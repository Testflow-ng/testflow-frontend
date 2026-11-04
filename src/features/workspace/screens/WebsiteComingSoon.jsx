import { LayoutTemplate } from 'lucide-react';
import ComingSoonScreen from './ComingSoonScreen.jsx';

/** Shown in place of the website editor until it is switched on (see flags.js). */
const WebsiteComingSoon = () => (
  <ComingSoonScreen title="Website" subtitle="Change the words and pictures on your pages." icon={LayoutTemplate} headline="The page editor"
    text="Soon you will edit the words, pictures and pages students see. For now you can set your name, logo and web address." cta={{ to: '/workspace/domains', label: 'Set my name, logo and address' }} />
);

export default WebsiteComingSoon;
