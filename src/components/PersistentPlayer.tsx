import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  Volume1,
  VolumeX,
  ListPlus,
  Mic2,
  SlidersHorizontal,
  Disc3,
  Layers
} from 'lucide-react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useUIStore } from '../stores/useUIStore';

// Format seconds into mm:ss
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const PersistentPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    likedSongIds,
    streamQuality,
    queue,
    queueIndex,
    togglePlay,
    next,
    previous,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLikeSong,
  } = usePlayerStore();

  const {
    playlists,
    selectedPlaylistId,
    language,
    currentView,
    setView,
    openAddToPlaylist,
    selectPlaylist,
  } = useUIStore();

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const isLiked = currentSong ? likedSongIds.includes(currentSong.id) : false;

  // Determine active playlist name for indicator pill
  const activeQueueItem = queue[queueIndex];
  const activePlaylistName =
    activeQueueItem?.sourceName ||
    playlists.find((p) => p.id === selectedPlaylistId)?.title ||
    'Cyberwave 2088';

  const displayTime = isScrubbing ? scrubValue : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  // Handle progress bar scrubbing
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * duration;
    seekTo(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleSeek(e);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
      }
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isScrubbing]);

  return (
    <div className="fixed bottom-3 left-68 right-4 z-40">
      <div className="glass-panel-elevated rounded-2xl p-3 px-5 flex items-center justify-between gap-4 border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-3xl bg-[#0D1319]/90">
        
        {/* Left: Track Details & Like */}
        <div className="flex items-center gap-3.5 min-w-[240px] max-w-[28%] shrink-0">
          <div className="relative group shrink-0">
            {currentSong?.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-[#bacbbe]">
                <Disc3 className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-[#00e599]/15 rounded-xl border border-[#00e599]/40 pointer-events-none" />
            )}
          </div>

          <div className="overflow-hidden space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                onClick={() => setView('lyrics')}
                className="font-semibold text-xs text-white truncate hover:text-[#00e599] hover:underline cursor-pointer transition-colors"
                title="Ver letras sincronizadas"
              >
                {currentSong?.title || 'Selecciona una canción'}
              </span>
              {currentSong?.audioQuality && (
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#06b6d4]/15 text-[#4cd7f6] border border-[#06b6d4]/30 shrink-0">
                  {currentSong.audioQuality.includes('24-bit') ? 'FLAC 24' : 'HI-RES'}
                </span>
              )}
            </div>
            <p
              onClick={() => setView('artist')}
              className="text-[11px] text-[#bacbbe] truncate hover:text-white hover:underline transition-colors cursor-pointer"
              title="Ver perfil de la artista y mecenazgo"
            >
              {currentSong?.artist || 'SpotiPlayer Audio Studio'}
            </p>
          </div>

          {currentSong && (
            <button
              onClick={() => toggleLikeSong(currentSong.id)}
              className={`p-1.5 rounded-full transition-all shrink-0 ${
                isLiked
                  ? 'text-[#00e599] hover:scale-110'
                  : 'text-[#bacbbe] hover:text-white hover:bg-white/5'
              }`}
              title={isLiked ? 'Quitar de favoritos' : 'Guardar en Tus Me Gusta'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#00e599]' : ''}`} />
            </button>
          )}
        </div>

        {/* Center: Controls, Scrubber & Playlist Bubble */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
          {/* Transport Controls */}
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full transition-colors relative ${
                shuffle ? 'text-[#00e599]' : 'text-[#bacbbe] hover:text-white'
              }`}
              title="Aleatorio"
            >
              <Shuffle className="w-4 h-4" />
              {shuffle && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00e599] rounded-full shadow-[0_0_6px_#00e599]" />
              )}
            </button>

            <button
              onClick={previous}
              className="p-1.5 text-[#bacbbe] hover:text-white transition-colors hover:scale-105"
              title="Anterior"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Neon Emerald Play Button */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-[#00e599] hover:bg-[#6dffba] text-[#070B0E] flex items-center justify-center transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,229,153,0.45)] active:scale-95"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-[#070B0E]" />
              ) : (
                <Play className="w-4 h-4 fill-[#070B0E] translate-x-0.5" />
              )}
            </button>

            <button
              onClick={next}
              className="p-1.5 text-[#bacbbe] hover:text-white transition-colors hover:scale-105"
              title="Siguiente"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-full transition-colors relative ${
                repeatMode !== 'off' ? 'text-[#00e599]' : 'text-[#bacbbe] hover:text-white'
              }`}
              title={`Repetir: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4 text-[#00e599]" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
              {repeatMode !== 'off' && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00e599] rounded-full shadow-[0_0_6px_#00e599]" />
              )}
            </button>
          </div>

          {/* Scrubber & Time */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#bacbbe] w-9 text-right tnum select-none">
              {formatTime(displayTime)}
            </span>

            <div
              ref={progressBarRef}
              onMouseDown={handleMouseDown}
              className="flex-1 h-1.5 bg-white/10 hover:h-2 rounded-full cursor-pointer relative group transition-all"
            >
              <div
                className="h-full bg-gradient-to-r from-[#00e599]/90 to-[#00e599] rounded-full relative shadow-[0_0_10px_rgba(0,229,153,0.5)]"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#00e599] rounded-full shadow-[0_0_12px_#00e599] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <span className="text-[10px] font-mono text-[#bacbbe] w-9 tnum select-none">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Playlist Bubble, Tool Actions & Volume */}
        <div className="flex items-center gap-2.5 min-w-[260px] justify-end shrink-0">
          {/* Active Playlist Bubble */}
          <button
            onClick={() => selectPlaylist(selectedPlaylistId || 'playlist-cyberwave')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-[#4cd7f6] hover:text-white transition-all max-w-[140px] truncate"
            title={`Reproduciendo de: ${activePlaylistName}`}
          >
            <Layers className="w-3 h-3 text-[#4cd7f6] shrink-0" />
            <span className="truncate">{activePlaylistName}</span>
          </button>

          {/* Add to playlist button */}
          {currentSong && (
            <button
              onClick={() => openAddToPlaylist(currentSong.id)}
              className="p-1.5 rounded-lg text-[#bacbbe] hover:text-[#00e599] hover:bg-white/5 transition-all"
              title="Añadir a playlist"
            >
              <ListPlus className="w-4 h-4" />
            </button>
          )}

          {/* Lyrics toggle button */}
          <button
            onClick={() => setView(currentView === 'lyrics' ? 'home' : 'lyrics')}
            className={`p-1.5 rounded-lg transition-all ${
              currentView === 'lyrics'
                ? 'text-[#00e599] bg-[#00e599]/15 border border-[#00e599]/30 shadow-[0_0_10px_rgba(0,229,153,0.3)]'
                : 'text-[#bacbbe] hover:text-white hover:bg-white/5'
            }`}
            title="Letras en Vivo & Inmersión (Pantalla 07)"
          >
            <Mic2 className="w-4 h-4" />
          </button>

          {/* Equalizer toggle button */}
          <button
            onClick={() => setView(currentView === 'equalizer' ? 'home' : 'equalizer')}
            className={`p-1.5 rounded-lg transition-all ${
              currentView === 'equalizer'
                ? 'text-[#00e599] bg-[#00e599]/15 border border-[#00e599]/30 shadow-[0_0_10px_rgba(0,229,153,0.3)]'
                : 'text-[#bacbbe] hover:text-white hover:bg-white/5'
            }`}
            title="Ecualizador DSP HD de 10 Bandas (Pantalla 09)"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 group pl-1">
            <button
              onClick={toggleMute}
              className="p-1 text-[#bacbbe] hover:text-white transition-colors"
              title={isMuted ? 'Desmutear' : 'Silenciar'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-20 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#00e599] focus:outline-none"
              title={`Volumen: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
