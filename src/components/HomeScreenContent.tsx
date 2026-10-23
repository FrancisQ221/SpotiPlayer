import React from 'react';
import {
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  Radio,
  CheckCircle2,
  Mic2,
  HeartHandshake,
  SlidersHorizontal,
  Search,
  HardDrive,
  ShieldCheck,
  Heart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useUIStore, type AppView } from '../stores/useUIStore';
import { MOCK_SONGS } from '../services/musicData';

export const HomeScreenContent: React.FC = () => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, play, setQueue, likedSongIds, toggleLikeSong } =
    usePlayerStore();
  const { setView, language } = useUIStore();

  const handleNavigateView = (view: AppView) => {
    setView(view);
    navigate(`/${view}`);
  };

  return (
    <div className="space-y-8 max-w-7xl animate-in fade-in duration-300">
      {/* Welcome Hero / Status Header */}
      <section className="glass-panel-elevated rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Internal neon ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#00e599]/15 to-[#4cd7f6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#00e599]/15 text-[#00e599] border border-[#00e599]/30 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                AUDIO HD MASTER & ÉTICA RADICAL
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-[#f5a623] border border-white/10 text-xs font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-[#f5a623]" />
                100% LIBRE DE PUBLICIDAD
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {language === 'es' ? 'SpotiPlayer Audio HD Studio' : 'SpotiPlayer Audio HD Studio'}
            </h1>
            <p className="text-sm text-[#bacbbe] leading-relaxed">
              {language === 'es'
                ? 'La plataforma definitiva de audio máster de alta resolución, mecenazgo ético directo a los creadores y transparencia comunitaria total.'
                : 'The ultimate high-resolution master audio streaming platform with direct ethical artist patronage and radical community transparency.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavigateView('artist')}
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-[#00e599]" />
              <span>{language === 'es' ? 'Perfil de Artista' : 'Artist Profile'}</span>
            </button>

            <button
              onClick={() => handleNavigateView('settings')}
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#00e599]" />
              <span>{language === 'es' ? 'Transparencia & Caché' : 'Transparency & Cache'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Complete Modular Showcase Grid (Pantalla 03 Navegación a Módulos) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00e599]" />
            <span>{language === 'es' ? 'Módulos del Sistema SpotiPlayer' : 'SpotiPlayer Core Modules'}</span>
          </h2>
          <span className="text-xs text-[#bacbbe]">Diseño Nocturne Glass Audio</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. LyricsScreen (Pantalla 07) */}
          <div
            onClick={() => handleNavigateView('lyrics')}
            className="glass-panel-elevated rounded-2xl p-4 border border-white/10 hover:border-[#00e599]/50 space-y-2.5 cursor-pointer transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#00e599] uppercase tracking-wider flex items-center gap-1">
                <Mic2 className="w-3 h-3" />
                Pantalla 07
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00e599]/15 text-[#00e599] font-bold">
                LIVE
              </span>
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-[#00e599] transition-colors">
              {language === 'es' ? 'Letras Sincronizadas' : 'Synced Lyrics'}
            </h3>
            <p className="text-[11px] text-[#bacbbe]/70 leading-snug">
              {language === 'es'
                ? 'Timestamps LRCLIB verso a verso y vúmetro reactivo.'
                : 'Verse-by-verse LRCLIB timestamps and reactive VU meter.'}
            </p>
          </div>

          {/* 2. ArtistProfileScreen (Pantalla 08) */}
          <div
            onClick={() => handleNavigateView('artist')}
            className="glass-panel-elevated rounded-2xl p-4 border border-white/10 hover:border-[#00e599]/50 space-y-2.5 cursor-pointer transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#00e599] uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3 h-3" />
                Pantalla 08
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00e599]/15 text-[#00e599] font-bold">
                HD STUDIO
              </span>
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-[#00e599] transition-colors">
              {language === 'es' ? 'Perfil de Artista' : 'Artist Profile'}
            </h3>
            <p className="text-[11px] text-[#bacbbe]/70 leading-snug">
              {language === 'es'
                ? 'Discografía completa, bio y especificaciones de audio master.'
                : 'Complete discography, bio, and master audio specifications.'}
            </p>
          </div>

          {/* 3. EqualizerScreen (Pantalla 09) */}
          <div
            onClick={() => handleNavigateView('equalizer')}
            className="glass-panel-elevated rounded-2xl p-4 border border-white/10 hover:border-[#4cd7f6]/50 space-y-2.5 cursor-pointer transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#4cd7f6] uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                Pantalla 09
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#4cd7f6]/15 text-[#4cd7f6] font-bold">
                10 BANDS
              </span>
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-[#4cd7f6] transition-colors">
              {language === 'es' ? 'Ecualizador DSP HD' : 'DSP Equalizer'}
            </h3>
            <p className="text-[11px] text-[#bacbbe]/70 leading-snug">
              {language === 'es'
                ? 'Curva Bézier SVG, presets acústicos y Bit-Perfect.'
                : 'SVG Bézier curve, acoustic presets, and Bit-Perfect mode.'}
            </p>
          </div>

          {/* 4. SearchScreen (Pantalla 10) */}
          <div
            onClick={() => handleNavigateView('search')}
            className="glass-panel-elevated rounded-2xl p-4 border border-white/10 hover:border-[#00e599]/50 space-y-2.5 cursor-pointer transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#00e599] uppercase tracking-wider flex items-center gap-1">
                <Search className="w-3 h-3" />
                Pantalla 10
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00e599]/15 text-[#00e599] font-bold">
                ITUNES
              </span>
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-[#00e599] transition-colors">
              {language === 'es' ? 'Buscador Global' : 'Global Explorer'}
            </h3>
            <p className="text-[11px] text-[#bacbbe]/70 leading-snug">
              {language === 'es'
                ? 'Consultas en tiempo real a iTunes con carátulas HD.'
                : 'Live iTunes API search with 600x600 HD artwork.'}
            </p>
          </div>

          {/* 5. TransparencySettingsScreen (Pantalla 12) */}
          <div
            onClick={() => handleNavigateView('settings')}
            className="glass-panel-elevated rounded-2xl p-4 border border-white/10 hover:border-[#f5a623]/50 space-y-2.5 cursor-pointer transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#f5a623] uppercase tracking-wider flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                Pantalla 12
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#f5a623]/20 text-[#f5a623] font-bold">
                CACHÉ
              </span>
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-[#f5a623] transition-colors">
              {language === 'es' ? 'Transparencia & Caché' : 'Transparency & Cache'}
            </h3>
            <p className="text-[11px] text-[#bacbbe]/70 leading-snug">
              {language === 'es'
                ? 'Libro mayor de donaciones y gestión offline FLAC.'
                : 'Public donation ledger and offline FLAC cache management.'}
            </p>
          </div>
        </div>
      </section>

      {/* Curated Hi-Fi Master Tracks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#00e599]" />
              <span>
                {language === 'es'
                  ? 'Pistas Seleccionadas de Estudio (Audio Master)'
                  : 'Studio Curated Tracks (Master Audio)'}
              </span>
            </h2>
            <p className="text-xs text-[#bacbbe]">
              {language === 'es'
                ? 'Haz clic en cualquier pista para cargarla en el ecualizador y visor de letras'
                : 'Click any track to load it into the equalizer and live lyrics viewer'}
            </p>
          </div>
          <button
            onClick={() => handleNavigateView('search')}
            className="text-xs font-bold text-[#00e599] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'es' ? 'Buscar más canciones' : 'Search more tracks'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_SONGS.map((song, idx) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                onClick={() => {
                  setQueue(MOCK_SONGS, idx, 'playlist', 'SpotiPlayer Masters');
                  play(song);
                }}
                className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer group relative overflow-hidden ${
                  isCurrent
                    ? 'border-[#00e599] bg-[#00e599]/10 shadow-[0_0_15px_rgba(0,229,153,0.2)]'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#00e599] text-[#070B0E] flex items-center justify-center shadow-lg shadow-[#00e599]/40 transform group-hover:scale-110 transition-transform">
                      {isCurrent && isPlaying ? (
                        <Pause className="w-5 h-5 fill-[#070B0E]" />
                      ) : (
                        <Play className="w-5 h-5 fill-[#070B0E] translate-x-0.5" />
                      )}
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-[#00e599] border border-[#00e599]/30">
                    {song.audioQuality || 'FLAC 24B'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-[#00e599]' : 'text-white'
                      }`}
                    >
                      {song.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikeSong(song.id, song);
                      }}
                      className={`p-1 rounded-full transition-transform hover:scale-125 cursor-pointer shrink-0 ${
                        likedSongIds.includes(song.id)
                          ? 'text-[#00e599]'
                          : 'text-[#849589] hover:text-white'
                      }`}
                      title={likedSongIds.includes(song.id) ? 'Quitar de favoritos' : 'Añadir a Tus Me Gusta'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          likedSongIds.includes(song.id) ? 'fill-[#00e599]' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#bacbbe] truncate">{song.artist}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#bacbbe]/70 pt-1">
                    <span>{song.durationFormatted || '03:45'}</span>
                    <span className="text-[#4cd7f6] font-mono font-medium">
                      {song.audioQuality || 'FLAC Master'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomeScreenContent;
