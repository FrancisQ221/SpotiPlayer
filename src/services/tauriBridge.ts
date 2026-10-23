/**
 * SpotiPlayer - Tauri v2 & Windows SMTC (System Media Transport Controls) Bridge
 * Connects physical keyboard media keys (Play, Pause, Next, Prev) and Windows OS
 * flyout banner with the Zustand usePlayerStore and AudioEngine.
 */

import { usePlayerStore } from '../stores/usePlayerStore';
import { isDesktop } from './config';

// Safe dynamic access to Tauri v2 core API if running in desktop environment
async function getTauriCore() {
  if (!isDesktop || typeof window === 'undefined') return null;

  try {
    // Dynamic import to avoid runtime crashes in browser environments
    const core = await import('@tauri-apps/api/core');
    const event = await import('@tauri-apps/api/event');
    return { core, event };
  } catch {
    return null;
  }
}

class TauriBridge {
  private isInitialized = false;
  private unsubscribeStore: (() => void) | null = null;
  private unlistenEvents: Array<() => void> = [];

  /**
   * Initializes Windows SMTC integration and physical media key listeners
   */
  public async init(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Setup Browser/WebView MediaSession API
    // On Windows 10/11, Edge WebView2 natively forwards MediaSession events directly to Windows SMTC!
    this.setupMediaSession();

    // 2. Setup Physical Keyboard Multimedia Keys (DOM Level 3 KeyboardEvent.code)
    this.setupHardwareKeyboardKeys();

    // 3. Setup Tauri IPC listeners if running inside Tauri v2 desktop executable
    if (isDesktop) {
      await this.setupTauriIPC();
    }

    // 4. Subscribe to Zustand store to propagate state to Windows SMTC
    this.setupStoreSync();
  }

  /**
   * Listens for physical hardware multimedia keys:
   * 'MediaPlayPause', 'MediaTrackNext', 'MediaTrackPrevious', 'MediaStop'
   */
  private setupHardwareKeyboardKeys(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const store = usePlayerStore.getState();

      switch (e.code) {
        case 'MediaPlayPause':
          e.preventDefault();
          store.togglePlay();
          break;
        case 'MediaTrackNext':
          e.preventDefault();
          store.next();
          break;
        case 'MediaTrackPrevious':
          e.preventDefault();
          store.previous();
          break;
        case 'MediaStop':
          e.preventDefault();
          store.pause();
          break;
        default:
          break;
      }
    });
  }

  /**
   * Connects navigator.mediaSession handlers for Windows SMTC and Android Lock Screen
   */
  private setupMediaSession(): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        usePlayerStore.getState().play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        usePlayerStore.getState().pause();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        usePlayerStore.getState().previous();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        usePlayerStore.getState().next();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          usePlayerStore.getState().seekTo(details.seekTime);
        }
      });
    } catch (err) {
      console.warn('[SpotiPlayer SMTC] Failed to register MediaSession action handlers:', err);
    }
  }

  /**
   * Sets up Tauri IPC events for native Windows OS integration
   */
  private async setupTauriIPC(): Promise<void> {
    const tauri = await getTauriCore();
    if (!tauri) return;

    try {
      const unlistenPlay = await tauri.event.listen('smtc://play', () => {
        usePlayerStore.getState().play();
      });
      const unlistenPause = await tauri.event.listen('smtc://pause', () => {
        usePlayerStore.getState().pause();
      });
      const unlistenToggle = await tauri.event.listen('smtc://toggle-play', () => {
        usePlayerStore.getState().togglePlay();
      });
      const unlistenNext = await tauri.event.listen('smtc://next', () => {
        usePlayerStore.getState().next();
      });
      const unlistenPrev = await tauri.event.listen('smtc://previous', () => {
        usePlayerStore.getState().previous();
      });

      this.unlistenEvents.push(unlistenPlay, unlistenPause, unlistenToggle, unlistenNext, unlistenPrev);
    } catch (err) {
      console.warn('[SpotiPlayer SMTC] Error binding Tauri IPC events:', err);
    }
  }

  /**
   * Syncs current song metadata and playback state with Windows SMTC
   */
  private setupStoreSync(): void {
    let lastSongId: string | null = null;
    let lastPlaying: boolean | null = null;

    this.unsubscribeStore = usePlayerStore.subscribe(async (state) => {
      const songChanged = state.currentSong?.id !== lastSongId;
      const playStateChanged = state.isPlaying !== lastPlaying;

      if (!songChanged && !playStateChanged) return;

      lastSongId = state.currentSong?.id || null;
      lastPlaying = state.isPlaying;

      const song = state.currentSong;

      // 1. Update MediaSession metadata (Windows SMTC & Android)
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        if (song) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            album: song.album || 'SpotiPlayer Master HD',
            artwork: [
              { src: song.coverUrl, sizes: '512x512', type: 'image/jpeg' },
              { src: song.coverUrl, sizes: '256x256', type: 'image/jpeg' },
            ],
          });
        }
        navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
      }

      // 2. Invoke native Tauri SMTC command if running as Windows desktop app
      if (isDesktop && song) {
        const tauri = await getTauriCore();
        if (tauri) {
          try {
            await tauri.core.invoke('update_smtc_metadata', {
              title: song.title,
              artist: song.artist,
              album: song.album || 'SpotiPlayer Master HD',
              artworkUrl: song.coverUrl,
            });

            await tauri.core.invoke('update_smtc_playback_state', {
              isPlaying: state.isPlaying,
              positionSeconds: state.currentTime,
              durationSeconds: state.duration,
            });
          } catch {
            // Silently handled
          }
        }
      }
    });
  }

  /**
   * Cleans up all listeners and subscriptions
   */
  public destroy(): void {
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    this.unlistenEvents.forEach((unlisten) => unlisten());
    this.unlistenEvents = [];
    this.isInitialized = false;
  }
}

export const tauriBridge = new TauriBridge();
export default tauriBridge;
