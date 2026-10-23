import React from 'react';
import { X, Check, ListMusic, Plus } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { MOCK_SONGS } from '../../services/musicData';

export const AddToPlaylistModal: React.FC = () => {
  const {
    isAddToPlaylistModalOpen,
    closeAddToPlaylist,
    songToAddToPlaylist,
    playlists,
    language,
    setCreatePlaylistModalOpen,
    addSongToPlaylist,
  } = useUIStore();
  const { currentSong } = usePlayerStore();

  if (!isAddToPlaylistModalOpen) return null;

  const targetSong =
    currentSong && currentSong.id === songToAddToPlaylist
      ? currentSong
      : MOCK_SONGS.find((s) => s.id === songToAddToPlaylist) || currentSong;

  const handleSelectPlaylist = async (playlistId: string) => {
    if (targetSong) {
      await addSongToPlaylist(playlistId, targetSong);
    }
    closeAddToPlaylist();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel-elevated w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={closeAddToPlaylist}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#bacbbe] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <h3 className="text-sm font-bold text-white">
            {language === 'es' ? 'Añadir a Playlist' : 'Add to Playlist'}
          </h3>
          {targetSong && (
            <p className="text-xs text-[#00e599] truncate mt-0.5 font-medium">
              {targetSong.title} — {targetSong.artist}
            </p>
          )}
        </div>

        <div className="space-y-1 max-h-60 overflow-y-auto mb-4 pr-1">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => handleSelectPlaylist(pl.id)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                <ListMusic className="w-4 h-4 text-[#bacbbe] group-hover:text-[#00e599] shrink-0" />
                <span className="text-xs font-semibold text-white truncate">{pl.title}</span>
              </div>
              <span className="text-[10px] text-[#bacbbe] shrink-0">{pl.songCount} temas</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            closeAddToPlaylist();
            setCreatePlaylistModalOpen(true);
          }}
          className="w-full py-2.5 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#00e599] flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'es' ? 'Crear nueva playlist' : 'Create new playlist'}</span>
        </button>
      </div>
    </div>
  );
};
