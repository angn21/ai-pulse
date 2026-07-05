import { Outlet } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="app-frame">
      <Sidebar />
      <div className="app-main">
        <header className="terminal-bar">AI_PULSE // tensorfeed uplink</header>
        <Outlet />
      </div>
      <MobileNav />
    </div>
  );
}
