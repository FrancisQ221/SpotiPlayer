import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Headphones,
  Disc3,
  ArrowRight,
  AlertCircle,
  Loader2,
  HeartHandshake,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
  onGuestAccess?: () => void;
}

export type PatronTier = 'free' | 'supporter' | 'audiophile';

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onGuestAccess,
}) => {
  const navigate = useNavigate();
  const { signUp, continueAsGuest, isLoading, error, errorMessage, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [patronTier, setPatronTier] = useState<PatronTier>('free');
  const [formValidation, setFormValidation] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidation(null);
    clearError();

    if (!username.trim()) {
      setFormValidation('Por favor, indica tu nombre de usuario o alias artístico.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setFormValidation('Por favor, introduce un correo electrónico válido.');
      return;
    }

    if (!password || password.length < 6) {
      setFormValidation('La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setFormValidation('Las contraseñas no coinciden.');
      return;
    }

    const success = await signUp(email, password, username);
    if (success) {
      navigate('/home');
    }
  };

  const handleLoginClick = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      navigate('/login');
    }
  };

  const handleGuestClick = () => {
    continueAsGuest();
    if (onGuestAccess) {
      onGuestAccess();
    }
    navigate('/home');
  };


  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0e141a] text-[#dde3ec] px-4 py-8 overflow-y-auto select-none">
      {/* Background Ambient Lighting & Neon Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#00e599]/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#f5a623]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[#06b6d4]/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Main Glass Card (Pantalla 02) */}
      <div className="relative z-10 w-full max-w-lg glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl my-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00e599]/25 via-[#f5a623]/15 to-transparent border border-[#00e599]/40 shadow-[0_0_24px_rgba(0,229,153,0.25)]">
            <Headphones className="w-7 h-7 text-[#00e599]" />
            <Sparkles className="w-4 h-4 text-[#f5a623] absolute -top-1 -right-1" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Crea tu Cuenta SpotiPlayer
            </h1>
            <p className="text-xs text-[#bacbbe] mt-1">
              Únete a la comunidad de audio libre de compresión y con mecenazgo transparente.
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {(errorMessage || error || formValidation) && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{formValidation || error || errorMessage}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#bacbbe] tracking-wide">
              Nombre de Usuario o Alias
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-[#849589] pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (formValidation) setFormValidation(null);
                }}
                placeholder="ej. ValeriaVox o AudiophileExplorer"
                disabled={isLoading}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-[#849589] transition-all focus:border-[#00e599] focus:bg-white/[0.07] focus:shadow-[0_0_16px_rgba(0,229,153,0.25)] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#bacbbe] tracking-wide">
              Correo Electrónico
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-[#849589] pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formValidation) setFormValidation(null);
                }}
                placeholder="tu@correo.com"
                disabled={isLoading}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-[#849589] transition-all focus:border-[#00e599] focus:bg-white/[0.07] focus:shadow-[0_0_16px_rgba(0,229,153,0.25)] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password & Confirm Inputs in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#bacbbe] tracking-wide">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#849589] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formValidation) setFormValidation(null);
                  }}
                  placeholder="Mín. 6 caracteres"
                  disabled={isLoading}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-[#849589] transition-all focus:border-[#00e599] focus:bg-white/[0.07] focus:shadow-[0_0_16px_rgba(0,229,153,0.25)] focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 text-[#849589] hover:text-[#dde3ec] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#bacbbe] tracking-wide">
                Confirmar Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#849589] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formValidation) setFormValidation(null);
                  }}
                  placeholder="Repite contraseña"
                  disabled={isLoading}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-[#849589] transition-all focus:border-[#00e599] focus:bg-white/[0.07] focus:shadow-[0_0_16px_rgba(0,229,153,0.25)] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Voluntary Community Patronage Selector (Ámbar #f5a623) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-[#f5a623]" />
                <span>Apoyo Voluntario a la Comunidad (Mecenazgo)</span>
              </label>
              <span className="text-[10px] font-bold text-[#f5a623] px-2 py-0.5 rounded-full bg-[#f5a623]/15 border border-[#f5a623]/30">
                100% Opcional
              </span>
            </div>

            <p className="text-[11px] text-[#bacbbe]">
              En SpotiPlayer no vendemos datos ni insertamos anuncios intrusivos. Elige tu modo de participación:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Option 1: Free */}
              <button
                type="button"
                onClick={() => setPatronTier('free')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  patronTier === 'free'
                    ? 'bg-[#00e599]/10 border-[#00e599] shadow-[0_0_14px_rgba(0,229,153,0.2)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {patronTier === 'free' && (
                  <Check className="w-3.5 h-3.5 text-[#00e599] absolute top-2 right-2" />
                )}
                <div>
                  <div className="text-xs font-bold text-white">Oyente Libre</div>
                  <div className="text-[10px] text-[#00e599] font-bold mt-0.5">$0 / Siempre</div>
                </div>
                <div className="text-[10px] text-[#849589] mt-2 leading-tight">
                  Audio máster completo, sin costo alguno.
                </div>
              </button>

              {/* Option 2: Supporter ($3) */}
              <button
                type="button"
                onClick={() => setPatronTier('supporter')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  patronTier === 'supporter'
                    ? 'bg-[#f5a623]/15 border-[#f5a623] shadow-[0_0_16px_rgba(245,166,35,0.25)]'
                    : 'bg-white/5 border-white/10 hover:border-[#f5a623]/40'
                }`}
              >
                {patronTier === 'supporter' && (
                  <Check className="w-3.5 h-3.5 text-[#f5a623] absolute top-2 right-2" />
                )}
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Mecenas</span>
                    <span className="text-[9px] px-1 rounded bg-[#f5a623]/20 text-[#f5a623] font-extrabold">Semilla</span>
                  </div>
                  <div className="text-[10px] text-[#f5a623] font-bold mt-0.5">$3 / mes</div>
                </div>
                <div className="text-[10px] text-[#bacbbe] mt-2 leading-tight">
                  Apoyo directo a servidores y creadores.
                </div>
              </button>

              {/* Option 3: Audiophile ($7) */}
              <button
                type="button"
                onClick={() => setPatronTier('audiophile')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  patronTier === 'audiophile'
                    ? 'bg-[#f5a623]/20 border-[#f5a623] shadow-[0_0_20px_rgba(245,166,35,0.35)]'
                    : 'bg-white/5 border-white/10 hover:border-[#f5a623]/40'
                }`}
              >
                {patronTier === 'audiophile' && (
                  <Check className="w-3.5 h-3.5 text-[#f5a623] absolute top-2 right-2" />
                )}
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Audiófilo</span>
                    <Sparkles className="w-2.5 h-2.5 text-[#fbbf24]" />
                  </div>
                  <div className="text-[10px] text-[#fbbf24] font-bold mt-0.5">$7 / mes</div>
                </div>
                <div className="text-[10px] text-[#bacbbe] mt-2 leading-tight">
                  Insignia dorada y acceso preferente a DSD.
                </div>
              </button>
            </div>
          </div>

          {/* Primary Submit Button: Emerald Neón #00e599 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-4 rounded-xl font-bold text-sm text-[#003822] bg-[#00e599] hover:bg-[#6dffba] active:scale-[0.98] shadow-[0_0_24px_rgba(0,229,153,0.4)] hover:shadow-[0_0_32px_rgba(0,229,153,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#003822]" />
                <span>Generando cuenta y credenciales...</span>
              </>
            ) : (
              <>
                <span>Crear Cuenta Gratuita</span>
                <ArrowRight className="w-4 h-4 text-[#003822]" />
              </>
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-[#849589]">
            ¿Ya tienes una cuenta registrada?{' '}
            <button
              type="button"
              onClick={handleLoginClick}
              className="text-[#00e599] hover:text-[#6dffba] font-bold hover:underline cursor-pointer ml-1"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>

        {/* Guest Mode Direct Shortcut */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleGuestClick}
            className="text-[11px] text-[#849589] hover:text-[#00e599] transition-colors cursor-pointer"
          >
            O explorar sin registro en Modo Libre
          </button>
        </div>

        {/* Transparency footer */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-[#849589]">
          <ShieldCheck className="w-3 h-3 text-[#00e599]" />
          <span>Tus credenciales se cifran con estándar SHA-256 en Supabase.</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
