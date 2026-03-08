import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Kanban,
  CalendarCheck,
  BarChart3,
  Settings,
  MessageSquare,
  History,
  X,
  LogOut,
  Bell,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/visits', icon: CalendarCheck, label: 'Visits' },
  { to: '/conversations', icon: MessageSquare, label: 'Conversations' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/historical', icon: History, label: 'Historical' },
];

const AppSidebar = ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[240px] flex flex-col border-r transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'hsl(var(--sidebar-bg))', borderColor: 'hsl(var(--sidebar-border))' }}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">G</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-sm" style={{ color: 'hsl(var(--sidebar-active-fg))' }}>Gharpayy</h1>
              <p className="text-[10px]" style={{ color: 'hsl(var(--sidebar-fg))' }}>Lead Management</p>
            </div>
          </div>
          <button className="lg:hidden p-1 rounded hover:bg-white/10" onClick={onClose}>
            <X size={18} style={{ color: 'hsl(var(--sidebar-fg))' }} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
          <NavLink to="/settings" onClick={onClose} className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}>
            <Settings size={18} />
            Settings
          </NavLink>
          <button onClick={signOut} className="sidebar-link w-full mt-1 hover:!text-red-400">
            <LogOut size={18} />
            Sign Out
          </button>
          <div className="mt-4 mx-3 p-3 rounded-lg" style={{ background: 'hsl(var(--sidebar-hover))' }}>
            <p className="text-xs font-medium truncate" style={{ color: 'hsl(var(--sidebar-active-fg))' }}>
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[10px] mt-0.5 truncate" style={{ color: 'hsl(var(--sidebar-fg))' }}>
              {user?.email || ''}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
