export type NavLinkItem = {
  to: string;
  label: string;
  end?: boolean;
};

export const NAV_LINKS: NavLinkItem[] = [
  { to: '/', label: '~/brief', end: true },
  { to: '/news', label: '~/news' },
  { to: '/status', label: '~/status' },
  { to: '/discover', label: '~/discover' },
  { to: '/premium', label: '~/premium' },
];
