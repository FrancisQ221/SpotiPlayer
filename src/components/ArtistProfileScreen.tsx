import React, { useState, useEffect } from 'react';
import {
  Play,
  Heart,
  Share2,
  CheckCircle2,
  SlidersHorizontal,
  ExternalLink,
  Users,
  MapPin,
  Disc3,
  Award,
  Globe,
  Radio,
  ListPlus,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useUIStore } from '../stores/useUIStore';
import { MOCK_ARTIST_VALERIA, MOCK_SONGS } from '../services/musicData';
import { musicService } from '../services/musicService';
import type { Song } from '../types/music';

export const ArtistProfileScreen: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    play,
    setQueue,
    toggleLikeSong,
    likedSongIds,
  } = usePlayerStore();
  const { language, openAddToPlaylist, toggleDonateModal } = useUIStore();

  const artist = MOCK_ARTIST_VALERIA;
  const [isFollowing, setIsFollowing] = useState(false);
  const [artistTracks, setArtistTracks] = useState<Song[]>(
    artist.popularTracks || MOCK_SONGS.slice(0, 5)
  );
  const [activeTab, setActiveTab] = useState<'top' | 'discography'>('top');
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch or populate real tracks for artist
  useEffect(() => {
    let isMounted = true;
    musicService.fetchArtistTracks(artist.name, 6).then((tracks) => {
      if (isMounted && tracks.length > 0) {
        setArtistTracks(tracks);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [artist.name]);

  const handlePlayDiscography = () => {
    if (artistTracks.length > 0) {
      setQueue(artistTracks, 0, 'artist', artist.name);
      play(artistTracks[0]);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const discography = [
    {
      id: 'disco-1',
      title: 'Neón & Ceniza (Deluxe)',
      year: 2024,
      type: 'Álbum',
      tracksCount: 12,
      coverUrl:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      format: 'FLAC 24-bit / 96kHz',
    },
    {
      id: 'disco-2',
      title: 'Resonancias Urbanas',
      year: 2023,
      type: 'EP',
      tracksCount: 5,
      coverUrl:
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      format: 'Hi-Res Lossless',
    },
    {
      id: 'disco-3',
      title: 'Códice Analógico',
      year: 2022,
      type: 'Single',
      tracksCount: 2,
      coverUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      format: 'Master HD',
    },
    {
      id: 'disco-4',
      title: 'Sesiones de Medianoche Live',
      year: 2021,
      type: 'Álbum en Vivo',
      tracksCount: 8,
      coverUrl:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      format: 'FLAC 48k',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl animate-in fade-in duration-300">
      {/* Toast Confirmation Notification for Share */}
      {copiedLink && (
        <div className="fixed top-20 right-8 z-50 p-3.5 px-4 rounded-2xl bg-[#0D1319]/95 border border-[#00e599] shadow-[0_0_25px_rgba(0,229,153,0.35)] text-white text-xs flex items-center gap-2.5 backdrop-blur-xl animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-[#00e599]" />
          <span>
            {language === 'es'
              ? 'Enlace al perfil del artista copiado al portapapeles'
              : 'Artist profile link copied to clipboard'}
          </span>
        </div>
      )}

      {/* 1. Artist Hero Banner (Pantalla 08 - Limpio y centrado en la música) */}
      <section className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
        <div className="relative h-72 sm:h-80 w-full overflow-hidden">
          <img
            src={artist.bannerUrl}
            alt={artist.name}
            className="w-full h-full object-cover object-center filter brightness-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e141a] via-[#0e141a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070B0E]/90 via-transparent to-[#070B0E]/60" />

          {/* Top Badges */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-[#00e599] border border-[#00e599]/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ARTISTA VERIFICADO SPOTIPLAYER
              </span>
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-[#4cd7f6] border border-[#4cd7f6]/30">
                MASTER FLAC 96kHz / 24-BIT
              </span>
            </div>

            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#00e599]" />
              Catálogo de Audio Directo
            </span>
          </div>

          {/* Artist Core Profile Info Bar */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-[#00e599]/50 shadow-[0_0_25px_rgba(0,229,153,0.3)] shrink-0">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {artist.name}
                  </h1>
                  <CheckCircle2 className="w-6 h-6 text-[#00e599] fill-[#00e599]/20" />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#bacbbe]">
                  <span className="flex items-center gap-1 text-white font-semibold">
                    <Users className="w-3.5 h-3.5 text-[#00e599]" />
                    {artist.monthlyListeners.toLocaleString()}{' '}
                    {language === 'es' ? 'oyentes mensuales' : 'monthly listeners'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#4cd7f6]" />
                    {artist.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#bacbbe]/80">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    {artist.productionGear}
                  </span>
                </div>
              </div>
            </div>

            {/* Standard Artist Actions (Reproducir, Seguir, Compartir y Redes Oficiales) */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Primary: Play Discography */}
              <button
                onClick={handlePlayDiscography}
                className="px-6 py-3 rounded-full bg-[#00e599] hover:bg-[#6dffba] text-[#070B0E] font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,153,0.5)] hover:shadow-[0_0_25px_rgba(0,229,153,0.7)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-[#070B0E] translate-x-0.5" />
                <span>{language === 'es' ? 'Reproducir Discografía' : 'Play Discography'}</span>
              </button>

              {/* Follow Button */}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-5 py-3 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                  isFollowing
                    ? 'bg-[#00e599]/15 border-[#00e599] text-[#00e599]'
                    : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                }`}
              >
                {isFollowing
                  ? language === 'es' ? 'Siguiendo' : 'Following'
                  : language === 'es' ? 'Seguir' : 'Follow'}
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer"
                title={language === 'es' ? 'Compartir Perfil' : 'Share Profile'}
              >
                <Share2 className="w-4 h-4 text-[#bacbbe]" />
              </button>
            </div>
          </div>
        </div>

        {/* Bio Strip & Official Links */}
        <div className="p-6 bg-[#0D1319]/80 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-[#bacbbe] leading-relaxed max-w-3xl">
            {artist.bio}
          </p>

          {/* Official External Links (Redes Oficiales) */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://bandcamp.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-[#bacbbe] hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>Bandcamp</span>
              <ExternalLink className="w-3 h-3 text-[#bacbbe]" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-[#bacbbe] hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>Instagram</span>
              <ExternalLink className="w-3 h-3 text-[#bacbbe]" />
            </a>
            <a
              href="https://valeriavox.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-[#00e599] transition-all flex items-center gap-1.5"
            >
              <Globe className="w-3 h-3 text-[#00e599]" />
              <span>Web Oficial</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Main Stage Grid: Left = Top Tracks & Discography (8 cols), Right = Studio Specs & Bio (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Music Tracks & Discography */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-4 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab('top')}
              className={`text-sm font-bold pb-2 transition-all cursor-pointer relative ${
                activeTab === 'top'
                  ? 'text-[#00e599]'
                  : 'text-[#bacbbe] hover:text-white'
              }`}
            >
              {language === 'es' ? 'Top Canciones' : 'Popular Tracks'}
              {activeTab === 'top' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00e599] shadow-[0_0_8px_#00e599]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('discography')}
              className={`text-sm font-bold pb-2 transition-all cursor-pointer relative ${
                activeTab === 'discography'
                  ? 'text-[#00e599]'
                  : 'text-[#bacbbe] hover:text-white'
              }`}
            >
              {language === 'es' ? 'Discografía & Álbumes' : 'Discography & Releases'}
              {activeTab === 'discography' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00e599] shadow-[0_0_8px_#00e599]" />
              )}
            </button>
          </div>

          {/* Top Tracks List (Clean, NO tip/donation column) */}
          {activeTab === 'top' && (
            <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-[#bacbbe]/70 font-semibold px-4 pb-2 border-b border-white/5 uppercase tracking-wider">
                <div className="flex items-center gap-4">
                  <span className="w-5 text-center">#</span>
                  <span>{language === 'es' ? 'Título' : 'Title'}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="hidden sm:inline">{language === 'es' ? 'Álbum' : 'Album'}</span>
                  <span className="hidden md:inline">{language === 'es' ? 'Formato' : 'Format'}</span>
                  <span>{language === 'es' ? 'Duración' : 'Duration'}</span>
                </div>
              </div>

              {artistTracks.map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                const isLiked = likedSongIds.includes(song.id);

                return (
                  <div
                    key={song.id}
                    onClick={() => {
                      setQueue(artistTracks, idx, 'artist', artist.name);
                      play(song);
                    }}
                    className={`group flex items-center justify-between p-3 px-4 rounded-2xl transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#00e599]/15 border border-[#00e599]/30 shadow-[0_0_15px_rgba(0,229,153,0.15)]'
                        : 'hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    {/* Left: Index / Play Icon + Artwork + Title */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-5 text-center shrink-0">
                        {isCurrent && isPlaying ? (
                          <div className="flex items-end justify-center gap-0.5 h-3.5">
                            <span className="w-1 bg-[#00e599] h-3 animate-pulse" />
                            <span className="w-1 bg-[#00e599] h-2 animate-pulse delay-75" />
                            <span className="w-1 bg-[#00e599] h-3.5 animate-pulse delay-150" />
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-[#bacbbe] group-hover:hidden">
                            {idx + 1}
                          </span>
                        )}
                        <Play className="w-3.5 h-3.5 text-white hidden group-hover:inline fill-current translate-x-0.5" />
                      </div>

                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
                      />

                      <div className="min-w-0">
                        <h4
                          className={`text-xs font-bold truncate ${
                            isCurrent ? 'text-[#00e599]' : 'text-white'
                          }`}
                        >
                          {song.title}
                        </h4>
                        <p className="text-[11px] text-[#bacbbe] truncate">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* Right: Album + Format + Duration + Actions (Me Gusta & Add to playlist) */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      <span className="hidden sm:inline-block text-xs text-[#bacbbe] truncate max-w-[140px]">
                        {song.album || 'Single Master'}
                      </span>

                      <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-[#4cd7f6] uppercase">
                        {song.audioQuality || 'FLAC 24B'}
                      </span>

                      <span className="text-xs font-mono text-[#bacbbe] tnum">
                        {song.durationFormatted || '03:45'}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikeSong(song.id, song);
                        }}
                        className="p-1 text-[#bacbbe] hover:text-[#00e599] transition-colors"
                        title={isLiked ? 'Quitar de favoritos' : 'Añadir a Tus Me Gusta'}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isLiked ? 'fill-[#00e599] text-[#00e599]' : ''
                          }`}
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddToPlaylist(song.id);
                        }}
                        className="p-1 text-[#bacbbe] hover:text-[#00e599] transition-colors"
                        title="Añadir a playlist"
                      >
                        <ListPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Discography Grid */}
          {activeTab === 'discography' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {discography.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handlePlayDiscography()}
                  className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-[#00e599]/40 space-y-3 cursor-pointer transition-all hover:scale-[1.02] group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#00e599] text-[#070B0E] flex items-center justify-center shadow-lg shadow-[#00e599]/40">
                        <Play className="w-5 h-5 fill-[#070B0E] translate-x-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-[#00e599] border border-[#00e599]/30">
                      {item.format}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-[#bacbbe]">
                      <span>{item.year} • {item.type}</span>
                      <span>{item.tracksCount} pistas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Studio Gear & Ethical Architecture Overview (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Studio Hardware Specs */}
          <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 shadow-xl space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00e599] uppercase tracking-wider">
              <Headphones className="w-4 h-4 text-[#00e599]" />
              <span>{language === 'es' ? 'Especificaciones de Estudio' : 'Studio Specifications'}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-[#bacbbe] uppercase tracking-wider block">
                  Cadena de Grabación Analógica
                </span>
                <p className="text-white font-medium">
                  {artist.productionGear} • Sintetizadores Moog & Prophet analógicos directos.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-[#bacbbe] uppercase tracking-wider block">
                  Fidelidad de Muestreo
                </span>
                <p className="text-[#4cd7f6] font-mono font-bold">
                  FLAC 24-bit / 96.0 kHz Bit-Perfect Studio Master
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-[#bacbbe] uppercase tracking-wider block">
                  Licenciamiento Abierto
                </span>
                <p className="text-[#bacbbe]">
                  Música independiente libre de restricciones corporativas y DRM invasivo.
                </p>
              </div>
            </div>
          </div>

          {/* Centralized Patronage Reference Card */}
          <div className="glass-panel rounded-3xl p-6 border border-[#f5a623]/25 bg-gradient-to-b from-[#f5a623]/[0.05] to-transparent space-y-3.5 relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-bold text-[#f5a623] uppercase tracking-wider">
              <Award className="w-4 h-4 text-[#f5a623]" />
              <span>{language === 'es' ? 'Mecenazgo Centralizado' : 'Centralized Patronage'}</span>
            </div>

            <p className="text-xs text-[#bacbbe] leading-relaxed">
              {language === 'es'
                ? 'SpotiPlayer mantiene los perfiles de artistas limpios y sin módulos repetitivos de pago. Si deseas apoyar a Valeria Vox o al proyecto comunitario, puedes destinar aportes directos mediante el Fondo Global.'
                : 'SpotiPlayer keeps individual artist profiles ad-free and uncluttered. Direct patronage is centralized via the SpotiPlayer Community Fund.'}
            </p>

            <button
              onClick={toggleDonateModal}
              className="w-full py-2.5 px-4 rounded-xl bg-[#f5a623]/15 hover:bg-[#f5a623]/25 border border-[#f5a623]/40 text-[#f5a623] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_15px_rgba(245,166,35,0.25)]"
            >
              <Heart className="w-3.5 h-3.5 text-[#f5a623]" />
              <span>{language === 'es' ? 'Abrir Fondo de Donación Global' : 'Open Global Support Fund'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfileScreen;
