import {
  EntidrSecurityRule,
  EntidrSecurityFilter,
  EntidrSecurityDomain,
  EntidrSecurityContext
} from '../../../types/entidr-security';

/**
 * Classe représentant une règle d'accès aux enregistrements
 */
export class RecordAccessRule implements EntidrSecurityRule {
  id: string;
  name: string;
  model: string;
  description?: string;
  domainFilter: string;
  groups: string[];
  permissions: any;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  /**
   * Crée une nouvelle règle d'accès aux enregistrements
   */
  constructor(data: Partial<EntidrSecurityRule>) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.model = data.model || '';
    this.description = data.description;
    this.domainFilter = data.domainFilter || '';
    this.groups = data.groups || [];
    this.permissions = data.permissions || {
      read: false,
      write: false,
      create: false,
      unlink: false
    };
    this.active = data.active !== undefined ? data.active : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Évalue si la règle s'applique à un contexte de sécurité donné
   */
  appliesTo(context: EntidrSecurityContext): boolean {
    // Vérifier si la règle est active
    if (!this.active) {
      return false;
    }

    // Vérifier si le modèle correspond
    if (this.model && this.model !== '*') {
      // Dans une implémentation réelle, vérifier si le modèle demandé correspond
      // Pour la démo, on suppose que le modèle est correct
    }

    // Vérifier si l'utilisateur appartient à l'un des groupes concernés
    if (this.groups.length > 0) {
      const userGroups = context.groups.map(g => g.id);
      const hasMatchingGroup = this.groups.some(groupId =>
        userGroups.includes(groupId)
      );

      if (!hasMatchingGroup) {
        return false;
      }
    }

    return true;
  }

  /**
   * Évalue le filtre de domaine pour un enregistrement donné
   */
  evaluateDomain(record: any, context: EntidrSecurityContext): boolean {
    if (!this.domainFilter || this.domainFilter.trim() === '') {
      return true; // Pas de filtre, accès accordé
    }

    try {
      // Parser le filtre de domaine
      const domain = this.parseDomainFilter(this.domainFilter);

      // Évaluer le domaine
      return this.evaluateDomainFilters(domain, record, context);
    } catch (error) {
      console.error(`Error evaluating domain filter for rule ${this.name}:`, error);
      return false; // En cas d'erreur, refuser l'accès
    }
  }

  /**
   * Vérifie si la règle accorde une permission spécifique
   */
  hasPermission(action: keyof any): boolean {
    return this.permissions[action] || false;
  }

  /**
   * Convertit la règle en objet JSON
   */
  toJSON(): EntidrSecurityRule {
    return {
      id: this.id,
      name: this.name,
      model: this.model,
      description: this.description,
      domainFilter: this.domainFilter,
      groups: [...this.groups],
      permissions: { ...this.permissions },
      active: this.active,
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt)
    };
  }

  /**
   * Met à jour la règle
   */
  update(data: Partial<EntidrSecurityRule>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.model !== undefined) this.model = data.model;
    if (data.description !== undefined) this.description = data.description;
    if (data.domainFilter !== undefined) this.domainFilter = data.domainFilter;
    if (data.groups !== undefined) this.groups = [...data.groups];
    if (data.permissions !== undefined) this.permissions = { ...data.permissions };
    if (data.active !== undefined) this.active = data.active;

    this.updatedAt = new Date();
  }

  /**
   * Active la règle
   */
  activate(): void {
    this.active = true;
    this.updatedAt = new Date();
  }

  /**
   * Désactive la règle
   */
  deactivate(): void {
    this.active = false;
    this.updatedAt = new Date();
  }

  /**
   * Ajoute un groupe à la règle
   */
  addGroup(groupId: string): boolean {
    if (!this.groups.includes(groupId)) {
      this.groups.push(groupId);
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Supprime un groupe de la règle
   */
  removeGroup(groupId: string): boolean {
    const initialLength = this.groups.length;
    this.groups = this.groups.filter(id => id !== groupId);

    if (initialLength > this.groups.length) {
      this.updatedAt = new Date();
      return true;
    }

    return false;
  }

  /**
   * Met à jour une permission
   */
  updatePermission(action: keyof any, value: boolean): void {
    this.permissions[action] = value;
    this.updatedAt = new Date();
  }

  /**
   * Valide la règle
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Rule name is required');
    }

    if (!this.model || this.model.trim() === '') {
      errors.push('Model is required');
    }

    if (!this.domainFilter || this.domainFilter.trim() === '') {
      errors.push('Domain filter is required');
    }

    try {
      this.parseDomainFilter(this.domainFilter);
    } catch (error) {
      errors.push(`Invalid domain filter: ${error}`);
    }

    return errors;
  }

  /**
   * Clone la règle
   */
  clone(newName?: string): RecordAccessRule {
    const cloneData = this.toJSON();
    delete cloneData.id;

    if (newName) {
      cloneData.name = newName;
    } else {
      cloneData.name = `${this.name}_copy`;
    }

    cloneData.createdAt = new Date();
    cloneData.updatedAt = new Date();

    return new RecordAccessRule(cloneData);
  }

  /**
   * Génère un ID unique pour la règle
   */
  private generateId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Parse le filtre de domaine
   */
  private parseDomainFilter(filter: string): EntidrSecurityDomain {
    // Dans une implémentation réelle, cela parserait une expression de domaine
    // Format attendu: "[('field', 'operator', 'value'), ('field2', 'operator', 'value2')]"

    try {
      // Supprimer les crochets extérieurs
      const cleanFilter = filter.trim().replace(/^\[|\]$/g, '');

      // Parser les conditions
      const conditions = this.parseConditions(cleanFilter);

      return {
        filters: conditions,
        logic: 'and' // Par défaut, utiliser AND
      };
    } catch (error) {
      throw new Error(`Invalid domain filter format: ${filter}`);
    }
  }

  /**
   * Parse les conditions du filtre
   */
  private parseConditions(filterString: string): EntidrSecurityFilter[] {
    // Format attendu: "('field', 'operator', 'value'), ('field2', 'operator', 'value2')"
    const conditionStrings = filterString.split('),(');

    return conditionStrings.map((conditionStr, index) => {
      // Nettoyer la chaîne
      const cleanCondition = conditionStr.trim().replace(/^\(|\)$/g, '');

      // Parser les parties
      const parts = cleanCondition.split(',').map(part => part.trim().replace(/^'|'$/g, ''));

      if (parts.length !== 3) {
        throw new Error(`Invalid condition format at index ${index}: ${conditionStr}`);
      }

      const [field, operator, value] = parts;

      // Convertir la valeur si nécessaire
      let parsedValue: any = value;

      if (value === 'True' || value === 'true') parsedValue = true;
      else if (value === 'False' || value === 'false') parsedValue = false;
      else if (value === 'None' || value === 'null') parsedValue = null;
      else if (!isNaN(Number(value))) parsedValue = Number(value);

      return {
        field,
        operator: operator as any,
        value: parsedValue
      };
    });
  }

  /**
   * Évalue les filtres de domaine
   */
  private evaluateDomainFilters(
    domain: EntidrSecurityDomain,
    record: any,
    context: EntidrSecurityContext
  ): boolean {
    if (!domain.filters || domain.filters.length === 0) {
      return true;
    }

    const results = domain.filters.map(filter =>
      this.evaluateFilter(filter, record, context)
    );

    // Appliquer la logique (AND/OR)
    if (domain.logic === 'or') {
      return results.some(result => result);
    } else {
      return results.every(result => result);
    }
  }

  /**
   * Évalue un filtre individuel
   */
  private evaluateFilter(
    filter: EntidrSecurityFilter,
    record: any,
    context: EntidrSecurityContext
  ): boolean {
    const { field, operator, value } = filter;

    // Récupérer la valeur du champ dans l'enregistrement
    const recordValue = this.getNestedValue(record, field);

    // Support des variables de contexte (ex: user.id, user.company_id)
    const evaluatedValue = this.evaluateValue(value, context);

    // Appliquer l'opérateur
    switch (operator) {
      case '=':
        return recordValue === evaluatedValue;
      case '!=':
        return recordValue !== evaluatedValue;
      case '>':
        return recordValue > evaluatedValue;
      case '<':
        return recordValue < evaluatedValue;
      case '>=':
        return recordValue >= evaluatedValue;
      case '<=':
        return recordValue <= evaluatedValue;
      case 'like':
        return this.likeMatch(recordValue, evaluatedValue);
      case 'ilike':
        return this.likeMatch(recordValue, evaluatedValue, true);
      case 'in':
        return Array.isArray(evaluatedValue) && evaluatedValue.includes(recordValue);
      case 'not in':
        return Array.isArray(evaluatedValue) && !evaluatedValue.includes(recordValue);
      default:
        return false;
    }
  }

  /**
   * Récupère une valeur imbriquée dans un objet
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Évalue une valeur en remplaçant les variables de contexte
   */
  private evaluateValue(value: any, context: EntidrSecurityContext): any {
    if (typeof value !== 'string') {
      return value;
    }

    // Support des variables comme ${user.id}, ${user.company_id}, etc.
    const variablePattern = /\$\{([^}]+)\}/g;

    return value.replace(variablePattern, (match, variablePath) => {
      try {
        return this.getNestedValue(context, variablePath);
      } catch (error) {
        console.warn(`Could not evaluate variable ${variablePath}:`, error);
        return match; // Retourner la chaîne originale si la variable n'existe pas
      }
    });
  }

  /**
   * Vérifie une correspondance de type LIKE
   */
  private likeMatch(value: any, pattern: any, caseInsensitive: boolean = false): boolean {
    if (typeof value !== 'string' || typeof pattern !== 'string') {
      return false;
    }

    // Convertir le pattern SQL en regex
    const regexPattern = pattern
      .replace(/%/g, '.*')
      .replace(/_/g, '.')
      .replace(/\|/g, '\\|');

    const flags = caseInsensitive ? 'i' : '';
    const regex = new RegExp(`^${regexPattern}$`, flags);

    return regex.test(value);
  }
}

export default RecordAccessRule;
