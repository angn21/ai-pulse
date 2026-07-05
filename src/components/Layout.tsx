import { Outlet } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="app-frame">
      <Sidebar />
      <div className="app-main">
        <header className="app-topbar">
          <span className="app-topbar-title">AI Pulse</span>
          <span className="app-topbar-sub">Live · TensorFeed</span>
        </header>
        <Outlet />
      </div>
      <MobileNav />
    </div>
  );
}
