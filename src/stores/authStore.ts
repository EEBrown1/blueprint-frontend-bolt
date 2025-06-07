import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    console.log('Login attempt with email:', email);
    set({ isLoading: true, error: null });
    
    try {
      console.log('Calling Supabase signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase response:', { data, error });

      if (error) throw error;

      if (data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.name,
        };
        console.log('Setting user in store:', user);
        set({ user, isAuthenticated: true, isLoading: false });
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Login failed. Please try again.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  register: async (email, password, name) => {
    console.log('Register attempt with email:', email);
    set({ isLoading: true, error: null });
    
    try {
      console.log('Calling Supabase signUp...');
      
      // Test the connection before attempting signup
      const { error: testError } = await supabase.auth.getSession();
      if (testError) {
        console.error('Connection test failed:', testError);
        throw new Error('Could not connect to authentication service. Please check your internet connection.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      console.log('Supabase signup response:', { 
        success: !!data.user, 
        error: error?.message,
        confirmationSent: data?.user?.confirmation_sent_at 
      });

      if (error) throw error;

      if (data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata.name,
        };
        console.log('Setting user in store:', user);
        set({ user, isAuthenticated: true, isLoading: false });
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Could not connect to the authentication service. Please check your internet connection and make sure your VPN (if any) is disabled.';
        } else {
          errorMessage = error.message;
        }
      }
      
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
  
  checkAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const user = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name,
        };
        set({ user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ user: null, isAuthenticated: false });
    }
  },
  
  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Password reset failed. Please try again.',
        isLoading: false 
      });
      throw error;
    }
  }
}));