import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { watchModules } from './server/services/moduleCacheService'
import { info } from './utils/logger'

// TODO: Implémenter un système de notification des changements de modules via WebSocket
// Actuellement désactivé pour éviter les dépendances backend dans le frontend

createRoot(document.getElementById("root")!).render(<App />);
