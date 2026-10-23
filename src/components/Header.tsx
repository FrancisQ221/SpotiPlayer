import React from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  User,
  Sliders,
  X,
  LogOut,
  LogIn
} from 'lucide-react';
import { useUIStore, type Language } from '../stores/useUIStore';
import { useAuthStore } from '../stores/useAuthStore';

export const Header: React.FC = () => {
  const { user, isGuest, signOut } = useAuthStore();
  const {
    currentView,
    setView,
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    toggleDonateModal,
  } = useUIStore();

  const categories = [
    { id: 'Todos', label: { es: 'Todos', en: 'All' } },
    { id: 'Urbano Latino', label: { es: 'Urbano Latino', en: 'Latin Urban' } },
    { id: 'Synth & Pop', label: { es: 'Synth & Pop', en: 'Synth & Pop' } },
    { id: 'Chillout', label: { es: 'Chillout', en: 'Chillout' } },
  ];

  const handleSearchFocus = () => {
    if (currentView !== 'search') {
      setView('search');
    }
  };

  return (
    <header className="sticky top-0 z-20 h-18 px-6 flex items-center justify-between gap-4 bg-[#070B0E]/85 backdrop-blur-2xl border-b border-white/5 transition-all">
      {/* Navigation history arrows & Search bar */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="hidden sm:flex items-center gap-1.5 text-[#bacbbe]">
          <button
            onClick={() => setView('home')}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 hover:text-white flex items-center justify-center transition-all border border-white/5"
            title="Atrás"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-white/5 opacity-40 cursor-not-allowed flex items-center justify-center border border-white/5"
            title="Adelante"
            disabled
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Global Pill Search Bar */}
        <div className="relative flex-1 group">
          <Search className="w-4 h-4 text-[#bacbbe] group-focus-within:text-[#00e599] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            placeholder={
              language === 'es'
                ? 'Buscar artistas, temas, podcasts...'
                : 'Search artists, tracks, podcasts...'
            }
            className="w-full h-10 pl-10 pr-10 rounded-full bg-white/[0.05] hover:bg-white/[0.08] focus:bg-[#131B22] border border-white/10 focus:border-[#00e599] text-xs text-white placeholder-[#bacbbe]/60 focus:outline-none focus:ring-2 focus:ring-[#00e599]/20 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bacbbe] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills (from mockup) */}
        <div className="hidden lg:flex items-center gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] text-[#bacbbe] border border-transparent'
                }`}
              >
                {cat.label[language]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header Actions: Language, Donate, Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Language switch */}
        <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10 text-[11px] font-semibold text-[#bacbbe]">
          <button
            onClick={() => setLanguage('es')}
            className={`px-2 py-0.5 rounded-full transition-all ${
              language === 'es' ? 'bg-[#00e599] text-[#070B0E] font-bold shadow-sm' : 'hover:text-white'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded-full transition-all ${
              language === 'en' ? 'bg-[#00e599] text-[#070B0E] font-bold shadow-sm' : 'hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* Amber Centralized Fund Button */}
        <button
          onClick={toggleDonateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#fbbf24] via-[#f5a623] to-[#f59e0b] hover:from-[#f5a623] hover:to-[#d97706] text-[#070B0E] font-bold text-xs shadow-[0_0_15px_rgba(245,166,35,0.35)] hover:shadow-[0_0_20px_rgba(245,166,35,0.55)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Fondo de donación centralizado SpotiPlayer & Creadores"
        >
          <Heart className="w-3.5 h-3.5 fill-[#070B0E]" />
          <span>{language === 'es' ? 'Fondo Global' : 'Global Fund'}</span>
        </button>

        {/* User profile / Guest state */}
        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('settings')}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
              title={`${user.email || 'Usuario'} - Configuración & Transparencia`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#00e599] to-[#4cd7f6] p-0.5">
                <div className="w-full h-full rounded-full bg-[#0e141a] flex items-center justify-center text-[#00e599]">
                  <User className="w-3.5 h-3.5 text-[#00e599]" />
                </div>
              </div>
              <span className="text-[11px] font-semibold text-white max-w-[90px] truncate hidden sm:inline-block">
                {user.user_metadata?.username || user.email?.split('@')[0] || 'Audiófilo'}
              </span>
            </button>
            <button
              onClick={() => signOut()}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-rose-500/20 text-[#bacbbe] hover:text-rose-400 border border-white/5 hover:border-rose-500/30 flex items-center justify-center transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#00e599] px-2 py-0.5 rounded-full bg-[#00e599]/10 border border-[#00e599]/25 hidden sm:inline-block">
              Modo Libre
            </span>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00e599]/15 hover:bg-[#00e599]/25 border border-[#00e599]/40 text-[#00e599] text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Iniciar sesión o registrar cuenta"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

