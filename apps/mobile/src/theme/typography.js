import { Platform } from 'react-native';
export const FONTS = {
    regular: Platform.select({
        web: 'Noto Serif SC, serif',
        ios: 'System',
        android: 'Roboto',
    }),
};
export const fontScale = 1.0; // Will be overridden by userStore
