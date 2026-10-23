/**
 * SpotiPlayer Supabase Service
 * Multiplatform client configuration supporting Web, Windows (Tauri v2), and Android (Capacitor).
 * Configures persistent session storage, automatic JWT token refreshing, and OAuth redirect resolution.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { isNative, isDesktop, isWeb } from './config';

// Environment variables for Supabase project connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Checks whether valid Supabase credentials have been configured in the environment.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseUrl !== 'https://tu-proyecto.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Fallback dummy credentials to allow offline guest-mode exploration without crashing constructor
const activeUrl = isSupabaseConfigured ? supabaseUrl : 'https://dummy-spotiplayer.supabase.co';
const activeKey = isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

/**
 * Dynamically resolves the OAuth callback redirect URL based on runtime platform:
 * - Android (Capacitor): Custom deep-link scheme `com.spotiplayer.music://auth/callback`
 * - Windows Desktop (Tauri): Origin `http://tauri.localhost` or local web view
 * - Web Browser: Standard window.location.origin
 */
export function getAuthRedirectUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:3000';

  if (isNative) {
    return 'com.spotiplayer.music://auth/callback';
  }

  if (isDesktop) {
    return window.location.origin || 'http://localhost:3000';
  }

  return window.location.origin;
}

/**
 * Universal storage adapter that safely accesses localStorage on Web, Tauri, and Capacitor WebView.
 */
const customStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (err) {
      console.warn('[Supabase Storage] Failed to get item from localStorage:', err);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (err) {
      console.warn('[Supabase Storage] Failed to set item to localStorage:', err);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn('[Supabase Storage] Failed to remove item from localStorage:', err);
    }
  },
};

/**
 * Global Supabase Client Instance
 * Configured with automatic token refresh and session persistence.
 */
export const supabase: SupabaseClient = createClient(activeUrl, activeKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb, // Only auto-parse URL hash parameters in browser environment
    flowType: 'pkce',          // Proof Key for Code Exchange (recommended for native apps and SPAs)
  },
});

export default supabase;
