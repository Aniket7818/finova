import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage }     from './pages/OverviewPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage }      from './pages/BudgetsPage';
import { GoalsPage }        from './pages/GoalsPage';
import { AnalyticsPage }    from './pages/AnalyticsPage';
import { RecurringPage }    from './pages/RecurringPage';
import { ReportsPage }      from './pages/ReportsPage';
import { SettingsPage }     from './pages/SettingsPage';
import { useTheme }         from './hooks/useTheme';

function ThemeInit() {
  useTheme(); // Initialize theme effect
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeInit />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/"             element={<OverviewPage />}     />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets"      element={<BudgetsPage />}      />
          <Route path="/goals"        element={<GoalsPage />}        />
          <Route path="/analytics"    element={<AnalyticsPage />}    />
          <Route path="/recurring"    element={<RecurringPage />}    />
          <Route path="/reports"      element={<ReportsPage />}      />
          <Route path="/settings"     element={<SettingsPage />}     />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
