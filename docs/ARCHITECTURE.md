# Architecture du Projet

## Schéma Global
```
┌─────────────────────────────────────────────────┐
│                    Frontend                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │   Modules   │  │    Core     │  │   UI    │ │
│  │  (Addons)   │  │ (Router,    │  │(Shared  │ │
│  └─────────────┘  │  State)     │  │ Comps)  │ │
└───────────────────┼─────────────┼──┴─────────┘ │
                    │  Backend    │              │
                    │  (API,      │              │
                    │  Services)  │              │
                    └─────────────┘              │
```

## Composants Clés

### Frontend
- **AddonManager**: Gestion des modules
- **RouterService**: Navigation application
- **UI Components**: Bibliothèque partagée

### Backend
- **API**: Points d'entrée REST
- **Services**: Logique métier
- **Models**: Accès aux données

## Flux de Données
1. UI → API → Services → DB
2. Modules → AddonManager → Router
