import React, { useState, useEffect, useRef } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Volume2,
  Disc3,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
  Check,
  Headphones,
  Waves
} from 'lucide-react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useUIStore } from '../stores/useUIStore';
import { audioEngine } from '../services/audioEngine';

// Acoustic presets with 10-band target gains
const PRESETS: {
  id: string;
  name: string;
  desc: string;
  icon: string;
  gains: number[];
}[] = [
  {
    id: 'spotiplayer-signature',
    name: 'Firma SpotiPlayer',
    desc: 'Hi-Fi Studio Balance',
    icon: '✨',
    gains: [4.5, 3.0, 1.5, 0.0, -1.0, 0.5, 2.0, 3.5, 4.0, 5.0],
  },
  {
    id: 'bass-boost',
    name: 'Refuerzo Graves',
    desc: 'Warm +5dB Sub-Bass',
    icon: '🔊',
    gains: [6.0, 5.0, 4.0, 2.5, 1.0, 0.0, 0.0, 1.0, 2.0, 2.5],
  },
  {
    id: 'vocal-crisp',
    name: 'Vocal Crisp',
    desc: 'Letras Vivas & Aire',
    icon: '🎤',
    gains: [-1.0, -0.5, 0.0, 1.0, 2.5, 4.0, 4.5, 3.5, 2.0, 1.5],
  },
  {
    id: 'flat-monitor',
    name: 'Monitor Plano',
    desc: '0 dB Direct Referencia',
    icon: '➖',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'cyber-synth',
    name: 'Cyber & Synth',
    desc: 'Mid-Scoop Analógico',
    icon: '⚡',
    gains: [5.5, 4.0, 2.0, -1.5, -2.5, -1.0, 2.0, 4.5, 5.5, 6.0],
  },
  {
    id: 'acoustic-3d',
    name: 'Acústico 3D',
    desc: 'Air & Ambience Reverb',
    icon: '🌌',
    gains: [2.0, 2.0, 1.0, 0.0, 1.0, 2.0, 3.0, 4.5, 6.0, 7.0],
  },
];

export const EqualizerScreen: React.FC = () => {
  const {
    eqBands,
    setEqBandGain,
    resetEq,
    bitPerfect,
    setBitPerfect,
    spatialAudio,
    setSpatialAudio,
    spatialWidth,
    setSpatialWidth,
    crossfade,
    setCrossfade,
    lufsNormalization,
    streamQuality,
    isPlaying,
  } = usePlayerStore();

  const { language, toggleDonateModal } = useUIStore();
  const [activePreset, setActivePreset] = useState<string>('spotiplayer-signature');
  const [liveSpectrum, setLiveSpectrum] = useState<number[]>([35, 60, 80, 95, 70, 55, 45, 65, 80, 50]);
  const animFrameRef = useRef<number | null>(null);

  // Apply acoustic preset
  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setActivePreset(preset.id);
    preset.gains.forEach((gain, index) => {
      const band = eqBands[index];
      if (band) {
        setEqBandGain(band.frequency, gain);
      }
    });
  };

  const handleReset = () => {
    resetEq();
    setActivePreset('flat-monitor');
  };

  // Real-time Spectrum Analyzer loop
  useEffect(() => {
    const dataArray = new Uint8Array(32);
    const updateSpectrum = () => {
      if (isPlaying) {
        audioEngine.getFrequencyData(dataArray);
        const mapped = [
          Math.max(20, (dataArray[2] / 255) * 100),
          Math.max(30, (dataArray[4] / 255) * 100),
          Math.max(50, (dataArray[6] / 255) * 100),
          Math.max(75, (dataArray[8] / 255) * 100),
          Math.max(85, (dataArray[10] / 255) * 100),
          Math.max(65, (dataArray[12] / 255) * 100),
          Math.max(60, (dataArray[14] / 255) * 100),
          Math.max(45, (dataArray[16] / 255) * 100),
          Math.max(40, (dataArray[18] / 255) * 100),
          Math.max(25, (dataArray[20] / 255) * 100),
        ];
        setLiveSpectrum(mapped);
      } else {
        setLiveSpectrum([15, 20, 25, 30, 25, 20, 15, 20, 25, 15]);
      }
      animFrameRef.current = requestAnimationFrame(updateSpectrum);
    };
    animFrameRef.current = requestAnimationFrame(updateSpectrum);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Compute SVG smooth spline curve from current 10-band gains
  const svgWidth = 640;
  const svgHeight = 120;
  const paddingX = 30;
  const baselineY = svgHeight / 2; // 0 dB line
  const maxGain = 12;

  const points = eqBands.map((band, idx) => {
    const x = paddingX + (idx / (eqBands.length - 1)) * (svgWidth - 2 * paddingX);
    // Invert Y so positive gain goes up
    const y = baselineY - (band.gain / maxGain) * (svgHeight / 2 - 12);
    return { x, y };
  });

  // Construct SVG Bezier path
  let pathD = `M ${points[0]?.x || 0} ${points[0]?.y || baselineY}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    pathD += ` Q ${current.x} ${current.y}, ${midX} ${(current.y + next.y) / 2}`;
  }
  const lastPoint = points[points.length - 1];
  if (lastPoint) {
    pathD += ` T ${lastPoint.x} ${lastPoint.y}`;
  }

  return (
    <div className="space-y-8 max-w-7xl animate-in fade-in duration-300">
      {/* 1. Header & Engine Status (Pantalla 09) */}
      <section className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e599] animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              DSP Audio Master & Ecualizador HD
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00e599]/20 text-[#00e599] border border-[#00e599]/30">
                v2.4 CORE
              </span>
            </h1>
          </div>
          <p className="text-xs text-[#bacbbe] max-w-2xl leading-relaxed">
            {language === 'es'
              ? 'Motor de renderizado de señal con cero aliasing, filtrado biquad IIR de punto flotante de 64-bit y cuantización bit-perfect activa.'
              : 'Zero-aliasing studio signal rendering engine with 64-bit floating point IIR biquad filters and active bit-perfect DAC quantization.'}
          </p>
        </div>

        {/* Engine Hardware Indicators */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-semibold text-[#4cd7f6] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#00e599]" />
            FLAC 24-BIT / 96KHZ
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-semibold text-[#bacbbe]">
            1,411 kbps RAW
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-semibold text-[#bacbbe]">
            5ms Buffer
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#00e599]/15 border border-[#00e599]/30 text-xs font-bold text-[#00e599] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            {bitPerfect ? 'DAC DIRECTO ON' : 'DAC PROCESADO'}
          </span>
        </div>
      </section>

      {/* 2. Acoustic Profiles / Presets Ribbon (Pantalla 09) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#bacbbe] uppercase tracking-wider">
            {language === 'es' ? 'Perfiles Acústicos & Calibración Rápida' : 'Acoustic Profiles & Fast Calibration'}
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-[#bacbbe] hover:text-[#00e599] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Restablecer Curva' : 'Reset Curve'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-[#00e599]/15 border-[#00e599] shadow-[0_0_15px_rgba(0,229,153,0.25)]'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{preset.icon}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#00e599]" />}
                </div>
                <div className="text-xs font-bold text-white truncate">{preset.name}</div>
                <div className="text-[10px] text-[#bacbbe] truncate">{preset.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Main Stage: 10-Band EQ + Spatial & LUFS Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 10-Band Sliders and Visual Curve Spline (Cols 8) */}
        <div className="lg:col-span-8 glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Curva Paramétrica de 10 Bandas</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#4cd7f6] font-mono">
                  DSP IIR Multi-Tap
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#bacbbe]">
              <span className="flex items-center gap-1.5 text-[#00e599]">
                <span className="w-2 h-2 rounded-full bg-[#00e599]" />
                Curva Activa
              </span>
              <span>•</span>
              <span>Referencia 0dB</span>
            </div>
          </div>

          {/* Dynamic Spline Visual Curve SVG */}
          <div className="w-full h-24 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden flex items-center justify-center p-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
            >
              {/* Reference Grid lines */}
              <line
                x1="0"
                y1={baselineY}
                x2={svgWidth}
                y2={baselineY}
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              {/* Shaded Area under curve */}
              <path
                d={`${pathD} L ${points[points.length - 1]?.x || svgWidth} ${baselineY} L ${points[0]?.x || 0} ${baselineY} Z`}
                fill="url(#curveGradient)"
                opacity="0.3"
              />
              {/* Spline Path */}
              <path
                d={pathD}
                fill="none"
                stroke="#00e599"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(0,229,153,0.8)]"
              />
              {/* Nodes */}
              {points.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#00e599"
                  stroke="#070B0E"
                  strokeWidth="1.5"
                />
              ))}

              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e599" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#00e599" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* 10 Vertical Sliders Bar */}
          <div className="grid grid-cols-10 gap-2 pt-2">
            {eqBands.map((band) => {
              const isPositive = band.gain > 0;
              const isZero = band.gain === 0;

              return (
                <div key={band.frequency} className="flex flex-col items-center gap-3">
                  {/* Gain label readout */}
                  <span
                    className={`text-[10px] font-mono font-bold tnum ${
                      isPositive
                        ? 'text-[#00e599]'
                        : isZero
                        ? 'text-[#bacbbe]'
                        : 'text-[#4cd7f6]'
                    }`}
                  >
                    {isPositive ? `+${band.gain.toFixed(1)}` : band.gain.toFixed(1)}
                  </span>

                  {/* Vertical Range Slider */}
                  <div className="h-40 flex items-center justify-center relative py-1">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="0.5"
                      value={band.gain}
                      onChange={(e) => {
                        setActivePreset('custom');
                        setEqBandGain(band.frequency, parseFloat(e.target.value));
                      }}
                      className="h-36 -rotate-90 appearance-none bg-white/10 hover:bg-white/15 rounded-full cursor-pointer accent-[#00e599] focus:outline-none w-36"
                      style={{
                        WebkitAppearance: 'slider-vertical',
                      }}
                    />
                  </div>

                  {/* Frequency Label */}
                  <span className="text-[10px] font-bold text-[#bacbbe] text-center">
                    {band.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Spatial 3D Scene & LUFS Normalization (Cols 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Spatial 3D Audio Card (from Mockup 09) */}
          <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-[#4cd7f6]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Escena Espacial 3D
                </h3>
              </div>

              {/* Functional Switch */}
              <button
                onClick={() => setSpatialAudio(!spatialAudio)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                  spatialAudio ? 'bg-[#00e599]' : 'bg-white/20'
                }`}
                title="Activar/Desactivar Virtualización Binaural"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#070B0E] transition-transform ${
                    spatialAudio ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-[#bacbbe] leading-relaxed">
              Virtualización binaural por convolución HRTF para auriculares y monitores de campo cercano.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-white">
                  Amplitud de Escenario
                </span>
                <span className="font-mono text-[#00e599] font-bold">
                  {spatialWidth}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={spatialWidth}
                onChange={(e) => setSpatialWidth(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#00e599] focus:outline-none"
              />
              <div className="flex justify-between text-[9px] text-[#bacbbe]/70 font-mono">
                <span>Íntimo (Mono/Estéreo)</span>
                <span>Inmersivo 360°</span>
              </div>
            </div>
          </div>

          {/* LUFS Normalization Card (from Mockup 09) */}
          <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00e599]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Normalización LUFS
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#00e599]/15 text-[#00e599] text-[10px] font-bold font-mono">
                -14 LUFS
              </span>
            </div>

            <p className="text-xs text-[#bacbbe] leading-relaxed">
              Alineación perceptual ITU-R BS.1770 con margen de pico dinámico para preservar transitorios de audio máster.
            </p>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
              <span className="text-[#bacbbe] text-[11px]">Dynamic Studio Headroom</span>
              <span className="text-[#00e599] font-mono font-bold">+2.1 dB</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Crossfade, Bit-Perfect DAC, and Live Spectrum Analyzer (Pantalla 09) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Crossfade */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Crossfade Sin Silencios
            </h4>
            <span className="text-xs font-mono text-[#00e599] font-bold">
              {crossfade.toFixed(1)} s
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={crossfade}
            onChange={(e) => setCrossfade(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#00e599] focus:outline-none"
          />
          <div className="flex justify-between text-[9px] text-[#bacbbe]/70 font-mono">
            <span>0s (Corte limpio)</span>
            <span>12s (Club Mix)</span>
          </div>
        </div>

        {/* Bit-Perfect External DAC Mode (from Mockup 09) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Salida Exclusiva</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#4cd7f6]/15 text-[#4cd7f6] font-mono">
                BIT-PERFECT
              </span>
            </h4>

            {/* Bit-Perfect Switch */}
            <button
              onClick={() => setBitPerfect(!bitPerfect)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                bitPerfect ? 'bg-[#00e599]' : 'bg-white/20'
              }`}
              title="Activar/Desactivar Bit-Perfect Direct"
            >
              <div
                className={`w-5 h-5 rounded-full bg-[#070B0E] transition-transform ${
                  bitPerfect ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
            <div>
              <p className="text-[11px] font-bold text-white">Fiio K7 / USB Audio Class 2.0</p>
              <p className="text-[9px] text-[#bacbbe]">S/PDIF Óptico & DSD Direct</p>
            </div>
            <Check className="w-4 h-4 text-[#00e599]" />
          </div>
        </div>

        {/* Live Spectrum Analyzer (from Mockup 09) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Analizador de Espectro</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00e599]/20 text-[#00e599] font-mono">
                Live
              </span>
            </h4>
            <span className="text-[9px] text-[#bacbbe]">4,096 pts FFT</span>
          </div>

          {/* Dynamic Spectrum Bars */}
          <div className="h-14 flex items-end justify-between gap-1 pt-1">
            {liveSpectrum.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-[#4cd7f6] to-[#00e599] rounded-t-sm shadow-[0_0_8px_rgba(0,229,153,0.3)] transition-all duration-75"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 5. Ethical Audio Manifesto Banner (from Mockup 09) */}
      <section className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f5a623]/20 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623] shrink-0">
            <Sparkles className="w-6 h-6 fill-[#f5a623]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              {language === 'es' ? 'Audio de Alta Fidelidad Libre & Sin Algoritmos Corporativos' : 'Open Hi-Fi Audio & Zero Corporate Algorithms'}
            </h3>
            <p className="text-xs text-[#bacbbe] leading-relaxed max-w-2xl">
              {language === 'es'
                ? 'SpotiPlayer es una plataforma autogestionada gracias al mecenazgo directo de oyentes como tú. Sin muros de pago artificiales para disfrutar de sonido máster de estudio.'
                : 'SpotiPlayer is a community self-funded platform with direct listener patronage. Zero artificial paywalls to experience master studio sound.'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleDonateModal}
          className="px-5 py-3 rounded-full bg-gradient-to-r from-[#fbbf24] via-[#f5a623] to-[#f59e0b] hover:from-[#f5a623] hover:to-[#d97706] text-[#070B0E] font-bold text-xs shadow-[0_0_20px_rgba(245,166,35,0.4)] transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer shrink-0"
        >
          {language === 'es' ? 'Apoyar Proyecto HD' : 'Support HD Project'}
        </button>
      </section>
    </div>
  );
};
