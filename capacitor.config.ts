import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spotiplayer.music',
  appName: 'SpotiPlayer',
  webDir: 'dist',
  backgroundColor: '#0e141a',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#0e141a',
  },
  plugins: {
    StatusBar: {
      style: 'DARK', // Dark style in Capacitor = light text/icons on dark background
      backgroundColor: '#0e141a',
      overlaysWebView: false,
    },
  },
};

export default config;
