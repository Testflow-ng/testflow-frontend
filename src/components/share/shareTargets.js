import { FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export const SHARE_TARGETS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    hint: 'Chats, groups and status',
    Icon: FaWhatsapp,
    iconClass: 'bg-success/10 text-[#25D366]',
    href: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    hint: 'Send to a chat or channel',
    Icon: FaTelegramPlane,
    iconClass: 'bg-info/10 text-[#26A5E4]',
    href: (url) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'x',
    label: 'X',
    hint: 'Post it on your timeline',
    Icon: FaXTwitter,
    iconClass: 'bg-surface-strong text-foreground-strong',
    href: (url) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
  },
];

export default SHARE_TARGETS;