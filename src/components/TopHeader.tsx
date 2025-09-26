import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function TopHeader() {
  const { user, signOut, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 safe-area-inset">
      <div className="px-4 py-3 relative">
        {!isAdminPage && (
          <div className="flex justify-center">
            <img
              src="/vror.png"
              alt="Veterans Race of Remembrance"
              className="h-12 w-auto"
            />
          </div>
        )}

        <div className="absolute top-3 right-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="touch-target bg-gray-100 rounded-full p-2 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="User menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    {isAdmin && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        Admin
                      </span>
                    )}
                    {user?.role}
                  </p>
                </div>
                <div className="p-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md touch-target"
                  >
                    Sign Out
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </header>
  );
}