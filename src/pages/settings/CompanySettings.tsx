import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Building2, MapPin, Phone, Mail, Globe, FileText, Upload, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import companyService from '../../services/companyService';
import { Company } from '@/types/company';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';

/**
 * Page des paramètres de la société
 * Permet de configurer les informations de l'entreprise
 */
const CompanySettings: React.FC = () => {
  // État pour les paramètres de l'entreprise
  const [company, setCompany] = useState<Company>({
    name: '',
    trading_name: '',
    description: '',
    industry: '',
    foundation_date: '',
    address: '',
    postal_code: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: ''
  });

  // État pour le chargement
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // État pour la confirmation de réinitialisation
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // État pour stocker les paramètres originaux
  const [originalParams, setOriginalParams] = useState<Company>({...company});

  // Toast pour les notifications
  const { toast } = useToast();

  // Charger les paramètres de l'entreprise
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const companyData = await companyService.get();
        setCompany(companyData);
        setOriginalParams({...companyData});
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données de l\'entreprise',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  // Gérer les changements dans les champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const key = id.replace(/-/g, '_'); // Convertir les tirets en underscores pour correspondre aux clés

    setCompany((prev: Company) => ({
      ...prev,
      [key]: value
    }));
  };

  // Enregistrer les paramètres
  const handleSave = async () => {
    setSaving(true);

    try {
      const updatedCompany = await companyService.update(company);
      setCompany(updatedCompany);
      setOriginalParams({...updatedCompany});

      toast({
        title: 'Succès',
        description: 'Les informations ont été enregistrées',
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer les informations',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Ouvrir la boîte de dialogue de confirmation de réinitialisation
  const openResetDialog = () => {
    // Vérifier s'il y a des modifications non enregistrées
    const hasChanges = JSON.stringify(company) !== JSON.stringify(originalParams);

    if (hasChanges) {
      setIsResetDialogOpen(true);
    } else {
      // S'il n'y a pas de modifications, pas besoin de confirmation
      toast({
        title: 'Information',
        description: 'Aucune modification à annuler',
        variant: 'default'
      });
    }
  };

  // Réinitialiser les paramètres
  const handleReset = () => {
    setIsResetting(true);

    try {
      // Restaurer les paramètres originaux
      setCompany({...originalParams});

      toast({
        title: 'Succès',
        description: 'Les modifications ont été annulées',
        variant: 'default'
      });

      // Fermer la boîte de dialogue
      setIsResetDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des paramètres:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'annuler les modifications',
        variant: 'destructive'
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="h-8 w-8 text-ivory-orange" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres de la société</h1>
          <p className="text-muted-foreground mt-1">Configurez les informations de votre entreprise</p>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="legal">Informations légales</TabsTrigger>
          <TabsTrigger value="visual">Identité visuelle</TabsTrigger>
        </TabsList>

        {/* Onglet Général */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Informations de base sur votre entreprise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Nom de l'entreprise</Label>
                      <Input
                        id="company_name"
                        placeholder="Entrez le nom de votre entreprise"
                        value={company.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_trading_name">Nom commercial</Label>
                      <Input
                        id="company_trading_name"
                        placeholder="Nom commercial (si différent)"
                        value={company.trading_name || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_description">Description</Label>
                    <Textarea
                      id="company_description"
                      placeholder="Brève description de votre entreprise"
                      className="min-h-[100px]"
                      value={company.description || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_industry">Secteur d'activité</Label>
                      <Input
                        id="company_industry"
                        placeholder="Ex: Technologie, Santé, etc."
                        value={company.industry || ''}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_foundation_date">Date de création</Label>
                      <Input
                        id="company_foundation_date"
                        type="date"
                        value={company.foundation_date || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Contact */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coordonnées</CardTitle>
              <CardDescription>Adresse et informations de contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-ivory-orange" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company_address">Adresse</Label>
                    <Textarea
                      id="company_address"
                      placeholder="Adresse complète"
                      className="min-h-[80px]"
                      value={company.address || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_postal_code">Code postal</Label>
                      <Input
                        id="company_postal_code"
                        placeholder="Code postal"
                        value={company.postal_code || ''}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_city">Ville</Label>
                      <Input
                        id="company_city"
                        placeholder="Ville"
                        value={company.city || ''}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_country">Pays</Label>
                      <Input
                        id="company_country"
                        placeholder="Pays"
                        value={company.country || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_phone">Téléphone</Label>
                      <Input
                        id="company_phone"
                        placeholder="Numéro de téléphone"
                        value={company.phone || ''}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company_email">Email</Label>
                      <Input
                        id="company_email"
                        type="email"
                        placeholder="Email de contact"
                        value={company.email || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_website">Site web</Label>
                      <Input
                        id="company_website"
                        placeholder="https://www.example.com"
                        value={company.website || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            disabled={loading || saving || isResetting}
            onClick={openResetDialog}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Annuler les modifications
          </Button>
          <Button
            className="bg-ivory-orange hover:bg-ivory-orange/90"
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </Tabs>

      {/* Boîte de dialogue de confirmation de réinitialisation */}
      <ConfirmationDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        title="Annuler les modifications"
        description="Êtes-vous sûr de vouloir annuler toutes les modifications non enregistrées ? Cette action est irréversible."
        actionLabel="Annuler les modifications"
        variant="default"
        isProcessing={isResetting}
        icon={<RefreshCw className="h-4 w-4 mr-2" />}
        onConfirm={handleReset}
      >
        <div>
          <p className="text-sm text-muted-foreground">
            Toutes les modifications que vous avez apportées seront perdues et les paramètres seront restaurés à leur état précédent.
          </p>
        </div>
      </ConfirmationDialog>
    </div>
  );
};

export default CompanySettings;
