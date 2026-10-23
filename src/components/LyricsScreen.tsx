import React, { useState, useEffect, useRef } from 'react';
import {
  Mic2,
  Disc3,
  Heart,
  Share2,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Radio,
  Sliders,
  Play,
  Pause,
  Layers
} from 'lucide-react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useUIStore } from '../stores/useUIStore';
import { musicService } from '../services/musicService';
import { audioEngine } from '../services/audioEngine';
import type { LyricLine } from '../types/music';

export const LyricsScreen: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seekTo,
    toggleLikeSong,
    likedSongIds,
  } = usePlayerStore();

  const { language, toggleDonateModal, setView } = useUIStore();

  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [lyricLang, setLyricLang] = useState<'es' | 'en' | 'orig'>('es');
  const [frequencyBars, setFrequencyBars] = useState<number[]>([40, 65, 85, 95, 75, 60, 45, 80, 70, 90, 85, 60]);

  const activeLyricRef = useRef<HTMLDivElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const isLiked = currentSong ? likedSongIds.includes(currentSong.id) : false;

  // 1. Fetch or load lyrics
  useEffect(() => {
    if (!currentSong) return;

    if (currentSong.lyrics && currentSong.lyrics.length > 0) {
      setLyrics(currentSong.lyrics);
      return;
    }

    let isMounted = true;
    setIsLoadingLyrics(true);

    musicService
      .fetchLyrics(currentSong.title, currentSong.artist, currentSong.album, currentSong.duration)
      .then((fetched) => {
        if (!isMounted) return;
        if (fetched.length > 0) {
          setLyrics(fetched);
          usePlayerStore.setState((state) => {
            if (state.currentSong?.id === currentSong.id) {
              return {
                currentSong: {
                  ...state.currentSong,
                  lyrics: fetched,
                },
              };
            }
            return state;
          });
        } else {
          // Fallback generated lyrics for ambient tracks
          const fallback: LyricLine[] = [
            { id: '1', time: 5, timestampStr: '00:05', text: 'Ecos sintéticos fluyen en la penumbra del estudio', translation: 'Synthetic echoes flow into the studio dusk' },
            { id: '2', time: 15, timestampStr: '00:15', text: 'Frecuencias master a 96kHz resonando en cada fibra', translation: '96kHz master frequencies resonating in every fiber' },
            { id: '3', time: 28, timestampStr: '00:28', text: 'En la frecuencia de la noche digital, las luces de neón susurran la verdad.', translation: "Within the digital night's resonant frequency, neon lights whisper the truth." },
            { id: '4', time: 45, timestampStr: '00:45', text: 'Un pulso analógico despierta entre los circuitos', translation: 'An analog pulse awakens among the circuits' },
            { id: '5', time: 60, timestampStr: '01:00', text: 'Saltando bytes en ondas de pura gravedad acústica', translation: 'Leaping bytes riding waves of sheer acoustic gravity' },
            { id: '6', time: 80, timestampStr: '01:20', text: 'Sintetizadores modulares que no duermen jamás', translation: 'Modular synthesizers that never rest' },
            { id: '7', time: 110, timestampStr: '01:50', text: 'La atmósfera se llena de reverberaciones infinitas', translation: 'The atmosphere fills with infinite reverberations' },
          ];
          setLyrics(fallback);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingLyrics(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentSong]);

  // 2. Real-time spectrum analyzer / VU meter animation loop
  useEffect(() => {
    const dataArray = new Uint8Array(32);

    const updateMeter = () => {
      if (isPlaying) {
        audioEngine.getFrequencyData(dataArray);
        // Extract 12 key bands
        const normalized = [
          Math.max(25, (dataArray[1] / 255) * 100),
          Math.max(30, (dataArray[2] / 255) * 100),
          Math.max(45, (dataArray[4] / 255) * 100),
          Math.max(60, (dataArray[6] / 255) * 100),
          Math.max(75, (dataArray[8] / 255) * 100),
          Math.max(90, (dataArray[10] / 255) * 100),
          Math.max(65, (dataArray[12] / 255) * 100),
          Math.max(70, (dataArray[14] / 255) * 100),
          Math.max(50, (dataArray[16] / 255) * 100),
          Math.max(40, (dataArray[18] / 255) * 100),
          Math.max(35, (dataArray[20] / 255) * 100),
          Math.max(25, (dataArray[22] / 255) * 100),
        ];
        setFrequencyBars(normalized);
      } else {
        setFrequencyBars([15, 20, 25, 30, 25, 20, 15, 25, 30, 20, 15, 10]);
      }
      animFrameRef.current = requestAnimationFrame(updateMeter);
    };

    animFrameRef.current = requestAnimationFrame(updateMeter);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // 3. Find current active lyric line based on currentTime
  let activeLyricIndex = -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      activeLyricIndex = i;
      break;
    }
  }

  // Smooth auto-scroll to current active lyric
  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIndex]);

  const fontClasses = {
    sm: { active: 'text-2xl', inactive: 'text-base', sub: 'text-xs' },
    md: { active: 'text-3xl sm:text-4xl', inactive: 'text-lg', sub: 'text-sm' },
    lg: { active: 'text-4xl sm:text-5xl', inactive: 'text-xl', sub: 'text-base' },
  }[fontSize];

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Stage: Album Art, Spectrum Meter & Patron Card (Pantalla 07) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Visualizer Container */}
          <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#00e599]/[0.03] to-transparent pointer-events-none" />

            {/* Artwork with loss-free studio badge */}
            <div className="relative group rounded-2xl overflow-hidden border border-white/15 shadow-2xl aspect-square">
              <img
                src={currentSong?.coverUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80'}
                alt={currentSong?.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-[#4cd7f6] border border-[#06b6d4]/30 flex items-center gap-1.5 uppercase">
                    <Radio className="w-3 h-3 text-[#00e599]" />
                    LOSSLESS STUDIO
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-[#00e599] border border-[#00e599]/30">
                    FLAC 24-bit / 96kHz
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#bacbbe]/80 font-medium">
                    {currentSong?.album || 'Studio Master Album'}
                  </span>
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-[#00e599] hover:bg-[#6dffba] text-[#070B0E] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,153,0.5)] transition-transform hover:scale-110 active:scale-95"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-[#070B0E]" />
                    ) : (
                      <Play className="w-5 h-5 fill-[#070B0E] translate-x-0.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Song details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-[#00e599]/15 text-[#00e599] font-extrabold text-[9px] uppercase tracking-wider">
                  PISTA MAESTRA
                </span>
                <span className="text-[11px] font-medium text-[#f5a623] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {currentSong?.patronCount?.toLocaleString() || '48,200'} Patrocinadores
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {currentSong?.title || 'Resonancia Cuántica'}
              </h2>
              <p className="text-sm text-[#bacbbe] font-medium">
                {currentSong?.artist || 'Kavinsky • Synthwave Lab'}
              </p>
              <p className="text-xs text-[#bacbbe]/70">
                Álbum: {currentSong?.album || 'Cybernetics Remastered'} ({currentSong?.releaseYear || 2024})
              </p>
            </div>

            {/* Active Real-Time Frequency Wave Spectrum (from Mockup 07) */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] uppercase font-bold text-[#bacbbe]/70 tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e599] animate-pulse" />
                  ESPECTRO DE FRECUENCIA ACTIVO
                </span>
                <span className="text-[10px] font-extrabold text-[#00e599]">
                  Master HD
                </span>
              </div>

              {/* Dynamic Animated Bars */}
              <div className="h-14 flex items-end justify-between gap-1 pt-2">
                {frequencyBars.map((height, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-[#00e599]/60 to-[#00e599] rounded-t-sm shadow-[0_0_8px_rgba(0,229,153,0.3)] transition-all duration-75"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              <div className="flex justify-between text-[9px] font-mono text-[#bacbbe]/60">
                <span>20 Hz</span>
                <span>1 kHz</span>
                <span>8 kHz</span>
                <span>24 kHz</span>
              </div>
            </div>

            {/* Action buttons: Favorites, Share, Direct Patron Tip */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => currentSong && toggleLikeSong(currentSong.id)}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isLiked
                      ? 'bg-[#00e599]/15 border-[#00e599] text-[#00e599]'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#00e599]' : ''}`} />
                  <span>{isLiked ? 'En Favoritos' : 'Favoritos'}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Enlace copiado al portapapeles');
                  }}
                  className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 className="w-4 h-4 text-[#bacbbe]" />
                  <span>Compartir</span>
                </button>
              </div>

              {/* Warm Amber Direct Patron Tip Button */}
              <button
                onClick={toggleDonateModal}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#fbbf24] via-[#f5a623] to-[#f59e0b] hover:from-[#f5a623] hover:to-[#d97706] text-[#070B0E] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,166,35,0.4)] transition-all transform hover:scale-[1.01] active:scale-98"
              >
                <Sparkles className="w-4 h-4 fill-[#070B0E]" />
                <span>Aportar Directo al Artista (Mecenazgo)</span>
              </button>
            </div>

            {/* Artist Mini Card */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentSong?.coverUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={currentSong?.artist}
                  className="w-9 h-9 rounded-full object-cover border border-[#00e599]/30"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    {currentSong?.artist || 'Valeria Vox'}
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00e599]" />
                  </div>
                  <span className="text-[10px] text-[#bacbbe]">
                    1,842,910 oyentes mensuales
                  </span>
                </div>
              </div>

              <button
                onClick={() => setView('artist')}
                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-white transition-colors"
              >
                Ver Perfil
              </button>
            </div>
          </div>
        </div>

        {/* Right Stage: Synchronized Lyrics Stream (Verso a Verso) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls Bar: Live badge, Language, Font Size */}
          <div className="glass-panel rounded-2xl p-3 px-5 border border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00e599] animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                LETRA SINCRONIZADA
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00e599]/20 text-[#00e599] font-bold">
                  LIVE
                </span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Language selection */}
              <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10 text-[10px] font-semibold text-[#bacbbe]">
                <button
                  onClick={() => setLyricLang('es')}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    lyricLang === 'es' ? 'bg-[#00e599] text-[#070B0E] font-bold' : 'hover:text-white'
                  }`}
                >
                  ES
                </button>
                <button
                  onClick={() => setLyricLang('en')}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    lyricLang === 'en' ? 'bg-[#00e599] text-[#070B0E] font-bold' : 'hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLyricLang('orig')}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    lyricLang === 'orig' ? 'bg-[#00e599] text-[#070B0E] font-bold' : 'hover:text-white'
                  }`}
                >
                  Original
                </button>
              </div>

              {/* Font scaling */}
              <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10 text-[11px] font-semibold text-[#bacbbe]">
                <button
                  onClick={() => setFontSize('sm')}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    fontSize === 'sm' ? 'bg-white/20 text-white' : 'hover:text-white'
                  }`}
                  title="Texto pequeño"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('md')}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    fontSize === 'md' ? 'bg-white/20 text-white' : 'hover:text-white'
                  }`}
                  title="Texto mediano"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    fontSize === 'lg' ? 'bg-white/20 text-white' : 'hover:text-white'
                  }`}
                  title="Texto grande"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Verses Scroll Stage */}
          <div
            ref={lyricsContainerRef}
            className="glass-panel-elevated rounded-3xl p-8 border border-white/10 shadow-2xl h-[580px] overflow-y-auto space-y-7 relative select-none scroll-smooth"
          >
            {isLoadingLyrics ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                <Disc3 className="w-8 h-8 text-[#00e599] animate-spin" />
                <p className="text-xs text-[#bacbbe]">
                  Sincronizando marcas de tiempo LRCLIB en vivo...
                </p>
              </div>
            ) : lyrics.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-center text-[#bacbbe]">
                <Mic2 className="w-8 h-8 text-[#bacbbe]/50" />
                <p className="text-sm font-semibold">Pista instrumental o sin letra registrada</p>
              </div>
            ) : (
              lyrics.map((line, index) => {
                const isActive = index === activeLyricIndex;
                const isPast = index < activeLyricIndex;

                return (
                  <div
                    key={line.id}
                    ref={isActive ? activeLyricRef : null}
                    onClick={() => seekTo(line.time)}
                    className={`transition-all duration-300 cursor-pointer rounded-2xl p-3 -mx-3 group ${
                      isActive
                        ? 'bg-[#00e599]/10 border-l-4 border-[#00e599] pl-4 scale-[1.02]'
                        : isPast
                        ? 'opacity-40 hover:opacity-80'
                        : 'opacity-60 hover:opacity-100 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-baseline gap-3 mb-1">
                      <span
                        className={`text-xs font-mono tnum ${
                          isActive ? 'text-[#00e599] font-bold' : 'text-[#bacbbe]/60'
                        }`}
                      >
                        {isActive && <span className="inline-block mr-1.5 text-[#00e599] animate-pulse">●</span>}
                        {line.timestampStr}
                      </span>
                    </div>

                    <p
                      className={`font-extrabold tracking-tight transition-all ${fontClasses.active} ${
                        isActive
                          ? 'text-[#00e599] drop-shadow-[0_0_25px_rgba(0,229,153,0.45)]'
                          : 'text-[#dde3ec] font-bold'
                      }`}
                    >
                      {lyricLang === 'en' && line.translation ? line.translation : line.text}
                    </p>

                    {lyricLang !== 'orig' && line.translation && (
                      <p className={`mt-1 font-medium text-[#4cd7f6]/80 ${fontClasses.sub}`}>
                        {lyricLang === 'es' ? line.translation : line.text}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Verification Notice */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-[#bacbbe]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00e599]" />
              <span>Letra verificada por comunidad abierta SpotiPlayer & LRCLIB</span>
            </div>
            <button
              onClick={() => alert('Reporte de sincronización enviado a la red.')}
              className="hover:text-white transition-colors underline"
            >
              Reportar desfase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
