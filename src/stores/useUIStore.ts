import { create } from 'zustand';
import type { Playlist, Song } from '../types/music';
import { MOCK_PLAYLISTS } from '../services/musicData';
import { libraryService } from '../services/libraryService';

export type AppView =
  | 'home'
  | 'search'
  | 'library'
  | 'history'
  | 'lyrics'
  | 'artist'
  | 'equalizer'
  | 'settings'
  | 'playlist';

export type Language = 'es' | 'en';

interface UIStoreState {
  currentView: AppView;
  selectedPlaylistId: string | null;
  selectedArtistId: string | null;
  language: Language;
  searchQuery: string;
  selectedCategory: string;
  
  // Modals & Panels
  isLyricsOpen: boolean;
  isEqualizerOpen: boolean;
  isDonateModalOpen: boolean;
  isCreatePlaylistModalOpen: boolean;
  isAddToPlaylistModalOpen: boolean;
  songToAddToPlaylist: string | null;

  // Dynamic user playlists
  playlists: Playlist[];

  // Actions
  setView: (view: AppView) => void;
  selectPlaylist: (playlistId: string) => void;
  selectArtist: (artistId: string) => void;
  setLanguage: (lang: Language) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setLyricsOpen: (isOpen: boolean) => void;
  toggleLyrics: () => void;
  setEqualizerOpen: (isOpen: boolean) => void;
  toggleEqualizer: () => void;
  setDonateModalOpen: (isOpen: boolean) => void;
  toggleDonateModal: () => void;
  setCreatePlaylistModalOpen: (isOpen: boolean) => void;
  openAddToPlaylist: (songId: string) => void;
  closeAddToPlaylist: () => void;
  createPlaylist: (title: string, description?: string) => Promise<string>;
  addSongToPlaylist: (playlistId: string, song: Song) => Promise<void>;
  syncPlaylistsFromCloud: () => Promise<void>;
}

export const useUIStore = create<UIStoreState>((set) => ({
  currentView: 'home',
  selectedPlaylistId: 'playlist-cyberwave',
  selectedArtistId: 'valeria-vox',
  language: 'es',
  searchQuery: '',
  selectedCategory: 'Todos',
  isLyricsOpen: false,
  isEqualizerOpen: false,
  isDonateModalOpen: false,
  isCreatePlaylistModalOpen: false,
  isAddToPlaylistModalOpen: false,
  songToAddToPlaylist: null,
  playlists: MOCK_PLAYLISTS,

  setView: (view) => set({ currentView: view }),
  selectPlaylist: (playlistId) => set({ selectedPlaylistId: playlistId, currentView: 'playlist' }),
  selectArtist: (artistId) => set({ selectedArtistId: artistId, currentView: 'artist' }),
  setLanguage: (language) => set({ language }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setLyricsOpen: (isLyricsOpen) => set({ isLyricsOpen }),
  toggleLyrics: () => set((state) => ({ isLyricsOpen: !state.isLyricsOpen })),
  setEqualizerOpen: (isEqualizerOpen) => set({ isEqualizerOpen }),
  toggleEqualizer: () => set((state) => ({ isEqualizerOpen: !state.isEqualizerOpen })),
  setDonateModalOpen: (isDonateModalOpen) => set({ isDonateModalOpen }),
  toggleDonateModal: () => set((state) => ({ isDonateModalOpen: !state.isDonateModalOpen })),
  setCreatePlaylistModalOpen: (isCreatePlaylistModalOpen) => set({ isCreatePlaylistModalOpen }),
  openAddToPlaylist: (songId) => set({ isAddToPlaylistModalOpen: true, songToAddToPlaylist: songId }),
  closeAddToPlaylist: () => set({ isAddToPlaylistModalOpen: false, songToAddToPlaylist: null }),
  createPlaylist: async (title, description = '') => {
    try {
      const created = await libraryService.createPlaylist(title, description);
      set((state) => ({
        playlists: [created, ...state.playlists],
        selectedPlaylistId: created.id,
        currentView: 'playlist',
        isCreatePlaylistModalOpen: false,
      }));
      return created.id;
    } catch {
      const id = `playlist-${Date.now()}`;
      const newPlaylist: Playlist = {
        id,
        title: title.trim() || 'Mi Nueva Playlist',
        description: description.trim() || 'Playlist personalizada de audio de alta fidelidad.',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        curator: { id: 'user-self', name: 'Alex Rivera', isVerified: true },
        visibility: 'public',
        isCollaborative: false,
        songs: [],
        songCount: 0,
        totalDuration: 0,
        tags: ['Personal', 'Master FLAC'],
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        playlists: [newPlaylist, ...state.playlists],
        selectedPlaylistId: id,
        currentView: 'playlist',
        isCreatePlaylistModalOpen: false,
      }));
      return id;
    }
  },

  addSongToPlaylist: async (playlistId: string, song: Song) => {
    try {
      await libraryService.addSongToPlaylist(playlistId, song);
      set((state) => {
        const updated = state.playlists.map((pl) => {
          if (pl.id === playlistId) {
            const hasSong = pl.songs.some((s) => s.id === song.id);
            if (!hasSong) {
              const newSongs = [...pl.songs, song];
              return {
                ...pl,
                songs: newSongs,
                songCount: newSongs.length,
                totalDuration: pl.totalDuration + (song.duration || 0),
              };
            }
          }
          return pl;
        });
        return { playlists: updated };
      });
    } catch (err) {
      console.warn('[useUIStore] addSongToPlaylist error:', err);
    }
  },

  syncPlaylistsFromCloud: async () => {
    try {
      const cloudPlaylists = await libraryService.getUserPlaylists();
      if (cloudPlaylists && cloudPlaylists.length > 0) {
        set((state) => {
          // Merge mock base playlists with cloud user playlists
          const mockIds = new Set(MOCK_PLAYLISTS.map((m) => m.id));
          const uniqueCloud = cloudPlaylists.filter((c) => !mockIds.has(c.id));
          return { playlists: [...uniqueCloud, ...MOCK_PLAYLISTS] };
        });
      }
    } catch (err) {
      console.warn('[useUIStore] syncPlaylistsFromCloud error:', err);
    }
  },
}));

