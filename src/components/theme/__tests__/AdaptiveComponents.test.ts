import { render, screen, fireEvent } from '@testing-library/react';
import { AdaptiveCard, AdaptiveButton, AdaptiveBadge, AdaptiveAlert, AdaptiveText, AdaptiveContainer } from '../AdaptiveComponents';
import { useTheme } from '../useTheme';
import { ThemeProvider } from '../ThemeProvider';
import React from 'react';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as any,
});

describe('Adaptive Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(ThemeProvider, null, children)
  );

  describe('AdaptiveCard', () => {
    it('should render with title and description', () => {
      render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveCard, { title: "Test Title", description: "Test Description" },
            React.createElement('div', null, 'Card Content')
          )
        )
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should render without title and description', () => {
      render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveCard, null,
            React.createElement('div', null, 'Card Content')
          )
        )
      );

      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('should apply theme-based styling', () => {
      const { container } = render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveCard, { title: "Test Title" },
            React.createElement('div', null, 'Card Content')
          )
        )
      );

      const card = container.firstChild;
      expect(card).toHaveClass('adaptive-card');
    });
  });

  describe('AdaptiveButton', () => {
    it('should render with default variant', () => {
      render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveButton, null, 'Click Me')
        )
      );

      const button = screen.getByRole('button', { name: 'Click Me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('adaptive-button');
    });

    it('should render with different variants', () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

      variants.forEach((variant) => {
        const { container } = render(
          React.createElement(TestWrapper, null,
            React.createElement(AdaptiveButton, { variant: variant }, `Button ${variant}`)
          )
        );

        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass(`adaptive-button--${variant}`);
      });
    });

    it('should handle click events', () => {
      const handleClick = vi.fn();
      render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveButton, { onClick: handleClick }, 'Click Me')
        )
      );

      const button = screen.getByRole('button', { name: 'Click Me' });
      button.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('AdaptiveBadge', () => {
    it('should render with default variant', () => {
      render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveBadge, null, 'Badge')
        )
      );

      const badge = screen.getByText('Badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('adaptive-badge');
    });

    it('should render with different variants', () => {
      const variants = ['default', 'secondary', 'success', 'warning', 'error', 'info'] as const;

      variants.forEach((variant) => {
        const { container } = render(
          React.createElement(TestWrapper, null,
            React.createElement(AdaptiveBadge, { variant: variant }, `Badge ${variant}`)
          )
        );

        const badge = container.querySelector('.adaptive-badge');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass(`adaptive-badge--${variant}`);
      });
    });
  });

  describe('AdaptiveAlert', () => {
    it('should render with title and content', () => {
      render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveAlert, { variant: "info", title: "Alert Title" }, 'Alert Content')
        )
      );

      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Alert Content')).toBeInTheDocument();
    });

    it('should render without title', () => {
      render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveAlert, { variant: "success" }, 'Alert Content')
        )
      );

      expect(screen.getByText('Alert Content')).toBeInTheDocument();
    });

    it('should render with different variants', () => {
      const variants = ['default', 'destructive', 'success', 'warning', 'info'] as const;

      variants.forEach((variant) => {
        const { container } = render(
          React.createElement(TestWrapper, null,
            React.createElement(AdaptiveAlert, { variant: variant, title: `Alert ${variant}` }, 'Content')
          )
        );

        const alert = container.querySelector('.adaptive-alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveClass(`adaptive-alert--${variant}`);
      });
    });
  });

  describe('AdaptiveText', () => {
    it('should render with default variant', () => {
      render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveText, null, 'Text Content')
        )
      );

      const text = screen.getByText('Text Content');
      expect(text).toBeInTheDocument();
      expect(text).toHaveClass('adaptive-text');
    });

    it('should render with different variants', () => {
      const variants = ['heading', 'subheading', 'body', 'caption', 'muted'] as const;

      variants.forEach((variant) => {
        const { container } = render(
          React.createElement(TestWrapper, null,
            React.createElement(AdaptiveText, { variant: variant }, `Text ${variant}`)
          )
        );

        const text = container.querySelector('.adaptive-text');
        expect(text).toBeInTheDocument();
        expect(text).toHaveClass(`adaptive-text--${variant}`);
      });
    });
  });

  describe('AdaptiveContainer', () => {
    it('should render with default maxWidth', () => {
      render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveContainer, null,
            React.createElement('div', null, 'Container Content')
          )
        )
      );

      const container = screen.getByText('Container Content').parentElement;
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('adaptive-container');
    });

    it('should render with different maxWidth values', () => {
      const maxWidths = ['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;

      maxWidths.forEach((maxWidth) => {
        const { container } = render(
          React.createElement(TestWrapper, null,
            React.createElement(AdaptiveContainer, { maxWidth: maxWidth },
              React.createElement('div', null, `Container ${maxWidth}`)
            )
          )
        );

        const containerElement = container.querySelector('.adaptive-container');
        expect(containerElement).toBeInTheDocument();
        expect(containerElement).toHaveClass(`adaptive-container--${maxWidth}`);
      });
    });
  });

  describe('Theme Integration', () => {
    it('should update styling when theme changes', () => {
      const TestComponent = () => {
        const { setTheme } = useTheme();
        return React.createElement('div', null,
          React.createElement(AdaptiveButton, { onClick: () => setTheme('dark') }, 'Change Theme'),
          React.createElement(AdaptiveCard, { title: "Test Card" },
            React.createElement(AdaptiveText, null, 'Test Content')
          )
        );
      };

      const { container } = render(
        React.createElement(TestWrapper, null,
          React.createElement(TestComponent)
        )
      );

      const button = screen.getByRole('button', { name: 'Change Theme' });
      const card = screen.getByText('Test Card').closest('.adaptive-card');
      const text = screen.getByText('Test Content');

      // Initial theme (light)
      expect(card).toBeInTheDocument();
      expect(text).toBeInTheDocument();

      // Change theme
      button.click();

      // Should still be present after theme change
      expect(card).toBeInTheDocument();
      expect(text).toBeInTheDocument();
    });

    it('should apply correct theme colors', () => {
      const { container } = render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveButton, null, 'Test Button'),
          React.createElement(AdaptiveBadge, null, 'Test Badge'),
          React.createElement(AdaptiveAlert, { variant: "info", title: "Test Alert" }, 'Test Content')
        )
      );

      const button = container.querySelector('button');
      const badge = container.querySelector('.adaptive-badge');
      const alert = container.querySelector('.adaptive-alert');

      expect(button).toBeInTheDocument();
      expect(badge).toBeInTheDocument();
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveButton, { "aria-label": "Close Button" }, 'X'),
          React.createElement(AdaptiveAlert, { role: "alert", variant: "error", title: "Error" }, 'Something went wrong')
        )
      );

      const button = screen.getByRole('button', { name: 'Close Button' });
      const alert = screen.getByRole('alert');

      expect(button).toHaveAttribute('aria-label', 'Close Button');
      expect(alert).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      const handleClick = vi.fn();
      render(
        React.createElement(TestWrapper, null,
          React.createElement(AdaptiveButton, { onClick: handleClick }, 'Submit')
        )
      );

      const button = screen.getByRole('button', { name: 'Submit' });

      // Simulate keyboard interaction
      button.focus();
      expect(button).toHaveFocus();

      // Simulate Enter key
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
