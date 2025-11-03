import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { VeteransPage } from './pages/VeteransPage';
import { TeamsPage } from './pages/TeamsPage';
import { EventsPage } from './pages/EventsPage';
import { SchedulePage } from './pages/SchedulePage';
import { AdminPage } from './pages/AdminPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
            <Route
              path="/"
              element={<Navigate to="/veterans" replace />}
            />

            <Route
              path="/veterans"
              element={
                <ProtectedRoute>
                  <VeteransPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <TeamsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/schedule"
              element={
                <ProtectedRoute>
                  <SchedulePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reset-password"
              element={<ResetPasswordPage />}
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;