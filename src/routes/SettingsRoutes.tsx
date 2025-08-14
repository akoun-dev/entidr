import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import SettingsLayout from '../components/layouts/SettingsLayout';

const SettingsOverview = lazy(() => import('../pages/settings/SettingsOverview'));
const CompanySettings = lazy(() => import('../pages/settings/CompanySettings'));
const UsersSettings = lazy(() => import('../pages/settings/UsersSettings'));
const GroupsSettings = lazy(() => import('../pages/settings/GroupsSettings'));
const LanguagesSettings = lazy(() => import('../pages/settings/LanguagesSettings'));
const CurrenciesSettings = lazy(() => import('../pages/settings/CurrenciesSettings'));
const CountriesSettings = lazy(() => import('../pages/settings/CountriesSettings'));
const TranslationsSettings = lazy(() => import('../pages/settings/TranslationsSettings'));
const DateFormatsSettings = lazy(() => import('../pages/settings/DateFormatsSettings'));
const TimeFormatsSettings = lazy(() => import('../pages/settings/TimeFormatsSettings'));
const NumberFormatsSettings = lazy(() => import('../pages/settings/NumberFormatsSettings'));
const DatabaseSettings = lazy(() => import('../pages/settings/DatabaseSettings'));
const EmailSettings = lazy(() => import('../pages/settings/EmailSettings'));
const SecuritySettings = lazy(() => import('../pages/settings/SecuritySettings'));
const AutomationSettings = lazy(() => import('../pages/settings/AutomationSettings'));
const ApiSettings = lazy(() => import('../pages/settings/ApiSettings'));
const LoggingSettings = lazy(() => import('../pages/settings/LoggingSettings'));
const ModulesListSettings = lazy(() => import('../pages/settings/ModulesListSettings'));
const AppsStoreSettings = lazy(() => import('../pages/settings/AppsStoreSettings'));
const UpdatesSettings = lazy(() => import('../pages/settings/UpdatesSettings'));
const DocumentLayoutsSettings = lazy(() => import('../pages/settings/DocumentLayoutsSettings'));
const ReportTemplatesSettings = lazy(() => import('../pages/settings/ReportTemplatesSettings'));
const PrintersSettings = lazy(() => import('../pages/settings/PrintersSettings'));
const PaymentProvidersSettings = lazy(() => import('../pages/settings/PaymentProvidersSettings'));
const ShippingMethodsSettings = lazy(() => import('../pages/settings/ShippingMethodsSettings'));
const ExternalServicesSettings = lazy(() => import('../pages/settings/ExternalServicesSettings'));
const NotificationSettings = lazy(() => import('../pages/settings/NotificationSettings'));
const AuditSettings = lazy(() => import('../pages/settings/AuditSettings'));
const BackupSettings = lazy(() => import('../pages/settings/BackupSettings'));
const AppearanceSettings = lazy(() => import('../pages/settings/AppearanceSettings'));
const WorkflowSettings = lazy(() => import('../pages/settings/WorkflowSettings'));
const ComplianceSettings = lazy(() => import('../pages/settings/ComplianceSettings'));
const ImportExportSettings = lazy(() => import('../pages/settings/ImportExportSettings'));
const CalendarSettings = lazy(() => import('../pages/settings/CalendarSettings'));
const SequenceSettings = lazy(() => import('../pages/settings/SequenceSettings'));
const PerformanceSettings = lazy(() => import('../pages/settings/PerformanceSettings'));

const settingsRoutes = [
  { path: 'company', Component: CompanySettings },
  { path: 'users', Component: UsersSettings },
  { path: 'groups', Component: GroupsSettings },
  { path: 'languages', Component: LanguagesSettings },
  { path: 'currencies', Component: CurrenciesSettings },
  { path: 'countries', Component: CountriesSettings },
  { path: 'translations', Component: TranslationsSettings },
  { path: 'date-formats', Component: DateFormatsSettings },
  { path: 'time-formats', Component: TimeFormatsSettings },
  { path: 'number-formats', Component: NumberFormatsSettings },
  { path: 'database', Component: DatabaseSettings },
  { path: 'email', Component: EmailSettings },
  { path: 'security', Component: SecuritySettings },
  { path: 'automation', Component: AutomationSettings },
  { path: 'api', Component: ApiSettings },
  { path: 'logging', Component: LoggingSettings },
  { path: 'modules-list', Component: ModulesListSettings },
  { path: 'apps-store', Component: AppsStoreSettings },
  { path: 'updates', Component: UpdatesSettings },
  { path: 'document-layouts', Component: DocumentLayoutsSettings },
  { path: 'report-templates', Component: ReportTemplatesSettings },
  { path: 'printers', Component: PrintersSettings },
  { path: 'payment-providers', Component: PaymentProvidersSettings },
  { path: 'shipping-methods', Component: ShippingMethodsSettings },
  { path: 'external-services', Component: ExternalServicesSettings },
  { path: 'notifications', Component: NotificationSettings },
  { path: 'audit', Component: AuditSettings },
  { path: 'backup', Component: BackupSettings },
  { path: 'appearance', Component: AppearanceSettings },
  { path: 'workflows', Component: WorkflowSettings },
  { path: 'compliance', Component: ComplianceSettings },
  { path: 'import-export', Component: ImportExportSettings },
  { path: 'calendar', Component: CalendarSettings },
  { path: 'sequences', Component: SequenceSettings },
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

