import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Hash, FileText, Calendar, Plus, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import axios from 'axios';

interface Sequence {
  id: string;
  name: string;
  prefix: string;
  suffix: string;
  nextNumber: number;
  padding: number;
  resetFrequency: 'never' | 'yearly' | 'monthly';
  documentType: string;
  lastReset: string | null;
  active: boolean;
}

interface SequenceConfig {
  id: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
  defaultFormat: string;
  defaultPadding: number;
  autoReset: boolean;
  advancedSettings: {
    yearFormat: string;
    separator: string;
    allowCustomFormat: boolean;
    allowManualReset: boolean;
    allowManualNumbering: boolean;
    enforceUniqueness: boolean;
    lockSequenceAfterUse: boolean;
  };
}

const SequenceSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [sequenceConfig, setSequenceConfig] = useState<SequenceConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour la confirmation de réinitialisation
  const [sequenceToReset, setSequenceToReset] = useState<Sequence | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // États pour la sauvegarde
  const [isSaving, setIsSaving] = useState(false);

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer les séquences
        const sequencesResponse = await axios.get('http://localhost:3001/api/sequences');
        setSequences(sequencesResponse.data);

        // Récupérer la configuration des séquences
        const configResponse = await axios.get('http://localhost:3001/api/sequenceconfig');
        setSequenceConfig(configResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données de séquence:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSequences = sequences.filter(sequence =>
    sequence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sequence.prefix.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour sauvegarder la configuration des séquences
  const saveSequenceConfig = async () => {
    try {
      setIsSaving(true);

      if (!sequenceConfig) return;

      await axios.put('http://localhost:3001/api/sequenceconfig', sequenceConfig);

      toast({
        title: "Configuration sauvegardée",
        description: "Configuration des séquences enregistrée avec succès",
        variant: "default",
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de la configuration",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de réinitialisation
  const openResetDialog = (sequence: Sequence) => {
    setSequenceToReset(sequence);
    setIsResetDialogOpen(true);
  };

  // Fonction pour réinitialiser une séquence
  const resetSequence = async () => {
    if (!sequenceToReset) return;

    setIsResetting(true);

    try {
      const response = await axios.post(`http://localhost:3001/api/sequences/${sequenceToReset.id}/reset`);

      // Mettre à jour la séquence dans le tableau
      setSequences(sequences.map(seq =>
        seq.id === sequenceToReset.id ? response.data : seq
      ));

      toast({
        title: "Séquence réinitialisée",
        description: "La séquence a été réinitialisée avec succès",
        variant: "default",
      });

      // Fermer la boîte de dialogue
      setIsResetDialogOpen(false);
      setSequenceToReset(null);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de la séquence:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la réinitialisation de la séquence",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Hash className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Numération</h1>
          <p className="text-muted-foreground mt-1">Gestion des numéros de séquence pour les documents</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
          <span className="ml-2">Chargement des données...</span>
        </div>
      ) : (
        <div className="space-y-6">
        {/* Liste des séquences */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Séquences configurées</CardTitle>
              <CardDescription>Liste des séquences de numérotation disponibles</CardDescription>
            </div>
            <Button className="bg-ivory-orange hover:bg-ivory-orange/90">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle séquence
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Input
                placeholder="Rechercher une séquence..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {filteredSequences.map((sequence) => (
                <div key={sequence.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{sequence.name}</h3>
                        <Badge variant="outline">
                          {sequence.resetFrequency === 'never' ? 'Jamais' :
                           sequence.resetFrequency === 'yearly' ? 'Annuel' : 'Mensuel'}
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-4 gap-4">
                        <div>
                          <Label>Préfixe</Label>
                          <div className="mt-1 font-mono">{sequence.prefix}</div>
                        </div>
                        <div>
                          <Label>Prochain numéro</Label>
                          <div className="mt-1 font-mono">
                            {String(sequence.nextNumber).padStart(sequence.padding, '0')}
                          </div>
                        </div>
                        <div>
                          <Label>Suffixe</Label>
                          <div className="mt-1 font-mono">{sequence.suffix}</div>
                        </div>
                        <div>
                          <Label>Exemple</Label>
                          <div className="mt-1 font-mono">
                            {sequence.prefix}
                            {String(sequence.nextNumber).padStart(sequence.padding, '0')}
                            {sequence.suffix}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration des séquences */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration des séquences</CardTitle>
            <CardDescription>Paramètres généraux de numérotation</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6">
            {sequenceConfig && (
              <>
                <div>
                  <Label>Année fiscale</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Du {sequenceConfig.fiscalYearStart} au {sequenceConfig.fiscalYearEnd}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="fiscal-year-start">Début de l'année fiscale</Label>
                    <Input
                      id="fiscal-year-start"
                      value={sequenceConfig.fiscalYearStart}
                      onChange={(e) => setSequenceConfig({
                        ...sequenceConfig,
                        fiscalYearStart: e.target.value
                      })}
                      className="mt-2"
                      placeholder="MM-DD"
                    />
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="fiscal-year-end">Fin de l'année fiscale</Label>
                    <Input
                      id="fiscal-year-end"
                      value={sequenceConfig.fiscalYearEnd}
                      onChange={(e) => setSequenceConfig({
                        ...sequenceConfig,
                        fiscalYearEnd: e.target.value
                      })}
                      className="mt-2"
                      placeholder="MM-DD"
                    />
                  </div>
                </div>
                <div>
                  <Label>Format par défaut</Label>
                  <div className="mt-2">
                    <Badge variant="outline">{sequenceConfig.defaultFormat}</Badge>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="default-format">Format par défaut</Label>
                    <Input
                      id="default-format"
                      value={sequenceConfig.defaultFormat}
                      onChange={(e) => setSequenceConfig({
                        ...sequenceConfig,
                        defaultFormat: e.target.value
                      })}
                      className="mt-2"
                    />
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="default-padding">Padding par défaut</Label>
                    <Input
                      id="default-padding"
                      type="number"
                      value={sequenceConfig.defaultPadding}
                      onChange={(e) => setSequenceConfig({
                        ...sequenceConfig,
                        defaultPadding: parseInt(e.target.value)
                      })}
                      className="mt-2"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Réinitialisation */}
        <Card>
          <CardHeader>
            <CardTitle>Réinitialisation des compteurs</CardTitle>
            <CardDescription>Gestion des réinitialisations périodiques</CardDescription>
          </CardHeader>
          <CardContent>
            {sequenceConfig && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Réinitialisation automatique</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Les compteurs seront réinitialisés automatiquement selon leur fréquence
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="auto-reset">Activer</Label>
                    <input
                      type="checkbox"
                      id="auto-reset"
                      checked={sequenceConfig.autoReset}
                      onChange={(e) => setSequenceConfig({
                        ...sequenceConfig,
                        autoReset: e.target.checked
                      })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Réinitialisation manuelle</h3>
                  <div className="space-y-2">
                    {sequences.map(sequence => (
                      <div key={sequence.id} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{sequence.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            (Prochain: {sequence.nextNumber})
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResetDialog(sequence)}
                          disabled={isResetting && sequenceToReset?.id === sequence.id}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Réinitialiser
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end mt-6">
          <Button
            className="bg-ivory-orange hover:bg-ivory-orange/90"
            onClick={saveSequenceConfig}
            disabled={loading || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </div>
      </div>
      )}

      {/* Boîte de dialogue de confirmation de réinitialisation */}
      <ConfirmationDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        title="Réinitialiser la séquence"
        description="Êtes-vous sûr de vouloir réinitialiser cette séquence ? Le prochain numéro sera 1."
        actionLabel="Réinitialiser"
        variant="destructive"
        isProcessing={isResetting}
        icon={<RefreshCw className="h-4 w-4 mr-2" />}
        onConfirm={resetSequence}
      >
        {sequenceToReset && (
          <div>
            <p className="font-medium">{sequenceToReset.name}</p>
            <p className="text-sm text-muted-foreground">
              Préfixe: <span className="font-mono">{sequenceToReset.prefix}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Prochain numéro actuel: <span className="font-mono">{sequenceToReset.nextNumber}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Suffixe: <span className="font-mono">{sequenceToReset.suffix}</span>
            </p>
            <p className="text-sm font-medium text-amber-500 mt-2">
              <AlertTriangle className="h-4 w-4 inline-block mr-1" />
              Cette action est irréversible et peut affecter la numérotation des documents.
            </p>
          </div>
        )}
      </ConfirmationDialog>
    </div>
  );
};

export default SequenceSettings;