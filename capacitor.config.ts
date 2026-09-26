import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pulsesocial.app',
  appName: 'PulseSocial',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
