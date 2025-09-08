import React from 'react';
import { HrNavigation } from './HrNavigation';

/**
 * Layout commun pour toutes les vues du module HR
 * Ce composant inclut le menu de navigation et évite la duplication
 * Il standardise également la position du menu pour assurer une cohérence visuelle
 */
interface HrLayoutProps {
  children: React.ReactNode;
  showMenu?: boolean; // Option pour masquer le menu si nécessaire
}

export const HrLayout: React.FC<HrLayoutProps> = ({ children, showMenu = true }) => {
  // Fonction pour trouver l'en-tête et insérer le menu après celui-ci
  const renderWithMenu = () => {
    // Convertir les enfants en tableau pour faciliter la manipulation
    const childrenArray = React.Children.toArray(children);

    // Si c'est un fragment avec un seul enfant, on utilise cet enfant
    let content = childrenArray;
    if (childrenArray.length === 1 && React.isValidElement(childrenArray[0])) {
      const firstChild = childrenArray[0] as React.ReactElement;
      if (firstChild.type === React.Fragment && firstChild.props.children) {
        content = React.Children.toArray(firstChild.props.children);
      }
    }

    // Trouver l'index de l'en-tête (premier élément avec className contenant "mb-6")
    const headerIndex = content.findIndex(child => {
      const element = child as React.ReactElement;
      return element.props && element.props.className && element.props.className.includes('mb-6');
    });

    if (headerIndex !== -1) {
      // Diviser les enfants en deux parties: avant et après l'en-tête
      const beforeHeader = content.slice(0, headerIndex);
      const header = content[headerIndex];
      const afterHeader = content.slice(headerIndex + 1);

      // Rendre avec le menu inséré après l'en-tête
      return (
        <>
          {beforeHeader}
          {header}
          {showMenu && <HrNavigation key="hr-navigation" />}
          {afterHeader}
        </>
      );
    }

    // Si on ne peut pas trouver l'en-tête, on rend les enfants avec le menu au début
    return (
      <>
        {showMenu && <HrNavigation />}
        {children}
      </>
    );
  };

  return (
    <div className="w-full adinkra-bg space-y-4 px-4 py-4">
      {renderWithMenu()}
    </div>
  );
};
