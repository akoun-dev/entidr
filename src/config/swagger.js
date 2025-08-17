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
        url: 'http://localhost:3000/api/v1',
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
        }
      }
    }
  },
  apis: ['./src/server/routes/*.js'], // fichiers contenant les annotations Swagger
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
