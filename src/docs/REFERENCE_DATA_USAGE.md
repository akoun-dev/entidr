# Utilisation des données de référence

Ce document explique comment utiliser les composants et services pour accéder aux données de référence dans l'application.

## Tables de référence disponibles

L'application utilise plusieurs tables de référence pour stocker des données communes utilisées à plusieurs endroits :

1. **Users** - Utilisateurs du système
2. **Groups** - Groupes d'utilisateurs
3. **Countries** - Pays
4. **Currencies** - Devises
5. **Languages** - Langues
6. **DateFormats** - Formats de date
7. **TimeFormats** - Formats d'heure
8. **NumberFormats** - Formats de nombre
9. **NotificationChannels** - Canaux de notification
10. **PaymentProviders** - Fournisseurs de paiement
11. **ShippingMethods** - Méthodes d'expédition
12. **Printers** - Imprimantes

## Service de données de référence

Le service `ReferenceDataService` fournit des méthodes pour accéder à ces données de référence :

```typescript
import ReferenceDataService from '../services/ReferenceDataService';

// Récupérer tous les utilisateurs
const users = await ReferenceDataService.getUsers();

// Récupérer un utilisateur spécifique
const user = await ReferenceDataService.getUser(1);

// Récupérer tous les pays
const countries = await ReferenceDataService.getCountries();

// Récupérer un pays spécifique
const country = await ReferenceDataService.getCountry('FR');
```

## Hooks React

Pour faciliter l'utilisation des données de référence dans les composants React, des hooks personnalisés sont disponibles :

```typescript
import { useUsers, useCountries } from '../hooks/useReferenceData';

function MyComponent() {
  // Récupérer tous les utilisateurs
  const { data: users, loading, error } = useUsers();
  
  // Récupérer tous les pays
  const { data: countries, loading: loadingCountries, error: countriesError } = useCountries();
  
  if (loading || loadingCountries) {
    return <div>Chargement...</div>;
  }
  
  if (error || countriesError) {
    return <div>Erreur lors du chargement des données</div>;
  }
  
  return (
    <div>
      <h2>Utilisateurs ({users.length})</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
      
      <h2>Pays ({countries.length})</h2>
      <ul>
        {countries.map(country => (
          <li key={country.id}>{country.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Composants de sélection

Des composants de sélection sont disponibles pour faciliter la sélection de données de référence dans les formulaires :

```tsx
import { UserSelector, CountrySelector, CurrencySelector, LanguageSelector } from '../components/selectors';

function MyForm() {
  const [userId, setUserId] = useState('');
  const [countryId, setCountryId] = useState('');
  
  return (
    <form>
      <UserSelector
        label="Responsable"
        value={userId}
        onChange={setUserId}
        required
        helperText="Sélectionnez l'utilisateur responsable"
      />
      
      <CountrySelector
        label="Pays"
        value={countryId}
        onChange={setCountryId}
        required
        helperText="Sélectionnez votre pays"
      />
      
      <button type="submit">Enregistrer</button>
    </form>
  );
}
```

## Bonnes pratiques

1. **Utiliser les tables de référence existantes** plutôt que de créer de nouvelles tables pour les mêmes données.
2. **Stocker uniquement les identifiants (IDs)** des entités référencées dans vos tables.
3. **Utiliser les composants de sélection** pour garantir une expérience utilisateur cohérente.
4. **Utiliser les hooks personnalisés** pour simplifier l'accès aux données dans les composants React.
5. **Utiliser le service centralisé** pour accéder aux données dans les services et les composants non-React.

## Exemple complet

Voir le fichier `src/examples/ReferenceDataExample.tsx` pour un exemple complet d'utilisation des composants de sélection dans un formulaire.

## Ajouter une nouvelle table de référence

Si vous avez besoin d'ajouter une nouvelle table de référence :

1. Créez le modèle, la migration et le seeder pour la nouvelle table.
2. Ajoutez les méthodes correspondantes dans `ReferenceDataService`.
3. Ajoutez un hook personnalisé dans `useReferenceData.ts`.
4. Créez un composant de sélection dans `src/components/selectors/`.
5. Exportez le composant et ses types dans `src/components/selectors/index.ts`.

## Support

Pour toute question ou problème concernant l'utilisation des données de référence, veuillez contacter l'équipe de développement.
