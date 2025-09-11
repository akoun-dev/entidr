import { renderHook, act, render, screen } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { ThemeProvider } from '../ThemeProvider';
import { AdaptiveCard, AdaptiveButton, AdaptiveBadge, AdaptiveAlert, AdaptiveText, AdaptiveContainer } from '../AdaptiveComponents';
import React from 'react';

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
  })),
});

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(ThemeProvider, null, children)
  );

  describe('Theme Switching Performance', () => {
    it('should switch themes quickly (< 16ms)', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const startTime = performance.now();

      act(() => {
        result.current.setTheme('dark');
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(16); // 60fps target
      expect(result.current.theme.currentTheme).toBe('dark');
    });

    it('should handle rapid theme changes', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const startTime = performance.now();

      // Rapid theme changes
      act(() => {
        result.current.setTheme('dark');
      });
      act(() => {
        result.current.setTheme('light');
      });
      act(() => {
        result.current.setTheme('auto');
      });
      act(() => {
        result.current.setTheme('dark');
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(64); // 4 changes at 16ms each
      expect(result.current.theme.currentTheme).toBe('dark');
    });

    it('should maintain performance with localStorage persistence', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const startTime = performance.now();

      act(() => {
        result.current.setTheme('dark');
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(16);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('Color Retrieval Performance', () => {
    it('should retrieve colors quickly (< 1ms)', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const startTime = performance.now();

      const colors = [
        result.current.getColor('primary'),
        result.current.getColor('secondary'),
        result.current.getColor('background'),
        result.current.getColor('text'),
        result.current.getColor('border'),
      ];

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1);
      expect(colors).toHaveLength(5);
      colors.forEach(color => {
        expect(color).toBeDefined();
        expect(typeof color).toBe('string');
      });
    });

    it('should handle bulk color retrieval efficiently', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const colorKeys = [
        'primary', 'secondary', 'success', 'warning', 'error', 'info',
        'background', 'card', 'dialog', 'text', 'textSecondary', 'textInverse',
        'accent', 'neutral', 'border', 'borderLight', 'borderStrong',
        'hover', 'active', 'focus', 'selected',
        'shadow', 'shadowLight', 'shadowStrong'
      ] as const;

      const startTime = performance.now();

      const colors = colorKeys.map(key => result.current.getColor(key));

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5); // Should be very fast
      expect(colors).toHaveLength(colorKeys.length);
      colors.forEach(color => {
        expect(color).toBeDefined();
        expect(typeof color).toBe('string');
      });
    });

    it('should update colors efficiently on theme change', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // Get colors in light theme
      const lightColors = [
        result.current.getColor('primary'),
        result.current.getColor('background'),
        result.current.getColor('text'),
      ];

      const startTime = performance.now();

      // Switch theme and get colors
      act(() => {
        result.current.setTheme('dark');
      });

      const darkColors = [
        result.current.getColor('primary'),
        result.current.getColor('background'),
        result.current.getColor('text'),
      ];

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(16);
      expect(darkColors).toHaveLength(3);

      // Colors should be different
      darkColors.forEach((darkColor, index) => {
        expect(darkColor).not.toBe(lightColors[index]);
      });
    });
  });

  describe('Font Retrieval Performance', () => {
    it('should retrieve fonts quickly (< 1ms)', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const startTime = performance.now();

      const fonts = [
        result.current.getFont('sans'),
        result.current.getFont('serif'),
        result.current.getFont('mono'),
        result.current.getFont('base'),
        result.current.getFont('lineHeightNormal'),
      ];

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1);
      expect(fonts).toHaveLength(5);
      fonts.forEach(font => {
        expect(font).toBeDefined();
        expect(typeof font).toBe('string');
      });
    });

    it('should handle bulk font retrieval efficiently', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const fontKeys = [
        'sans', 'serif', 'mono',
        'base', 'sm', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl',
        'lineHeightTight', 'lineHeightNormal',
        'lineHeightRelaxed', 'lineHeightLoose'
      ] as const;

      const startTime = performance.now();

      const fonts = fontKeys.map(key => result.current.getFont(key));

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(3);
      expect(fonts).toHaveLength(fontKeys.length);
      fonts.forEach(font => {
        expect(font).toBeDefined();
        expect(typeof font).toBe('string');
      });
    });
  });

  describe('Spacing Retrieval Performance', () => {
    it('should retrieve spacing values quickly (< 1ms)', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const startTime = performance.now();

      const spacing = [
        result.current.getSpacing('xs' as any),
        result.current.getSpacing('sm' as any),
        result.current.getSpacing('md' as any),
        result.current.getSpacing('lg' as any),
        result.current.getSpacing('xl' as any),
      ];

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1);
      expect(spacing).toHaveLength(5);
      spacing.forEach(value => {
        expect(value).toBeDefined();
        expect(typeof value).toBe('string');
      });
    });

    it('should handle bulk spacing retrieval efficiently', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const spacingKeys = [
        'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl',
        'px', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6',
        '7', '8', '9', '10', '11', '12'
      ] as const;

      const startTime = performance.now();

      const spacing = spacingKeys.map(key => result.current.getSpacing(key as any));

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(3);
      expect(spacing).toHaveLength(spacingKeys.length);
      spacing.forEach(value => {
        expect(value).toBeDefined();
        expect(typeof value).toBe('string');
      });
    });
  });

  describe('Component Rendering Performance', () => {
    it('should render components quickly', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const TestComponent = () => (
        React.createElement('div', null,
          React.createElement(AdaptiveCard, { title: "Performance Test", children: [
            React.createElement(AdaptiveText, { variant: "heading", children: "Heading" }),
            React.createElement(AdaptiveText, { variant: "body", children: "Body text" }),
            React.createElement(AdaptiveButton, { children: "Click Me" }),
            React.createElement(AdaptiveBadge, { children: "Badge" })
          ] })
        )
      );

      const startTime = performance.now();

      const { container, unmount } = render(
        React.createElement(wrapper, null,
          React.createElement(TestComponent)
        )
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50); // Should render quickly

      // Verify components are rendered
      expect(screen.getByText('Performance Test')).toBeDefined();
      expect(screen.getByText('Heading')).toBeDefined();
      expect(screen.getByText('Body text')).toBeDefined();
      expect(screen.getByText('Click Me')).toBeDefined();
      expect(screen.getByText('Badge')).toBeDefined();

      unmount();
    });

    it('should handle re-renders efficiently', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        const { theme } = useTheme();
        return React.createElement(AdaptiveCard, { title: `Render Count: ${renderCount}`, children: [
          React.createElement(AdaptiveText, { children: `Current theme: ${theme.currentTheme}` })
        ] });
      };

      const { unmount } = render(
        React.createElement(wrapper, null,
          React.createElement(TestComponent)
        )
      );

      const initialCount = renderCount;

      // Change theme multiple times
      act(() => {
        result.current.setTheme('dark');
      });
      act(() => {
        result.current.setTheme('light');
      });
      act(() => {
        result.current.setTheme('dark');
      });

      // Should not re-render excessively
      expect(renderCount).toBeLessThan(initialCount + 10);

      unmount();
    });

    it('should render many components efficiently', () => {
      const TestComponent = () => (
        React.createElement('div', null,
          Array.from({ length: 100 }, (_, i) => (
            React.createElement(AdaptiveCard, { key: i, title: `Card ${i}`, children: [
              React.createElement(AdaptiveText, { children: `Content ${i}` }),
              React.createElement(AdaptiveButton, { variant: "outline", children: `Button ${i}` }),
              React.createElement(AdaptiveBadge, { variant: "secondary", children: `Badge ${i}` })
            ] })
          ))
        )
      );

      const startTime = performance.now();

      const { container, unmount } = render(
        React.createElement(wrapper, null,
          React.createElement(TestComponent)
        )
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200); // Should handle 100 components efficiently

      // Verify all components are rendered
      expect(container.querySelectorAll('.adaptive-card')).toHaveLength(100);
      expect(container.querySelectorAll('.adaptive-text')).toHaveLength(100);
      expect(container.querySelectorAll('.adaptive-button')).toHaveLength(100);
      expect(container.querySelectorAll('.adaptive-badge')).toHaveLength(100);

      unmount();
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not leak memory on theme changes', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const initialMemory = (performance as any).memory?.usedJSHeapSize;

      // Perform many theme changes
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.setTheme(i % 2 === 0 ? 'light' : 'dark');
        });
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize;

      // Memory should not increase significantly
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB increase
      }
    });

    it('should reuse theme objects efficiently', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const theme1 = result.current.theme;

      // Should return same object reference when unchanged
      const theme2 = result.current.theme;
      expect(theme1).toBe(theme2);

      act(() => {
        result.current.setTheme('dark');
      });

      const theme3 = result.current.theme;

      // Should return new object reference when changed
      expect(theme3).not.toBe(theme1);

      act(() => {
        result.current.setTheme('light');
      });

      const theme4 = result.current.theme;

      // Should return new object reference when changed back
      expect(theme4).not.toBe(theme3);
      expect(theme4).not.toBe(theme1); // May or may not be same as theme1
    });
  });

  describe('Initialization Performance', () => {
    it('should initialize quickly', () => {
      const startTime = performance.now();

      const { result } = renderHook(() => useTheme(), { wrapper });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10); // Should initialize very quickly
      expect(result.current.theme).toBeDefined();
      expect(result.current.theme.currentTheme).toBe('light');
    });

    it('should initialize with localStorage quickly', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const startTime = performance.now();

      const { result } = renderHook(() => useTheme(), { wrapper });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10);
      expect(result.current.theme.currentTheme).toBe('dark');
    });

    it('should initialize without dependencies quickly', () => {
      // Remove localStorage and matchMedia
      delete (window as any).localStorage;
      delete (window as any).matchMedia;

      const startTime = performance.now();

      const { result } = renderHook(() => useTheme(), { wrapper });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10);
      expect(result.current.theme).toBeDefined();
      expect(result.current.theme.currentTheme).toBe('light');

      // Restore dependencies
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
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
        })),
      });
    });
  });
});
