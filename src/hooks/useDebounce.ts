import { useState, useEffect } from 'react';

/**
 * Hook pour débounce une valeur
 * @param value Valeur à débounce
 * @param delay Délai en millisecondes
 * @returns Valeur débounce
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Créer un timer pour mettre à jour la valeur débounce
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nettoyer le timer si la valeur change avant la fin du délai
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pour débounce une valeur avec un contrôleur d'annulation
 * @param value Valeur à débounce
 * @param delay Délai en millisecondes
 * @returns Objet contenant la valeur débounce et une fonction pour annuler
 */
export function useDebounceWithCancel<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setTimeoutId(null);
    }, delay);

    setTimeoutId(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [value, delay]);

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const isPending = timeoutId !== null;

  return {
    debouncedValue,
    cancel,
    isPending,
  };
}

export default useDebounce;
