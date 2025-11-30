import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import Spinner from '@cloudscape-design/components/spinner';
import Box from '@cloudscape-design/components/box';

// Lazy load all page components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Accounts = lazy(() => import('./pages/Accounts'));
const Reports = lazy(() => import('./pages/Reports'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Budget = lazy(() => import('./pages/Budget'));
const Import = lazy(() => import('./pages/Import'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading fallback component
const LoadingFallback = () => (
  <Box textAlign="center" padding="xxl">
    <Spinner size="large" />
  </Box>
);

function App() {
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

export default App;

