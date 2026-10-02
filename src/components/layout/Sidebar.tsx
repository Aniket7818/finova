import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, Target, BarChart3,
  RefreshCw, FileText, Settings, ChevronLeft, ChevronRight,
  Sun, Moon, Monitor, Zap, X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils';
import { AGENCY_URL } from '../../constants';

const navItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Overview'          },
  { to: '/transactions',icon: ArrowLeftRight,  label: 'Transactions'      },
  { to: '/budgets',     icon: PiggyBank,       label: 'Budgets'           },
  { to: '/goals',       icon: Target,          label: 'Savings Goals'     },
  { to: '/analytics',   icon: BarChart3,       label: 'Analytics'         },
  { to: '/recurring',   icon: RefreshCw,       label: 'Recurring Payments'},
  { to: '/reports',     icon: FileText,        label: 'Reports'           },
  { to: '/settings',    icon: Settings,        label: 'Settings'          },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, mobileNavOpen, setMobileNavOpen, settings } = useAppStore();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const isSysDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const themeOptions = [
    { value: 'light'  as const, icon: Sun,     label: 'Light theme'  },
    { value: 'dark'   as const, icon: Moon,    label: 'Dark theme'   },
    { value: 'system' as const, icon: Monitor, label: `System default (Device: ${isSysDark ? 'Dark' : 'Light'})` },
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Visible ONLY on md and up: hidden md:flex)            */}
      {/* ========================================================================= */}
      <aside
        className={cn(
          'no-print hidden md:flex fixed left-0 top-0 h-screen bg-white dark:bg-slate-900',
          'border-r border-slate-200 dark:border-slate-800 flex-col transition-all duration-300 z-30',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-primary-500/20">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex flex-col">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                  Finova
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide mt-0.5 uppercase">
                  Finance SaaS
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleSidebar}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className={cn(
              'p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
              'hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
              !sidebarOpen && 'mx-auto'
            )}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                title={!sidebarOpen ? label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
                  !sidebarOpen && 'justify-center px-0'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-transform group-hover:scale-105',
                    isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'
                  )}
                />
                {sidebarOpen && <span className="truncate">{label}</span>}

                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary-600 dark:bg-primary-500 rounded-r" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop bottom section */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Theme switcher */}
          {sidebarOpen ? (
            <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 rounded-xl p-1 gap-1">
              {themeOptions.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  title={label}
                  className={cn(
                    'flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-medium transition-all',
                    theme === value
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={`Current: ${theme}. Click to switch`}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* User profile */}
          <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
              {settings.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                  {settings.name}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {settings.email}
                </p>
              </div>
            )}
          </div>

          {/* Agency Credit */}
          {sidebarOpen && (
            <div className="text-center pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
              <p className="text-[10px] text-slate-400 dark:text-slate-600">
                © 2026 Finova ·{' '}
                <a
                  href={AGENCY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Infinvo Tech
                </a>
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE NAVIGATION DRAWER (Slide-over overlay, visible ONLY on mobile)   */}
      {/* ========================================================================= */}
      {/* Backdrop */}
      <div
        className={cn(
          'no-print fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300',
          mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-out drawer panel */}
      <div
        className={cn(
          'no-print fixed inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white dark:bg-slate-900',
          'border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl',
          'transition-transform duration-300 ease-out md:hidden',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile drawer header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-primary-500/20">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-none block">
                Finova
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Personal Finance
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile drawer links */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  'flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400')} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Mobile drawer footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Theme switcher */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 rounded-xl p-1 gap-1">
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
                  theme === value
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* User profile */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {settings.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {settings.name}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {settings.email}
              </p>
            </div>
          </div>

          {/* Agency Credit */}
          <div className="text-center pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Designed &amp; Developed by{' '}
              <a
                href={AGENCY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Infinvo Tech
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
