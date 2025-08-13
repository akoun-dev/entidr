/**
 * Exemple d'utilisation des composants de sélection de données de référence
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { UserSelector, CountrySelector, CurrencySelector, LanguageSelector } from '../components/selectors';

/**
 * Composant d'exemple pour démontrer l'utilisation des sélecteurs de données de référence
 */
const ReferenceDataExample: React.FC = () => {
  // États pour stocker les valeurs sélectionnées
  const [userId, setUserId] = useState<string>('');
  const [countryId, setCountryId] = useState<string>('');
  const [currencyId, setCurrencyId] = useState<string>('');
  const [languageId, setLanguageId] = useState<string>('');
  const [name, setName] = useState<string>('');
  
  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Afficher les données du formulaire
    console.log({
      name,
      userId,
      countryId,
      currencyId,
      languageId
    });
    
    // Ici, vous pourriez envoyer les données à une API
    alert('Formulaire soumis avec succès !');
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Exemple d'utilisation des données de référence</CardTitle>
          <CardDescription>
            Ce formulaire démontre comment utiliser les composants de sélection pour les données de référence.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Champ de texte standard */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entrez votre nom"
                required
              />
            </div>
            
            {/* Sélecteur d'utilisateur */}
            <UserSelector
              label="Responsable"
              value={userId}
              onChange={setUserId}
              required
              helperText="Sélectionnez l'utilisateur responsable"
            />
            
            {/* Sélecteur de pays */}
            <CountrySelector
              label="Pays"
              value={countryId}
              onChange={setCountryId}
              required
              helperText="Sélectionnez votre pays"
            />
            
            {/* Sélecteur de devise */}
            <CurrencySelector
              label="Devise"
              value={currencyId}
              onChange={setCurrencyId}
              helperText="Sélectionnez votre devise préférée"
            />
            
            {/* Sélecteur de langue */}
            <LanguageSelector
              label="Langue"
              value={languageId}
              onChange={setLanguageId}
              helperText="Sélectionnez votre langue préférée"
            />
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ReferenceDataExample;
