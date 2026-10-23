import React, { useState } from 'react';
import {
  HardDrive,
  Trash2,
  Download,
  ShieldCheck,
  Check,
  Sparkles,
  DollarSign,
  TrendingUp,
  Server,
  Heart,
  Cpu,
  Layers,
  FileText,
  AlertCircle,
  ExternalLink,
  Lock,
  Eye,
  RefreshCw,
  Sliders,
  Database,
  Radio,
  Wifi,
  Smartphone,
  FolderOpen,
  Key,
  Users,
  Copy,
  FolderGit2
} from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { usePlayerStore } from '../stores/usePlayerStore';

export const TransparencySettingsScreen: React.FC = () => {
  const { language, toggleDonateModal } = useUIStore();
  const { bitPerfect, setBitPerfect } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<'audio' | 'storage' | 'transparency' | 'privacy'>('transparency');
  const [wifiQuality, setWifiQuality] = useState<'flac' | 'high'>('flac');
  const [cellularQuality, setCellularQuality] = useState<'balanced' | 'extreme'>('balanced');
  const [cacheSizeMb, setCacheSizeMb] = useState(3200); // 3.2 GB
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const pgpKey = 'spoti_usr_9a4f21bc9048e77a';

  const handleClearCache = () => {
    setIsClearingCache(true);
    setTimeout(() => {
      setCacheSizeMb(280);
      setIsClearingCache(false);
      setNotificationMsg(
        language === 'es'
          ? 'Memoria caché volátil limpiada exitosamente (2.92 GB liberados).'
          : 'Volatile memory cache cleared successfully (2.92 GB freed).'
      );
      setTimeout(() => setNotificationMsg(null), 4000);
    }, 800);
  };

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(pgpKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleDownloadCsv = () => {
    const csvContent =
      'Fecha,Destinatario,Tipo,Monto_USD,Estado,Hash\n' +
      '2024-10-20,Valeria Vox,Regalías Directas,5915.00,Completado,0x9b7a...e41\n' +
      '2024-10-20,Edge CDN Hi-Res,Infraestructura,1690.00,Completado,0x4f12...a90\n' +
      '2024-10-20,SpotiPlayer Core,Desarrollo Libre,845.00,Completado,0x88c3...112\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SpotiPlayer_Transacciones_Auditoría_2024.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-7xl animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-[#0D1319]/95 border border-[#00e599] shadow-[0_0_25px_rgba(0,229,153,0.3)] text-white text-xs flex items-center gap-3 backdrop-blur-xl animate-in slide-in-from-top-4">
          <Check className="w-5 h-5 text-[#00e599] shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header matching Image_23_87a97ad3.png (Pantalla 12) */}
      <section className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#bacbbe]">
            <span className="uppercase tracking-widest text-[#00e599] font-bold">PREFERENCIAS DEL SISTEMA</span>
            <span>•</span>
            <span>v2.4.0 Studio Edition</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Configuración & Transparencia
          </h1>

          <p className="text-xs text-[#bacbbe] max-w-2xl leading-relaxed">
            {language === 'es'
              ? 'Optimiza la fidelidad acústica en tiempo real, gestiona los paquetes FLAC sin conexión y supervisa el balance ético de fondos comunitarios.'
              : 'Tune real-time acoustic fidelity, manage offline FLAC storage, and inspect live community ethical finances.'}
          </p>
        </div>

        {/* Hardware Status Indicators */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-full bg-[#00e599]/15 border border-[#00e599]/30 text-xs font-mono font-bold text-[#00e599] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse" />
            DAC USB Conectado
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-[#4cd7f6]">
              96K BIT-PERFECT
            </span>
          </span>

          <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#bacbbe] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#4cd7f6]" />
            Sincronizado
          </span>
        </div>
      </section>

      {/* Navigation Tabs (Pantalla 12) */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('audio')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'audio'
              ? 'bg-[#00e599] text-[#070B0E] shadow-[0_0_15px_rgba(0,229,153,0.35)]'
              : 'bg-white/5 text-[#bacbbe] hover:text-white hover:bg-white/10 border border-white/5'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Calidad de Audio & Streaming</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'storage'
              ? 'bg-[#00e599] text-[#070B0E] shadow-[0_0_15px_rgba(0,229,153,0.35)]'
              : 'bg-white/5 text-[#bacbbe] hover:text-white hover:bg-white/10 border border-white/5'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Almacenamiento & Modo Offline</span>
        </button>

        <button
          onClick={() => setActiveTab('transparency')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'transparency'
              ? 'bg-[#f5a623] text-[#070B0E] shadow-[0_0_20px_rgba(245,166,35,0.4)]'
              : 'bg-white/5 text-[#bacbbe] hover:text-white hover:bg-white/10 border border-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Mecenazgo & Transparencia Radical</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-[#f5a623] font-bold">
            100% ABIERTO
          </span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'privacy'
              ? 'bg-[#00e599] text-[#070B0E] shadow-[0_0_15px_rgba(0,229,153,0.35)]'
              : 'bg-white/5 text-[#bacbbe] hover:text-white hover:bg-white/10 border border-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Privacidad & Cuenta</span>
        </button>
      </div>

      {/* 1. Storage & Offline Cache Management (Visible in storage or transparency tabs) */}
      {(activeTab === 'storage' || activeTab === 'transparency') && (
        <section className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00e599]/15 flex items-center justify-center text-[#00e599]">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Almacenamiento Local & Descargas Offline</h3>
                <p className="text-xs text-[#bacbbe]">
                  Supervisa la huella de memoria física, la caché de streaming y archivos de alta resolución.
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[#bacbbe]">
              NVMe SSD / SpotiStore Encrypted
            </span>
          </div>

          {/* 4 Metric Cards from Mockup 12 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Assigned */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#bacbbe]">
                ESPACIO ASIGNADO SPOTIPLAYER
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#00e599]">
                14.8 <span className="text-xs font-normal text-white">GB</span>
              </div>
              <div className="text-[10px] text-[#00e599]">342 temas FLAC descargados</div>
            </div>

            {/* Card 2: Volatile */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#bacbbe]">
                CACHÉ VOLÁTIL DE TRANSMISIÓN
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#4cd7f6]">
                {(cacheSizeMb / 1024).toFixed(1)} <span className="text-xs font-normal text-white">GB</span>
              </div>
              <div className="text-[10px] text-[#bacbbe]">Portadas e índices temporales</div>
            </div>

            {/* Card 3: Free */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#bacbbe]">
                ESPACIO LIBRE EN UNIDAD
              </div>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                238.0 <span className="text-xs font-normal text-[#bacbbe]">GB</span>
              </div>
              <div className="text-[10px] text-[#bacbbe]/70">De 256 GB totales del disco</div>
            </div>

            {/* Card 4: Offline Status */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#bacbbe]">
                ESTADO DE MODO FUERA DE LÍNEA
              </div>
              <div className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 pt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e599]" />
                Listo para Viajes
              </div>
              <div className="text-[10px] text-[#00e599]">Cero conexión requerida</div>
            </div>
          </div>

          {/* Storage Segmented Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex">
              <div style={{ width: '5.8%' }} className="h-full bg-[#00e599]" title="Canciones Guardadas" />
              <div style={{ width: '1.2%' }} className="h-full bg-[#4cd7f6]" title="Caché de Sistema" />
              <div style={{ width: '93%' }} className="h-full bg-white/15" title="Otros Archivos / SO" />
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-[#bacbbe]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-white">
                  <span className="w-2 h-2 rounded-full bg-[#00e599]" />
                  Canciones Guardadas (14.8 GB)
                </span>
                <span className="flex items-center gap-1.5 text-[#4cd7f6]">
                  <span className="w-2 h-2 rounded-full bg-[#4cd7f6]" />
                  Caché de Sistema ({(cacheSizeMb / 1024).toFixed(1)} GB)
                </span>
                <span className="hidden sm:flex items-center gap-1.5 text-[#bacbbe]/70">
                  <span className="w-2 h-2 rounded-full bg-white/20" />
                  Otros Archivos / SO (238 GB)
                </span>
              </div>

              <span className="font-mono text-xs">18.0 GB / 256.0 GB (7.0%)</span>
            </div>
          </div>

          {/* Actions & Folder Path */}
          <div className="pt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#bacbbe] bg-white/[0.03] px-3.5 py-2 rounded-xl border border-white/5 truncate max-w-xl">
              <FolderOpen className="w-4 h-4 text-[#4cd7f6] shrink-0" />
              <span className="truncate">/Users/audio_studio/Library/Application Support/SpotiPlayer/FLAC_Masters/</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleClearCache}
                disabled={isClearingCache}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-white hover:text-red-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearingCache ? 'Limpiando...' : 'Limpiar Memoria Caché'}</span>
              </button>

              <button
                onClick={() => alert('Selector de directorio de almacenamiento abierto.')}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-[#00e599]" />
                <span>Gestionar Carpeta de Descargas</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Radical Transparency & Community Public Ledger (Pantalla 12) */}
      {(activeTab === 'transparency' || activeTab === 'privacy') && (
        <section className="space-y-6">
          {/* Main Manifesto Banner from Mockup 12 */}
          <div className="glass-panel-elevated rounded-3xl p-7 border border-[#f5a623]/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#f5a623]/20 border border-[#f5a623]/30 text-[10px] font-extrabold text-[#f5a623] uppercase tracking-wider">
                  MANIFIESTO DE CÓDIGO ABIERTO & ÉTICA
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e599]" />
                  Cero Algoritmos Ocultos
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Transparencia Radical del Proyecto Libre & Sin Anuncios
              </h2>

              <p className="text-xs sm:text-sm text-[#bacbbe] leading-relaxed">
                En SpotiPlayer no existen accionistas silenciosos ni venta de tus telemetrías. Nuestra infraestructura
                sobrevive gracias al patrocinio colectivo de audiófilos y distribuidores independientes. Aquí puedes auditar
                en tiempo real el destino exacto de cada centavo.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                onClick={toggleDonateModal}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#fbbf24] via-[#f5a623] to-[#f59e0b] hover:from-[#f5a623] hover:to-[#d97706] text-[#070B0E] font-extrabold text-xs shadow-[0_0_25px_rgba(245,166,35,0.45)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 fill-[#070B0E]" />
                <span>Gestionar mi Aporte Voluntario / Donar</span>
              </button>

              <span className="text-[10px] text-[#bacbbe]/80 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#00e599]" />
                Aportes 100% deducibles y sin comisiones intermedias
              </span>
            </div>
          </div>

          {/* 2-Column Split: Left = Community Goal Circle Gauge, Right = 100% Funds Breakdown (Pantalla 12) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Meta Comunitaria del Servidor (4 cols) */}
            <div className="lg:col-span-4 glass-panel-elevated rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#bacbbe]">
                    SOSTENIBILIDAD MENSUAL
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-[#00e599]">
                    Octubre 2024
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white">Meta Comunitaria del Servidor</h3>
                <p className="text-xs text-[#bacbbe] leading-relaxed">
                  Para costear ancho de banda de alta velocidad de 40 Gbps y retribución justa de artistas.
                </p>
              </div>

              {/* Circular Gauge Meter */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="9"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#00e599"
                      strokeWidth="9"
                      strokeDasharray={`${84.5 * 2.51} 251`}
                      strokeLinecap="round"
                      fill="transparent"
                      className="drop-shadow-[0_0_12px_rgba(0,229,153,0.6)]"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold font-mono text-white">84.5%</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00e599]">
                      FINANCIADO
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-[#bacbbe]">Recaudado:</span>
                  <span className="font-mono font-bold text-[#00e599]">$8,450 USD</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#bacbbe]">Meta mensual mínima:</span>
                  <span className="font-mono font-bold text-white">$10,000 USD</span>
                </div>
                <p className="text-[10px] text-[#f5a623] pt-1">
                  Faltan $1,550 USD para asegurar el próximo ciclo sin recurrir a reservas.
                </p>
              </div>
            </div>

            {/* Right Card: Desglose del 100% de los Fondos (8 cols) */}
            <div className="lg:col-span-8 glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Desglose del 100% de los Fondos</h3>
                  <p className="text-xs text-[#bacbbe]">
                    Distribución algorítmica verificable en la red de auditoría abierta.
                  </p>
                </div>
                <a
                  href="#audit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownloadCsv();
                  }}
                  className="text-xs font-bold text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver Libro Contable Público</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 3 Fund Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 70% Artistas */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-[#00e599]/15 flex items-center justify-center text-[#00e599]">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-extrabold font-mono text-[#00e599]">70%</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Artistas & Regalías Justas</h4>
                    <p className="text-[11px] text-[#bacbbe] leading-snug mt-1">
                      Liquidación directa a creadores independientes por reproducción efectiva. Más de 4x la media de la
                      industria comercial.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[10px] text-[#bacbbe] flex justify-between font-mono">
                    <span>Proyectado este mes:</span>
                    <span className="text-white font-bold">$5,915.00</span>
                  </div>
                </div>

                {/* 20% Infraestructura */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-[#4cd7f6]/15 flex items-center justify-center text-[#4cd7f6]">
                      <Server className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-extrabold font-mono text-[#4cd7f6]">20%</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Infraestructura Hi-Res</h4>
                    <p className="text-[11px] text-[#bacbbe] leading-snug mt-1">
                      Nodos de transmisión Edge FLAC, servidores de caché descentralizados y ancho de banda global sin
                      latencia perceptible.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[10px] text-[#bacbbe] flex justify-between font-mono">
                    <span>Proyectado este mes:</span>
                    <span className="text-white font-bold">$1,690.00</span>
                  </div>
                </div>

                {/* 10% Desarrollo Libre */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-[#f5a623]/15 flex items-center justify-center text-[#f5a623]">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-extrabold font-mono text-[#f5a623]">10%</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Desarrollo Libre</h4>
                    <p className="text-[11px] text-[#bacbbe] leading-snug mt-1">
                      Mantenimiento de bibliotecas abiertas en GitHub, auditorías de seguridad criptográfica y optimización
                      de códecs libres.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[10px] text-[#bacbbe] flex justify-between font-mono">
                    <span>Proyectado este mes:</span>
                    <span className="text-white font-bold">$845.00</span>
                  </div>
                </div>
              </div>

              {/* Notarized Transactions Bottom Strip */}
              <div className="p-4 rounded-2xl bg-[#070B0E]/60 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#00e599]">
                    <Database className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Transacciones Notariadas Recientes</h4>
                    <p className="text-[10px] text-[#bacbbe]">
                      Último corte contable firmado el 24 de Octubre, 2024 (Hash: 0x9b7...e41)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-[#00e599]">+12.4% vs Sept</span>
                  <button
                    onClick={handleDownloadCsv}
                    className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Descargar CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mecenas Protectores del Mes Strip (Pantalla 12) */}
          <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#f5a623]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Mecenas Protectores del Mes
                </h3>
              </div>
              <span className="text-xs text-[#bacbbe]">2,410 aportantes libres y anónimos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f5a623]/20 text-[#f5a623] font-bold text-xs flex items-center justify-center shrink-0">
                  AL
                </div>
                <div>
                  <div className="text-xs font-bold text-white">AudioLab Studio BCN</div>
                  <div className="text-[10px] text-[#00e599]">Pilar Maestro • 12 meses</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#00e599]/20 text-[#00e599] font-bold text-xs flex items-center justify-center shrink-0">
                  MR
                </div>
                <div>
                  <div className="text-xs font-bold text-white">M. Rodriguez (DAC Direct)</div>
                  <div className="text-[10px] text-[#4cd7f6]">Guardián Hi-Fi • 8 meses</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#4cd7f6]/20 text-[#4cd7f6] font-bold text-xs flex items-center justify-center shrink-0">
                  ST
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Synthwave Collective</div>
                  <div className="text-[10px] text-[#f5a623]">Nodo Semilla • 5 meses</div>
                </div>
              </div>

              <div
                onClick={toggleDonateModal}
                className="p-3.5 rounded-2xl bg-[#f5a623]/10 border border-[#f5a623]/30 hover:bg-[#f5a623]/20 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[#f5a623]">+ Tu Nombre Aquí</div>
                  <div className="text-[10px] text-[#bacbbe]">Súmate desde $2 USD/mes</div>
                </div>
                <Sparkles className="w-4 h-4 text-[#f5a623]" />
              </div>
            </div>
          </div>

          {/* Privacy & Credentials (Pantalla 12) */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00e599]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Privacidad Soberana & Credenciales
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e599]/15 text-[#00e599] font-mono">
                CERO TELEMETRÍA PUBLICITARIA
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-white">Historial de Escucha Local</h4>
                <p className="text-[11px] text-[#bacbbe]">
                  Tu historial de reproducción reside únicamente cifrado en tu dispositivo. Puedes depurar los registros
                  de escucha o exportarlos en formato JSON libre.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => alert('Historial exportado como JSON cifrado.')}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white transition-all cursor-pointer"
                  >
                    Exportar Historial (.JSON)
                  </button>
                  <button
                    onClick={() => alert('Historial de escucha local eliminado.')}
                    className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs transition-all cursor-pointer"
                  >
                    Borrar Historial
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-white">Llave PGP de Mecenas / Cuenta</h4>
                <p className="text-[11px] text-[#bacbbe]">
                  Identificador criptográfico anónimo para conservar tus listas de reproducción sin necesidad de correo
                  electrónico personal.
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-black/40 px-3 py-2 rounded-xl border border-white/10 text-[#00e599] flex-1 truncate">
                    {pgpKey}
                  </span>
                  <button
                    onClick={handleCopyKey}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                    title="Copiar llave"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-[#00e599]" /> : <Copy className="w-4 h-4 text-[#bacbbe]" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Audio & Streaming Settings (When Audio tab is selected) */}
      {activeTab === 'audio' && (
        <section className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Motor de Procesamiento & Tasa de Muestreo</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00e599]/15 text-[#00e599] font-mono">
                  MASTER HD ACTIVO
                </span>
              </h3>
              <p className="text-xs text-[#bacbbe]">
                Configura el comportamiento del decodificador FLAC y el acoplamiento con periféricos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wi-Fi Streaming Quality */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Wifi className="w-4 h-4 text-[#00e599]" />
                <span>Streaming bajo Red Wi-Fi</span>
              </div>
              <p className="text-[11px] text-[#bacbbe]">
                Resolución acústica prioritaria en redes domésticas o fijas.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setWifiQuality('flac')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    wifiQuality === 'flac'
                      ? 'bg-[#00e599]/15 border-[#00e599]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Master FLAC</span>
                    {wifiQuality === 'flac' && <Check className="w-3.5 h-3.5 text-[#00e599]" />}
                  </div>
                  <div className="text-[10px] text-[#4cd7f6] font-mono mt-0.5">96 kHz / 24-bit Lossless</div>
                  <div className="text-[9px] text-[#bacbbe] mt-1">Flujo transparente puro sin compresión.</div>
                </button>

                <button
                  onClick={() => setWifiQuality('high')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    wifiQuality === 'high'
                      ? 'bg-[#00e599]/15 border-[#00e599]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Alta Calidad</span>
                    {wifiQuality === 'high' && <Check className="w-3.5 h-3.5 text-[#00e599]" />}
                  </div>
                  <div className="text-[10px] text-[#bacbbe] font-mono mt-0.5">320 kbps Opus/AAC</div>
                  <div className="text-[9px] text-[#bacbbe] mt-1">Menor consumo y carga ultrarrápida.</div>
                </button>
              </div>
            </div>

            {/* Mobile Data Quality */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Smartphone className="w-4 h-4 text-[#4cd7f6]" />
                <span>Streaming en Datos Móviles</span>
              </div>
              <p className="text-[11px] text-[#bacbbe]">
                Gestiona el ahorro de megabytes en conexiones móviles.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCellularQuality('balanced')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    cellularQuality === 'balanced'
                      ? 'bg-[#00e599]/15 border-[#00e599]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Equilibrado</span>
                    {cellularQuality === 'balanced' && <Check className="w-3.5 h-3.5 text-[#00e599]" />}
                  </div>
                  <div className="text-[10px] text-[#4cd7f6] font-mono mt-0.5">192 kbps VBR</div>
                  <div className="text-[9px] text-[#bacbbe] mt-1">Ideal para desplazamientos.</div>
                </button>

                <button
                  onClick={() => setCellularQuality('extreme')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    cellularQuality === 'extreme'
                      ? 'bg-[#00e599]/15 border-[#00e599]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Ahorro Extremo</span>
                    {cellularQuality === 'extreme' && <Check className="w-3.5 h-3.5 text-[#00e599]" />}
                  </div>
                  <div className="text-[10px] text-[#bacbbe] font-mono mt-0.5">96 kbps HE-AAC</div>
                  <div className="text-[9px] text-[#bacbbe] mt-1">Optimizado para planes con cuota.</div>
                </button>
              </div>
            </div>
          </div>

          {/* Bit-Perfect and EBU Normalization Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#00e599]" />
                  <h4 className="text-xs font-bold text-white">Modo Bit-Perfect para DAC Externo</h4>
                </div>
                <button
                  onClick={() => setBitPerfect(!bitPerfect)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 shrink-0 ${
                    bitPerfect ? 'bg-[#00e599]' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[#070B0E] transition-transform ${
                      bitPerfect ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-[#bacbbe] leading-relaxed">
                Omite el mezclador del kernel de audio del sistema operativo (WASAPI Exclusivo / CoreAudio Direct).
                Ofrece transferencia directa de muestras a hardware de conversión sin remuestreo.
              </p>
              <div className="text-[10px] text-[#00e599] font-mono">
                ● Dispositivo detectado: Topping E30 II (PCM 96k / DSD)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#4cd7f6]" />
                  <h4 className="text-xs font-bold text-white">Normalización EBU R128</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#4cd7f6]/15 text-[#4cd7f6] text-[10px] font-mono">
                  -14 LUFS
                </span>
              </div>
              <p className="text-[11px] text-[#bacbbe] leading-relaxed">
                Iguala el nivel perceptible entre pistas consecutivas de diferentes épocas y géneros. Desactiva esta opción
                para disfrutar del rango dinámico virgen del máster de estudio.
              </p>
              <div className="text-[10px] text-[#bacbbe] font-medium">
                Perfil objetivo: <span className="text-white">Estudio Audiófilo (Sin compresión limitadora)</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
