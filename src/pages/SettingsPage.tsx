import { useState, useRef } from 'react';
import { User, Globe, Calendar, Bell, Database, Download, Upload, Trash2, Sun, Moon, Monitor } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../hooks/useTheme';
import { downloadFile } from '../utils';
import { cn } from '../utils';
import { AGENCY_URL } from '../constants';

const currencies = [
  { code: 'INR', label: '₹ Indian Rupee' },
  { code: 'USD', label: '$ US Dollar' },
  { code: 'EUR', label: '€ Euro' },
  { code: 'GBP', label: '£ British Pound' },
];

const dateFormats = [
  { value: 'dd MMM yyyy', label: 'DD MMM YYYY (e.g. 02 Oct 2026)' },
  { value: 'MM/dd/yyyy',  label: 'MM/DD/YYYY (e.g. 10/02/2026)' },
  { value: 'dd/MM/yyyy',  label: 'DD/MM/YYYY (e.g. 02/10/2026)' },
  { value: 'yyyy-MM-dd',  label: 'ISO (2026-10-02)' },
];

export function SettingsPage() {
  const { settings, updateSettings, resetToSampleData, exportData, importData } = useAppStore();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const data = exportData();
    downloadFile(JSON.stringify(data, null, 2), 'finova-data.json', 'application/json');
    toast.success('Data exported as JSON');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data || typeof data !== 'object') throw new Error('Invalid format');
        importData(data);
        toast.success('Data imported successfully');
      } catch {
        toast.error('Failed to import: invalid JSON format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    resetToSampleData();
    toast.success('Data reset to sample data');
    setShowResetConfirm(false);
  };

  const inputCls = 'w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition';
  const sectionCls = 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4';

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Profile */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Profile</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
            <input
              value={settings.name}
              onChange={(e) => updateSettings({ name: e.target.value })}
              className={inputCls}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              value={settings.email}
              onChange={(e) => updateSettings({ email: e.target.value })}
              className={inputCls}
              placeholder="your@email.com"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">This is a demo profile. No data is sent to any server.</p>
      </div>

      {/* Preferences */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Preferences</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label>
            <select value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })} className={inputCls}>
              {currencies.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date Format</label>
            <select value={settings.dateFormat} onChange={(e) => updateSettings({ dateFormat: e.target.value })} className={inputCls}>
              {dateFormats.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-1">
          <Sun className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Appearance</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Choose a theme or sync automatically with your device preference.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              value: 'light' as const,
              icon: Sun,
              label: 'Light',
              desc: 'Clean, soft bright theme',
            },
            {
              value: 'dark' as const,
              icon: Moon,
              label: 'Dark',
              desc: 'Deep slate midnight theme',
            },
            {
              value: 'system' as const,
              icon: Monitor,
              label: 'System',
              desc: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'Device sync (Currently Dark)'
                : 'Device sync (Currently Light)',
            },
          ].map(({ value, icon: Icon, label, desc }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left group',
                theme === value
                  ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    theme === value
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                {desc}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
          ℹ️ When <strong>System</strong> is selected, Finova mirrors your OS/browser mode. If your computer is in light mode, System will show light; if your computer switches to dark mode, Finova will automatically turn dark.
        </p>
      </div>

      {/* Notifications */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notification Preferences</h3>
        </div>
        {[
          { key: 'budgetAlerts',        label: 'Budget Alerts',         desc: 'Get notified when approaching budget limits' },
          { key: 'goalReminders',       label: 'Goal Reminders',        desc: 'Reminders to contribute towards your goals'  },
          { key: 'recurringReminders',  label: 'Recurring Reminders',   desc: 'Alerts for upcoming recurring payments'       },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>
            </div>
            <button
              onClick={() => updateSettings({ notifications: { ...settings.notifications, [key]: !settings.notifications[key as keyof typeof settings.notifications] } })}
              className={cn('w-11 h-6 rounded-full transition-colors relative', settings.notifications[key as keyof typeof settings.notifications] ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700')}
            >
              <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', settings.notifications[key as keyof typeof settings.notifications] ? 'left-5' : 'left-0.5')} />
            </button>
          </div>
        ))}
        <p className="text-xs text-slate-400 dark:text-slate-500">Demo — notifications are shown in the app header only.</p>
      </div>

      {/* Data Management */}
      <div className={sectionCls}>
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Data Management</h3>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 px-4 py-3 mb-3">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">🔒 Local Storage Only</p>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">All your data is stored exclusively in this browser's localStorage. Nothing is sent to any server.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={handleExportJSON} className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Upload className="w-4 h-4" /> Import JSON
          </button>
          <button onClick={() => setShowResetConfirm(true)} className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 className="w-4 h-4" /> Reset Data
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
        <p className="text-xs text-slate-400 dark:text-slate-500">Reset will restore all sample transactions, budgets, and goals.</p>
      </div>

      {/* About */}
      <div className={sectionCls}>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">About Finova</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>Finova</strong> — Take control of your money. A smarter way to track spending, build budgets, and reach your financial goals.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          This is a frontend-only demo application. No real banking connections, no real financial advice, no personal data collection.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
          Designed &amp; Developed by{' '}
          <a href={AGENCY_URL} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Infinvo Tech
          </a>
          {' '}· © 2026 Finova. All rights reserved.
        </p>
      </div>

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset to Sample Data"
        message="This will delete all your custom transactions, budgets, and goals, and restore the original sample data. This cannot be undone."
        confirmLabel="Reset Everything"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
