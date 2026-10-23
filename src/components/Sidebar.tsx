import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  Home,
  Search,
  Library,
  History,
  PlusCircle,
  ListMusic,
  Heart,
  SlidersHorizontal,
  Settings,
  ShieldCheck,
  HeartHandshake,
  Globe,
  Mic2,
  FolderPlus,
  Users
} from 'lucide-react';
import { useUIStore, type AppView, type Language } from '../stores/useUIStore';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentView,
    setView,
    playlists,
    selectedPlaylistId,
    selectPlaylist,
    language,
    setLanguage,
    setCreatePlaylistModalOpen,
    toggleDonateModal,
  } = useUIStore();

  const handleNav = (view: AppView) => {
    setView(view);
    navigate(`/${view}`);
  };


  const navItems: { view: AppView; label: { es: string; en: string }; icon: React.FC<{ className?: string }> }[] = [
    { view: 'home', label: { es: 'Inicio', en: 'Home' }, icon: Home },
    { view: 'search', label: { es: 'Explorar / Búsqueda', en: 'Explore / Search' }, icon: Search },
    { view: 'library', label: { es: 'Tu Biblioteca', en: 'Your Library' }, icon: Library },
    { view: 'history', label: { es: 'Cola e Historial', en: 'Queue & History' }, icon: History },
    { view: 'lyrics', label: { es: 'Letras & Inmersión', en: 'Lyrics & Immersion' }, icon: Mic2 },
    { view: 'artist', label: { es: 'Perfil de Artista', en: 'Artist Profile' }, icon: Users },
    { view: 'equalizer', label: { es: 'Ecualizador HD', en: 'DSP Equalizer' }, icon: SlidersHorizontal },
    { view: 'settings', label: { es: 'Transparencia & Caché', en: 'Transparency & Cache' }, icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-[#0D1319]/90 backdrop-blur-2xl border-r border-white/5 select-none transition-all">
      {/* Brand Header */}
      <div className="p-5 pb-4 flex items-center justify-between border-b border-white/5">
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-3 group text-left transition-transform hover:scale-[1.02] focus:outline-none cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00e599] via-[#00e599]/90 to-[#4cd7f6] flex items-center justify-center text-[#070B0E] font-extrabold shadow-lg shadow-[#00e599]/25 group-hover:shadow-[#00e599]/40 transition-shadow">
            <Radio className="w-5 h-5 text-[#070B0E]" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 leading-none">
              SpotiPlayer
            </div>
            <span className="text-[9px] font-bold tracking-widest text-[#00e599] uppercase">
              AUDIO HD STUDIO
            </span>
          </div>
        </button>

        {/* Studio Version Badge */}
        <span className="px-2 py-0.5 rounded-full bg-[#00e599]/15 border border-[#00e599]/30 text-[#00e599] text-[9px] font-extrabold font-mono uppercase tracking-wider">
          v2.4 HD
        </span>
      </div>

      {/* Primary Navigation */}
      <div className="px-3 py-3 space-y-1">
        <p className="px-3 text-[10px] font-bold tracking-wider text-[#bacbbe]/60 uppercase mb-1">
          {language === 'es' ? 'Navegación' : 'Navigation'}
        </p>
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => handleNav(item.view)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all text-left group cursor-pointer ${
                isActive
                  ? 'bg-[#00e599] text-[#070B0E] font-bold shadow-[0_0_18px_rgba(0,229,153,0.35)]'
                  : 'text-[#dde3ec]/85 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[#070B0E]' : 'text-[#bacbbe]'
                }`}
              />
              <span className="truncate">{item.label[language]}</span>
            </button>
          );
        })}
      </div>

      {/* Library & Playlists Section */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 border-t border-white/5">
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-[10px] font-bold tracking-wider text-[#bacbbe]/60 uppercase">
            {language === 'es' ? 'Tu Biblioteca' : 'Your Library'}
          </span>
          <button
            onClick={() => setCreatePlaylistModalOpen(true)}
            className="text-[#bacbbe] hover:text-[#00e599] transition-colors p-1"
            title={language === 'es' ? 'Nueva Playlist' : 'New Playlist'}
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Create playlist quick button */}
        <button
          onClick={() => setCreatePlaylistModalOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#00e599] bg-[#00e599]/10 hover:bg-[#00e599]/20 border border-[#00e599]/25 transition-all text-left"
        >
          <PlusCircle className="w-4 h-4 text-[#00e599]" />
          <span>{language === 'es' ? 'Crear Playlist Nueva' : 'Create New Playlist'}</span>
        </button>

        {/* Playlists list */}
        <div className="space-y-0.5 pt-1">
          {playlists.map((pl) => {
            const isSelected = currentView === 'playlist' && selectedPlaylistId === pl.id;
            return (
              <button
                key={pl.id}
                onClick={() => selectPlaylist(pl.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left truncate group ${
                  isSelected
                    ? 'bg-white/10 text-[#00e599] font-semibold border border-[#00e599]/30'
                    : 'text-[#bacbbe] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <ListMusic
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected ? 'text-[#00e599]' : 'text-[#bacbbe]/70 group-hover:text-white'
                  }`}
                />
                <span className="truncate">{pl.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ÚNICO BOTÓN GLOBAL DE DONACIÓN DIRECTA (Barra Lateral Persistente) */}
      <div className="p-3 border-t border-white/5 pb-28">
        <div className="rounded-2xl p-3.5 bg-gradient-to-b from-[#f5a623]/[0.08] via-white/[0.03] to-white/[0.01] border border-[#f5a623]/30 shadow-[0_0_20px_rgba(245,166,35,0.12)] space-y-2.5 relative overflow-hidden group">
          {/* Subtle amber background radiant glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#f5a623]/10 rounded-full blur-xl pointer-events-none group-hover:bg-[#f5a623]/20 transition-all" />

          <div className="flex items-center justify-between text-[11px] font-extrabold text-[#f5a623]">
            <div className="flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-[#f5a623]" />
              <span className="tracking-wider uppercase">FONDO COMUNITARIO</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623] font-mono">
              100% DIRECTO
            </span>
          </div>

          <p className="text-[10px] text-[#bacbbe] leading-snug">
            {language === 'es'
              ? 'Apoya a tus artistas preferidos y mantén los servidores libres de anuncios corporativos.'
              : 'Direct patronage to your favorite creators and ad-free high fidelity streaming.'}
          </p>

          {/* Único botón global */}
          <button
            onClick={toggleDonateModal}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#fbbf24] via-[#f5a623] to-[#f59e0b] hover:from-[#f5a623] hover:to-[#d97706] text-[#070B0E] font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(245,166,35,0.4)] hover:shadow-[0_0_25px_rgba(245,166,35,0.6)] transition-all transform hover:scale-[1.02] active:scale-98 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-[#070B0E]" />
            <span>
              {language === 'es'
                ? 'Apoyar a SpotiPlayer & Creadores'
                : 'Support SpotiPlayer & Creators'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
