/**
 * SpotiPlayer - Audio HD Studio
 * Type Definitions for Nocturne Glass Audio Engine
 */

export type AudioQualityFormat =
  | 'FLAC 24-bit / 96kHz'
  | 'FLAC 24B'
  | 'FLAC 48k'
  | 'FLAC 96k'
  | 'FLAC'
  | 'Hi-Res Lossless'
  | 'Hi-Res Direct'
  | 'Dolby Atmos'
  | 'Spatial 3D'
  | 'DSD-128'
  | 'Master HD'
  | 'WAV 96k'
  | '320k';

export type RepeatMode = 'off' | 'all' | 'one';

export type PlaylistVisibility = 'public' | 'private' | 'collaborative';

export interface LyricLine {
  id: string;
  time: number; // in seconds
  timestampStr: string; // e.g. "01:24"
  text: string;
  translation?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  featuredArtists?: string[];
  album: string;
  albumId?: string;
  duration: number; // in seconds
  durationFormatted?: string; // e.g. "03:45"
  coverUrl: string;
  audioUrl: string;
  audioQuality: AudioQualityFormat;
  bitrate?: string; // e.g. "1,411 kbps RAW"
  sampleRate?: string; // e.g. "96.0 kHz / 24-bit"
  isLiked?: boolean;
  patronCount?: number;
  lyrics?: LyricLine[];
  bpm?: number;
  genre?: string;
  releaseYear?: number;
  addedAt?: string;
  plays?: number;
  hasLosslessMaster?: boolean;
}

export type Track = Song;

export interface PatronTier {
  id: string;
  name: string; // e.g. "Invítale un Café", "Pase Producción", "Honorífico"
  price: number;
  currency: string; // e.g. "USD" | "EUR"
  description?: string;
  perks: string[];
  icon?: 'coffee' | 'headphones' | 'star' | 'heart';
  isPopular?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  location: string; // e.g. "Madrid / Berlín"
  productionGear?: string; // e.g. "Ableton & Moog"
  monthlyListeners: number;
  verified: boolean;
  isDirectAudio: boolean; // 100% Streaming Libre / Hi-Res Direct
  patronTiers: PatronTier[];
  patronStats: {
    totalPatrons: number;
    monthlyFunding: number;
    fundingGoal: number;
    goalPercentage: number;
  };
  latestRelease?: {
    title: string;
    type: 'Single' | 'EP' | 'Album';
    quality: AudioQualityFormat;
    coverUrl: string;
    year: number;
  };
  popularTracks: Song[];
  albums?: Album[];
  eps?: Album[];
  upcomingStreams?: Array<{
    id: string;
    title: string;
    date: string;
    isExclusive: boolean;
  }>;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  year: number;
  coverUrl: string;
  quality: AudioQualityFormat;
  trackCount: number;
  tracks?: Song[];
  isCrowdfunded?: boolean;
  crowdfundStatus?: string;
}

export interface PlaylistCurator {
  id: string;
  name: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  curator: PlaylistCurator;
  visibility: PlaylistVisibility;
  isCollaborative: boolean;
  songs: Song[];
  songCount: number;
  totalDuration: number; // in seconds
  tags: string[];
  patronSupport?: {
    patronsCount: number;
    fundedPercentage: number;
    monthlyGoal?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface QueueItem {
  id: string;
  song: Song;
  addedAt: number;
  source: 'playlist' | 'album' | 'artist' | 'recommendation' | 'manual';
  sourceName?: string;
}

export interface EqualizerBand {
  frequency: number; // e.g. 31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000 Hz
  label: string; // e.g. "31 Hz", "1k Hz"
  gain: number; // dB between -12 and +12
}

export interface PlaybackState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  queue: QueueItem[];
  queueIndex: number;
  history: Song[];
  
  // High Fidelity DSP & Audio Engine Settings
  bitPerfect: boolean;
  spatialAudio: boolean;
  spatialWidth: number; // 0 to 200%
  crossfade: number; // seconds
  lufsNormalization: boolean;
  targetLufs: number; // default -14 LUFS
  bufferHealth: number; // percentage 0 - 100
  streamQuality: AudioQualityFormat;
  eqBands: EqualizerBand[];
}
