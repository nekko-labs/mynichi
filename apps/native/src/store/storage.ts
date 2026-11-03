import { Storage } from 'expo-sqlite/kv-store';

// Native persists to expo-sqlite's key-value store. storage.web.ts covers web, so
// expo-sqlite (and its wasm, which Metro cannot bundle) never reaches the web build.
export const read = (key: string): string | null => Storage.getItemSync(key);
export const write = (key: string, value: string): void => Storage.setItemSync(key, value);
