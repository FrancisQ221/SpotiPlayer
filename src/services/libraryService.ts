/**
 * SpotiPlayer Library & Cloud Database Synchronization Service
 * Handles:
 * - Real-time persistence of "Tus Me Gusta" (Favorites) via Supabase
 * - User Playlists and Playlist Items with Row Level Security (RLS)
 * - Offline & Guest Mode fallback with localStorage mirroring
 * - Cross-device synchronization (Windows .exe <-> Android .apk)
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { Song, Playlist } from '../types/music';

const LOCAL_FAVORITES_KEY = 'spotiplayer_local_favorites';
const LOCAL_PLAYLISTS_KEY = 'spotiplayer_local_playlists';

interface FavoriteDbRow {
  id: string;
  user_id: string;
  song_id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  duration_formatted?: string;
  thumbnail_url?: string;
  audio_url?: string;
  audio_quality?: string;
  bitrate?: string;
  sample_rate?: string;
  created_at: string;
}

interface PlaylistDbRow {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_url?: string;
  is_public: boolean;
  is_collaborative: boolean;
  created_at: string;
  updated_at: string;
}

interface PlaylistItemDbRow {
  id: string;
  playlist_id: string;
  user_id: string;
  song_id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  duration_formatted?: string;
  thumbnail_url?: string;
  audio_url?: string;
  audio_quality?: string;
  position: number;
  added_at: string;
}

export class LibraryService {
  /**
   * Helper: Retrieve current authenticated Supabase user ID if present
   */
  private async getActiveUserId(): Promise<string | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      return user.id;
    } catch {
      return null;
    }
  }

  /**
   * Helper: Read local favorites cache
   */
  private getLocalFavorites(): Song[] {
    try {
      if (typeof window === 'undefined') return [];
      const raw = window.localStorage.getItem(LOCAL_FAVORITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Helper: Save local favorites cache
   */
  private setLocalFavorites(songs: Song[]): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(songs));
      }
    } catch (err) {
      console.warn('[LibraryService] Failed saving local favorites:', err);
    }
  }

  /**
   * Toggles like state for a song.
   * If authenticated, persists in Supabase `favorites` table.
   * Also mirrors state in local cache for instant UI responsiveness.
   * Returns: true if the song is now liked, false if unliked.
   */
  public async toggleLike(song: Song): Promise<boolean> {
    const userId = await this.getActiveUserId();
    const localList = this.getLocalFavorites();
    const existingIndex = localList.findIndex((s) => s.id === song.id);
    const isCurrentlyLiked = existingIndex !== -1;
    const shouldBeLiked = !isCurrentlyLiked;

    // 1. Optimistic Local Cache Update
    if (shouldBeLiked) {
      const updatedSong: Song = { ...song, isLiked: true };
      this.setLocalFavorites([updatedSong, ...localList]);
    } else {
      this.setLocalFavorites(localList.filter((s) => s.id !== song.id));
    }

    // 2. Persist to Cloud if user is authenticated with Supabase
    if (userId && isSupabaseConfigured) {
      try {
        if (shouldBeLiked) {
          const { error } = await supabase.from('favorites').insert({
            user_id: userId,
            song_id: song.id,
            title: song.title,
            artist: song.artist,
            album: song.album || 'Single Master HD',
            duration: song.duration || 180,
            duration_formatted: song.durationFormatted || '03:00',
            thumbnail_url: song.coverUrl,
            audio_url: song.audioUrl,
            audio_quality: song.audioQuality || 'FLAC 24-bit / 96kHz',
            bitrate: song.bitrate || '1,411 kbps RAW',
            sample_rate: song.sampleRate || '96.0 kHz / 24-bit',
          });

          if (error && error.code !== '23505') { // 23505 is unique violation (already liked)
            console.error('[LibraryService] Supabase insert favorite error:', error.message);
          }
        } else {
          const { error } = await supabase
            .from('favorites')
            .delete()
            .match({ user_id: userId, song_id: song.id });

          if (error) {
            console.error('[LibraryService] Supabase delete favorite error:', error.message);
          }
        }
      } catch (cloudErr) {
        console.warn('[LibraryService] Cloud favorites sync error:', cloudErr);
      }
    }

    return shouldBeLiked;
  }

  /**
   * Retrieves all liked tracks ("Tus Me Gusta") for current user or guest.
   */
  public async getFavorites(): Promise<Song[]> {
    const userId = await this.getActiveUserId();

    // If authenticated, fetch real-time data from Supabase
    if (userId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const cloudSongs: Song[] = data.map((row: FavoriteDbRow) => ({
            id: row.song_id,
            title: row.title,
            artist: row.artist,
            album: row.album || 'Single Master HD',
            duration: row.duration,
            durationFormatted: row.duration_formatted || '03:00',
            coverUrl: row.thumbnail_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
            audioUrl: row.audio_url || '',
            audioQuality: (row.audio_quality as Song['audioQuality']) || 'FLAC 24-bit / 96kHz',
            bitrate: row.bitrate || '1,411 kbps RAW',
            sampleRate: row.sample_rate || '96.0 kHz / 24-bit',
            genre: 'Master Hi-Fi',
            releaseYear: new Date(row.created_at).getFullYear(),
            hasLosslessMaster: true,
            isLiked: true,
          }));

          // Mirror cloud songs to local cache
          this.setLocalFavorites(cloudSongs);
          return cloudSongs;
        }
      } catch (err) {
        console.warn('[LibraryService] Failed fetching favorites from Supabase, using local cache:', err);
      }
    }

    // Fallback: Local Cache
    return this.getLocalFavorites();
  }

  /**
   * Creates a new playlist either in Supabase or localStorage
   */
  public async createPlaylist(title: string, description = ''): Promise<Playlist> {
    const userId = await this.getActiveUserId();
    const cleanTitle = title.trim() || 'Mi Nueva Playlist';
    const cleanDesc = description.trim() || 'Playlist personalizada de audio de alta fidelidad.';
    const defaultCover = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';

    if (userId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('playlists')
          .insert({
            user_id: userId,
            title: cleanTitle,
            description: cleanDesc,
            cover_url: defaultCover,
            is_public: true,
          })
          .select()
          .single();

        if (!error && data) {
          const newPlaylist: Playlist = {
            id: data.id,
            title: data.title,
            description: data.description,
            coverUrl: data.cover_url,
            curator: { id: userId, name: 'Mi Cuenta', isVerified: true },
            visibility: 'public',
            isCollaborative: false,
            songs: [],
            songCount: 0,
            totalDuration: 0,
            tags: ['Personal', 'Master FLAC'],
            createdAt: data.created_at,
          };
          return newPlaylist;
        }
      } catch (err) {
        console.warn('[LibraryService] Supabase create playlist error, falling back to local:', err);
      }
    }

    // Local / Guest fallback
    const localId = `playlist-${Date.now()}`;
    const localPlaylist: Playlist = {
      id: localId,
      title: cleanTitle,
      description: cleanDesc,
      coverUrl: defaultCover,
      curator: { id: 'local-user', name: 'Audiófilo Local', isVerified: false },
      visibility: 'public',
      isCollaborative: false,
      songs: [],
      songCount: 0,
      totalDuration: 0,
      tags: ['Local', 'Master FLAC'],
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = this.getLocalPlaylists();
      this.setLocalPlaylists([localPlaylist, ...existing]);
    } catch (e) {
      console.warn('[LibraryService] Could not persist local playlist:', e);
    }

    return localPlaylist;
  }

  /**
   * Helper: Read local playlists
   */
  private getLocalPlaylists(): Playlist[] {
    try {
      if (typeof window === 'undefined') return [];
      const raw = window.localStorage.getItem(LOCAL_PLAYLISTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Helper: Save local playlists
   */
  private setLocalPlaylists(playlists: Playlist[]): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(playlists));
      }
    } catch (err) {
      console.warn('[LibraryService] Failed saving local playlists:', err);
    }
  }

  /**
   * Retrieves all playlists for current user
   */
  public async getUserPlaylists(): Promise<Playlist[]> {
    const userId = await this.getActiveUserId();

    if (userId && isSupabaseConfigured) {
      try {
        const { data: playlistsData, error } = await supabase
          .from('playlists')
          .select('*, playlist_items(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(playlistsData)) {
          return playlistsData.map((row) => {
            const items = (row.playlist_items || []) as PlaylistItemDbRow[];
            const mappedSongs: Song[] = items
              .sort((a, b) => a.position - b.position)
              .map((it) => ({
                id: it.song_id,
                title: it.title,
                artist: it.artist,
                album: it.album || 'Single Master',
                duration: it.duration,
                durationFormatted: it.duration_formatted || '03:00',
                coverUrl: it.thumbnail_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
                audioUrl: it.audio_url || '',
                audioQuality: (it.audio_quality as Song['audioQuality']) || 'FLAC 24-bit / 96kHz',
                hasLosslessMaster: true,
              }));

            const totalDuration = mappedSongs.reduce((sum, s) => sum + (s.duration || 0), 0);

            return {
              id: row.id,
              title: row.title,
              description: row.description || '',
              coverUrl: row.cover_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
              curator: { id: userId, name: 'Mi Cuenta', isVerified: true },
              visibility: row.is_public ? 'public' : 'private',
              isCollaborative: row.is_collaborative,
              songs: mappedSongs,
              songCount: mappedSongs.length,
              totalDuration,
              tags: ['Personal', 'Master FLAC'],
              createdAt: row.created_at,
            };
          });
        }
      } catch (err) {
        console.warn('[LibraryService] Supabase playlists fetch error:', err);
      }
    }

    return this.getLocalPlaylists();
  }

  /**
   * Adds a song to a playlist
   */
  public async addSongToPlaylist(playlistId: string, song: Song): Promise<boolean> {
    const userId = await this.getActiveUserId();

    if (userId && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('playlist_items').insert({
          playlist_id: playlistId,
          user_id: userId,
          song_id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album || 'Single Master HD',
          duration: song.duration || 180,
          duration_formatted: song.durationFormatted || '03:00',
          thumbnail_url: song.coverUrl,
          audio_url: song.audioUrl,
          audio_quality: song.audioQuality || 'FLAC 24-bit / 96kHz',
          position: Date.now(),
        });

        if (!error) return true;
        console.error('[LibraryService] Add song error:', error.message);
      } catch (err) {
        console.warn('[LibraryService] Supabase add song error:', err);
      }
    }

    // Local fallback
    const playlists = this.getLocalPlaylists();
    const target = playlists.find((p) => p.id === playlistId);
    if (target) {
      if (!target.songs.some((s) => s.id === song.id)) {
        target.songs.push(song);
        target.songCount = target.songs.length;
        target.totalDuration += song.duration || 0;
        this.setLocalPlaylists(playlists);
      }
      return true;
    }

    return false;
  }

  /**
   * Removes a song from a playlist
   */
  public async removeSongFromPlaylist(playlistId: string, songId: string): Promise<boolean> {
    const userId = await this.getActiveUserId();

    if (userId && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('playlist_items')
          .delete()
          .match({ playlist_id: playlistId, song_id: songId });

        if (!error) return true;
      } catch (err) {
        console.warn('[LibraryService] Remove song error:', err);
      }
    }

    // Local fallback
    const playlists = this.getLocalPlaylists();
    const target = playlists.find((p) => p.id === playlistId);
    if (target) {
      const removed = target.songs.find((s) => s.id === songId);
      target.songs = target.songs.filter((s) => s.id !== songId);
      target.songCount = target.songs.length;
      if (removed) target.totalDuration = Math.max(0, target.totalDuration - (removed.duration || 0));
      this.setLocalPlaylists(playlists);
      return true;
    }

    return false;
  }

  /**
   * Deletes a playlist
   */
  public async deletePlaylist(playlistId: string): Promise<boolean> {
    const userId = await this.getActiveUserId();

    if (userId && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('playlists')
          .delete()
          .eq('id', playlistId);

        if (!error) return true;
      } catch (err) {
        console.warn('[LibraryService] Delete playlist error:', err);
      }
    }

    // Local fallback
    const playlists = this.getLocalPlaylists().filter((p) => p.id !== playlistId);
    this.setLocalPlaylists(playlists);
    return true;
  }
}

export const libraryService = new LibraryService();
export default libraryService;
