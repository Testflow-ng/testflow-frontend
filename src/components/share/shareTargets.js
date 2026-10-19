import { MessageCircle, Send, X } from 'lucide-react';

/*
  Share targets, as plain hrefs.

  Deliberately not "share buttons" wired to a vendor SDK: WhatsApp, Telegram and X all accept
  a prefilled composer URL, so there is nothing to load, nothing to initialise, and nothing to
  break when a script is blocked or a phone is offline. The preview card in the chat is built
  by the backend from the Open Graph tags on the shared link, not from anything on the page.

  Only WhatsApp takes the caption: the others build their own text from the link's preview.
*/
export const SHARE_TARGETS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    hint: 'Chats, groups and status',
    Icon: MessageCircle,
    iconClass: 'bg-success/10 text-success',
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    hint: 'Send to a chat or channel',
    Icon: Send,
    iconClass: 'bg-info/10 text-info',
    href: (url) => `https://t.me/share/url?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'x',
    label: 'X',
    hint: 'Post it on your timeline',
    Icon: X,
    iconClass: 'bg-surface-strong text-foreground-strong',
    href: (url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
  },
];

export default SHARE_TARGETS;
