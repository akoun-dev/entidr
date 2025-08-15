import { createRoot, hydrateRoot } from 'react-dom/client';
import { StrictMode, Suspense } from 'react';
import App from './App';
import { LoadingScreen } from './components/LoadingScreen';
import './index.css';

const rootElement = document.getElementById('root')!;

if (rootElement.hasChildNodes()) {
  hydrateRoot(
    rootElement,
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <Suspense fallback={<LoadingScreen />}>
        <App />
      </Suspense>
    </StrictMode>
  );
}

