import { AddonManifest } from '../../src/types/addon';

const manifest: AddonManifest = {
  // Métadonnées de base
  name: 'bpmn',
  version: '1.0.0',
  versions: ['1.0.0'],
  displayName: 'BPMN',
  summary: 'Modélisation et exécution de processus BPMN 2.0',
  description: 'Module pour créer, publier et piloter des workflows métiers via BPMN 2.0',
  publication: {
    status: 'draft',
    auditLog: 'addons/bpmn/bpmn.log'
  },

  // Configuration
  application: true,
  autoInstall: false,
  installable: true,

  // Routes définies par l'addon
  routes: [],

  // Modèles de données
  models: [
    {
      name: 'bpmn.process',
      displayName: 'Processus',
      fields: [
        { name: 'name', type: 'string', required: true, label: 'Nom' },
        { name: 'version', type: 'string', required: true, label: 'Version' },
        { name: 'definition', type: 'string', required: true, label: 'Définition BPMN XML' },
        { name: 'status', type: 'string', required: true, label: 'Statut', default: 'draft' }
      ]
    },
    {
      name: 'bpmn.instance',
      displayName: 'Instance',
      fields: [
        { name: 'process_id', type: 'many2one', required: true, label: 'Processus', relation: 'bpmn.process' },
        { name: 'status', type: 'string', required: true, label: 'Statut', default: 'created' },
        { name: 'start_date', type: 'datetime', required: false, label: 'Date de début' },
        { name: 'end_date', type: 'datetime', required: false, label: 'Date de fin' }
      ]
    },
    {
      name: 'bpmn.task',
      displayName: 'Tâche',
      fields: [
        { name: 'instance_id', type: 'many2one', required: true, label: 'Instance', relation: 'bpmn.instance' },
        { name: 'name', type: 'string', required: true, label: 'Nom' },
        { name: 'type', type: 'string', required: true, label: 'Type' },
        { name: 'assignee_id', type: 'many2one', required: false, label: 'Assigné à', relation: 'hr.employee' },
        { name: 'due_date', type: 'date', required: false, label: 'Échéance' },
        { name: 'status', type: 'string', required: true, label: 'Statut', default: 'pending' }
      ]
    },
    {
      name: 'bpmn.connector',
      displayName: 'Connecteur',
      fields: [
        { name: 'name', type: 'string', required: true, label: 'Nom' },
        { name: 'type', type: 'string', required: true, label: 'Type' },
        { name: 'config', type: 'string', required: false, label: 'Configuration' }
      ]
    },
    {
      name: 'bpmn.form',
      displayName: 'Formulaire',
      fields: [
        { name: 'name', type: 'string', required: true, label: 'Nom' },
        { name: 'schema', type: 'string', required: true, label: 'Schéma JSON' },
        { name: 'public', type: 'boolean', required: true, label: 'Public', default: false }
      ]

    },
    {
      name: 'bpmn.variable',
      displayName: 'Variable',
      fields: [
        { name: 'instance_id', type: 'many2one', required: true, label: 'Instance', relation: 'bpmn.instance' },
        { name: 'name', type: 'string', required: true, label: 'Nom' },
        { name: 'value', type: 'string', required: false, label: 'Valeur', pii: true },
        { name: 'encrypted', type: 'boolean', required: true, label: 'Chiffré', default: false }
      ]
    },
    {
      name: 'bpmn.attachment',
      displayName: 'Pièce jointe',
      fields: [
        { name: 'task_id', type: 'many2one', required: true, label: 'Tâche', relation: 'bpmn.task' },
        { name: 'filename', type: 'string', required: true, label: 'Nom du fichier' },
        { name: 'mimetype', type: 'string', required: true, label: 'Type MIME' },
        { name: 'size', type: 'integer', required: true, label: 'Taille' },
        { name: 'content', type: 'binary', required: true, label: 'Contenu', pii: true },
        { name: 'encrypted', type: 'boolean', required: true, label: 'Chiffré', default: false }
      ]
    }

      },
    {
      name: 'bpmn.event',
      displayName: 'Événement',
      fields: [
        { name: 'instance_id', type: 'many2one', required: true, label: 'Instance', relation: 'bpmn.instance' },
        { name: 'type', type: 'string', required: true, label: 'Type' },
        { name: 'payload', type: 'string', required: false, label: 'Données' },
        { name: 'status', type: 'string', required: true, label: 'Statut', default: 'pending' }
      ]
    },
    {
      name: 'bpmn.job',
      displayName: 'Job',
      fields: [
        { name: 'instance_id', type: 'many2one', required: true, label: 'Instance', relation: 'bpmn.instance' },
        { name: 'type', type: 'string', required: true, label: 'Type' },
        { name: 'scheduled_at', type: 'datetime', required: false, label: 'Planifié pour' },
        { name: 'status', type: 'string', required: true, label: 'Statut', default: 'pending' },
        { name: 'data', type: 'string', required: false, label: 'Données' }
      ]
    },
    {
      name: 'bpmn.transaction',
      displayName: 'Transaction',
      fields: [
        { name: 'instance_id', type: 'many2one', required: true, label: 'Instance', relation: 'bpmn.instance' },
        { name: 'status', type: 'string', required: true, label: 'Statut', default: 'started' },
        { name: 'started_at', type: 'datetime', required: false, label: 'Début' },
        { name: 'ended_at', type: 'datetime', required: false, label: 'Fin' }
      ]
    },
  ],

  // Menus définis par l'addon
  menus: [
    {
      id: 'menu_bpmn_root',
      name: 'BPMN',
      sequence: 60,
      route: '/bpmn',
      icon: 'Workflow'
    },
    {
      id: 'menu_bpmn_processes',
      name: 'Processus',
      sequence: 10,
      route: '/bpmn/processes',
      parent: 'menu_bpmn_root',
      icon: 'CircuitBoard'
    },
    {
      id: 'menu_bpmn_instances',
      name: 'Instances',
      sequence: 20,
      route: '/bpmn/instances',
      parent: 'menu_bpmn_root',
      icon: 'PlayCircle'
    },
    {
      id: 'menu_bpmn_connectors',
      name: 'Connecteurs',
      sequence: 30,
      route: '/bpmn/connectors',
      parent: 'menu_bpmn_root',
      icon: 'Cable'
    }
  ],

  // Dépendances
  dependencies: []
};

export default manifest;
