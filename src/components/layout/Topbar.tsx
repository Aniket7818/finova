import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Plus, ChevronDown, LogOut, Settings, Menu, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDate } from '../../utils';
import { cn } from '../../utils';

const pageTitles: Record<string, string> = {
  '/':            'Overview',
  '/transactions':'Transactions',
  '/budgets':     'Budgets',
  '/goals':       'Savings Goals',
  '/analytics':   'Analytics',
  '/recurring':   'Recurring Payments',
  '/reports':     'Reports',
  '/settings':    'Settings',
};

interface TopbarProps {
  onAddTransaction: () => void;
}

export function Topbar({ onAddTransaction }: TopbarProps) {
  const location = useLocation();
  const {
    notifications,
    markAllNotificationsRead,
    settings,
    setMobileNavOpen,
  } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const title = pageTitles[location.pathname] ?? 'Finova';
  const unread = notifications.filter((n) => !n.read).length;
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const notifColors = {
    info: 'text-blue-500',
    warning: 'text-amber-500',
    success: 'text-green-500',
    error: 'text-red-500',
  };

  return (
    <header className="no-print h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-20 backdrop-blur-md">
      {/* Mobile menu hamburger toggle */}
      <button
        onClick={() => setMobileNavOpen(true)}
        className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Brand logo for mobile */}
      <div className="md:hidden flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
      </div>

      {/* Page title and date */}
      <div className="min-w-0">
        <h1 className="font-bold text-slate-900 dark:text-slate-100 text-base md:text-lg tracking-tight truncate">
          {title}
        </h1>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block leading-none mt-0.5">
          {today}
        </p>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Add Transaction primary button */}
        <button
          onClick={onAddTransaction}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-xs sm:text-sm font-semibold hover:bg-primary-700 active:scale-95 transition-all shadow-sm shadow-primary-500/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Transaction</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications((p) => !p);
              setShowProfile(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute 1.5 top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white dark:ring-slate-900">
                {unread}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Notifications
                  </h3>
                  {unread > 0 && (
                    <span className="text-[10px] font-bold bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded-full">
                      {unread} new
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                        !n.read && 'bg-primary-50/40 dark:bg-primary-900/10'
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={cn('text-xs mt-1 shrink-0', notifColors[n.type])}>●</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {formatDate(n.createdAt, 'dd MMM, HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile((p) => !p);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {settings.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {settings.name}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {settings.email}
                </p>
              </div>
              <div className="p-1">
                <Link
                  to="/settings"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" /> Settings
                </Link>
                <button
                  onClick={() => setShowProfile(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-400" /> Log out (Demo)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside backdrop for dropdowns */}
      {(showNotifications || showProfile) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
  );
}
