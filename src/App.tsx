
import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AddonLoader from "./components/AddonLoader";
import AddonManager from "./core/AddonManager";
import { RouteDefinition } from "./types/addon";
import SettingsRoutes from "./routes/SettingsRoutes";
import { debug, error } from "./utils/logger";

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
  const [addonRoutes, setAddonRoutes] = useState<RouteDefinition[]>([]);

  useEffect(() => {
    const refresh = () => {
      const routes = AddonManager.getAllRoutes();
      debug("Routes chargées:", routes);
      if (routes.length === 0) {
        error("Aucune route n'a été chargée depuis les modules");
      } else {
        routes.forEach((route, index) => debug(`Route ${index}:`, route));
      }
      setAddonRoutes(routes as any);
    };

    // Première récupération
    refresh();

    // Écoute des chargements tardifs de modules
    AddonManager.registerHook('postModuleLoad', () => refresh());
  }, []);

  // Afficher les routes dans la console pour le débogage
  debug("Rendu des routes:", addonRoutes);
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Route principale */}
          <Route path="/" element={<Index />} />
          {/* Routes des addons */}
          {addonRoutes.map((route, index) => {
            debug(`Rendu de la route ${index}:`, route);
            const path = (route as any).path?.startsWith('/') ? (route as any).path.slice(1) : (route as any).path;
            return (
              <Route
                key={`addon-route-${index}`}
                path={path}
                element={React.createElement((route as any).component)}
              />
            );
          })}

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
