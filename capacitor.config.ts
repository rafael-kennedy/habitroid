import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.habitroid.app',
    appName: 'Habitroid',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
    },
    android: {
        buildOptions: {
            signingType: 'apksigner',
        },
    },
};

export default config;
