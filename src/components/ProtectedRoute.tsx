/**
 * SpotiPlayer Protected Route Wrapper
 * Multiplatform route guard for Web, Windows (Tauri v2), and Android (Capacitor).
 * Handles:
 * - Session restoration validation without UI flicker
 * - Authentication & Guest Mode ("Modo Estándar Libre") access
 * - Automatic redirects from /login and /register to /home for active sessions
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * When true, only unauthenticated visitors can access this route (e.g. /login, /register).
   * Authenticated users or guests will be redirected to `redirectTo` (default: /home).
   */
  publicOnly?: boolean;
  /**
   * Destination path when redirecting. Defaults to /login for protected routes, and /home for publicOnly.
   */
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  publicOnly = false,
  redirectTo,
}) => {
  const { user, isGuest, isInitialized } = useAuthStore();
  const location = useLocation();

  // Render seamless dark glassmorphism splash screen during session validation
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0e141a] text-white select-none">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00e599]/25 to-transparent border border-[#00e599]/40 shadow-[0_0_32px_rgba(0,229,153,0.35)] mb-4">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#00e599] border-t-transparent" />
        </div>
        <p className="text-xs font-bold tracking-widest text-[#00e599] uppercase">
          SpotiPlayer Studio HD
        </p>
        <span className="text-[11px] text-[#849589] mt-1">Verificando sesión segura...</span>
      </div>
    );
  }

  const hasAccess = Boolean(user || isGuest);

  // If route is public-only (e.g., /login or /register) and user is already signed in or guest
  if (publicOnly) {
    if (hasAccess) {
      return <Navigate to={redirectTo || '/home'} replace />;
    }
    return <>{children}</>;
  }

  // If route is protected and user does not have session or guest mode
  if (!hasAccess) {
    return <Navigate to={redirectTo || '/login'} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
