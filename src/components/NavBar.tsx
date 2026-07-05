import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/news', label: 'News' },
  { to: '/status', label: 'Status' },
  { to: '/discover', label: 'Discover' },
  { to: '/premium', label: 'Premium' },
];

export function NavBar() {
  return (
    <nav className="navbar">
      {links.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          {label}
        </NavLink>
      ))}
      <style>{`
        .navbar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--nav-height);
          background: var(--bg-card);
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 100;
          padding: 0 8px;
        }
        .nav-link {
          flex: 1;
          text-align: center;
          padding: 8px 4px;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 500;
          text-decoration: none;
          border-radius: 8px;
          transition: color 0.15s;
        }
        .nav-link.active {
          color: var(--accent);
          font-weight: 700;
        }
        .nav-link:hover {
          text-decoration: none;
          color: var(--text);
        }
      `}</style>
    </nav>
  );
}
