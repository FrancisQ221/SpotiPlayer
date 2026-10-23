import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Headphones,
  Disc3,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export interface LoginScreenProps {
  onNavigateToRegister?: () => void;
  onGuestAccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onGuestAccess,
}) => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, continueAsGuest, isLoading, error, errorMessage, clearError } =
    useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formValidation, setFormValidation] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidation(null);
    clearError();

    if (!email.trim()) {
      setFormValidation('Por favor, introduce tu correo electrónico.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setFormValidation('El formato del correo electrónico no es válido.');
      return;
    }

    if (!password) {
      setFormValidation('Por favor, introduce tu contraseña.');
      return;
    }

    if (password.length < 6) {
      setFormValidation('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const success = await signIn(email, password);
    if (success) {
      navigate('/home');
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    if (onGuestAccess) {
      onGuestAccess();
    }
    navigate('/home');
  };

  const handleRegisterClick = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister();
    } else {
      navigate('/register');
    }
  };


  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0e141a] text-[#dde3ec] px-4 py-8 overflow-hidden select-none">
      {/* Background Ambient Lighting & Neon Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00e599]/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#f5a623]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-[#06b6d4]/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Glass Card (Pantalla 01) */}
      <div className="relative z-10 w-full max-w-md glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00e599]/25 via-[#00e599]/10 to-transparent border border-[#00e599]/40 shadow-[0_0_30px_rgba(0,229,153,0.3)]">
            <Headphones className="w-8 h-8 text-[#00e599]" />
            <Disc3 className="w-4 h-4 text-[#6dffba] absolute -top-1 -right-1 animate-spin duration-[6000ms]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
              SpotiPlayer
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00e599]/15 text-[#00e599] border border-[#00e599]/30 tracking-wider uppercase">
                Studio
              </span>
            </h1>
            <p className="text-xs text-[#bacbbe]">
              Audio máster en alta resolución y mecenazgo ético
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {(errorMessage || error || formValidation) && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{formValidation || error || errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-[#849589] transition-all focus:border-[#00e599] focus:bg-white/[0.07] focus:shadow-[0_0_16px_rgba(0,229,153,0.25)] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#bacbbe] tracking-wide">
                Contraseña
              </label>
              <span className="text-[11px] text-[#00e599] hover:underline cursor-pointer">
                ¿Olvidaste tu contraseña?
              </span>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-[#849589] pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formValidation) setFormValidation(null);
                }}
                placeholder="••••••••"
                disabled={isLoading}
                required
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-[#849589] transition-all focus:border-[#00e599] focus:bg-white/[0.07] focus:shadow-[0_0_16px_rgba(0,229,153,0.25)] focus:outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 text-[#849589] hover:text-[#dde3ec] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Submit Button (Emerald Neón #00e599) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-[#003822] bg-[#00e599] hover:bg-[#6dffba] active:scale-[0.98] shadow-[0_0_24px_rgba(0,229,153,0.4)] hover:shadow-[0_0_32px_rgba(0,229,153,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#003822]" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-4 h-4 text-[#003822]" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative px-3 bg-[#131b22] text-[11px] font-medium text-[#849589] uppercase tracking-wider">
            O continúa con
          </span>
        </div>

        {/* Secondary: Google OAuth Button */}
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-50"
        >
          {/* Google SVG Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continuar con Google</span>
        </button>

        {/* Tertiary: Guest Access (Modo Estándar Libre) */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleGuest}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs text-[#bacbbe] hover:text-[#00e599] transition-colors py-1 px-3 rounded-lg hover:bg-white/5 cursor-pointer font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00e599]" />
            <span>Entrar como invitado (Modo Libre)</span>
          </button>
        </div>

        {/* Navigation to Register */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-[#849589]">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={handleRegisterClick}
              className="text-[#00e599] hover:text-[#6dffba] font-bold hover:underline cursor-pointer ml-1"
            >
              Regístrate aquí
            </button>
          </p>
        </div>

        {/* Privacy & Anti-ad badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#849589]">
          <ShieldCheck className="w-3 h-3 text-[#00e599]" />
          <span>Sin publicidad, sin rastreo comercial. 100% audio libre.</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
