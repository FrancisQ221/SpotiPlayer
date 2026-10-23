import React, { useState } from 'react';
import {
  X,
  Heart,
  ShieldCheck,
  Check,
  Sparkles,
  Coffee,
  Headphones,
  Star,
  Users,
  Building2,
  ChevronRight,
  ExternalLink,
  Coins,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { MOCK_ARTIST_VALERIA, MOCK_SONGS } from '../../services/musicData';

export const DonationModal: React.FC = () => {
  const { isDonateModalOpen, setDonateModalOpen, language } = useUIStore();

  // Tabs: 'platform' | 'artist'
  const [activeTab, setActiveTab] = useState<'platform' | 'artist'>('platform');

  // Platform tab state
  const [platformTier, setPlatformTier] = useState<number>(10);
  const [customPlatformAmount, setCustomPlatformAmount] = useState<string>('');

  // Artist tab state
  const availableArtists = [
    {
      id: MOCK_ARTIST_VALERIA.id,
      name: MOCK_ARTIST_VALERIA.name,
      avatarUrl: MOCK_ARTIST_VALERIA.avatarUrl,
      genre: 'Synthwave & Electro-Pop',
      location: MOCK_ARTIST_VALERIA.location,
    },
    {
      id: 'bioluminescent-sound',
      name: 'Bioluminescent Sound',
      avatarUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
      genre: 'Lo-Fi Chill & Ambient',
      location: 'Tokio, Japón',
    },
    {
      id: 'sintetizador-88',
      name: 'Sintetizador 88',
      avatarUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
      genre: 'Cyberpunk Synth',
      location: 'Berlín, Alemania',
    },
    {
      id: 'kavinsky-lab',
      name: 'Kavinsky & Synthwave Lab',
      avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      genre: 'Outrun & Darksynth',
      location: 'París, Francia',
    },
    {
      id: 'kroma-sound',
      name: 'Kroma Soundworks',
      avatarUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80',
      genre: 'Ambient Latino',
      location: 'Bogotá, Colombia',
    },
  ];

  const [selectedArtistId, setSelectedArtistId] = useState<string>(MOCK_ARTIST_VALERIA.id);
  const [artistAmount, setArtistAmount] = useState<number>(15);
  const [customArtistAmount, setCustomArtistAmount] = useState<string>('');
  const [artistNote, setArtistNote] = useState<string>('');
  const [splitWithPlatform, setSplitWithPlatform] = useState<boolean>(false);

  // Success confirmation state
  const [hasDonated, setHasDonated] = useState<boolean>(false);
  const [confirmationDetails, setConfirmationDetails] = useState<{
    type: 'platform' | 'artist';
    amount: number;
    beneficiary: string;
  } | null>(null);

  if (!isDonateModalOpen) return null;

  const platformTiers = [
    {
      amount: 3,
      label: language === 'es' ? 'Café Servidor' : 'Server Coffee',
      desc: language === 'es' ? 'Ancho de banda FLAC sin compresión' : 'Lossless bandwidth support',
      icon: Coffee,
    },
    {
      amount: 10,
      label: language === 'es' ? 'Nodo HD Master' : 'Master HD Node',
      desc: language === 'es' ? 'Mantiene el nodo de streaming 96kHz' : 'Supports 96kHz streaming node',
      icon: Headphones,
      popular: true,
    },
    {
      amount: 25,
      label: language === 'es' ? 'Mecenas Guardián' : 'Guardian Patron',
      desc: language === 'es' ? 'Infraestructura libre y descentralizada' : 'Free & open infrastructure',
      icon: Star,
    },
  ];

  const artistTiers = [5, 10, 15, 30];

  const selectedArtist =
    availableArtists.find((a) => a.id === selectedArtistId) || availableArtists[0];

  const effectivePlatformAmount = customPlatformAmount
    ? parseFloat(customPlatformAmount) || platformTier
    : platformTier;

  const effectiveArtistAmount = customArtistAmount
    ? parseFloat(customArtistAmount) || artistAmount
    : artistAmount;

  const handleDonatePlatform = () => {
    setConfirmationDetails({
      type: 'platform',
      amount: effectivePlatformAmount,
      beneficiary: 'SpotiPlayer Open Infrastructure',
    });
    setHasDonated(true);
    setTimeout(() => {
      setHasDonated(false);
      setConfirmationDetails(null);
      setDonateModalOpen(false);
    }, 2800);
  };

  const handleDonateArtist = () => {
    setConfirmationDetails({
      type: 'artist',
      amount: effectiveArtistAmount,
      beneficiary: selectedArtist.name,
    });
    setHasDonated(true);
    setTimeout(() => {
      setHasDonated(false);
      setConfirmationDetails(null);
      setDonateModalOpen(false);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="glass-panel-elevated w-full max-w-xl rounded-3xl p-6 sm:p-7 border border-[#f5a623]/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden bg-[#0D1319]/95 text-white">
        {/* Amber Ambient Top Light */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-b from-[#f5a623]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-t from-[#00e599]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setDonateModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-[#bacbbe] hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f5a623]/20 border border-[#f5a623]/40 text-[#f5a623] mb-1 shadow-[0_0_20px_rgba(245,166,35,0.3)]">
            <Heart className="w-6 h-6 fill-[#f5a623]" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {language === 'es'
              ? 'Fondo de Donación & Mecenazgo Centralizado'
              : 'Centralized Patronage & Support Fund'}
          </h2>
          <p className="text-xs text-[#bacbbe] max-w-md mx-auto leading-relaxed">
            {language === 'es'
              ? 'Un único lugar transparente para apoyar a tus artistas favoritos o financiar servidores libres de publicidad y algoritmos oscuros.'
              : 'A single transparent hub to support independent artists and maintain ad-free, bit-perfect high-res audio streaming.'}
          </p>
        </div>

        {/* Confirmation Screen */}
        {hasDonated && confirmationDetails ? (
          <div className="py-10 px-4 text-center space-y-4 animate-in zoom-in-95 duration-300 relative z-10">
            <div className="w-16 h-16 rounded-full bg-[#00e599]/20 border border-[#00e599] text-[#00e599] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,229,153,0.5)]">
              <Check className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                {language === 'es' ? '¡Aporte Registrado con Éxito!' : 'Contribution Successfully Registered!'}
              </h3>
              <p className="text-xs text-[#00e599] font-mono font-semibold">
                ${confirmationDetails.amount} USD → {confirmationDetails.beneficiary}
              </p>
              <p className="text-xs text-[#bacbbe] max-w-sm mx-auto leading-relaxed pt-2">
                {language === 'es'
                  ? 'Transacción registrada en el libro público de transparencia. El 100% de los fondos son transferidos directamente sin recargos corporativos.'
                  : 'Logged into the public community ledger. 100% of funds are directed without corporate cuts.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 relative z-10">
            {/* Clean 2-Option Tab Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
              <button
                onClick={() => setActiveTab('platform')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'platform'
                    ? 'bg-[#00e599] text-[#070B0E] shadow-[0_0_15px_rgba(0,229,153,0.35)]'
                    : 'text-[#bacbbe] hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>{language === 'es' ? '1. Apoyar la Plataforma' : '1. Support Platform'}</span>
              </button>

              <button
                onClick={() => setActiveTab('artist')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'artist'
                    ? 'bg-gradient-to-r from-[#fbbf24] via-[#f5a623] to-[#f59e0b] text-[#070B0E] shadow-[0_0_15px_rgba(245,166,35,0.4)]'
                    : 'text-[#bacbbe] hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{language === 'es' ? '2. Apoyar a un Artista' : '2. Support Artists'}</span>
              </button>
            </div>

            {/* TAB 1: Platform Support */}
            {activeTab === 'platform' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#bacbbe] font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00e599]" />
                      {language === 'es' ? 'Meta mensual de servidores libres:' : 'Monthly ad-free server goal:'}
                    </span>
                    <span className="font-mono font-bold text-[#00e599]">84.5% financiado</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00e599] to-[#4cd7f6] rounded-full w-[84.5%]" />
                  </div>
                  <p className="text-[10px] text-[#bacbbe]/70 leading-relaxed">
                    {language === 'es'
                      ? 'Sin anuncios, sin rastreadores comerciales y con transmisión Bit-Perfect FLAC disponible para todos.'
                      : 'Zero ads, zero trackers, bit-perfect FLAC streaming open to all.'}
                  </p>
                </div>

                {/* Platform Tiers */}
                <div className="grid grid-cols-3 gap-3">
                  {platformTiers.map((tier) => {
                    const isSelected =
                      platformTier === tier.amount && !customPlatformAmount;
                    const Icon = tier.icon;
                    return (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => {
                          setPlatformTier(tier.amount);
                          setCustomPlatformAmount('');
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-[#00e599]/15 border-[#00e599] shadow-[0_0_15px_rgba(0,229,153,0.25)]'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {tier.popular && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-[#00e599] text-[#070B0E] font-extrabold text-[8px] uppercase tracking-wider">
                            Popular
                          </span>
                        )}
                        <Icon
                          className={`w-4 h-4 mb-2 ${
                            isSelected ? 'text-[#00e599]' : 'text-[#bacbbe]'
                          }`}
                        />
                        <div className="text-sm font-extrabold text-white">
                          ${tier.amount}{' '}
                          <span className="text-[10px] font-normal text-[#bacbbe]">USD</span>
                        </div>
                        <div className="text-[10px] text-[#bacbbe] mt-0.5 font-medium">
                          {tier.label}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Field */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-[#bacbbe] shrink-0 font-medium">
                    {language === 'es' ? 'Otro importe libre:' : 'Custom amount:'}
                  </span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#00e599]">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={customPlatformAmount}
                      onChange={(e) => setCustomPlatformAmount(e.target.value)}
                      placeholder="Monto voluntario (USD)"
                      className="w-full bg-white/5 border border-white/10 focus:border-[#00e599] rounded-xl pl-7 pr-3 py-1.5 text-xs font-mono text-white placeholder-[#bacbbe]/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Confirm Platform Contribution */}
                <button
                  type="button"
                  onClick={handleDonatePlatform}
                  className="w-full py-3 px-4 rounded-full bg-[#00e599] hover:bg-[#6dffba] text-[#070B0E] font-bold text-xs shadow-[0_0_20px_rgba(0,229,153,0.4)] transition-all transform hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Sparkles className="w-4 h-4 fill-[#070B0E]" />
                  <span>
                    {language === 'es'
                      ? `Confirmar Aporte de $${effectivePlatformAmount} USD a Servidores`
                      : `Confirm $${effectivePlatformAmount} USD to Server Infrastructure`}
                  </span>
                </button>
              </div>
            )}

            {/* TAB 2: Artist Direct Patronage */}
            {activeTab === 'artist' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Artist Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#bacbbe] uppercase tracking-wider block">
                    {language === 'es' ? 'Selecciona al Artista Beneficiario:' : 'Select Beneficiary Artist:'}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {availableArtists.map((artist) => {
                      const isSelected = selectedArtistId === artist.id;
                      return (
                        <div
                          key={artist.id}
                          onClick={() => setSelectedArtistId(artist.id)}
                          className={`p-2 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#f5a623]/20 border-[#f5a623] shadow-[0_0_15px_rgba(245,166,35,0.25)]'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <img
                            src={artist.avatarUrl}
                            alt={artist.name}
                            className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{artist.name}</h4>
                            <p className="text-[10px] text-[#bacbbe] truncate">{artist.genre}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#f5a623] shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Amount presets */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#bacbbe] uppercase tracking-wider block">
                    {language === 'es' ? 'Monto del Aporte Directo:' : 'Contribution Amount:'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {artistTiers.map((amt) => {
                      const isSelected = artistAmount === amt && !customArtistAmount;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setArtistAmount(amt);
                            setCustomArtistAmount('');
                          }}
                          className={`py-2 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs ${
                            isSelected
                              ? 'bg-[#f5a623] text-[#070B0E] border-[#f5a623] shadow-[0_0_12px_rgba(245,166,35,0.4)]'
                              : 'bg-white/[0.04] text-white border-white/10 hover:border-white/25'
                          }`}
                        >
                          ${amt} USD
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom amount or note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#f5a623]">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={customArtistAmount}
                      onChange={(e) => setCustomArtistAmount(e.target.value)}
                      placeholder={language === 'es' ? 'Otro importe (USD)' : 'Custom amount (USD)'}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#f5a623] rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-white placeholder-[#bacbbe]/50 focus:outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    value={artistNote}
                    onChange={(e) => setArtistNote(e.target.value)}
                    placeholder={language === 'es' ? 'Nota para el artista (opcional)' : 'Message to artist (optional)'}
                    className="w-full bg-white/5 border border-white/10 focus:border-[#f5a623] rounded-xl px-3 py-2 text-xs text-white placeholder-[#bacbbe]/50 focus:outline-none"
                  />
                </div>

                {/* Distribution guarantee pill */}
                <div className="p-2.5 rounded-xl bg-[#f5a623]/10 border border-[#f5a623]/25 flex items-center justify-between text-[11px]">
                  <span className="text-[#f5a623] font-semibold flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    {language === 'es' ? '100% Directo a la cuenta de' : '100% Direct to'} {selectedArtist.name}
                  </span>
                  <span className="text-[10px] text-[#bacbbe]">0% comisiones corporativas</span>
                </div>

                {/* Confirm Artist Contribution Button */}
                <button
                  type="button"
                  onClick={handleDonateArtist}
                  className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#fbbf24] via-[#f5a623] to-[#f59e0b] hover:from-[#f5a623] hover:to-[#d97706] text-[#070B0E] font-bold text-xs shadow-[0_0_20px_rgba(245,166,35,0.45)] transition-all transform hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-[#070B0E]" />
                  <span>
                    {language === 'es'
                      ? `Enviar $${effectiveArtistAmount} USD a ${selectedArtist.name}`
                      : `Send $${effectiveArtistAmount} USD to ${selectedArtist.name}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Transparency Notice */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#bacbbe]/70 relative z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00e599]" />
            <span>SpotiPlayer Fair-Share Audio Protocol</span>
          </div>
          <span>Auditoría en tiempo real</span>
        </div>
      </div>
    </div>
  );
};
