export const read = (key: string): string | null =>
  typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
export const write = (key: string, value: string): void => localStorage.setItem(key, value);
