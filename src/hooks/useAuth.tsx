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

  // Debug wrapper functions to track state changes
  const setSessionWithDebug = (newSession: Session | null) => {
    console.log('🔄 SESSION STATE CHANGE:', {
      from: session ? 'has session' : 'no session',
      to: newSession ? 'has session' : 'no session',
      sessionId: newSession?.user?.id,
      timestamp: new Date().toISOString()
    });

    // Store session state in sessionStorage for persistence
    if (newSession) {
      sessionStorage.setItem('authSession', JSON.stringify({
        access_token: newSession.access_token,
        user: newSession.user,
        timestamp: Date.now()
      }));
    } else {
      sessionStorage.removeItem('authSession');
    }

    setSession(newSession);
  };

  const setUserWithDebug = (newUser: User | null) => {
    console.log('👤 USER STATE CHANGE:', {
      from: user ? `${user.email} (${user.id})` : 'no user',
      to: newUser ? `${newUser.email} (${newUser.id})` : 'no user',
      timestamp: new Date().toISOString(),
      stack: new Error().stack?.split('\n').slice(1, 4)
    });

    // Store user state in sessionStorage for persistence
    if (newUser) {
      sessionStorage.setItem('authUser', JSON.stringify(newUser));
    } else {
      sessionStorage.removeItem('authUser');
    }

    setUser(newUser);
  };

  useEffect(() => {
    // Check if user just logged out
    const justLoggedOut = sessionStorage.getItem('justLoggedOut');
    if (justLoggedOut) {
      sessionStorage.removeItem('justLoggedOut');
      console.log('🚪 JUST LOGGED OUT FLAG DETECTED');
      setSessionWithDebug(null);
      setUserWithDebug(null);
      setLoading(false);
      return;
    }

    // Failsafe timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('⚠️ Loading timeout reached, forcing loading=false');
      console.log('🔄 Timeout fallback: clearing auth state');
      setSessionWithDebug(null);
      setUserWithDebug(null);
      setLoading(false);
    }, 8000); // 8 second timeout (session fetch has 5s timeout)

    // Get initial session with timeout protection
    const getSession = async () => {
      try {
        console.log('🔄 Getting initial session...');

        // Add timeout to getSession call specifically
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
        );

        const { data: { session: initialSession } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        console.log('✅ Initial session retrieved:', initialSession);
        setSessionWithDebug(initialSession);

        if (initialSession?.user) {
          console.log('👤 User found in session, fetching profile...');
          await fetchUserProfile(initialSession.user);
        } else {
          console.log('❌ No session found, stopping loading');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error getting session:', error);
        console.log('🔄 Attempting to recover from sessionStorage...');

        // Try to recover from sessionStorage
        try {
          const storedUser = sessionStorage.getItem('authUser');
          const storedSession = sessionStorage.getItem('authSession');

          if (storedUser && storedSession) {
            console.log('✅ Recovered auth state from sessionStorage');
            const parsedUser = JSON.parse(storedUser);
            setUserWithDebug(parsedUser);
            // Don't set session from storage as it might be stale
            setLoading(false);
            return;
          }
        } catch (recoveryError) {
          console.error('❌ Failed to recover from sessionStorage:', recoveryError);
        }

        // Final fallback
        console.log('🔄 No recovery possible, clearing state');
        setSessionWithDebug(null);
        setUserWithDebug(null);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change event:', event, 'Session:', session);

        // Always update session to keep it in sync
        setSessionWithDebug(session);

        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('👤 User signed in, fetching profile...');
          await fetchUserProfile(session.user);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed, updating profile if needed...');
          if (!user || user.id !== session.user.id) {
            await fetchUserProfile(session.user);
          } else {
            // User is already set and matches, just ensure loading is false
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
          console.log('❌ User signed out or session lost, clearing state');
          setUserWithDebug(null);
          setLoading(false);
        } else if (event === 'INITIAL_SESSION') {
          console.log('🔄 Initial session event, handling in getSession');
          // Don't do anything here, let getSession handle it
        } else {
          console.log('🚫 Unhandled auth event:', event);
          setLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    console.log('🔄 fetchUserProfile called for user:', authUser.id, authUser.email);

    try {
      // Determine user role first
      const adminEmails = [
        'nate.dowd@operationmotorsport.org',
        'tiffany.lodder@operationmotorsport.org',
        'jason.leach@operationmotorsport.org',
        'admin@operationmotorsport.org'
      ];

      const userEmail = authUser.email || '';
      const fallbackRole: 'admin' | 'staff' = adminEmails.includes(userEmail.toLowerCase()) ? 'admin' : 'staff';

      // Try to fetch user profile from database first with timeout protection
      try {
        console.log('🔍 Attempting to fetch user profile from database...');

        // Add 3-second timeout to database query
        const dbQueryPromise = supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database query timeout')), 3000)
        );

        const { data: userProfile, error: profileError } = await Promise.race([
          dbQueryPromise,
          timeoutPromise
        ]) as any;

        if (!profileError && userProfile) {
          console.log('✅ User profile found in database:', userProfile);
          setUserWithDebug(userProfile);
          console.log('✅ User state set from database profile');
          return;
        } else {
          console.log('❌ Database query failed or no profile found:', profileError);
        }
      } catch (error) {
        console.error('❌ Database fetch error (will use fallback):', error);
      }

      // ALWAYS create fallback user profile to ensure login works
      console.log(`🔄 Creating fallback user profile with ${fallbackRole} role for ${userEmail}...`);
      const tempUser = {
        id: authUser.id,
        email: userEmail,
        role: fallbackRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setUserWithDebug(tempUser);
      console.log(`✅ Fallback user profile created with ${fallbackRole} role:`, tempUser);

    } catch (error) {
      console.error('❌ Critical error in fetchUserProfile:', error);

      // EMERGENCY fallback - ensure user is ALWAYS set
      const emergencyUser = {
        id: authUser.id,
        email: authUser.email || '',
        role: 'staff' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setUserWithDebug(emergencyUser);
      console.log('🚨 Emergency user profile created:', emergencyUser);
    } finally {
      // ALWAYS set loading to false
      console.log('🔄 Setting loading=false in fetchUserProfile finally block');
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
      setSessionWithDebug(null);
      setUserWithDebug(null);

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
      setSessionWithDebug(null);
      setUserWithDebug(null);

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