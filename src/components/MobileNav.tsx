import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from './navLinks';

export function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Main navigation">
      {NAV_LINKS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => (isActive ? 'mobile-nav-link active' : 'mobile-nav-link')}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
