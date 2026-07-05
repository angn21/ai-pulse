export type NavLinkItem = {
  to: string;
  label: string;
  end?: boolean;
};

export const NAV_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Brief', end: true },
  { to: '/news', label: 'News' },
  { to: '/status', label: 'Status' },
  { to: '/discover', label: 'Discover' },
  { to: '/premium', label: 'Premium' },
];
