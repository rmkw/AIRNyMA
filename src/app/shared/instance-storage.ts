import { environment } from '../../environments/environment';

const prefix = `siiernma:${environment.baseUrl}:`;

/** Storage belongs to this backend instance, even when frontends share an origin. */
export const instanceStorage = {
  getItem(key: string): string | null {
    return localStorage.getItem(prefix + key);
  },
  setItem(key: string, value: string): void {
    localStorage.setItem(prefix + key, value);
  },
  removeItem(key: string): void {
    localStorage.removeItem(prefix + key);
  },
  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(prefix))
      .forEach(key => localStorage.removeItem(key));
  },
};
