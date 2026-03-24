import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generic string storage with JSON serialization.
 * Use this for simple key-value persistence without Zustand.
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};

/** AsyncStorage key for auth token */
export const AUTH_TOKEN_KEY = 'ananta-auth-token';
/** AsyncStorage key for refresh token */
export const REFRESH_TOKEN_KEY = 'ananta-refresh-token';
/** AsyncStorage key for user email */
export const AUTH_EMAIL_KEY = 'ananta-auth-email';
