import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Environment } from '@/types/mpesa';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [environment, setEnvironment] = useState<Environment>('sandbox');

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn('transition-all duration-300', 'ml-64')}>
        <Header environment={environment} onEnvironmentChange={setEnvironment} />
        <main className="p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
