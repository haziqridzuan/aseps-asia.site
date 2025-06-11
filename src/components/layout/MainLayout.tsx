import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import BackToTop from '@/components/BackToTop';

export default function MainLayout() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setIsLoaded(true);
      toast('Welcome to ASEPS Asia', {
        description: 'Your manufacturing progress tracker',
        position: 'bottom-center',
      });
    }, 500);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 md:p-6 transition-all">
            {isLoaded ? (
              <div className="animate-fade-in">
                <Outlet />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-primary">Loading...</div>
              </div>
            )}
            <BackToTop />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
