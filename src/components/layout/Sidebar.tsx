import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  CalendarClock,
  Users,
  FileCheck,
  ClipboardList,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'C2B Transactions', href: '/c2b', icon: ArrowDownToLine },
  { name: 'B2C Transactions', href: '/b2c', icon: ArrowUpFromLine },
  { name: 'B2B Transactions', href: '/b2b', icon: Building2 },
  { name: 'M-Pesa Ratiba', href: '/ratiba', icon: CalendarClock },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Reconciliation', href: '/reconciliation', icon: FileCheck },
  { name: 'Audit Logs', href: '/audit', icon: ClipboardList },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col gradient-dark transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-mpesa flex items-center justify-center shadow-mpesa">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">M-Pesa</h1>
              <p className="text-xs text-sidebar-foreground/60">Integration Hub</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto rounded-xl gradient-mpesa flex items-center justify-center shadow-mpesa">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'nav-item',
                    isActive ? 'nav-item-active' : 'nav-item-inactive'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'mx-auto')} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
