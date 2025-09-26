import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BottomNavigation } from './BottomNavigation';
import { TopHeader } from './TopHeader';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopHeader />

      <main className="flex-1 pb-16 safe-area-inset">
        {children}
      </main>

      <BottomNavigation />
    </div>
  );
}