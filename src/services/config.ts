/**
 * SpotiPlayer Platform & Native Environment Detection Service
 * Dynamically identifies runtime target:
 * - Web Browser (`isWeb`)
 * - Windows Desktop via Tauri v2 (`isDesktop`)
 * - Android APK via Capacitor (`isNative`)
 */

export type AppPlatform = 'windows' | 'android' | 'web';

export interface PlatformCapabilities {
  supportsSMTC: boolean;             // Windows System Media Transport Controls
  supportsMediaSession: boolean;     // MediaSession API (Android & Web)
  supportsForegroundService: boolean;// Android Continuous Background Playback
  supportsHaptics: boolean;          // Native vibration / haptics feedback
  supportsOfflineFileSystem: boolean;// Native disk storage caching
}

export interface AppConfig {
  isWeb: boolean;
  isDesktop: boolean;
  isNative: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isIOS: boolean;
  platform: AppPlatform;
  platformLabel: string;
  capabilities: PlatformCapabilities;
  apiBaseUrl: string;
  timeoutMs: number;
  maxRetries: number;
}

// Augment window object for native bridges
declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
    __TAURI__?: unknown;
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
      platform?: string;
    };
  }
}

/**
 * Checks if the runtime is running within Tauri v2 desktop context.
 */
function detectTauriDesktop(): boolean {
  if (typeof window === 'undefined') return false;

  const hasTauriGlobals = Boolean(
    window.__TAURI_INTERNALS__ !== undefined || 
    window.__TAURI__ !== undefined
  );

  return hasTauriGlobals;
}

/**
 * Checks if the runtime is running within Capacitor native mobile context (Android / iOS).
 */
function detectCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;

  const cap = window.Capacitor;
  if (!cap) return false;

  if (typeof cap.isNativePlatform === 'function') {
    return cap.isNativePlatform();
  }

  const platform = typeof cap.getPlatform === 'function' ? cap.getPlatform() : cap.platform;
  return platform === 'android' || platform === 'ios';
}

/**
 * Resolves specific operating system for desktop or mobile.
 */
function detectOperatingSystem(): { isWindows: boolean; isAndroid: boolean; isIOS: boolean } {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isWindows: false, isAndroid: false, isIOS: false };
  }

  const userAgent = navigator.userAgent || '';
  const capPlatform = window.Capacitor?.getPlatform ? window.Capacitor.getPlatform() : '';

  const isAndroid = capPlatform === 'android' || /Android/i.test(userAgent);
  const isIOS = capPlatform === 'ios' || /iPhone|iPad|iPod/i.test(userAgent);
  const isWindows = /Windows|Win32|Win64/i.test(userAgent) || (!isAndroid && !isIOS && detectTauriDesktop());

  return { isWindows, isAndroid, isIOS };
}

// Compute platform flags once at module load
const isDesktopDetected = detectTauriDesktop();
const isNativeDetected = detectCapacitorNative();
const { isWindows, isAndroid, isIOS } = detectOperatingSystem();
const isWebDetected = !isDesktopDetected && !isNativeDetected;

// Primary platform designation
export const isDesktop = isDesktopDetected;
export const isNative = isNativeDetected;
export const isWeb = isWebDetected;

export const platform: AppPlatform = isNativeDetected
  ? 'android'
  : isDesktopDetected
  ? 'windows'
  : 'web';

export const platformLabel: string = isNativeDetected
  ? 'Android Native (Capacitor)'
  : isDesktopDetected
  ? 'Windows Desktop (Tauri v2)'
  : 'Web Application';

/**
 * Hardware and platform media capabilities.
 */
export const capabilities: PlatformCapabilities = {
  // Windows SMTC (System Media Transport Controls) via Tauri plugin
  supportsSMTC: isDesktop && isWindows,
  // Standard MediaSession API supported by modern Android WebViews and Web browsers
  supportsMediaSession: typeof navigator !== 'undefined' && 'mediaSession' in navigator,
  // Android Foreground Service for locked-screen audio persistence
  supportsForegroundService: isNative && isAndroid,
  supportsHaptics: isNative,
  supportsOfflineFileSystem: isDesktop || isNative,
};

/**
 * Intelligently resolves the remote API base URL for current target:
 * - On Android emulator, rewrites `localhost` or `127.0.0.1` to `10.0.2.2`
 * - On Web or desktop, defaults to environment variable or standard origin
 */
export function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (envUrl) {
    // If running in Android emulator and URL points to localhost, map to host loopback 10.0.2.2
    if (isNative && isAndroid) {
      if (envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return envUrl
          .replace('localhost', '10.0.2.2')
          .replace('127.0.0.1', '10.0.2.2');
      }
    }
    return envUrl.replace(/\/+$/, ''); // Remove trailing slashes
  }

  // Fallback defaults
  if (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.startsWith('file://')) {
    return window.location.origin;
  }

  return 'https://api.spotiplayer.com';
}

export const API_BASE_URL = resolveApiBaseUrl();
export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 12000;
export const API_MAX_RETRIES = Number(import.meta.env.VITE_API_MAX_RETRIES) || 3;

export const appConfig: AppConfig = {
  isWeb,
  isDesktop,
  isNative,
  isAndroid,
  isWindows,
  isIOS,
  platform,
  platformLabel,
  capabilities,
  apiBaseUrl: API_BASE_URL,
  timeoutMs: API_TIMEOUT_MS,
  maxRetries: API_MAX_RETRIES,
};

export default appConfig;
