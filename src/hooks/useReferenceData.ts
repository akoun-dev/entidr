/**
 * Hooks personnalisés pour accéder aux données de référence
 * Ces hooks facilitent l'utilisation des données de référence dans les composants React
 */
import { useState } from 'react';
import { useDeepCompareEffect } from './useDeepCompareEffect';
import ReferenceDataService from '../services/ReferenceDataService';

/**
 * Hook générique pour récupérer des données de référence
 * @param fetchFunction Fonction à appeler pour récupérer les données
 * @param params Paramètres optionnels pour la requête. Pour éviter des
 * rechargements inutiles, mémoïsez cet objet afin de garantir la stabilité de
 * sa référence (ex. avec `useMemo`).
 * @param dependencies Dépendances supplémentaires pour le useEffect
 */
export function useReferenceData<T>(
  fetchFunction: (params?: any) => Promise<T[]>,
  params = {},
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useDeepCompareEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await fetchFunction(params);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
        console.error('Erreur lors de la récupération des données:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, ...dependencies]);

  return { data, loading, error };
}

// Hooks spécifiques pour chaque type de données de référence

/**
 * Hook pour récupérer la liste des utilisateurs
 */
export function useUsers(params = {}) {
  return useReferenceData(ReferenceDataService.getUsers.bind(ReferenceDataService), params);
}

/**
 * Hook pour récupérer la liste des groupes
 */
export function useGroups(params = {}) {
  return useReferenceData(ReferenceDataService.getGroups.bind(ReferenceDataService), params);
}

/**
 * Hook pour récupérer la liste des pays
 */
export function useCountries(params = {}) {
  return useReferenceData(ReferenceDataService.getCountries.bind(ReferenceDataService), params);
}

/**
 * Hook pour récupérer la liste des devises
 */
export function useCurrencies(params = {}) {
  return useReferenceData(ReferenceDataService.getCurrencies.bind(ReferenceDataService), params);
}

/**
 * Hook pour récupérer la liste des langues
 */
export function useLanguages(params = {}) {
  return useReferenceData(ReferenceDataService.getLanguages.bind(ReferenceDataService), params);
}

/**
 * Hook pour récupérer la liste des formats de date
 */
export function useDateFormats(params = {}) {
  return useReferenceData(ReferenceDataService.getDateFormats.bind(ReferenceDataService), params);
}

/**
 * Hook pour récupérer la liste des formats d'heure
 */
export function useTimeFormats(params = {}) {
  return useReferenceData(ReferenceDataService.getTimeFormats.bind(ReferenceDataService), params);
}

/**
 * Hook pour récupérer la liste des formats de nombre
 */
export function useNumberFormats(params = {}) {
  return useReferenceData(ReferenceDataService.getNumberFormats.bind(ReferenceDataService), params);
}

/**
 * Hook pour récupérer la liste des canaux de notification
 */
export function useNotificationChannels(params = {}) {
  return useReferenceData(ReferenceDataService.getNotificationChannels.bind(ReferenceDataService), params);
}

/**
 * Hook pour récupérer la liste des fournisseurs de paiement
 */
export function usePaymentProviders(params = {}) {
  return useReferenceData(ReferenceDataService.getPaymentProviders.bind(ReferenceDataService), params);
}

/**
 * Hook pour récupérer la liste des méthodes d'expédition
 */
export function useShippingMethods(params = {}) {
  return useReferenceData(ReferenceDataService.getShippingMethods.bind(ReferenceDataService), params);
}

/**
 * Hook pour récupérer la liste des imprimantes
 */
export function usePrinters(params = {}) {
  return useReferenceData(ReferenceDataService.getPrinters.bind(ReferenceDataService), params);
}

// Exporter tous les hooks
export default {
  useUsers,
  useGroups,
  useCountries,
  useCurrencies,
  useLanguages,
  useDateFormats,
  useTimeFormats,
  useNumberFormats,
  useNotificationChannels,
  usePaymentProviders,
  useShippingMethods,
  usePrinters
};
