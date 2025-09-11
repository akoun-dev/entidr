# Exemple de Base - Création d'une Vue Utilisateur

Ce guide vous montre comment créer une vue utilisateur complète avec le système de vues Entidr, en utilisant le composant `ListView` et le service `EntidrViewService`.

## Prérequis

- Node.js et npm/yarn installés
- Projet React avec TypeScript configuré
- Dépendances Entidr installées

## Installation des dépendances

```bash
npm install @entidr/views @entidr/core @entidr/ui
# ou
yarn add @entidr/views @entidr/core @entidr/ui
```

## Structure du projet

```
src/
├── components/
│   ├── UserListPage.tsx
│   └── UserForm.tsx
├── services/
│   └── UserService.ts
├── types/
│   └── User.ts
└── docs/
    └── examples/
        └── BasicViewExample.md
```

## Étape 1: Définition des types

Créez le fichier `src/types/User.ts`:

```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'pending';
  role: 'admin' | 'user' | 'manager';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'pending';
  role: 'admin' | 'user' | 'manager';
}
```

## Étape 2: Création du service utilisateur

Créez le fichier `src/services/UserService.ts`:

```typescript
import { EntidrViewService } from '@entidr/views';
import { User, UserFormData } from '../types/User';

// Mock de données pour l'exemple
const mockUsers: User[] = [
  {
    id: 1,
    username: 'johndoe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    status: 'active',
    role: 'user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    username: 'janedoe',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    status: 'active',
    role: 'admin',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 3,
    username: 'bobsmith',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Smith',
    status: 'pending',
    role: 'user',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

export class UserService {
  private viewService: EntidrViewService;

  constructor(viewService: EntidrViewService) {
    this.viewService = viewService;
  }

  // Récupérer tous les utilisateurs
  async getAllUsers(): Promise<User[]> {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockUsers];
  }

  // Récupérer un utilisateur par ID
  async getUserById(id: number): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.find(user => user.id === id) || null;
  }

  // Créer un nouvel utilisateur
  async createUser(userData: UserFormData): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: User = {
      id: Math.max(...mockUsers.map(u => u.id)) + 1,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockUsers.push(newUser);
    return newUser;
  }

  // Mettre à jour un utilisateur
  async updateUser(id: number, userData: Partial<UserFormData>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvé');
    }
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...userData,
      updatedAt: new Date()
    };
    
    return mockUsers[userIndex];
  }

  // Supprimer un utilisateur
  async deleteUser(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvé');
    }
    
    mockUsers.splice(userIndex, 1);
  }

  // Créer la vue utilisateur par défaut
  async createUserListView(): Promise<void> {
    const userView = {
      name: 'Liste des utilisateurs',
      description: 'Vue complète pour la gestion des utilisateurs',
      type: 'LIST' as const,
      model: 'User',
      fields: [
        {
          name: 'id',
          label: 'ID',
          widget: 'INPUT' as const,
          visible: true,
          editable: false,
          required: false,
          order: 1
        },
        {
          name: 'username',
          label: "Nom d'utilisateur",
          widget: 'INPUT' as const,
          visible: true,
          editable: true,
          required: true,
          order: 2,
          validation: {
            pattern: '^[a-zA-Z0-9_]{3,20}$',
            custom: (value: string) => {
              if (value.toLowerCase().includes('admin')) {
                return "Le nom d'utilisateur ne peut pas contenir 'admin'";
              }
              return true;
            }
          }
        },
        {
          name: 'email',
          label: 'Email',
          widget: 'EMAIL' as const,
          visible: true,
          editable: true,
          required: true,
          order: 3
        },
        {
          name: 'firstName',
          label: 'Prénom',
          widget: 'INPUT' as const,
          visible: true,
          editable: true,
          required: true,
          order: 4
        },
        {
          name: 'lastName',
          label: 'Nom',
          widget: 'INPUT' as const,
          visible: true,
          editable: true,
          required: true,
          order: 5
        },
        {
          name: 'status',
          label: 'Statut',
          widget: 'SELECT' as const,
          visible: true,
          editable: true,
          required: true,
          order: 6,
          width: '120px',
          align: 'center',
          options: [
            { value: 'active', label: 'Actif' },
            { value: 'inactive', label: 'Inactif' },
            { value: 'pending', label: 'En attente' }
          ],
          format: (value: string) => {
            const statusConfig = {
              active: { text: 'Actif', color: 'green' },
              inactive: { text: 'Inactif', color: 'red' },
              pending: { text: 'En attente', color: 'orange' }
            };
            return statusConfig[value] || { text: value, color: 'gray' };
          }
        },
        {
          name: 'role',
          label: 'Rôle',
          widget: 'SELECT' as const,
          visible: true,
          editable: true,
          required: true,
          order: 7,
          width: '120px',
          align: 'center',
          options: [
            { value: 'admin', label: 'Administrateur' },
            { value: 'manager', label: 'Manager' },
            { value: 'user', label: 'Utilisateur' }
          ]
        },
        {
          name: 'createdAt',
          label: 'Créé le',
          widget: 'DATE' as const,
          visible: true,
          editable: false,
          required: false,
          order: 8,
          width: '150px',
          format: (value: Date) => value.toLocaleDateString('fr-FR')
        }
      ],
      defaultFilters: [
        {
          id: 'active-users',
          field: 'status',
          label: 'Utilisateurs actifs',
          type: 'SELECT' as const,
          operator: '=',
          value: 'active',
          active: true
        }
      ],
      defaultSorts: [
        {
          field: 'username',
          type: 'ASC' as const,
          priority: 1
        }
      ],
      pagination: {
        enabled: true,
        pageSize: 10,
        pageSizeOptions: [5, 10, 20, 50],
        position: 'bottom' as const,
        type: 'advanced' as const
      },
      actions: [
        {
          id: 'edit-user',
          label: 'Modifier',
          icon: 'edit',
          type: 'BUTTON' as const,
          style: 'primary' as const,
          visible: true,
          enabled: true,
          position: 'row' as const,
          permission: {
            model: 'User',
            action: 'update'
          }
        },
        {
          id: 'delete-user',
          label: 'Supprimer',
          icon: 'delete',
          type: 'BUTTON' as const,
          style: 'danger' as const,
          visible: true,
          enabled: true,
          position: 'row' as const,
          permission: {
            model: 'User',
            action: 'delete'
          },
          confirm: {
            title: 'Confirmation de suppression',
            message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
            type: 'warning' as const
          }
        },
        {
          id: 'add-user',
          label: 'Ajouter un utilisateur',
          icon: 'add',
          type: 'BUTTON' as const,
          style: 'success' as const,
          visible: true,
          enabled: true,
          position: 'toolbar' as const,
          permission: {
            model: 'User',
            action: 'create'
          }
        },
        {
          id: 'export-users',
          label: 'Exporter',
          icon: 'download',
          type: 'BUTTON' as const,
          style: 'secondary' as const,
          visible: true,
          enabled: true,
          position: 'toolbar' as const,
          permission: {
            model: 'User',
            action: 'export'
          }
        }
      ],
      isDefault: true,
      active: true,
      permissions: {
        visible: true,
        editable: true,
        create: true,
        read: true,
        update: true,
        delete: true,
        export: true,
        import: true,
        allowedRoles: ['admin', 'manager']
      },
      metadata: {
        tags: ['users', 'management', 'admin'],
        category: 'User Management'
      }
    };

    try {
      await this.viewService.createView(userView);
      console.log('Vue utilisateur créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la vue:', error);
    }
  }
}
```

## Étape 3: Création du formulaire utilisateur

Créez le fichier `src/components/UserForm.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { User, UserFormData } from '../types/User';

interface UserFormProps {
  user?: User | null;
  onSave: (userData: UserFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSave,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    status: 'active',
    role: 'user'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        role: user.role
      });
    }
  }, [user]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value) return "Le nom d'utilisateur est requis";
        if (value.length < 3) return "Le nom d'utilisateur doit contenir au moins 3 caractères";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscore";
        if (value.toLowerCase().includes('admin')) return "Le nom d'utilisateur ne peut pas contenir 'admin'";
        return '';
      
      case 'email':
        if (!value) return 'L\'email est requis';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'L\'email est invalide';
        return '';
      
      case 'firstName':
        if (!value) return 'Le prénom est requis';
        return '';
      
      case 'lastName':
        if (!value) return 'Le nom est requis';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof UserFormData]);
      if (error) {
        newErrors[key] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof UserFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marquer tous les champs comme touchés
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(allTouched);
    
    if (validateForm()) {
      await onSave(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {user ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Nom d'utilisateur *
          </label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            onBlur={() => handleBlur('username')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Prénom *
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Statut *
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="pending">En attente</option>
            </select>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Rôle *
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="user">Utilisateur</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            disabled={loading}
          >
            Annuler
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </span>
            ) : (
              user ? 'Mettre à jour' : 'Créer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
```

## Étape 4: Création de la page principale

Créez le fichier `src/components/UserListPage.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { ListView } from '@entidr/views';
import { EntidrViewService, EntidrViewCacheService } from '@entidr/views';
import { EntidrSecurityContext } from '@entidr/core';
import { UserService } from '../services/UserService';
import { User, UserFormData } from '../types/User';
import UserForm from './UserForm';

// Initialisation des services
const cacheService = new EntidrViewCacheService();
const viewService = new EntidrViewService(cacheService, console);
const userService = new UserService(viewService);

// Contexte de sécurité
const securityContext: EntidrSecurityContext = {
  user: {
    id: 'user-1',
    username: 'admin',
    email: 'admin@example.com',
    roles: ['admin'],
    groups: ['users'],
    permissions: ['view:read', 'view:write', 'user:create', 'user:update', 'user:delete']
  },
  hasPermission: (permission) => true,
  hasRole: (role) => true,
  isInGroup: (group) => true,
  checkAccess: (resource, action) => true
};

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Charger les utilisateurs au démarrage
  useEffect(() => {
    loadUsers();
    
    // Créer la vue par défaut si elle n'existe pas
    userService.createUserListView();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await userService.getAllUsers();
      setUsers(userData);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selected: User[]) => {
    if (selected.length === 1) {
      setSelectedUser(selected[0]);
    } else {
      setSelectedUser(null);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleFormSave = async (userData: UserFormData) => {
    setFormLoading(true);
    
    try {
      if (selectedUser) {
        // Mise à jour
        await userService.updateUser(selectedUser.id, userData);
      } else {
        // Création
        await userService.createUser(userData);
      }
      
      setShowForm(false);
      setSelectedUser(null);
      await loadUsers(); // Recharger la liste
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde de l\'utilisateur');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username}" ?`)) {
      return;
    }
    
    try {
      await userService.deleteUser(user.id);
      await loadUsers(); // Recharger la liste
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  // Définition de la vue pour le composant ListView
  const userListView = {
    id: 'user-list',
    name: 'Liste des utilisateurs',
    type: 'LIST' as const,
    model: 'User',
    fields: [
      {
        name: 'id',
        label: 'ID',
        widget: 'INPUT' as const,
        visible: true,
        editable: false,
        required: false,
        order: 1
      },
      {
        name: 'username',
        label: "Nom d'utilisateur",
        widget: 'INPUT' as const,
        visible: true,
        editable: true,
        required: true,
        order: 2
      },
      {
        name: 'email',
        label: 'Email',
        widget: 'EMAIL' as const,
        visible: true,
        editable: true,
        required: true,
        order: 3
      },
      {
        name: 'firstName',
        label: 'Prénom',
        widget: 'INPUT' as const,
        visible: true,
        editable: true,
        required: true,
        order: 4
      },
      {
        name: 'lastName',
        label: 'Nom',
        widget: 'INPUT' as const,
        visible: true,
        editable: true,
        required: true,
        order: 5
      },
      {
        name: 'status',
        label: 'Statut',
        widget: 'SELECT' as const,
        visible: true,
        editable: true,
        required: true,
        order: 6,
        options: [
          { value: 'active', label: 'Actif' },
          { value: 'inactive', label: 'Inactif' },
          { value: 'pending', label: 'En attente' }
        ]
      },
      {
        name: 'role',
        label: 'Rôle',
        widget: 'SELECT' as const,
        visible: true,
        editable: true,
        required: true,
        order: 7,
        options: [
          { value: 'admin', label: 'Administrateur' },
          { value: 'manager', label: 'Manager' },
          { value: 'user', label: 'Utilisateur' }
        ]
      }
    ],
    isDefault: false,
    active: true,
    permissions: {
      visible: true,
      editable: true,
      create: true,
      read: true,
      update: true,
      delete: true,
      export: true,
      import: true
    }
  };

  if (showForm) {
    return (
      <div className="p-6">
        <UserForm
          user={selectedUser}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          loading={formLoading}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Ajouter un utilisateur
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <ListView
          view={userListView}
          securityContext={securityContext}
          initialData={users}
          onSelectionChange={handleUserSelect}
          onEdit={handleEdit}
          onDataDelete={handleDelete}
          onDataLoad={() => console.log('Données chargées')}
        />
      )}
    </div>
  );
};

export default UserListPage;
```

## Étape 5: Intégration dans l'application

Créez ou modifiez votre fichier `App.tsx`:

```typescript
import React from 'react';
import UserListPage from './components/UserListPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Application de Gestion - Système de Vues Entidr
            </h1>
          </div>
        </div>
      </header>
      
      <main>
        <UserListPage />
      </main>
    </div>
  );
}

export default App;
```

## Étape 6: Lancement de l'application

```bash
npm start
# ou
yarn start
```

## Fonctionnalités implémentées

### 1. Affichage des données
- Tableau avec toutes les colonnes utilisateur
- Tri par colonnes (ID, username, email, etc.)
- Pagination avec options de taille de page
- Formatage personnalisé des dates et statuts

### 2. Gestion des données
- Création de nouveaux utilisateurs
- Modification des utilisateurs existants
- Suppression des utilisateurs avec confirmation
- Validation des formulaires

### 3. Interaction utilisateur
- Sélection simple et multiple des lignes
- Actions contextuelles (modifier, supprimer)
- Barre d'outils avec action d'ajout
- Feedback visuel lors des opérations

### 4. Sécurité
- Vérification des permissions pour chaque action
- Contexte de sécurité intégré
- Contrôle d'accès basé sur les rôles

### 5. Performance
- Chargement asynchrone des données
- Indicateurs de chargement
- Gestion des erreurs
- Optimisation du rendu

## Personnalisation possible

### 1. Ajouter de nouvelles colonnes
```typescript
// Ajouter dans la définition des champs
{
  name: 'lastLogin',
  label: 'Dernière connexion',
  widget: 'DATETIME',
  visible: true,
  editable: false,
  required: false,
  order: 9,
  format: (value: Date) => value.toLocaleString('fr-FR')
}
```

### 2. Ajouter des filtres personnalisés
```typescript
// Ajouter dans defaultFilters
{
  id: 'role-filter',
  field: 'role',
  label: 'Filtrer par rôle',
  type: 'SELECT',
  operator: '=',
  value: 'user',
  active: false
}
```

### 3. Personnaliser le thème
```css
/* styles.css */
.custom-list-view {
  --list-header-bg: #1f2937;
  --list-header-text: #ffffff;
  --list-row-hover: #f3f4f6;
  --list-row-selected: #dbeafe;
}

.custom-list-view .list-header {
  background-color: var(--list-header-bg);
  color: var(--list-header-text);
}
```

### 4. Ajouter des exports
```typescript
const handleExport = async () => {
  try {
    const csvContent = convertToCSV(users);
    downloadFile(csvContent, 'users.csv', 'text/csv');
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
  }
};
```

## Bonnes pratiques

### 1. Gestion des erreurs
- Toujours utiliser try/catch pour les opérations asynchrones
- Afficher des messages d'erreur clairs à l'utilisateur
- Journaliser les erreurs pour le débogage

### 2. Performance
- Utiliser la pagination pour les grands datasets
- Implémenter le chargement paresseux si nécessaire
- Éviter les rendus inutiles avec React.memo

### 3. Accessibilité
- Fournir des labels ARIA appropriés
- Assurer la navigation au clavier
- Utiliser des couleurs avec un contraste suffisant

### 4. Sécurité
- Valider toutes les entrées utilisateur
- Utiliser le contexte de sécurité pour les permissions
- Nettoyer les données avant affichage

## Conclusion

Cet exemple démontre comment créer une vue utilisateur complète avec le système de vues Entidr. Le composant `ListView` fournit une base solide pour l'affichage et la gestion des données, tandis que le service `EntidrViewService` offre une API puissante pour la gestion des configurations de vue.

En suivant ce guide, vous avez appris à :
- Définir des types de données TypeScript
- Créer des services pour la gestion des données
- Configurer une vue avec des champs, filtres et actions
- Implémenter des formulaires avec validation
- Gérer l'état de l'application avec React hooks
- Intégrer le système de sécurité

Vous pouvez maintenant étendre cet exemple pour créer des vues plus complexes et adapter le système à vos besoins spécifiques.
