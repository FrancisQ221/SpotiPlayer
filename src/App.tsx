/**
 * SpotiPlayer Multiplatform Application
 * React 19 + TypeScript + Zustand + Tailwind CSS + Supabase Auth.
 * Compatible with Web, Windows (.exe with Tauri v2), and Android (.apk with Capacitor).
 * Features:
 * - Persistent authentication & Guest Mode ("Modo Estándar Libre")
 * - Protected route wrapper with instant session restoration without UI flicker
 * - Multiplatform HashRouter ensuring static & local WebView asset route resolution
 */

import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { HomeScreenContent } from './components/HomeScreenContent';
import { SearchScreen } from './components/SearchScreen';
import { LyricsScreen } from './components/LyricsScreen';
import { EqualizerScreen } from './components/EqualizerScreen';
import { ArtistProfileScreen } from './components/ArtistProfileScreen';
import { TransparencySettingsScreen } from './components/TransparencySettingsScreen';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginScreen, RegisterScreen } from './pages';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { usePlayerStore } from './stores/usePlayerStore';
import { useUIStore, type AppView } from './stores/useUIStore';
import { useAuthStore } from './stores/useAuthStore';
import { MOCK_SONGS } from './services/musicData';

/**
 * Route View Synchronizer
 * Syncs URL location path with useUIStore state for two-way consistency across links and buttons.
 */
function RouteSyncWatcher() {
  const location = useLocation();
  const { setView } = useUIStore();

  useEffect(() => {
    const rawPath = location.pathname.replace(/^\/+/, '');
    const validViews: AppView[] = [
      'home',
      'search',
      'library',
      'history',
      'lyrics',
      'artist',
      'equalizer',
      'settings',
      'playlist',
    ];

    if (rawPath && validViews.includes(rawPath as AppView)) {
      setView(rawPath as AppView);
    }
  }, [location.pathname, setView]);

  return null;
}

/**
 * Main Player Shell Router
 */
function MainPlayerRouter() {
  // Initialize Web Audio Engine
  useAudioPlayer();

  const { currentSong, setQueue, syncFavoritesFromCloud } = usePlayerStore();
  const { syncPlaylistsFromCloud } = useUIStore();
  const { user } = useAuthStore();

  // Populate initial master track queue and synchronize cloud favorites & playlists
  useEffect(() => {
    if (!currentSong) {
      setQueue(MOCK_SONGS, 0, 'playlist', 'SpotiPlayer Masters');
    }
    syncFavoritesFromCloud();
    syncPlaylistsFromCloud();
  }, [currentSong, setQueue, syncFavoritesFromCloud, syncPlaylistsFromCloud, user]);


  return (
    <>
      <RouteSyncWatcher />
      <AppLayout>
        <Routes>
          <Route path="/home" element={<HomeScreenContent />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="/lyrics" element={<LyricsScreen />} />
          <Route path="/equalizer" element={<EqualizerScreen />} />
          <Route path="/artist" element={<ArtistProfileScreen />} />
          <Route path="/settings" element={<TransparencySettingsScreen />} />
          <Route path="/library" element={<HomeScreenContent />} />
          <Route path="/history" element={<HomeScreenContent />} />
          <Route path="/playlist" element={<HomeScreenContent />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AppLayout>
    </>
  );
}

/**
 * Root Application Entrypoint
 */
export default function App() {
  const { checkSession, isInitialized } = useAuthStore();

  // Restore session from localStorage/WebView partition on startup (Windows & Android persistence)
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Anti-flicker splash screen during initial storage verification
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0e141a] text-white select-none">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00e599]/25 to-transparent border border-[#00e599]/40 shadow-[0_0_32px_rgba(0,229,153,0.35)] mb-4">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#00e599] border-t-transparent" />
        </div>
        <p className="text-xs font-bold tracking-widest text-[#00e599] uppercase">
          SpotiPlayer Studio HD
        </p>
        <span className="text-[11px] text-[#849589] mt-1">Verificando sesión persistente...</span>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Public-only authentication routes (redirect to /home if already logged in or guest) */}
        <Route
          path="/login"
          element={
            <ProtectedRoute publicOnly redirectTo="/home">
              <LoginScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute publicOnly redirectTo="/home">
              <RegisterScreen />
            </ProtectedRoute>
          }
        />

        {/* Root redirect to home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Protected Application Routes (requires active user or guest mode) */}
        <Route
          path="/*"
          element={
            <ProtectedRoute redirectTo="/login">
              <MainPlayerRouter />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
}
