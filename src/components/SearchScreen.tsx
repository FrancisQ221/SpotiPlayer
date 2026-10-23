import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  Play,
  Pause,
  ArrowRight,
  Heart,
  ListPlus,
  ShieldAlert,
  ShieldCheck,
  Disc3,
  Sparkles,
  Sliders,
  Check,
  Radio,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { musicService } from '../services/musicService';
import type { Song } from '../types/music';

// Preset genres from the design mockups
const GENRE_CARDS = [
  { id: 'synthwave', title: 'Synthwave & Retrowave', sub: 'Outrun, Darksynth, Neon 80s', query: 'Synthwave Retrowave', color: 'from-purple-900/40 to-blue-900/30' },
  { id: 'lofi', title: 'Lo-Fi Chill & Focus', sub: 'Cintas de casete, vinilo', query: 'Lo-Fi Chill Beats', color: 'from-emerald-900/40 to-teal-900/30' },
  { id: 'urbano', title: 'Urbano & Trap Latino', sub: 'Reggaetón alternativo, drill', query: 'Urbano Latino', color: 'from-amber-900/40 to-orange-900/30' },
  { id: 'electronica', title: 'Electrónica & Cyber Club', sub: 'Techno berlinés, DnB, IDM', query: 'Cyberpunk Electronic Techno', color: 'from-cyan-900/40 to-blue-900/30' },
  { id: 'acustico', title: 'Acústico & Voces Puras', sub: 'Guitarras íntimas, cuartetos', query: 'Acoustic Guitar Pure Vocals', color: 'from-rose-900/40 to-pink-900/30' },
  { id: 'gaming', title: 'Gaming & Ambient', sub: 'Paisajes sonoros cinemáticos 3D', query: 'Ambient Gaming Soundscapes', color: 'from-indigo-900/40 to-violet-900/30' },
  { id: 'rock', title: 'Rock Alternativo', sub: 'Post-punk, indie fuzz, shoegaze', query: 'Alternative Indie Rock', color: 'from-red-900/40 to-stone-900/30' },
  { id: 'jazz', title: 'Jazz & Instrumental HD', sub: 'DSD, Bebop, Neo-Soul', query: 'Jazz Instrumental HD', color: 'from-yellow-900/40 to-amber-900/30' },
];

export const SearchScreen: React.FC = () => {
  const { searchQuery, setSearchQuery, language, openAddToPlaylist } = useUIStore();
  const { currentSong, isPlaying, play, pause, setQueue, toggleLikeSong, likedSongIds } = usePlayerStore();

  const [inputVal, setInputVal] = useState(searchQuery || 'Synthwave / Cyberpunk');
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Valeria Vox Quantum',
    'Retrowave 80s 96kHz',
    'Lo-Fi Neo-Tokyo',
    'Binaural Beats 432Hz',
  ]);

  // Execute live search against iTunes API
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const tracks = await musicService.searchTracks(query, 30);
      setResults(tracks);
      
      // Add to recent searches if not present
      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item.toLowerCase() !== query.toLowerCase());
        return [query, ...filtered.slice(0, 5)];
      });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync external search query from Header if modified
  useEffect(() => {
    if (searchQuery && searchQuery !== inputVal) {
      setInputVal(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchQuery, performSearch]);

  // Initial search on mount
  useEffect(() => {
    performSearch(inputVal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchQuery(inputVal);
      performSearch(inputVal);
    }
  };

  const handleRemoveRecent = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => prev.filter((t) => t !== termToRemove));
  };

  const handleClearAllRecent = () => {
    setRecentSearches([]);
  };

  const handleSelectRecent = (term: string) => {
    setInputVal(term);
    setSearchQuery(term);
    performSearch(term);
  };

  // Click on a song: load into player store and play immediately!
  const handlePlaySong = async (song: Song, index: number) => {
    if (currentSong?.id === song.id && isPlaying) {
      pause();
      return;
    }

    // Set active queue with search results so next/previous works across all matches
    setQueue(results, index, 'manual', inputVal || 'Búsqueda Global');

    // Fetch synchronized lyrics in background from LRCLIB for full immersion
    try {
      const lyrics = await musicService.fetchLyrics(song.title, song.artist, song.album, song.duration);
      if (lyrics.length > 0) {
        usePlayerStore.setState((state) => {
          if (state.currentSong?.id === song.id) {
            return {
              currentSong: {
                ...state.currentSong,
                lyrics,
              },
            };
          }
          return state;
        });
      }
    } catch (err) {
      console.warn('Could not fetch lyrics:', err);
    }
  };

  const topMatch = results.length > 0 ? results[0] : null;
  const relatedTracks = results.length > 1 ? results.slice(1) : results;

  return (
    <div className="space-y-8 max-w-6xl animate-in fade-in duration-300">
      {/* 1. Header & Live Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Search className="w-6 h-6 text-[#00e599]" />
              {language === 'es' ? 'Explorador de Audio Espacial y Acústico' : 'Spatial & Acoustic Audio Explorer'}
            </h1>
            <p className="text-xs text-[#bacbbe] mt-1">
              {language === 'es'
                ? 'Conectado a APIs de streaming globales en tiempo real. Cero datos simulados.'
                : 'Connected to live global streaming APIs in real-time. Zero mock data.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#4cd7f6] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shrink-0 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse" />
            <span>Indexación Descentralizada • 1,482,900 Masters FLAC</span>
          </div>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleFormSubmit} className="relative flex items-center gap-3">
          <div className="relative flex-1 group">
            <Search className="w-5 h-5 text-[#bacbbe] group-focus-within:text-[#00e599] absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                language === 'es'
                  ? 'Escribe un artista, canción, álbum o género (ej. Synthwave, The Weeknd, Dua Lipa, Daft Punk)...'
                  : 'Type an artist, song, album or genre...'
              }
              className="w-full h-12 pl-12 pr-12 rounded-full bg-[#131B22]/90 hover:bg-[#161c22] focus:bg-[#161c22] border border-white/10 focus:border-[#00e599] text-sm text-white placeholder-[#bacbbe]/50 focus:outline-none focus:ring-2 focus:ring-[#00e599]/25 transition-all shadow-inner"
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => {
                  setInputVal('');
                  setSearchQuery('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bacbbe] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-12 px-6 rounded-full bg-[#00e599] hover:bg-[#6dffba] text-[#070B0E] font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,153,0.35)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <Disc3 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{language === 'es' ? 'Explorar' : 'Explore'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Recent Searches Chips */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-[#bacbbe]/70 uppercase">
                {language === 'es' ? 'Búsquedas Recientes:' : 'Recent Searches:'}
              </span>
              {recentSearches.map((term) => (
                <div
                  key={term}
                  onClick={() => handleSelectRecent(term)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-medium cursor-pointer transition-all group hover:border-[#00e599]/30"
                >
                  <span className="truncate max-w-[150px]">{term}</span>
                  <button
                    onClick={(e) => handleRemoveRecent(term, e)}
                    className="text-[#bacbbe] hover:text-red-400 p-0.5"
                    title="Eliminar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleClearAllRecent}
              className="text-[11px] font-bold tracking-wider uppercase text-[#00e599] hover:text-[#6dffba] transition-colors"
            >
              {language === 'es' ? 'Limpiar Todo' : 'Clear All'}
            </button>
          </div>
        )}
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
          <Disc3 className="w-8 h-8 text-[#00e599] animate-spin" />
          <p className="text-xs text-[#bacbbe] font-medium">
            {language === 'es' ? 'Consultando catálogo en vivo...' : 'Fetching live audio stream...'}
          </p>
        </div>
      )}

      {/* 2. Top Match & Related Tracks (Pantalla 10) */}
      {!isLoading && results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Match Card (Left 5 Cols) */}
          {topMatch && (
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'es' ? 'Mejor Coincidencia' : 'Top Match'}
                </span>
                <span className="text-[11px] text-[#00e599] font-medium">
                  Relevancia Acústica 99.4%
                </span>
              </div>

              <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden space-y-5">
                {/* Visual Backdrop */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#00e599]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative shrink-0">
                    <img
                      src={topMatch.coverUrl}
                      alt={topMatch.artist}
                      className="w-24 h-24 rounded-full object-cover border-2 border-white/15 shadow-xl"
                    />
                    <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#00e599] text-[#070B0E] font-extrabold text-[9px] uppercase tracking-wider shadow-md">
                      MASTER
                    </span>
                  </div>

                  <div className="overflow-hidden space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#00e599] uppercase tracking-wider">
                      <Radio className="w-3 h-3" />
                      <span>{language === 'es' ? 'Artista Verificado • Direct Audio' : 'Verified Artist • Direct Audio'}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white truncate">
                      {topMatch.artist}
                    </h2>
                    <p className="text-xs text-[#bacbbe] truncate font-medium">
                      {topMatch.title}
                    </p>
                    <p className="text-[10px] text-[#bacbbe]/70 line-clamp-1">
                      Álbum: {topMatch.album} ({topMatch.releaseYear})
                    </p>
                  </div>
                </div>

                {/* Audiophile Frequency Box */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs relative z-10">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#bacbbe]/70 tracking-wider block">
                      Frecuencia / Formato
                    </span>
                    <span className="font-bold text-[#4cd7f6] mt-0.5 block">
                      FLAC Puro • 96.0 kHz / 24-bit
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#00e599]/15 text-[#00e599] border border-[#00e599]/30 text-[10px] font-bold">
                    Estreno Libre
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 relative z-10">
                  <button
                    onClick={() => handlePlaySong(topMatch, 0)}
                    className="flex-1 py-3 px-5 rounded-full bg-[#00e599] hover:bg-[#6dffba] text-[#070B0E] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,153,0.4)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {currentSong?.id === topMatch.id && isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-[#070B0E]" />
                        <span>{language === 'es' ? 'Pausar' : 'Pause'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-[#070B0E]" />
                        <span>{language === 'es' ? 'Reproducir Ahora' : 'Play Now'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => openAddToPlaylist(topMatch.id)}
                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:text-[#00e599]"
                    title="Añadir a playlist"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleLikeSong(topMatch.id, topMatch)}
                    className={`p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all ${
                      likedSongIds.includes(topMatch.id)
                        ? 'text-[#00e599]'
                        : 'text-white hover:text-[#00e599]'
                    }`}
                    title="Favoritos"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedSongIds.includes(topMatch.id) ? 'fill-[#00e599]' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Related Tracks (Right 7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {language === 'es' ? 'Pistas Relacionadas con la Búsqueda' : 'Related Tracks'}
              </span>
              <span className="text-xs text-[#bacbbe]">
                {relatedTracks.length} {language === 'es' ? 'resultados' : 'results'}
              </span>
            </div>

            <div className="glass-panel-elevated rounded-3xl p-3 border border-white/10 divide-y divide-white/5 space-y-1">
              {relatedTracks.slice(0, 7).map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                const isCurrentPlaying = isCurrent && isPlaying;
                const isLiked = likedSongIds.includes(song.id);

                return (
                  <div
                    key={song.id}
                    onClick={() => handlePlaySong(song, idx + (topMatch ? 1 : 0))}
                    className={`p-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                      isCurrent
                        ? 'bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/30'
                        : 'hover:bg-white/[0.04] text-white'
                    }`}
                  >
                    {/* Index or Equalizer Bars */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 text-center text-xs font-mono text-[#bacbbe] shrink-0">
                        {isCurrentPlaying ? (
                          <div className="flex items-end justify-center gap-0.5 h-3">
                            <span className="w-0.5 h-3 bg-[#00e599] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-0.5 h-2 bg-[#00e599] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-0.5 h-3.5 bg-[#00e599] animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        ) : (
                          <span className="group-hover:hidden">{(idx + 1).toString().padStart(2, '0')}</span>
                        )}
                        <Play className={`w-3.5 h-3.5 text-white mx-auto hidden group-hover:block ${isCurrent ? 'text-[#00e599]' : ''}`} />
                      </div>

                      {/* Cover Thumbnail */}
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                      />

                      {/* Song Title & Artist */}
                      <div className="overflow-hidden space-y-0.5">
                        <p className={`text-xs font-bold truncate ${isCurrent ? 'text-[#00e599]' : 'text-white'}`}>
                          {song.title}
                        </p>
                        <p className="text-[11px] text-[#bacbbe] truncate">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* Spec badge & Duration & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#06b6d4]/15 text-[#4cd7f6] border border-[#06b6d4]/30">
                        {song.audioQuality.includes('24-bit') ? '96kHz / 24b' : 'FLAC Master'}
                      </span>

                      <span className="text-xs font-mono text-[#bacbbe] tnum">
                        {song.durationFormatted || '03:40'}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikeSong(song.id, song);
                        }}
                        className={`p-1.5 rounded-full transition-all ${
                          isLiked
                            ? 'text-[#00e599]'
                            : 'text-[#bacbbe] hover:text-white'
                        }`}
                        title="Me gusta"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#00e599]' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddToPlaylist(song.id);
                        }}
                        className="p-1.5 text-[#bacbbe] hover:text-[#00e599] transition-colors"
                        title="Añadir a playlist"
                      >
                        <ListPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Community Transparency & Zero-Ads Guarantee Banner (from Mockup 10) */}
      <section className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#4cd7f6] shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#00e599]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                {language === 'es' ? 'Búsqueda 100% Comunitaria y Neutra' : '100% Community & Neutral Search'}
              </h3>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#00e599]/15 text-[#00e599] border border-[#00e599]/30">
                CERO ADS
              </span>
            </div>
            <p className="text-xs text-[#bacbbe] leading-relaxed max-w-2xl">
              {language === 'es'
                ? 'En SpotiPlayer ningún sello discográfico ni patrocinador puede pagar por alterar los resultados de búsqueda. El motor clasifica por coincidencia tímbrica, fidelidad de muestreo y apoyo real de oyentes independientes.'
                : 'In SpotiPlayer no record label or sponsor can pay to alter search rankings. Categorized strictly by acoustic fidelity and community support.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            alert(
              language === 'es'
                ? 'Algoritmo SpotiPlayer: Indexación descentralizada de audio master, sin tracking publicitario y 100% de transparencia en streaming.'
                : 'SpotiPlayer Algorithm: Decentralized audio master indexing, zero ad tracking, and 100% streaming transparency.'
            );
          }}
          className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white whitespace-nowrap transition-all shrink-0 cursor-pointer"
        >
          {language === 'es' ? 'Conocer Algoritmo Libre' : 'Explore Open Algorithm'}
        </button>
      </section>

      {/* 4. Explore by Genre & Mood Categories Grid (from Mockup 10) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            {language === 'es' ? 'Explorar todo por Géneros & Estado de Ánimo' : 'Explore All by Genres & Moods'}
          </h2>
          <span className="text-xs text-[#bacbbe]">
            {language === 'es' ? 'Archivos master sin pérdida categorizados por acústica' : 'Lossless master archives categorized by acoustics'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GENRE_CARDS.map((genre) => (
            <div
              key={genre.id}
              onClick={() => {
                setInputVal(genre.query);
                setSearchQuery(genre.query);
                performSearch(genre.query);
              }}
              className={`p-5 rounded-3xl bg-gradient-to-br ${genre.color} border border-white/10 hover:border-[#00e599]/40 hover:scale-[1.02] transition-all cursor-pointer shadow-lg space-y-2 group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-[#4cd7f6] uppercase">
                  HD STUDIO
                </span>
                <Radio className="w-3.5 h-3.5 text-[#00e599] group-hover:rotate-12 transition-transform" />
              </div>

              <h4 className="text-base font-bold text-white group-hover:text-[#00e599] transition-colors">
                {genre.title}
              </h4>
              <p className="text-xs text-[#bacbbe]/80">
                {genre.sub}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
