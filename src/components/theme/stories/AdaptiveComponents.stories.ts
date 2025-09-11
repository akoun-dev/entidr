import React from 'react';
import { AdaptiveCard, AdaptiveButton, AdaptiveBadge, AdaptiveAlert, AdaptiveText, AdaptiveContainer } from '../AdaptiveComponents';
import { useTheme } from '../useTheme';

export default {
  title: 'Theme/Adaptive Components',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

// Template pour les stories avec contrôle de thème
const ThemeTemplate = (Story: React.FC) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTheme('light')}
          className={`px-3 py-1 rounded ${theme.appliedTheme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`px-3 py-1 rounded ${theme.appliedTheme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Dark
        </button>
        <button
          onClick={() => setTheme('auto')}
          className={`px-3 py-1 rounded ${theme.currentTheme === 'auto' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Auto
        </button>
      </div>
      <Story />
    </div>
  );
};

export const AdaptiveCardStory = {
  render: () => (
    <AdaptiveCard title="Card Title" description="Card description">
      <p>This is the card content. It adapts to the current theme.</p>
      <AdaptiveButton className="mt-2">Action</AdaptiveButton>
    </AdaptiveCard>
  ),
  name: 'AdaptiveCard',
  decorators: [ThemeTemplate],
};

export const AdaptiveButtonVariants = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <AdaptiveButton>Default</AdaptiveButton>
      <AdaptiveButton variant="destructive">Destructive</AdaptiveButton>
      <AdaptiveButton variant="outline">Outline</AdaptiveButton>
      <AdaptiveButton variant="secondary">Secondary</AdaptiveButton>
      <AdaptiveButton variant="ghost">Ghost</AdaptiveButton>
      <AdaptiveButton variant="link">Link</AdaptiveButton>
    </div>
  ),
  name: 'AdaptiveButton - All Variants',
  decorators: [ThemeTemplate],
};

export const AdaptiveBadgeVariants = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <AdaptiveBadge>Default</AdaptiveBadge>
      <AdaptiveBadge variant="secondary">Secondary</AdaptiveBadge>
      <AdaptiveBadge variant="success">Success</AdaptiveBadge>
      <AdaptiveBadge variant="warning">Warning</AdaptiveBadge>
      <AdaptiveBadge variant="info">Info</AdaptiveBadge>
    </div>
  ),
  name: 'AdaptiveBadge - All Variants',
  decorators: [ThemeTemplate],
};

export const AdaptiveAlertVariants = {
  render: () => (
    <div className="space-y-4 w-96">
      <AdaptiveAlert variant="default" title="Information">
        This is an informational alert.
      </AdaptiveAlert>
      <AdaptiveAlert variant="success" title="Success">
        The operation was successful!
      </AdaptiveAlert>
      <AdaptiveAlert variant="warning" title="Warning">
        Please review this information.
      </AdaptiveAlert>
    </div>
  ),
  name: 'AdaptiveAlert - All Variants',
  decorators: [ThemeTemplate],
};

export const AdaptiveTextVariants = {
  render: () => (
    <div className="space-y-2">
      <AdaptiveText variant="heading">Heading Text</AdaptiveText>
      <AdaptiveText variant="subheading">Subheading Text</AdaptiveText>
      <AdaptiveText variant="body">Body text - This is the main content text.</AdaptiveText>
      <AdaptiveText variant="caption">Caption text - smaller text for labels.</AdaptiveText>
      <AdaptiveText variant="muted">Muted text - less prominent information.</AdaptiveText>
    </div>
  ),
  name: 'AdaptiveText - All Variants',
  decorators: [ThemeTemplate],
};

export const AdaptiveContainerSizes = {
  render: () => (
    <div className="space-y-4">
      <AdaptiveContainer maxWidth="sm">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          Small Container (max-w-sm)
        </div>
      </AdaptiveContainer>
      <AdaptiveContainer maxWidth="md">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          Medium Container (max-w-md)
        </div>
      </AdaptiveContainer>
      <AdaptiveContainer maxWidth="lg">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          Large Container (max-w-lg)
        </div>
      </AdaptiveContainer>
      <AdaptiveContainer maxWidth="full">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          Full Width Container (max-w-full)
        </div>
      </AdaptiveContainer>
    </div>
  ),
  name: 'AdaptiveContainer - All Sizes',
  decorators: [ThemeTemplate],
};

export const ThemeComparison = {
  render: () => (
    <div className="space-y-6">
      <AdaptiveCard title="Theme Comparison">
        <p>This card shows how components adapt to different themes.</p>
        <div className="mt-4 space-y-4">
          <div>
            <AdaptiveText variant="subheading">Buttons</AdaptiveText>
            <div className="flex gap-2 mt-2">
              <AdaptiveButton>Primary</AdaptiveButton>
              <AdaptiveButton variant="outline">Outline</AdaptiveButton>
            </div>
          </div>
          <div>
            <AdaptiveText variant="subheading">Badges</AdaptiveText>
            <div className="flex gap-2 mt-2">
              <AdaptiveBadge>Default</AdaptiveBadge>
              <AdaptiveBadge variant="success">Success</AdaptiveBadge>
            </div>
          </div>
          <div>
            <AdaptiveText variant="subheading">Alerts</AdaptiveText>
            <div className="mt-2">
              <AdaptiveAlert variant="info" title="Info">
                This is an informational alert.
              </AdaptiveAlert>
            </div>
          </div>
        </div>
      </AdaptiveCard>
    </div>
  ),
  name: 'Theme Comparison',
  decorators: [ThemeTemplate],
};

export const AccessibilityExample = {
  render: () => (
    <div className="space-y-4">
      <AdaptiveCard title="Accessibility Features">
        <AdaptiveText variant="body">
          This system includes several accessibility features:
        </AdaptiveText>
        <ul className="list-disc list-inside space-y-1">
          <li><AdaptiveText variant="body">High contrast ratios (WCAG AA compliant)</AdaptiveText></li>
          <li><AdaptiveText variant="body">Reduced eye strain in dark mode</AdaptiveText></li>
          <li><AdaptiveText variant="body">Optimized font sizes and spacing</AdaptiveText></li>
          <li><AdaptiveText variant="body">Keyboard navigation support</AdaptiveText></li>
        </ul>
        <div className="mt-4">
          <AdaptiveAlert variant="success" title="Accessibility Optimized">
            All components meet WCAG 2.1 AA standards for contrast and readability.
          </AdaptiveAlert>
        </div>
      </AdaptiveCard>
    </div>
  ),
  name: 'Accessibility Example',
  decorators: [ThemeTemplate],
};
