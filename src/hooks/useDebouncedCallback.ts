import { useCallback, useRef } from 'react';

/**
 * Hook pour débounce une fonction de callback
 * @param callback Fonction à débounce
 * @param delay Délai en millisecondes
 * @returns Fonction débounce
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
        timeoutRef.current = null;
      }, delay);
    },
    [callback, delay]
  ) as T;
}

/**
 * Hook pour débounce une fonction de callback avec un contrôleur d'annulation
 * @param callback Fonction à débounce
 * @param delay Délai en millisecondes
 * @returns Objet contenant la fonction débounce et des utilitaires
 */
export function useDebouncedCallbackWithCancel<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef(false);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      pendingRef.current = true;
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        timeoutRef.current = null;
        pendingRef.current = false;
      }, delay);
    },
    [callback, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      pendingRef.current = false;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      callback(); // Exécuter immédiatement
      timeoutRef.current = null;
      pendingRef.current = false;
    }
  }, [callback]);

  const isPending = useCallback(() => pendingRef.current, []);

  return {
    debouncedCallback,
    cancel,
    flush,
    isPending,
  };
}

/**
 * Hook pour le throttling d'une fonction de callback
 * @param callback Fonction à throttler
 * @param delay Délai en millisecondes
 * @returns Fonction throttled
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        // Si le délai est écoulé, exécuter immédiatement
        callback(...args);
        lastCallRef.current = now;
      } else {
        // Sinon, planifier l'exécution pour la fin du délai
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastCallRef.current = Date.now();
          timeoutRef.current = null;
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay]
  ) as T;
}

export default useDebouncedCallback;
