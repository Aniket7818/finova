import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../ui/ToastContainer';
import { TransactionModal } from '../transactions/TransactionModal';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils';
import { AGENCY_URL } from '../../constants';

export function AppShell() {
  const { sidebarOpen } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar & Mobile Drawer */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300 w-full min-w-0',
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        )}
      >
        <Topbar onAddTransaction={() => setAddOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="mt-auto px-6 py-5 border-t border-slate-200 dark:border-slate-800 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 Finova. All rights reserved. &nbsp;·&nbsp;{' '}
            <span>
              Designed &amp; Developed by{' '}
              <a
                href={AGENCY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
              >
                Infinvo Tech
              </a>
            </span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            🔒 Demo app — all changes are stored locally in your browser. No real bank connectivity or financial advice.
          </p>
        </footer>
      </div>

      <TransactionModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ToastContainer />
    </div>
  );
}
