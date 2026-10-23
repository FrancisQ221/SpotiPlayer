/**
 * SpotiPlayer - Native MediaSession & Background Audio Hook
 * Integrates directly with the OS System Media Controls (Android Notification Shade,
 * Android Lock Screen, Windows SMTC, and macOS Control Center) via navigator.mediaSession.
 *
 * Provides:
 * - High-Definition multi-resolution artwork (96x96 to 512x512)
 * - Complete OS playback actions (play, pause, next, previous, seekto, seekbackward, seekforward, stop)
 * - Real-time position state synchronization (duration, playbackRate, position)
 * - Screen / CPU WakeLock retention to prevent background suspension
 */

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';

/**
 * Standard sizes recommended by the W3C MediaSession spec & Android System UI
 */
const ARTWORK_SIZES = [
  { size: '96x96', dimension: '96x96' },
  { size: '128x128', dimension: '128x128' },
  { size: '192x192', dimension: '192x192' },
  { size: '256x256', dimension: '256x256' },
  { size: '384x384', dimension: '384x384' },
  { size: '512x512', dimension: '512x512' },
];

export function useMediaSession() {
  const currentSong = usePlayerStore((state) => state.currentSong);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);

  const play = usePlayerStore((state) => state.play);
  const pause = usePlayerStore((state) => state.pause);
  const next = usePlayerStore((state) => state.next);
  const previous = usePlayerStore((state) => state.previous);
  const seekTo = usePlayerStore((state) => state.seekTo);

  // References to track WakeLock sentinel across re-renders
  const wakeLockSentinelRef = useRef<WakeLockSentinel | null>(null);

  // 1. Sync Track Metadata (Title, Artist, Album, HD Artwork Array)
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (!currentSong) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      return;
    }

    try {
      // Build multi-resolution artwork array for Android Lock Screen & Notification Center
      const artworkList = ARTWORK_SIZES.map(({ dimension }) => ({
        src: currentSong.coverUrl,
        sizes: dimension,
        type: 'image/png',
      }));

      // Set native OS metadata
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album || 'SpotiPlayer Master HD',
        artwork: artworkList,
      });
    } catch (error) {
      console.warn('[useMediaSession] Error setting media metadata:', error);
    }
  }, [currentSong]);

  // 2. Sync Playback State ('playing' | 'paused' | 'none')
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      if (!currentSong) {
        navigator.mediaSession.playbackState = 'none';
      } else {
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      }
    } catch (error) {
      console.warn('[useMediaSession] Error setting playback state:', error);
    }
  }, [isPlaying, currentSong]);

  // 3. Register Global OS Media Action Handlers
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const actionHandlers: Array<[MediaSessionAction, MediaSessionActionHandler | null]> = [
      ['play', () => play()],
      ['pause', () => pause()],
      ['previoustrack', () => previous()],
      ['nexttrack', () => next()],
      [
        'seekto',
        (details) => {
          if (details.seekTime !== undefined && !isNaN(details.seekTime)) {
            seekTo(details.seekTime);
          }
        },
      ],
      [
        'seekbackward',
        (details) => {
          const offset = details.seekOffset || 10;
          const target = Math.max(0, currentTime - offset);
          seekTo(target);
        },
      ],
      [
        'seekforward',
        (details) => {
          const offset = details.seekOffset || 10;
          const target = Math.min(duration || 0, currentTime + offset);
          seekTo(target);
        },
      ],
      [
        'stop',
        () => {
          pause();
          seekTo(0);
        },
      ],
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (err) {
        // Some actions might not be supported on all browser engines
        console.debug(`[useMediaSession] Action '${action}' not supported:`, err);
      }
    });

    return () => {
      actionHandlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // Ignore cleanup errors
        }
      });
    };
  }, [play, pause, next, previous, seekTo, currentTime, duration]);

  // 4. Sync OS Position State (Seekbar in Android Lock Screen & Notification Shade)
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('mediaSession' in navigator) ||
      typeof navigator.mediaSession.setPositionState !== 'function' ||
      !currentSong ||
      !duration ||
      isNaN(duration) ||
      duration <= 0
    ) {
      return;
    }

    try {
      const safeDuration = Math.max(0, duration);
      const safePosition = Math.min(Math.max(0, currentTime), safeDuration);

      navigator.mediaSession.setPositionState({
        duration: safeDuration,
        playbackRate: isPlaying ? 1.0 : 0.0,
        position: safePosition,
      });
    } catch (err) {
      // setPositionState throws if position > duration or values are negative
      console.debug('[useMediaSession] setPositionState ignored out-of-sync update:', err);
    }
  }, [currentTime, duration, isPlaying, currentSong]);

  // 5. Screen & CPU WakeLock Management (Prevents OS from killing thread on mobile/lock screen)
  useEffect(() => {
    let isCancelled = false;

    const requestLock = async () => {
      if (
        typeof navigator === 'undefined' ||
        !('wakeLock' in navigator) ||
        !isPlaying ||
        isCancelled
      ) {
        return;
      }

      try {
        if (!wakeLockSentinelRef.current) {
          wakeLockSentinelRef.current = await navigator.wakeLock.request('screen');
          wakeLockSentinelRef.current.addEventListener('release', () => {
            wakeLockSentinelRef.current = null;
          });
        }
      } catch (err) {
        // WakeLock request can fail if battery saver is engaged or user switched apps
        console.debug('[useMediaSession] WakeLock request notice:', err);
      }
    };

    const releaseLock = async () => {
      if (wakeLockSentinelRef.current) {
        try {
          await wakeLockSentinelRef.current.release();
        } catch {
          // Ignore release errors
        }
        wakeLockSentinelRef.current = null;
      }
    };

    if (isPlaying) {
      requestLock();
    } else {
      releaseLock();
    }

    // Re-acquire lock if page visibility changes back to visible while playing
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseLock();
    };
  }, [isPlaying]);
}

export default useMediaSession;
