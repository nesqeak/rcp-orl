import { useEffect, useState } from 'react';

/** État React persisté dans le localStorage (silencieux si le stockage est indisponible). */
export function useLocalStorageState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Stockage plein ou désactivé : l'état reste disponible en mémoire
    }
  }, [key, value]);

  return [value, setValue] as const;
}
