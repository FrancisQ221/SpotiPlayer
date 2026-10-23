import React, { useState } from 'react';
import { X, Sparkles, Music } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

export const CreatePlaylistModal: React.FC = () => {
  const { isCreatePlaylistModalOpen, setCreatePlaylistModalOpen, createPlaylist, language } = useUIStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isCreatePlaylistModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createPlaylist(title, description);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel-elevated w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setCreatePlaylistModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#bacbbe] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#00e599]/15 border border-[#00e599]/30 flex items-center justify-center text-[#00e599]">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {language === 'es' ? 'Crear Nueva Playlist' : 'Create New Playlist'}
            </h2>
            <p className="text-xs text-[#bacbbe]">
              {language === 'es' ? 'Colección de audio de alta fidelidad' : 'High fidelity audio collection'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#bacbbe] mb-1.5">
              {language === 'es' ? 'Nombre de la playlist' : 'Playlist name'}
            </label>
            <input
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'es' ? 'Ej. Sesión Nocturna 96k' : 'e.g. Midnight 96k Session'}
              className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00e599] text-sm text-white placeholder-[#bacbbe]/50 focus:outline-none focus:ring-1 focus:ring-[#00e599]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#bacbbe] mb-1.5">
              {language === 'es' ? 'Descripción (opcional)' : 'Description (optional)'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'es' ? 'Escribe de qué se trata esta mezcla...' : 'Write what this mix is about...'}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#00e599] text-xs text-white placeholder-[#bacbbe]/50 focus:outline-none focus:ring-1 focus:ring-[#00e599] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreatePlaylistModalOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#bacbbe] hover:text-white hover:bg-white/5 transition-colors"
            >
              {language === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#00e599] hover:bg-[#6dffba] text-[#070B0E] font-bold text-xs shadow-[0_0_15px_rgba(0,229,153,0.35)] transition-all transform hover:scale-105 active:scale-95"
            >
              {language === 'es' ? 'Crear Playlist' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
