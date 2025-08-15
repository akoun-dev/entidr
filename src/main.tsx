import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { watchModules } from './services/moduleCacheService'
import logger from './utils/logger'

// Initialiser le watcher pour détecter les changements de modules
watchModules(() => {
  logger.info('Module change detected - reloading application')
  window.location.reload()
})

createRoot(document.getElementById("root")!).render(<App />);
