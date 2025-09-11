import {
  EntidrSecurityContext,
  EntidrSecurityRule,
  EntidrAccessResult
} from '../../../types/entidr-security';
import RecordAccessRule from '../rules/RecordAccessRule';
import { GroupModel } from '../models/Group';

/**
 * Service de gestion des règles d'accès aux enregistrements (Row-Level Security)
 */
export class RecordAccessService {
  private static instance: RecordAccessService;
  private rules: Map<string, RecordAccessRule> = new Map();
  private ruleCache: Map<string, { rules: RecordAccessRule[]; timestamp: number; ttl: number }> = new Map();
  private readonly DEFAULT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Récupère l'instance unique du service (Singleton)
   */
  public static getInstance(): RecordAccessService {
    if (!RecordAccessService.instance) {
      RecordAccessService.instance = new RecordAccessService();
    }
    return RecordAccessService.instance;
  }

  /**
   * Crée une nouvelle règle d'accès
   */
  async createRule(ruleData: Partial<EntidrSecurityRule>): Promise<RecordAccessRule> {
    const rule = new RecordAccessRule(ruleData);

    // Valider la règle
    const validationErrors = rule.validate();
    if (validationErrors.length > 0) {
      throw new Error(`Invalid rule: ${validationErrors.join(', ')}`);
    }

    // Stocker la règle
    this.rules.set(rule.id, rule);

    // Invalider le cache
    this.invalidateRuleCache();

    return rule;
  }

  /**
   * Met à jour une règle d'accès
   */
  async updateRule(ruleId: string, updateData: Partial<EntidrSecurityRule>): Promise<RecordAccessRule> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    // Mettre à jour la règle
    rule.update(updateData);

    // Valider la règle après mise à jour
    const validationErrors = rule.validate();
    if (validationErrors.length > 0) {
      throw new Error(`Invalid rule after update: ${validationErrors.join(', ')}`);
    }

    // Invalider le cache
    this.invalidateRuleCache();

    return rule;
  }

  /**
   * Supprime une règle d'accès
   */
  async deleteRule(ruleId: string): Promise<boolean> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    // Supprimer la règle
    this.rules.delete(ruleId);

    // Invalider le cache
    this.invalidateRuleCache();

    return true;
  }

  /**
   * Récupère une règle par son ID
   */
  async getRule(ruleId: string): Promise<RecordAccessRule | null> {
    return this.rules.get(ruleId) || null;
  }

  /**
   * Récupère toutes les règles
   */
  async getAllRules(): Promise<RecordAccessRule[]> {
    return Array.from(this.rules.values());
  }

  /**
   * Récupère les règles pour un modèle spécifique
   */
  async getRulesForModel(model: string): Promise<RecordAccessRule[]> {
    return Array.from(this.rules.values()).filter(rule =>
      rule.model === model || rule.model === '*'
    );
  }

  /**
   * Récupère les règles applicables à un contexte de sécurité
   */
  async getApplicableRules(context: EntidrSecurityContext): Promise<RecordAccessRule[]> {
    // Vérifier le cache d'abord
    const cacheKey = this.getCacheKey(context.user.id, 'applicable_rules');
    const cached = this.ruleCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.rules;
    }

    // Récupérer toutes les règles actives
    const allRules = Array.from(this.rules.values()).filter(rule => rule.active);

    // Filtrer les règles applicables au contexte
    const applicableRules = allRules.filter(rule => rule.appliesTo(context));

    // Mettre en cache le résultat
    this.ruleCache.set(cacheKey, {
      rules: applicableRules,
      timestamp: Date.now(),
      ttl: this.DEFAULT_CACHE_TTL
    });

    return applicableRules;
  }

  /**
   * Vérifie l'accès à un enregistrement spécifique
   */
  async checkRecordAccess(
    context: EntidrSecurityContext,
    model: string,
    record: any,
    action: keyof any = 'read'
  ): Promise<EntidrAccessResult> {
    // Récupérer les règles applicables
    const applicableRules = await this.getApplicableRules(context);

    // Filtrer les règles pour le modèle spécifique
    const modelRules = applicableRules.filter(rule =>
      rule.model === model || rule.model === '*'
    );

    // Si aucune règle ne s'applique, accorder l'accès par défaut
    if (modelRules.length === 0) {
      return {
        granted: true,
        reason: 'No access rules apply'
      };
    }

    // Évaluer chaque règle
    let granted = false;
    let reasons: string[] = [];

    for (const rule of modelRules) {
      // Vérifier si la règle accorde la permission demandée
      if (!rule.hasPermission(action)) {
        reasons.push(`Rule ${rule.name} does not grant ${action} permission`);
        continue;
      }

      // Évaluer le filtre de domaine
      const domainMatch = rule.evaluateDomain(record, context);

      if (domainMatch) {
        granted = true;
        reasons.push(`Access granted by rule ${rule.name}`);
      } else {
        reasons.push(`Record does not match domain filter for rule ${rule.name}`);
      }
    }

    return {
      granted,
      reason: reasons.join('; '),
      rules: modelRules.map(rule => rule.toJSON())
    };
  }

  /**
   * Filtre une liste d'enregistrements selon les règles d'accès
   */
  async filterRecords(
    context: EntidrSecurityContext,
    model: string,
    records: any[],
    action: keyof any = 'read'
  ): Promise<any[]> {
    // Récupérer les règles applicables
    const applicableRules = await this.getApplicableRules(context);

    // Filtrer les règles pour le modèle spécifique
    const modelRules = applicableRules.filter(rule =>
      rule.model === model || rule.model === '*'
    );

    // Si aucune règle ne s'applique, retourner tous les enregistrements
    if (modelRules.length === 0) {
      return records;
    }

    // Filtrer les enregistrements
    const filteredRecords: any[] = [];

    for (const record of records) {
      const accessResult = await this.checkRecordAccess(context, model, record, action);

      if (accessResult.granted) {
        filteredRecords.push(record);
      }
    }

    return filteredRecords;
  }

  /**
   * Génère une clause WHERE SQL basée sur les règles d'accès
   */
  async generateWhereClause(
    context: EntidrSecurityContext,
    model: string,
    action: keyof any = 'read'
  ): Promise<{ whereClause: string; parameters: any[] }> {
    // Récupérer les règles applicables
    const applicableRules = await this.getApplicableRules(context);

    // Filtrer les règles pour le modèle spécifique et la permission
    const modelRules = applicableRules.filter(rule =>
      (rule.model === model || rule.model === '*') &&
      rule.hasPermission(action)
    );

    if (modelRules.length === 0) {
      return {
        whereClause: '1=1', // Toujours vrai
        parameters: []
      };
    }

    // Générer les conditions WHERE pour chaque règle
    const conditions: string[] = [];
    const parameters: any[] = [];

    for (const rule of modelRules) {
      try {
        const ruleCondition = this.generateRuleCondition(rule, context, parameters);
        conditions.push(ruleCondition);
      } catch (error) {
        console.warn(`Could not generate SQL condition for rule ${rule.name}:`, error);
      }
    }

    // Combiner les conditions avec OR (si au moins une règle autorise l'accès)
    const whereClause = conditions.length > 0
      ? `(${conditions.join(' OR ')})`
      : '1=0'; // Toujours faux si aucune condition ne peut être générée

    return {
      whereClause,
      parameters
    };
  }

  /**
   * Active une règle
   */
  async activateRule(ruleId: string): Promise<boolean> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    rule.activate();
    this.invalidateRuleCache();
    return true;
  }

  /**
   * Désactive une règle
   */
  async deactivateRule(ruleId: string): Promise<boolean> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    rule.deactivate();
    this.invalidateRuleCache();
    return true;
  }

  /**
   * Clone une règle
   */
  async cloneRule(ruleId: string, newName?: string): Promise<RecordAccessRule> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    const clonedRule = rule.clone(newName);
    this.rules.set(clonedRule.id, clonedRule);
    this.invalidateRuleCache();

    return clonedRule;
  }

  /**
   * Ajoute un groupe à une règle
   */
  async addGroupToRule(ruleId: string, groupId: string): Promise<boolean> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    const result = rule.addGroup(groupId);
    if (result) {
      this.invalidateRuleCache();
    }

    return result;
  }

  /**
   * Supprime un groupe d'une règle
   */
  async removeGroupFromRule(ruleId: string, groupId: string): Promise<boolean> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    const result = rule.removeGroup(groupId);
    if (result) {
      this.invalidateRuleCache();
    }

    return result;
  }

  /**
   * Invalide le cache des règles
   */
  private invalidateRuleCache(): void {
    this.ruleCache.clear();
  }

  /**
   * Nettoie le cache des règles expirées
   */
  cleanupRuleCache(): void {
    const now = Date.now();
    for (const [key, value] of this.ruleCache) {
      if (now - value.timestamp > value.ttl) {
        this.ruleCache.delete(key);
      }
    }
  }

  /**
   * Génère une condition SQL pour une règle
   */
  private generateRuleCondition(
    rule: RecordAccessRule,
    context: EntidrSecurityContext,
    parameters: any[]
  ): string {
    if (!rule.domainFilter || rule.domainFilter.trim() === '') {
      return '1=1'; // Toujours vrai si pas de filtre
    }

    try {
      const domain = rule.parseDomainFilter(rule.domainFilter);
      return this.generateDomainCondition(domain, context, parameters);
    } catch (error) {
      throw new Error(`Cannot generate SQL condition for rule ${rule.name}: ${error}`);
    }
  }

  /**
   * Génère une condition SQL pour un domaine
   */
  private generateDomainCondition(
    domain: any,
    context: EntidrSecurityContext,
    parameters: any[]
  ): string {
    if (!domain.filters || domain.filters.length === 0) {
      return '1=1';
    }

    const conditions = domain.filters.map((filter: any) => {
      return this.generateFilterCondition(filter, context, parameters);
    });

    // Combiner les conditions avec AND/OR
    const operator = domain.logic === 'or' ? ' OR ' : ' AND ';
    return conditions.join(operator);
  }

  /**
   * Génère une condition SQL pour un filtre
   */
  private generateFilterCondition(
    filter: any,
    context: EntidrSecurityContext,
    parameters: any[]
  ): string {
    const { field, operator, value } = filter;

    // Évaluer la valeur (support des variables de contexte)
    const evaluatedValue = this.evaluateValue(value, context);

    // Générer la condition SQL
    switch (operator) {
      case '=':
        parameters.push(evaluatedValue);
        return `${field} = ?`;

      case '!=':
        parameters.push(evaluatedValue);
        return `${field} != ?`;

      case '>':
        parameters.push(evaluatedValue);
        return `${field} > ?`;

      case '<':
        parameters.push(evaluatedValue);
        return `${field} < ?`;

      case '>=':
        parameters.push(evaluatedValue);
        return `${field} >= ?`;

      case '<=':
        parameters.push(evaluatedValue);
        return `${field} <= ?`;

      case 'like':
        parameters.push(evaluatedValue);
        return `${field} LIKE ?`;

      case 'ilike':
        parameters.push(evaluatedValue);
        return `LOWER(${field}) LIKE LOWER(?)`;

      case 'in':
        if (!Array.isArray(evaluatedValue)) {
          throw new Error('IN operator requires an array value');
        }
        if (evaluatedValue.length === 0) {
          return '1=0'; // Toujours faux si le tableau est vide
        }
        const placeholders = evaluatedValue.map(() => '?').join(', ');
        parameters.push(...evaluatedValue);
        return `${field} IN (${placeholders})`;

      case 'not in':
        if (!Array.isArray(evaluatedValue)) {
          throw new Error('NOT IN operator requires an array value');
        }
        if (evaluatedValue.length === 0) {
          return '1=1'; // Toujours vrai si le tableau est vide
        }
        const placeholders2 = evaluatedValue.map(() => '?').join(', ');
        parameters.push(...evaluatedValue);
        return `${field} NOT IN (${placeholders2})`;

      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
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
   * Récupère une valeur imbriquée dans un objet
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Génère une clé de cache
   */
  private getCacheKey(userId: string, type: string): string {
    return `${userId}:${type}`;
  }

  /**
   * Initialise le service avec des données par défaut
   */
  async initialize(): Promise<void> {
    console.log('RecordAccessService initialized');

    // Créer quelques règles d'exemple
    await this.createExampleRules();

    // Démarrer le nettoyage périodique du cache
    setInterval(() => {
      this.cleanupRuleCache();
    }, 15 * 60 * 1000); // Toutes les 15 minutes
  }

  /**
   * Crée des règles d'exemple pour la démonstration
   */
  private async createExampleRules(): Promise<void> {
    try {
      // Règle: Les utilisateurs ne peuvent voir que leurs propres enregistrements
      await this.createRule({
        name: 'User Own Records',
        model: '*',
        description: 'Users can only see their own records',
        domainFilter: "[('user_id', '=', '${user.id}')]",
        groups: [],
        permissions: {
          read: true,
          write: true,
          create: false,
          unlink: false
        },
        active: true
      });

      // Règle: Les managers peuvent voir les enregistrements de leur département
      await this.createRule({
        name: 'Manager Department Records',
        model: '*',
        description: 'Managers can see records from their department',
        domainFilter: "[('department_id', '=', '${user.department_id}')]",
        groups: ['managers'],
        permissions: {
          read: true,
          write: true,
          create: true,
          unlink: false
        },
        active: true
      });

      console.log('Example record access rules created');
    } catch (error) {
      console.error('Error creating example rules:', error);
    }
  }

  /**
   * Détruit l'instance du service
   */
  destroy(): void {
    this.rules.clear();
    this.ruleCache.clear();
    RecordAccessService.instance = null as any;
  }
}

export default RecordAccessService;
