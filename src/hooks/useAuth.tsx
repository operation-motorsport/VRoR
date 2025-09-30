import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: 'staff' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Check if user just logged out
    const justLoggedOut = sessionStorage.getItem('justLoggedOut');
    if (justLoggedOut) {
      sessionStorage.removeItem('justLoggedOut');
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }

    // Get initial session
    const getSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession);
        setSession(initialSession);
        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user);
        } else {
          // No session found, stop loading
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('Fetching user profile for:', authUser.id);

      // Try to fetch user profile from database first
      console.log('Fetching user profile from database...');

      try {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          console.error('Database error fetching user profile:', profileError);
          throw profileError;
        }

        if (userProfile) {
          console.log('✅ User profile found in database:', userProfile);
          setUser(userProfile);
          console.log('🔄 Setting loading=false after database profile found');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Failed to fetch user profile, creating temporary one:', error);
      }

      // Fallback: Create temporary user profile with staff role (not admin)
      console.log('Creating temporary user profile with staff role...');
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        role: 'staff', // Default to staff, not admin
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log('Temporary user profile created with staff role');
      console.log('🔄 Setting loading=false after temporary profile created');
      setLoading(false);

      // TODO: Re-enable database query after fixing connection issues
      /*
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      console.log('User profile query result:', { data, error });

      if (error && error.code === 'PGRST116') {
        console.log('Creating new user profile...');
        const newUser = await createUserProfile(authUser.id, authUser.email || '');
        console.log('New user created:', newUser);
        setUser(newUser);
      } else if (error) {
        console.error('Database error:', error);
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          role: 'staff',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else if (data) {
        console.log('User profile found:', data);
        setUser(data);
      }
      */
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback: create minimal user object
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        role: 'staff',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log('🔄 Setting loading=false after error fallback');
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const createUserProfile = async (userId: string, email: string, role: 'staff' | 'admin' = 'staff') => {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: email,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, role: 'staff' | 'admin' = 'staff') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        }
      }
    });
    if (error) throw error;

    // If user was created successfully, also create their profile in the users table
    if (data.user) {
      try {
        await createUserProfile(data.user.id, email, role);
        console.log('User profile created in database');
      } catch (profileError) {
        console.error('Failed to create user profile:', profileError);
        // Don't throw here - the auth user was created successfully
      }
    }

    // Don't return data to match interface
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');

      // Set logout flag before clearing session storage
      sessionStorage.setItem('justLoggedOut', 'true');

      // Clear local state immediately
      setSession(null);
      setUser(null);

      // Force clear all Supabase storage keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('supabase.auth')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Sign out from Supabase after clearing storage
      await supabase.auth.signOut({ scope: 'global' });

      console.log('User signed out successfully');

      // Navigate to login instead of reload to prevent auth state restoration
      window.location.href = window.location.origin;

    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if there's an error, clear everything and navigate
      sessionStorage.setItem('justLoggedOut', 'true');
      setSession(null);
      setUser(null);

      // Clear all storage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('supabase.auth')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      window.location.href = window.location.origin;
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
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