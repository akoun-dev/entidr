
import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import { ThemeProvider } from "./components/providers/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddonLoader from "./components/AddonLoader";
import AddonManager from "./core/AddonManager";
import SettingsRoutes from "./routes/SettingsRoutes";
import logger from "./utils/logger";

// Création du client de requête
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AddonLoader>
          <AppRoutes />
        </AddonLoader>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Composant séparé pour les routes qui sera rendu après le chargement des modules
const AppRoutes = () => {
  const [addonRoutes, setAddonRoutes] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // Récupérer les routes des addons une fois que l'AddonLoader a chargé les modules
    const addonManager = AddonManager.getInstance();
    const routes = addonManager.getAllRoutes();
    logger.debug("Routes chargées:", routes);

    // Vérifier si les routes sont correctement chargées
    if (routes.length === 0) {
      logger.error("Aucune route n'a été chargée depuis les modules");
    } else {
      routes.forEach((route, index) => {
        logger.debug(`Route ${index}:`, route);
      });
    }

    setAddonRoutes(routes);
  }, []);

  // Afficher les routes dans la console pour le débogage
  logger.debug("Rendu des routes:", addonRoutes);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Route principale */}
          <Route path="/" element={<Index />} />

          {/* Routes des addons */}
          {addonRoutes.map((route, index) => {
            logger.debug(`Rendu de la route ${index}:`, route);
            // Si la route est un élément React valide, on le rend directement
            if (React.isValidElement(route)) {
              return React.cloneElement(route, { key: `addon-route-${index}` });
            }
            // Sinon, on l'enveloppe dans un fragment
            return (
              <React.Fragment key={`addon-route-${index}`}>
                {route}
              </React.Fragment>
            );
          })}

          {/* Route explicite pour le module HR (solution temporaire) */}
          <Route path="hr" element={<React.Suspense fallback={<div>Chargement...</div>}>
            {React.createElement(
              // @ts-ignore - Ignorer l'erreur de type pour le moment
              React.lazy(() => import('../addons/hr/views/pages/HrDashboardView'))
            )}
          </React.Suspense>} />

          {/* Routes des paramètres */}
          {SettingsRoutes}

          {/* Route de fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
