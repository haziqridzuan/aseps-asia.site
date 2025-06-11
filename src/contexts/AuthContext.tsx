import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Simple password check
      if (password === 'aseps2025') {
        const user = {
          id: '1',
          email: email || 'admin@asepsasia.com',
          role: 'admin',
        };

        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));

        // Sign in with Supabase (no password validation, just to create a session)
        // This is needed for Supabase RLS policies
        await supabase.auth.signInWithPassword({
          email: 'admin@asepsasia.com',
          password: 'aseps2025',
        });

        toast({
          title: 'Login successful',
          description: 'Welcome to the admin panel',
          position: 'bottom-right',
        });

        navigate('/admin/dashboard');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();

    setUser(null);
    localStorage.removeItem('user');
    navigate('/'); // Redirect to main dashboard instead of login

    toast({
      title: 'Logged out',
      description: 'You have been logged out',
      position: 'bottom-right',
    });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
