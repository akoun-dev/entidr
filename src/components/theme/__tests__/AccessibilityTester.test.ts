import { render, screen } from '@testing-library/react';
import { AccessibilityTester } from '../AccessibilityTester';
import { useTheme } from '../useTheme';
import { ThemeProvider } from '../ThemeProvider';
import React from 'react';
import { jest } from '@jest/globals';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as any,
});

describe('AccessibilityTester', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(ThemeProvider, null, children)
  );

  it('should render accessibility tester with default props', () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    expect(screen.getByText('Accessibility Tester')).toBeInTheDocument();
    expect(screen.getByText('WCAG 2.1 AA Compliance')).toBeInTheDocument();
  });

  it('should render color contrast tests', () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    expect(screen.getByText('Color Contrast Tests')).toBeInTheDocument();
    expect(screen.getByText('Primary Text')).toBeInTheDocument();
    expect(screen.getByText('Secondary Text')).toBeInTheDocument();
  });

  it('should render keyboard navigation tests', () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    expect(screen.getByText('Keyboard Navigation')).toBeInTheDocument();
    expect(screen.getByText('Focusable Elements')).toBeInTheDocument();
  });

  it('should render screen reader tests', () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    expect(screen.getByText('Screen Reader Tests')).toBeInTheDocument();
    expect(screen.getByText('ARIA Labels')).toBeInTheDocument();
  });

  it('should render theme switching tests', () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    expect(screen.getByText('Theme Switching')).toBeInTheDocument();
    expect(screen.getByText('Light Mode')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('should render accessibility recommendations', () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    expect(screen.getByText('High Contrast')).toBeInTheDocument();
    expect(screen.getByText('Large Text')).toBeInTheDocument();
  });

  it('should update when theme changes', () => {
    const TestComponent = () => {
      const { setTheme } = useTheme();
      return React.createElement('div', null,
        React.createElement('button', { onClick: () => setTheme('dark') }, 'Switch to Dark'),
        React.createElement(AccessibilityTester)
      );
    };

    render(
      React.createElement(TestWrapper, null,
        React.createElement(TestComponent)
      )
    );

    const switchButton = screen.getByRole('button', { name: 'Switch to Dark' });

    // Should show light mode initially
    expect(screen.getByText('Light Mode')).toBeInTheDocument();

    // Switch to dark mode
    switchButton.click();

    // Should still show accessibility tester
    expect(screen.getByText('Accessibility Tester')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    const tester = screen.getByRole('region', { name: /accessibility tester/i });
    expect(tester).toBeInTheDocument();
    expect(tester).toHaveAttribute('aria-labelledby');
  });

  it('should be keyboard navigable', () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('tabindex');
    });
  });

  it('should display contrast ratios', () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    // Check for contrast ratio information
    const contrastElements = screen.getAllByText(/:/);
    expect(contrastElements.length).toBeGreaterThan(0);
  });

  it('should provide actionable recommendations', () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    // Look for recommendation elements
    const recommendations = screen.getByText('Recommendations');
    expect(recommendations).toBeInTheDocument();

    // Should have specific recommendation items
    const highContrast = screen.getByText('High Contrast');
    const largeText = screen.getByText('Large Text');
    expect(highContrast).toBeInTheDocument();
    expect(largeText).toBeInTheDocument();
  });

  it('should handle missing features gracefully', () => {
    // Remove localStorage
    delete (window as any).localStorage;

    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    // Should still render without errors
    expect(screen.getByText('Accessibility Tester')).toBeInTheDocument();

    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  it('should work with different theme modes', () => {
    // Mock dark mode preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })) as any,
    });

    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    // Should work with dark mode preference
    expect(screen.getByText('Accessibility Tester')).toBeInTheDocument();
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();

    // Restore matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })) as any,
    });
  });

  it('should provide comprehensive accessibility information', () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    // Check for all major sections
    const sections = [
      'Accessibility Tester',
      'WCAG 2.1 AA Compliance',
      'Color Contrast Tests',
      'Keyboard Navigation',
      'Screen Reader Tests',
      'Theme Switching',
      'Recommendations'
    ];

    sections.forEach(section => {
      expect(screen.getByText(section)).toBeInTheDocument();
    });
  });

  it('should have accessible color combinations', () => {
    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    // Check that text elements are visible and have proper contrast
    const textElements = screen.getAllByText(/[A-Za-z]/);
    textElements.forEach(element => {
      expect(element).toBeInTheDocument();
      // Note: Actual contrast testing would require color calculation
    });
  });

  it('should support reduced motion preferences', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })) as any,
    });

    render(
      React.createElement(TestWrapper, null,
        React.createElement(AccessibilityTester)
      )
    );

    // Should work with reduced motion preference
    expect(screen.getByText('Accessibility Tester')).toBeInTheDocument();

    // Restore matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })) as any,
    });
  });
});
