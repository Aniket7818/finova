# Finova — Personal Finance & Expense Tracking SaaS

> **Take control of your money.** A smarter way to track spending, build budgets, and reach your financial goals.

![Finova](https://img.shields.io/badge/Finova-Personal%20Finance-7c3aed?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.3-646cff?style=flat-square&logo=vite)
![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🌟 Overview

**Finova** is a personal finance dashboard web application built with a modern SaaS fintech aesthetic. Users can track income, expenses, budgets, savings goals, transactions, recurring subscriptions, and analytics — with changes persisted locally in the browser via `LocalStorage`.

---

## ✨ Features

- **📊 Comprehensive Dashboard (`/`)**:
  - Live KPI cards: Total Balance, Monthly Income, Monthly Expenses, Savings Rate with period-over-period comparisons.
  - Income vs. Expenses interactive line charts.
  - Category spending donut chart.
  - Recent transactions overview, budget warning widgets, active savings goals, and upcoming recurring bills.
  - Quick actions modal for adding income, expenses, budgets, or goals.

- **💳 Transactions Management (`/transactions`)**:
  - Full CRUD operations with instant derived calculations.
  - Multi-criteria filtering (Type, Category, Date range, Search by title/merchant).
  - Multi-column sorting (date ascending/descending, amount ascending/descending).
  - Paginated table view on desktop; responsive card view on mobile.
  - Export filtered records as CSV.
  - Form validation with Zod and React Hook Form.

- **🎯 Category Budgets (`/budgets`)**:
  - Category monthly spending caps.
  - Visual status progress bars with near-limit and over-budget warnings.
  - Month-by-month historical budget inspection and navigation.

- **🏆 Savings Goals (`/goals`)**:
  - Target amount, target date, custom icon and color pickers.
  - Interactive "Add Money" modal with real-time percentage recalculation.
  - Dedicated completed goals section.

- **📈 Spending Analytics (`/analytics`)**:
  - 3-month, 6-month, and 12-month trends.
  - Cash flow breakdown bar charts.
  - Top category spending rankings with percentage bars.
  - Average daily expense metrics and savings rate indicators.

- **🔄 Recurring Payments & Subscriptions (`/recurring`)**:
  - Manage recurring bills and subscriptions (Netflix, Spotify, Rent, Utilities, SIPs).
  - Flexible billing cycles (Daily, Weekly, Monthly, Quarterly, Yearly).
  - Pause/resume toggle and deletion with confirmation dialogs.
  - Aggregated monthly recurring cost summary.

- **📑 Reports & Statements (`/reports`)**:
  - Detailed monthly breakdown.
  - Printable statement layout with print CSS (`window.print()`).
  - One-click CSV and structured text export.

- **⚙️ Settings & Data Portability (`/settings`)**:
  - Profile customization.
  - Currency selection (`₹ INR`, `$ USD`, `€ EUR`, `£ GBP`).
  - Date format preference.
  - Appearance themes: **Light**, **Dark**, and **System** (auto-mirrors device preference).
  - Complete JSON data export and import with validation.
  - One-click reset to seed data.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with LocalStorage persistence
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Aniket7818/finova.git

# Navigate to the project directory
cd finova

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Building for Production

```bash
npm run build
```

The production output will be generated in the `dist/` directory.

---

## 🎨 Design System

- **Primary Colors**: Deep Violet / Indigo (`#7c3aed`)
- **Neutral Backgrounds**: Soft off-white (`#f8fafc`) in light mode; Slate-950 (`#020617`) in dark mode
- **Cards**: Rounded 16–20px with subtle borders and soft shadows
- **Typography**: Inter / system font stack
- **Responsive**: Desktop sidebar + mobile off-canvas drawer

---

## 📄 License & Credits

- © 2026 Finova. All rights reserved.
- Designed & Developed by [Infinvo Tech](https://infinvotech.com)
