import { create } from 'zustand';
import { audioEngine } from '../services/audioEngine';
import { libraryService } from '../services/libraryService';
import type {
  Song,
  QueueItem,
  RepeatMode,
  AudioQualityFormat,
  EqualizerBand,
} from '../types/music';

// Initial 10-band DSP parametric equalizer configuration
const DEFAULT_EQ_BANDS: EqualizerBand[] = [
  { frequency: 31, label: '31 Hz', gain: 4.5 },
  { frequency: 63, label: '63 Hz', gain: 3.0 },
  { frequency: 125, label: '125 Hz', gain: 1.5 },
  { frequency: 250, label: '250 Hz', gain: 0.0 },
  { frequency: 500, label: '500 Hz', gain: -1.0 },
  { frequency: 1000, label: '1k Hz', gain: 0.5 },
  { frequency: 2000, label: '2k Hz', gain: 2.0 },
  { frequency: 4000, label: '4k Hz', gain: 3.5 },
  { frequency: 8000, label: '8k Hz', gain: 4.0 },
  { frequency: 16000, label: '16k Hz', gain: 5.0 },
];

export interface PlayerStoreState {
  // Playback state
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0.0 to 1.0
  previousVolume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode; // 'off' | 'all' | 'one'
  
  // Queue & History
  queue: QueueItem[];
  queueIndex: number;
  history: Song[];
  originalQueue: QueueItem[]; // Preserved when shuffle is toggled

  // User interactions
  likedSongIds: string[];

  // Audiophile DSP & Master Studio Engine
  bitPerfect: boolean;
  spatialAudio: boolean;
  spatialWidth: number; // 0 to 200%
  crossfade: number; // seconds (e.g. 4.5s)
  lufsNormalization: boolean;
  targetLufs: number; // -14 LUFS
  bufferHealth: number; // percentage (0 - 100%)
  streamQuality: AudioQualityFormat;
  eqBands: EqualizerBand[];

  // Actions
  play: (song?: Song) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setQueue: (
    songs: Song[],
    startIndex?: number,
    source?: QueueItem['source'],
    sourceName?: string
  ) => void;
  addToQueue: (song: Song, source?: QueueItem['source'], sourceName?: string) => void;
  removeFromQueue: (queueItemId: string) => void;
  clearQueue: () => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleLikeSong: (songId: string, song?: Song) => Promise<void>;
  syncFavoritesFromCloud: () => Promise<void>;
  setEqBandGain: (frequency: number, gain: number) => void;
  resetEq: () => void;
  setSpatialAudio: (enabled: boolean) => void;
  setSpatialWidth: (width: number) => void;
  setBitPerfect: (enabled: boolean) => void;
  setCrossfade: (seconds: number) => void;
  setStreamQuality: (quality: AudioQualityFormat) => void;
  setBufferHealth: (health: number) => void;
}

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.85,
  previousVolume: 0.85,
  isMuted: false,
  shuffle: false,
  repeatMode: 'off',
  
  queue: [],
  queueIndex: -1,
  history: [],
  originalQueue: [],
  likedSongIds: [],

  bitPerfect: true,
  spatialAudio: true,
  spatialWidth: 140,
  crossfade: 4.5,
  lufsNormalization: true,
  targetLufs: -14,
  bufferHealth: 99.8,
  streamQuality: 'FLAC 24-bit / 96kHz',
  eqBands: DEFAULT_EQ_BANDS,

  play: (song?: Song) => {
    const { queue, queueIndex, currentSong } = get();

    if (song) {
      // If a specific song was requested, find it in the queue or prepend it
      const existingIndex = queue.findIndex((item) => item.song.id === song.id);
      if (existingIndex !== -1) {
        set({
          currentSong: song,
          queueIndex: existingIndex,
          isPlaying: true,
          duration: song.duration || 0,
          currentTime: 0,
        });
      } else {
        const newItem: QueueItem = {
          id: `${song.id}-${Date.now()}`,
          song,
          addedAt: Date.now(),
          source: 'manual',
        };
        const newQueue = [...queue, newItem];
        set({
          queue: newQueue,
          originalQueue: newQueue,
          queueIndex: newQueue.length - 1,
          currentSong: song,
          isPlaying: true,
          duration: song.duration || 0,
          currentTime: 0,
        });
      }
      return;
    }

    if (!currentSong && queue.length > 0) {
      const targetIndex = queueIndex >= 0 ? queueIndex : 0;
      const targetItem = queue[targetIndex];
      set({
        currentSong: targetItem.song,
        queueIndex: targetIndex,
        isPlaying: true,
        duration: targetItem.song.duration || 0,
      });
      return;
    }

    if (currentSong) {
      set({ isPlaying: true });
    }
  },

  pause: () => {
    set({ isPlaying: false });
  },

  togglePlay: () => {
    const { isPlaying, currentSong, queue } = get();
    if (isPlaying) {
      set({ isPlaying: false });
    } else {
      if (!currentSong && queue.length > 0) {
        get().play(queue[0].song);
      } else if (currentSong) {
        set({ isPlaying: true });
      }
    }
  },

  next: () => {
    const { queue, queueIndex, repeatMode, currentSong, history } = get();
    if (queue.length === 0) return;

    // Handle repeat one
    if (repeatMode === 'one' && currentSong) {
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    const nextIndex = queueIndex + 1;

    // If there is another track in queue
    if (nextIndex < queue.length) {
      const nextSong = queue[nextIndex].song;
      const updatedHistory = currentSong ? [currentSong, ...history.slice(0, 49)] : history;
      set({
        currentSong: nextSong,
        queueIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
        duration: nextSong.duration || 0,
        history: updatedHistory,
      });
      return;
    }

    // At end of queue
    if (repeatMode === 'all') {
      const firstSong = queue[0].song;
      const updatedHistory = currentSong ? [currentSong, ...history.slice(0, 49)] : history;
      set({
        currentSong: firstSong,
        queueIndex: 0,
        isPlaying: true,
        currentTime: 0,
        duration: firstSong.duration || 0,
        history: updatedHistory,
      });
    } else {
      // Stop playback at end of queue
      set({ isPlaying: false, currentTime: 0 });
    }
  },

  previous: () => {
    const { currentTime, queue, queueIndex, history, currentSong } = get();

    // If current song has played for more than 3 seconds, restart it
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    // Go to previous track in queue if available
    if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      const prevSong = queue[prevIndex].song;
      set({
        currentSong: prevSong,
        queueIndex: prevIndex,
        isPlaying: true,
        currentTime: 0,
        duration: prevSong.duration || 0,
      });
      return;
    }

    // Otherwise check history if queue has no previous
    if (history.length > 0) {
      const [lastSong, ...restHistory] = history;
      set({
        currentSong: lastSong,
        history: restHistory,
        isPlaying: true,
        currentTime: 0,
        duration: lastSong.duration || 0,
      });
      return;
    }

    // Fallback: restart track
    set({ currentTime: 0 });
  },

  seekTo: (seconds: number) => {
    const { duration } = get();
    const clamped = Math.max(0, Math.min(seconds, duration || 0));
    set({ currentTime: clamped });
    audioEngine.seek(clamped);
  },

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(volume, 1));
    set({
      volume: clamped,
      isMuted: clamped === 0,
      previousVolume: clamped > 0 ? clamped : get().previousVolume,
    });
  },

  toggleMute: () => {
    const { isMuted, volume, previousVolume } = get();
    if (isMuted) {
      set({
        isMuted: false,
        volume: previousVolume > 0 ? previousVolume : 0.5,
      });
    } else {
      set({
        isMuted: true,
        previousVolume: volume > 0 ? volume : 0.85,
        volume: 0,
      });
    }
  },

  toggleShuffle: () => {
    const { shuffle, queue, queueIndex, originalQueue, currentSong } = get();
    const nextShuffle = !shuffle;

    if (nextShuffle) {
      // Preserve current playing item at the top and shuffle remaining
      if (queue.length <= 1) {
        set({ shuffle: true });
        return;
      }

      const currentItem = queue[queueIndex] || (currentSong ? { id: currentSong.id, song: currentSong, addedAt: Date.now(), source: 'manual' as const } : null);
      const remainingItems = queue.filter((_, idx) => idx !== queueIndex);

      // Fisher-Yates shuffle
      const shuffled = [...remainingItems];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const newQueue = currentItem ? [currentItem, ...shuffled] : shuffled;
      set({
        shuffle: true,
        originalQueue: queue.length ? queue : originalQueue,
        queue: newQueue,
        queueIndex: currentItem ? 0 : -1,
      });
    } else {
      // Restore original queue order, aligning currentSong position
      const restored = originalQueue.length > 0 ? originalQueue : queue;
      const newIndex = currentSong
        ? restored.findIndex((item) => item.song.id === currentSong.id)
        : 0;

      set({
        shuffle: false,
        queue: restored,
        queueIndex: newIndex !== -1 ? newIndex : 0,
      });
    }
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const cycle: Record<RepeatMode, RepeatMode> = {
      off: 'all',
      all: 'one',
      one: 'off',
    };
    set({ repeatMode: cycle[repeatMode] });
  },

  setQueue: (songs, startIndex = 0, source = 'playlist', sourceName) => {
    if (songs.length === 0) {
      set({
        queue: [],
        originalQueue: [],
        queueIndex: -1,
        currentSong: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      });
      return;
    }

    const items: QueueItem[] = songs.map((song, i) => ({
      id: `${song.id}-${Date.now()}-${i}`,
      song,
      addedAt: Date.now() + i,
      source,
      sourceName,
    }));

    const validIndex = Math.max(0, Math.min(startIndex, items.length - 1));
    const activeSong = items[validIndex].song;

    set({
      queue: items,
      originalQueue: items,
      queueIndex: validIndex,
      currentSong: activeSong,
      isPlaying: true,
      currentTime: 0,
      duration: activeSong.duration || 0,
    });
  },

  addToQueue: (song, source = 'manual', sourceName) => {
    const { queue, originalQueue, isPlaying, currentSong } = get();
    const newItem: QueueItem = {
      id: `${song.id}-${Date.now()}`,
      song,
      addedAt: Date.now(),
      source,
      sourceName,
    };

    const newQueue = [...queue, newItem];
    const newOriginalQueue = [...originalQueue, newItem];

    // If nothing was playing, begin playing the added song immediately
    if (!currentSong || (!isPlaying && queue.length === 0)) {
      set({
        queue: newQueue,
        originalQueue: newOriginalQueue,
        queueIndex: newQueue.length - 1,
        currentSong: song,
        isPlaying: true,
        duration: song.duration || 0,
        currentTime: 0,
      });
    } else {
      set({
        queue: newQueue,
        originalQueue: newOriginalQueue,
      });
    }
  },

  removeFromQueue: (queueItemId: string) => {
    const { queue, originalQueue, queueIndex } = get();
    const itemIndex = queue.findIndex((item) => item.id === queueItemId);
    if (itemIndex === -1) return;

    const newQueue = queue.filter((item) => item.id !== queueItemId);
    const newOriginal = originalQueue.filter((item) => item.id !== queueItemId);

    let newQueueIndex = queueIndex;
    if (itemIndex < queueIndex) {
      newQueueIndex = Math.max(0, queueIndex - 1);
    } else if (itemIndex === queueIndex) {
      // Currently playing item removed; skip to next if available
      if (newQueue.length > 0) {
        const nextTarget = itemIndex < newQueue.length ? itemIndex : newQueue.length - 1;
        set({
          queue: newQueue,
          originalQueue: newOriginal,
          queueIndex: nextTarget,
          currentSong: newQueue[nextTarget].song,
          duration: newQueue[nextTarget].song.duration || 0,
          currentTime: 0,
        });
        return;
      } else {
        set({
          queue: [],
          originalQueue: [],
          queueIndex: -1,
          currentSong: null,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
        });
        return;
      }
    }

    set({
      queue: newQueue,
      originalQueue: newOriginal,
      queueIndex: newQueueIndex,
    });
  },

  clearQueue: () => {
    const { currentSong } = get();
    if (!currentSong) {
      set({
        queue: [],
        originalQueue: [],
        queueIndex: -1,
        currentSong: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      });
      return;
    }

    // Keep currently playing track
    const singleItem: QueueItem = {
      id: `${currentSong.id}-${Date.now()}`,
      song: currentSong,
      addedAt: Date.now(),
      source: 'manual',
    };

    set({
      queue: [singleItem],
      originalQueue: [singleItem],
      queueIndex: 0,
    });
  },

  reorderQueue: (startIndex: number, endIndex: number) => {
    const { queue, queueIndex } = get();
    const result = Array.from(queue);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Calculate adjusted queueIndex
    let newIndex = queueIndex;
    if (startIndex === queueIndex) {
      newIndex = endIndex;
    } else if (startIndex < queueIndex && endIndex >= queueIndex) {
      newIndex = queueIndex - 1;
    } else if (startIndex > queueIndex && endIndex <= queueIndex) {
      newIndex = queueIndex + 1;
    }

    set({
      queue: result,
      queueIndex: newIndex,
    });
  },

  setCurrentTime: (time: number) => {
    set({ currentTime: time });
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  toggleLikeSong: async (songId: string, songObj?: Song) => {
    const { likedSongIds, currentSong, queue } = get();
    const isLiked = likedSongIds.includes(songId);
    const updated = isLiked
      ? likedSongIds.filter((id) => id !== songId)
      : [...likedSongIds, songId];

    // Optimistic state update in Zustand
    set({ likedSongIds: updated });

    if (currentSong && currentSong.id === songId) {
      set({
        currentSong: {
          ...currentSong,
          isLiked: !isLiked,
        },
      });
    }

    // Resolve song object
    const targetSong =
      songObj ||
      (currentSong?.id === songId ? currentSong : queue.find((q) => q.song.id === songId)?.song);

    if (targetSong) {
      try {
        await libraryService.toggleLike(targetSong);
      } catch (err) {
        console.warn('[usePlayerStore] Error persisting favorite to libraryService:', err);
      }
    }
  },

  syncFavoritesFromCloud: async () => {
    try {
      const favorites = await libraryService.getFavorites();
      const likedIds = favorites.map((s) => s.id);
      set({ likedSongIds: likedIds });

      const { currentSong } = get();
      if (currentSong) {
        set({
          currentSong: {
            ...currentSong,
            isLiked: likedIds.includes(currentSong.id),
          },
        });
      }
    } catch (err) {
      console.warn('[usePlayerStore] Failed syncing favorites from cloud:', err);
    }
  },

  setEqBandGain: (frequency: number, gain: number) => {
    const { eqBands } = get();
    const clampedGain = Math.max(-12, Math.min(12, gain));
    const updated = eqBands.map((band) =>
      band.frequency === frequency ? { ...band, gain: clampedGain } : band
    );
    set({ eqBands: updated });
  },

  resetEq: () => {
    set({ eqBands: DEFAULT_EQ_BANDS });
  },

  setSpatialAudio: (enabled: boolean) => {
    set({ spatialAudio: enabled });
  },

  setSpatialWidth: (width: number) => {
    set({ spatialWidth: Math.max(0, Math.min(200, width)) });
  },

  setBitPerfect: (enabled: boolean) => {
    set({ bitPerfect: enabled });
  },

  setCrossfade: (seconds: number) => {
    set({ crossfade: Math.max(0, Math.min(12, seconds)) });
  },

  setStreamQuality: (quality: AudioQualityFormat) => {
    set({ streamQuality: quality });
  },

  setBufferHealth: (health: number) => {
    set({ bufferHealth: Math.max(0, Math.min(100, health)) });
  },
}));
