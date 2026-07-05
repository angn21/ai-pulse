import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from './navLinks';

export function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">
        <strong>AI_PULSE</strong>
        tensorfeed uplink
      </div>
      {NAV_LINKS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
