import type { CapacitorConfig } from '@capacitor/cli';

// Set to true to test with local dev server, false for production
const USE_DEV_SERVER = false;

const DEV_SERVER = 'http://10.0.2.2:3000'; // Android emulator localhost
const PROD_URL = 'https://waypointgy.com'; // Production URL

const config: CapacitorConfig = {
  appId: 'gy.waypoint.app',
  appName: 'Waypoint',
  webDir: 'public', // Fallback, not used when server.url is set
  server: {
    url: USE_DEV_SERVER ? DEV_SERVER : PROD_URL,
    cleartext: USE_DEV_SERVER, // Only allow http for local dev
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0d5c4b',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      backgroundColor: '#ffffff',
      style: 'DARK', // Dark icons on light background
      overlaysWebView: false, // Don't overlay - push content down
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      // These will be set per-platform in native config
      serverClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      forceCodeForRefreshToken: true,
    },
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0d5c4b',
  },
  ios: {
    backgroundColor: '#0d5c4b',
    contentInset: 'automatic',
  },
};

export default config;
