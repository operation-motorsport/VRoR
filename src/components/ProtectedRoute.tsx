import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute render - loading:', loading, 'user:', user ? 'present' : 'null', 'adminOnly:', adminOnly);

  // Emergency debug mode - enable temporarily to bypass auth issues
  const DEBUG_MODE = true; // TEMPORARY: Enable to bypass auth while debugging

  if (DEBUG_MODE) {
    console.log('DEBUG MODE: Bypassing auth');
    return <>{children}</>;
  }

  if (loading) {
    console.log('ProtectedRoute: Still loading, user:', user, 'loading:', loading);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
          <p className="text-xs text-gray-400 mt-2">Restoring your session, please wait</p>
          <p className="text-xs text-gray-400 mt-1">Check console for debug information</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, showing LoginForm');
    return <LoginForm />;
  }

  console.log('ProtectedRoute: User authenticated, showing children');

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            This feature requires administrator permissions.
          </p>
          <p className="text-sm text-gray-500">
            Contact an administrator to upgrade your account.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}