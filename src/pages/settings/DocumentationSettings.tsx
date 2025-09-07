import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';

const Code: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <pre className={`p-3 rounded bg-muted text-xs overflow-auto ${className}`}>{children}</pre>
);

const Section: React.FC<React.PropsWithChildren<{ title: string; description?: string }>> = ({ title, description, children }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const DocumentationSettings: React.FC = () => {
  const [query, setQuery] = useState('');

  const matches = (text: string) => text.toLowerCase().includes(query.toLowerCase());

  // Static docs content rendered in-app (no .md files required)
  const coreSteps = (
    <>
      <p className="text-sm text-muted-foreground mb-2">Le cœur (ERP Core) se met à jour en mode maintenance :</p>
      <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
        <li>Effectuer une sauvegarde (base + fichiers).</li>
        <li>Basculer en maintenance.</li>
        <li>Déployer le package core (git pull ou archive).</li>
        <li>Installer les dépendances et builder.</li>
        <li>Exécuter les migrations de base.</li>
        <li>Redémarrer les services et vérifier la santé.</li>
      </ol>
      <div className="mt-3 text-xs text-muted-foreground">
        Conseils : planifiez une fenêtre de maintenance, testez d'abord en staging, et documentez les changements majeurs.
      </div>
    </>
  );

  const modulesStructure = (
    <>
      <p className="text-sm text-muted-foreground mb-2">Déposez vos updates dans l'arborescence suivante :</p>
      <Code>{`updates/
  modules/
    <module_name>/
      <version>/
        ...fichiers à copier dans addons/<module_name>/
        CHANGELOG.md (optionnel)
        migrations/ (optionnel)`}</Code>
      <p className="text-sm text-muted-foreground mt-2">Étapes :</p>
      <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
        <li>Créer <code>updates/modules/&lt;module&gt;/&lt;version&gt;</code> et y déposer les fichiers.</li>
        <li>Depuis Paramètres → Mises à jour, cliquer <strong>Vérifier les mises à jour</strong>.</li>
        <li>Sélectionner le module et cliquer <strong>Installer la mise à jour</strong>.</li>
        <li>Contrôler les journaux et le bon fonctionnement.</li>
      </ol>
      <div className="mt-3 text-xs text-muted-foreground">
        Une sauvegarde du module est conservée dans <code>backups/modules/</code> lors de l'application.
      </div>
    </>
  );

  const apiEnvelope = (
    <>
      <p className="text-sm text-muted-foreground mb-2">Toutes les réponses de l'API utilisent une enveloppe unifiée :</p>
      <Code>{`{
  "data": <payload>,
  "error": null | { "message": string, ... }
}`}</Code>
      <p className="text-sm text-muted-foreground mb-2">Côté front, Axios est centralisé et déballe automatiquement <code>data</code>.</p>
      <Code>{`// src/config/api.ts (instance Axios centralisée)
api.interceptors.response.use((res) => {
  const p = res?.data;
  if (p && typeof p === 'object' && 'data' in p) {
    return { ...res, data: p.data };
  }
  return res;
});`}</Code>
    </>
  );

  const security = (
    <>
      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
        <li>Routes d'écriture protégées (authenticate + authorize(['admin'])).</li>
        <li>Chiffrement des mots de passe SMTP (AES‑GCM) au repos.</li>
        <li>Masquage des clés API côté lecture et logs d'audit sur opérations sensibles.</li>
        <li>Helmet, CORS configurable, rate limiting global.</li>
      </ul>
    </>
  );

  const deployment = (
    <>
      <p className="text-sm text-muted-foreground mb-2">Exemple de déploiement productif :</p>
      <Code>{`# 1) Maintenance + sauvegarde
# 2) Déploiement
git fetch --all && git checkout tags/vX.Y.Z
npm ci && npm run build
npm run migrate
# 3) Redémarrage
pm2 restart all
`}</Code>
    </>
  );

  const sections = [
    { key: 'overview', title: 'Aperçu', content: <p className="text-sm text-muted-foreground">Documentation intégrée du système : mises à jour Core & modules, enveloppe API, sécurité et déploiement.</p>},
    { key: 'core', title: 'Mises à jour ERP Core', content: coreSteps },
    { key: 'modules', title: 'Mises à jour des modules', content: modulesStructure },
    { key: 'api', title: 'Contrat API & Axios', content: apiEnvelope },
    { key: 'security', title: 'Sécurité', content: security },
    { key: 'deploy', title: 'Déploiement', content: deployment },
  ];

  const filtered = useMemo(() => {
    if (!query.trim()) return sections;
    return sections.filter(s => matches(s.title) || (typeof s.content?.props?.children === 'string' && matches(s.content.props.children)) || true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Documentation intégrée</h1>
        <p className="text-muted-foreground mt-1">Consultez la documentation sans ouvrir de fichiers .md</p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <Input
          placeholder="Rechercher dans la documentation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue={filtered[0]?.key || 'overview'} className="space-y-4">
        <TabsList className="flex flex-wrap gap-2">
          {sections.map(s => (
            <TabsTrigger key={s.key} value={s.key}>{s.title}</TabsTrigger>
          ))}
        </TabsList>
        {sections.map(s => (
          <TabsContent key={s.key} value={s.key}>
            <Section title={s.title}>{s.content}</Section>
          </TabsContent>
        ))}
      </Tabs>

      <Separator className="my-6" />
      <p className="text-xs text-muted-foreground">
        Besoin d'une section supplémentaire ? Indiquez-nous le sujet à documenter et nous l'ajouterons ici.
      </p>
    </div>
  );
};

export default DocumentationSettings;

