const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API EntIDR',
      version: '1.0.0',
      description: 'Documentation de l\'API EntIDR',
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints pour l\'authentification des utilisateurs'
      },
      {
        name: 'Groups',
        description: 'Endpoints pour la gestion des groupes'
      }
    ],
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Serveur de développement'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Language: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string', example: 'fr-FR' },
            native_name: { type: 'string', nullable: true },
            direction: { type: 'string', enum: ['ltr', 'rtl'] },
            is_default: { type: 'boolean' },
            active: { type: 'boolean' }
          }
        },
        Translation: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            key: { type: 'string' },
            locale: { type: 'string', example: 'fr-FR' },
            namespace: { type: 'string', example: 'common' },
            value: { type: 'string' },
            is_default: { type: 'boolean' },
            active: { type: 'boolean' },
            description: { type: 'string' }
          }
        },
        EmailServer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            protocol: { type: 'string', enum: ['smtp', 'sendmail'] },
            host: { type: 'string' },
            port: { type: 'integer' },
            username: { type: 'string' },
            from_email: { type: 'string' },
            from_name: { type: 'string' },
            encryption: { type: 'string', enum: ['tls', 'ssl', 'none'] },
            is_default: { type: 'boolean' },
            active: { type: 'boolean' }
          }
        },
        ApiKey: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            key: { type: 'string' },
            permissions: { type: 'array', items: { type: 'string' } },
            active: { type: 'boolean' },
            expires_at: { type: 'string', format: 'date-time' },
            last_used_at: { type: 'string', format: 'date-time' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        // Analytics schemas
        BpmnAnalytics: {
          type: 'object',
          properties: {
            activeInstances: { type: 'integer', example: 5 },
            averageDuration: { type: 'integer', example: 120, description: 'Durée moyenne en secondes' },
            slaCompliance: { type: 'integer', example: 95, description: 'Pourcentage de conformité SLA' }
          }
        },
        // Analytics schemas
        BpmnAnalytics: {
          type: 'object',
          properties: {
            activeInstances: { type: 'integer' },
            averageDuration: { type: 'integer' },
            slaCompliance: { type: 'integer' }
          }
        },
        // Module schema
        Module: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            version: { type: 'string' },
            description: { type: 'string' },
            active: { type: 'boolean' },
            installed: { type: 'boolean' },
            dependencies: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },
        // Parameter schemas
        Parameter: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            key: { type: 'string' },
            value: { type: 'string' },
            category: { type: 'string' },
            description: { type: 'string' }
          }
        },
        // Authentication schemas
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        },
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
            active: { type: 'boolean' }
          }
        },
        Group: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            permissions: {
              type: 'array',
              items: { type: 'string' }
            },
            active: { type: 'boolean' },
            memberCount: { type: 'integer' }
          }
        },
        GroupCreate: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            permissions: {
              type: 'array',
              items: { type: 'string' }
            },
            active: { type: 'boolean' }
          }
        },
        GroupUpdate: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            permissions: {
              type: 'array',
              items: { type: 'string' }
            },
            active: { type: 'boolean' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            totalItems: { type: 'integer' },
            totalPages: { type: 'integer' },
            currentPage: { type: 'integer' },
            itemsPerPage: { type: 'integer' }
          }
        },
        ModuleUpdate: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', example: 'module' },
            name: { type: 'string', description: 'Display name' },
            module: { type: 'string', description: 'Technical module name' },
            currentVersion: { type: 'string' },
            newVersion: { type: 'string' },
            size: { type: 'string', example: '12.5 MB' },
            releaseDate: { type: 'string', example: '2025-04-28' },
            changelog: { type: 'array', items: { type: 'string' } },
            security: { type: 'boolean' }
          }
        }
      }
    }
  },
  apis: ['./src/server/routes/*.js', './src/server/api/v1/*.js'], // fichiers contenant les annotations Swagger
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
