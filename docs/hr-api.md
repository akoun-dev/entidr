# API du module HR

Racine: `/api/v1/hr`

Toutes les réponses suivent l'enveloppe `{ data, error }`.

## Employés
- GET `/employees?q=` → Employee[]
- GET `/employees/:id` → Employee
- POST `/employees` → Employee
- PUT `/employees/:id` → Employee
- DELETE `/employees/:id` → 204

## Départements
- GET `/departments` | `/directions` → Department[]
- GET `/departments/:id` | `/directions/:id` → Department
- POST `/departments` | `/directions` → Department
- PUT `/departments/:id` | `/directions/:id` → Department
- DELETE `/departments/:id` | `/directions/:id` → 204

## Contrats
- GET `/contracts?employee_id=&q=` → Contract[]
- GET `/contracts/:id` → Contract
- POST `/contracts` → Contract (name, employee_id, contract_type, date_start requis)
- PUT `/contracts/:id` → Contract
- DELETE `/contracts/:id` → 204

## Documents
- GET `/documents?employee_id=` → Document[]
- GET `/documents/:id` → Document
- POST `/documents` → Document (name, file_url requis)
- PUT `/documents/:id` → Document
- DELETE `/documents/:id` → 204

## Tâches On/Offboarding
- GET `/onboarding/tasks?employee_id=` → Task[]
- GET `/offboarding/tasks?employee_id=` → Task[]
- POST `/tasks` → Task (title, kind requis)
- PUT `/tasks/:id` → Task
- DELETE `/tasks/:id` → 204

## Workflows (RBAC: hr, admin)
- GET `/workflows` → Workflow[]
- POST `/workflows` → Workflow (name, kind requis)
- PUT `/workflows/:id` → Workflow
- DELETE `/workflows/:id` → 204

## Signatures (RBAC: hr, admin[, manager])
- GET `/signatures?employee_id=&document_id=` → SignatureRequest[]
- POST `/signatures` → SignatureRequest (document_id requis)
- POST `/signatures/:id/sign` → SignatureRequest (status=signed)

## Sécurité & Rôles (RBAC: hr, admin)
- GET `/security/roles` → Role[]
- GET `/security/roles/:id` → Role
- POST `/security/roles` → Role (name requis)
- PUT `/security/roles/:id` → Role
- DELETE `/security/roles/:id` → 204
- POST `/security/roles/:id/permissions` → Role (permission_id requis)
- DELETE `/security/roles/:roleId/permissions/:permissionId` → Role

### Permissions
- GET `/security/permissions` → Permission[]
- GET `/security/permissions/:id` → Permission
- POST `/security/permissions` → Permission (name, resource, action requis)
- PUT `/security/permissions/:id` → Permission
- DELETE `/security/permissions/:id` → 204

## Modèles & Types
- Employee: `id, name, job_title?, department_id?, work_email?, work_phone?, mobile_phone?, parent_id?, birth_date?, address?, employment_type?, hire_date?, notes?, active, created_at, updated_at`
- Department: `id, name, manager_id?, active, created_at, updated_at`
- Contract: `id, name, employee_id, contract_type, date_start, date_end?, wage?, state, notes?, created_at, updated_at`
- Document: `id, name, employee_id?, type?, file_url, mime_type?, size_bytes?, created_at, updated_at`
- Task: `id, employee_id?, kind, title, description?, assignee_role?, due_date?, status, completed_by?, completed_at?`
- Workflow: `id, name, kind, config?, active, created_at, updated_at`
- SignatureRequest: `id, document_id, employee_id?, provider, status, token?, signed_at?, created_at, updated_at`
- Role: `id, name, description?, permissions[], active, created_at, updated_at`
- Permission: `id, name, resource, action, description?, created_at, updated_at`

RBAC basique via middleware `allow(roles)` (à durcir en prod via auth globale).

