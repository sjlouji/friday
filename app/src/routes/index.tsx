import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Spinner from "@cloudscape-design/components/spinner";
import Box from "@cloudscape-design/components/box";

const LoadingFallback = () => (
  <Box textAlign="center" padding="xxl">
    <Spinner size="large" />
  </Box>
);

const Dashboard = lazy(() => import("@/modules/dashboard/pages/Dashboard"));
const Transactions = lazy(() => import("@/modules/transactions/pages/Transactions"));
const Accounts = lazy(() => import("@/modules/accounts/pages/Accounts"));
const Reports = lazy(() => import("@/modules/reports/pages/Reports"));
const Portfolio = lazy(() => import("@/modules/portfolio/pages/Portfolio"));
const Budget = lazy(() => import("@/modules/budget/pages/Budget"));
const Bills = lazy(() => import("@/modules/bills/pages/Bills"));
const Tax = lazy(() => import("@/modules/tax/pages/Tax"));
const Goals = lazy(() => import("@/modules/goals/pages/Goals"));
const RecurringTransactions = lazy(() => import("@/modules/recurring/pages/RecurringTransactions"));
const Assets = lazy(() => import("@/modules/assets/pages/Assets"));
const Debt = lazy(() => import("@/modules/debt/pages/Debt"));
const Import = lazy(() => import("@/modules/import/pages/Import"));
const Settings = lazy(() => import("@/modules/settings/pages/Settings"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="transactions"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Transactions />
              </Suspense>
            }
          />
          <Route
            path="accounts"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Accounts />
              </Suspense>
            }
          />
          <Route
            path="reports"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Reports />
              </Suspense>
            }
          />
          <Route
            path="portfolio"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Portfolio />
              </Suspense>
            }
          />
          <Route
            path="budget"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Budget />
              </Suspense>
            }
          />
          <Route
            path="bills"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Bills />
              </Suspense>
            }
          />
          <Route
            path="tax"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Tax />
              </Suspense>
            }
          />
          <Route
            path="goals"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Goals />
              </Suspense>
            }
          />
          <Route
            path="recurring"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <RecurringTransactions />
              </Suspense>
            }
          />
          <Route
            path="assets"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Assets />
              </Suspense>
            }
          />
          <Route
            path="debt"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Debt />
              </Suspense>
            }
          />
          <Route
            path="import"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Import />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

