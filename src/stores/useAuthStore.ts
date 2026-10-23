/**
 * SpotiPlayer Global Authentication Store
 * Powered by Zustand & Supabase Auth.
 * Multiplatform support for Web, Windows (Tauri v2), and Android (Capacitor).
 * Provides automatic session restoration, Guest Mode (Modo Estándar Libre), and persistent state.
 */

import { create } from 'zustand';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, getAuthRedirectUrl } from '../services/supabase';

const GUEST_STORAGE_KEY = 'spotiplayer_guest_mode';

export interface UserProfileMetadata {
  username?: string;
  avatar_url?: string;
  patron_tier?: string;
}

export interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  errorMessage: string | null;
  isGuest: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, username?: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  continueAsGuest: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  errorMessage: null,
  isGuest: false,

  /**
   * Clears any active error message in the UI
   */
  clearError: () => {
    set({ error: null, errorMessage: null });
  },

  /**
   * Automatically restores persisted user session upon app launch or phone restart.
   * Also listens for real-time auth events (token refresh, sign out).
   */
  checkSession: async () => {
    set({ isLoading: true, errorMessage: null });

    // Check if user previously elected to continue as guest
    const savedGuest = typeof window !== 'undefined'
      ? window.localStorage.getItem(GUEST_STORAGE_KEY) === 'true'
      : false;

    if (!isSupabaseConfigured) {
      set({
        isLoading: false,
        isInitialized: true,
        isGuest: savedGuest,
        user: null,
        session: null,
      });
      return;
    }

    try {
      // 1. Retrieve current persisted session from Supabase storage
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.warn('[useAuthStore] Error retrieving session:', error.message);
        set({
          session: null,
          user: null,
          isGuest: savedGuest,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }

      if (session?.user) {
        // Active session restored: disable guest mode and set authenticated user
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(GUEST_STORAGE_KEY);
        }
        set({
          session,
          user: session.user,
          isGuest: false,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        // No active session found
        set({
          session: null,
          user: null,
          isGuest: savedGuest,
          isLoading: false,
          isInitialized: true,
        });
      }

      // 2. Set up continuous background session listener
      supabase.auth.onAuthStateChange((_event, currentSession) => {
        if (currentSession?.user) {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(GUEST_STORAGE_KEY);
          }
          set({
            session: currentSession,
            user: currentSession.user,
            isGuest: false,
          });
        } else {
          set({
            session: null,
            user: null,
          });
        }
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al verificar la sesión';
      console.error('[useAuthStore] checkSession failure:', message);
      set({
        isLoading: false,
        isInitialized: true,
        isGuest: savedGuest,
        error: null,
        errorMessage: null, // Avoid blocking guest exploration on transient network error
      });
    }
  },

  /**
   * Authenticates user with email and password
   */
  signIn: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null, errorMessage: null });

    if (!isSupabaseConfigured) {
      const msg = 'Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env para autenticación real.';
      set({
        isLoading: false,
        error: msg,
        errorMessage: msg,
      });
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        set({ isLoading: false, error: error.message, errorMessage: error.message });
        return false;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(GUEST_STORAGE_KEY);
      }

      set({
        user: data.user,
        session: data.session,
        isGuest: false,
        isLoading: false,
        error: null,
        errorMessage: null,
      });

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado durante el inicio de sesión';
      set({ isLoading: false, error: message, errorMessage: message });
      return false;
    }
  },


  /**
   * Registers a new user account with email, password, and optional username
   */
  signUp: async (email: string, password: string, username?: string): Promise<boolean> => {
    set({ isLoading: true, error: null, errorMessage: null });

    if (!isSupabaseConfigured) {
      const msg = 'Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env para registro de usuarios.';
      set({
        isLoading: false,
        error: msg,
        errorMessage: msg,
      });
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username?.trim() || email.split('@')[0],
            patron_tier: 'standard',
          },
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });

      if (error) {
        set({ isLoading: false, error: error.message, errorMessage: error.message });
        return false;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(GUEST_STORAGE_KEY);
      }

      // If email confirmation is disabled in Supabase, session is established immediately
      set({
        user: data.user,
        session: data.session,
        isGuest: false,
        isLoading: false,
        error: null,
        errorMessage: null,
      });

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado durante el registro';
      set({ isLoading: false, error: message, errorMessage: message });
      return false;
    }
  },

  /**
   * Initiates Google OAuth authentication with native deep-link or web redirect
   */
  signInWithGoogle: async (): Promise<void> => {
    set({ isLoading: true, error: null, errorMessage: null });

    if (!isSupabaseConfigured) {
      const msg = 'Configura tus credenciales de Supabase para iniciar sesión con Google.';
      set({
        isLoading: false,
        error: msg,
        errorMessage: msg,
      });
      return;
    }

    try {
      const redirectUrl = getAuthRedirectUrl();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        set({ isLoading: false, error: error.message, errorMessage: error.message });
      }
      // On success, the browser / WebView navigates to Google consent screen
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al conectar con Google OAuth';
      set({ isLoading: false, error: message, errorMessage: message });
    }
  },

  /**
   * Signs out user and clears persisted sessions
   */
  signOut: async (): Promise<void> => {
    set({ isLoading: true });

    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[useAuthStore] Error during signOut:', err);
    } finally {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(GUEST_STORAGE_KEY);
      }
      set({
        user: null,
        session: null,
        isGuest: false,
        isLoading: false,
        error: null,
        errorMessage: null,
      });
    }
  },

  /**
   * Enables Guest Mode ("Modo Estándar Libre") without forcing user registration,
   * allowing instant listening with full audiophile features.
   */
  continueAsGuest: () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(GUEST_STORAGE_KEY, 'true');
      } catch (err) {
        console.warn('[useAuthStore] Failed saving guest flag to localStorage:', err);
      }
    }

    set({
      user: null,
      session: null,
      isGuest: true,
      error: null,
      errorMessage: null,
      isLoading: false,
    });
  },
}));

