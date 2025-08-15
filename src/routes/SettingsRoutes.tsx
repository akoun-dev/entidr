import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import SettingsLayout from '../components/layouts/SettingsLayout';

const SettingsOverview = lazy(() => import('@/pages/settings/SettingsOverview').then(module => ({ default: module.default })));
const CompanySettings = lazy(() => import('@/pages/settings/CompanySettings').then(module => ({ default: module.default })));
const UsersSettings = lazy(() => {
  console.log('[DEBUG] Starting dynamic import of UsersSettings');
  return import('@/pages/settings/UsersSettings')
    .then(module => {
      console.log('[DEBUG] Successfully loaded UsersSettings module');
      return { default: module.default };
    })
    .catch(err => {
      console.error('[ERROR] Failed to load UsersSettings module:', {
        error: err,
        stack: err.stack,
        message: err.message
      });
      return {
        default: () => (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            Failed to load Users Settings - {err.message}
          </div>
        )
      };
    });
});
const GroupsSettings = lazy(() => import('@/pages/settings/GroupsSettings').then(module => ({ default: module.default })));
const LanguagesSettings = lazy(() => import('@/pages/settings/LanguagesSettings').then(module => ({ default: module.default })));
const CurrenciesSettings = lazy(() => import('@/pages/settings/CurrenciesSettings').then(module => ({ default: module.default })));
const CountriesSettings = lazy(() => import('@/pages/settings/CountriesSettings').then(module => ({ default: module.default })));
const TranslationsSettings = lazy(() => import('@/pages/settings/TranslationsSettings').then(module => ({ default: module.default })));
const DateFormatsSettings = lazy(() => import('@/pages/settings/DateFormatsSettings').then(module => ({ default: module.default })));
const TimeFormatsSettings = lazy(() => import('@/pages/settings/TimeFormatsSettings').then(module => ({ default: module.default })));
const NumberFormatsSettings = lazy(() => import('@/pages/settings/NumberFormatsSettings').then(module => ({ default: module.default })));
const DatabaseSettings = lazy(() => import('@/pages/settings/DatabaseSettings').then(module => ({ default: module.default })));
const EmailSettings = lazy(() => import('@/pages/settings/EmailSettings').then(module => ({ default: module.default })));
const SecuritySettings = lazy(() => import('@/pages/settings/SecuritySettings').then(module => ({ default: module.default })));
const AutomationSettings = lazy(() => import('@/pages/settings/AutomationSettings').then(module => ({ default: module.default })));
const ApiSettings = lazy(() => import('@/pages/settings/ApiSettings').then(module => ({ default: module.default })));
const LoggingSettings = lazy(() => import('@/pages/settings/LoggingSettings').then(module => ({ default: module.default })));
const ModulesListSettings = lazy(() => import('@/pages/settings/ModulesListSettings').then(module => ({ default: module.default })));
const AppsStoreSettings = lazy(() => import('@/pages/settings/AppsStoreSettings').then(module => ({ default: module.default })));
const UpdatesSettings = lazy(() => import('@/pages/settings/UpdatesSettings').then(module => ({ default: module.default })));
const DocumentLayoutsSettings = lazy(() => import('@/pages/settings/DocumentLayoutsSettings').then(module => ({ default: module.default })));
const ReportTemplatesSettings = lazy(() => import('@/pages/settings/ReportTemplatesSettings').then(module => ({ default: module.default })));
const PrintersSettings = lazy(() => import('@/pages/settings/PrintersSettings').then(module => ({ default: module.default })));
const PaymentProvidersSettings = lazy(() => import('@/pages/settings/PaymentProvidersSettings').then(module => ({ default: module.default })));
const ShippingMethodsSettings = lazy(() => import('@/pages/settings/ShippingMethodsSettings').then(module => ({ default: module.default })));
const ExternalServicesSettings = lazy(() => import('@/pages/settings/ExternalServicesSettings').then(module => ({ default: module.default })));
const NotificationSettings = lazy(() => import('@/pages/settings/NotificationSettings').then(module => ({ default: module.default })));
const AuditSettings = lazy(() => import('@/pages/settings/AuditSettings').then(module => ({ default: module.default })));
const BackupSettings = lazy(() => import('@/pages/settings/BackupSettings').then(module => ({ default: module.default })));
const AppearanceSettings = lazy(() => import('@/pages/settings/AppearanceSettings').then(module => ({ default: module.default })));
const WorkflowSettings = lazy(() => import('@/pages/settings/WorkflowSettings').then(module => ({ default: module.default })));
const ComplianceSettings = lazy(() => import('@/pages/settings/ComplianceSettings').then(module => ({ default: module.default })));
const ImportExportSettings = lazy(() => import('@/pages/settings/ImportExportSettings').then(module => ({ default: module.default })));
const CalendarSettings = lazy(() => import('@/pages/settings/CalendarSettings').then(module => ({ default: module.default })));
const SequenceSettings = lazy(() => import('@/pages/settings/SequenceSettings').then(module => ({ default: module.default })));
const PerformanceSettings = lazy(() => import('@/pages/settings/PerformanceSettings').then(module => ({ default: module.default })));

const settingsRoutes = [
  // General
  { path: 'general/company', Component: CompanySettings },
  { path: 'general/users', Component: UsersSettings },
  { path: 'general/groups', Component: GroupsSettings },
  
  // Localization
  { path: 'localization/languages', Component: LanguagesSettings },
  { path: 'localization/currencies', Component: CurrenciesSettings },
  { path: 'localization/countries', Component: CountriesSettings },
  { path: 'localization/translations', Component: TranslationsSettings },
  { path: 'localization/date-formats', Component: DateFormatsSettings },
  { path: 'localization/time-formats', Component: TimeFormatsSettings },
  { path: 'localization/number-formats', Component: NumberFormatsSettings },
  
  // System
  { path: 'system/database', Component: DatabaseSettings },
  { path: 'system/email', Component: EmailSettings },
  { path: 'system/security', Component: SecuritySettings },
  { path: 'system/automation', Component: AutomationSettings },
  { path: 'system/api', Component: ApiSettings },
  { path: 'system/logging', Component: LoggingSettings },
  { path: 'system/audit', Component: AuditSettings },
  { path: 'system/backup', Component: BackupSettings },
  
  // Modules
  { path: 'modules/list', Component: ModulesListSettings },
  { path: 'modules/store', Component: AppsStoreSettings },
  { path: 'modules/updates', Component: UpdatesSettings },
  
  // Documents
  { path: 'documents/layouts', Component: DocumentLayoutsSettings },
  { path: 'documents/templates', Component: ReportTemplatesSettings },
  { path: 'documents/printers', Component: PrintersSettings },

  // Appearance
  { path: 'appearance/themes', Component: AppearanceSettings },
  
  // Integrations
  { path: 'integrations/payments', Component: PaymentProvidersSettings },
  { path: 'integrations/shipping', Component: ShippingMethodsSettings },
  { path: 'integrations/external', Component: ExternalServicesSettings },
  { path: 'integrations/notifications', Component: NotificationSettings },
  
  // Workflows
  { path: 'workflows', Component: WorkflowSettings },
  
  // Compliance
  { path: 'compliance', Component: ComplianceSettings },
  
  // Data
  { path: 'data/import-export', Component: ImportExportSettings },
  
  // Calendar
  { path: 'calendar', Component: CalendarSettings },
  
  // Sequences
  { path: 'sequences', Component: SequenceSettings },
  
  // Performance
  { path: 'performance', Component: PerformanceSettings },
];

const renderLazy = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<div>Loading...</div>}>
    <Component />
  </Suspense>
);

const SettingsRoutes = (
  <Route path="settings" element={<SettingsLayout />}>
    <Route index element={renderLazy(SettingsOverview)} />
    {settingsRoutes.map(({ path, Component }) => (
      <Route key={path} path={path} element={renderLazy(Component)} />
    ))}
  </Route>
);

export default SettingsRoutes;

