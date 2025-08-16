
import React from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import AddonManager from "@/core/AddonManager";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const addons = AddonManager.listAddons();

  return (
    <div className="py-8 px-4 md:px-8">
      <Container>
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Bienvenue dans votre ERP
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plateforme de gestion d'entreprise modulaire et extensible. Utilisez les modules disponibles ou créez les vôtres.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {addons.map((addon) => (
            <Card key={addon.name} className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle>{addon.displayName}</CardTitle>
                <CardDescription>{addon.summary}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {addon.description}
                </p>
                {addon.routes && addon.routes.length > 0 && addon.routes[0].path && (
                  <Button asChild className="w-full">
                    <Link to={addon.routes[0].path}>
                      Accéder au module
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Besoin d'un nouveau module ?</h2>
          <p className="text-muted-foreground mb-4">
            Créez un nouveau module en suivant la structure standard pour étendre les fonctionnalités de votre ERP.
          </p>
          <Button variant="outline">
            Voir la documentation
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default Index;
