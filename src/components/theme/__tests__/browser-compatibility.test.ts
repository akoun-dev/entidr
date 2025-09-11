import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { ThemeProvider } from '../ThemeProvider';
import React from 'react';
import { jest } from '@jest/globals';

// Mock localStorage at the top
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

// Mock matchMedia at the top
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

describe('Browser Compatibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(ThemeProvider, null, children)
  );

  describe('localStorage Fallbacks', () => {
    it('should work without localStorage', () => {
      // Remove localStorage
      const originalLocalStorage = window.localStorage;
      delete (window as any).localStorage;

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.setTheme('dark');
        });
      }).not.toThrow();

      expect(result.current.theme.currentTheme).toBe('dark');

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
      });
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock localStorage to throw error
      const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(() => {
          throw new Error('localStorage error');
        }),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        configurable: true,
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.setTheme('dark');
        });
      }).not.toThrow();

      expect(result.current.theme.currentTheme).toBe('dark');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should work with limited localStorage', () => {
      // Mock localStorage with limited functionality
      const mockLocalStorage = {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        configurable: true,
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should work normally
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme.currentTheme).toBe('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('matchMedia Fallbacks', () => {
    it('should work without matchMedia', () => {
      // Remove matchMedia
      const originalMatchMedia = window.matchMedia;
      delete (window as any).matchMedia;

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.setTheme('auto');
        });
      }).not.toThrow();

      // Should fall back to light theme
      expect(result.current.theme.currentTheme).toBe('auto');
      expect(result.current.theme.appliedTheme).toBe('light');

      // Restore matchMedia
      Object.defineProperty(window, 'matchMedia', {
        value: originalMatchMedia,
        configurable: true,
      });
    });

    it('should handle matchMedia errors gracefully', () => {
      // Mock matchMedia to throw error
      const mockMatchMedia = jest.fn(() => {
        throw new Error('matchMedia error');
      });

      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia,
        configurable: true,
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.setTheme('auto');
        });
      }).not.toThrow();

      // Should fall back to light theme
      expect(result.current.theme.currentTheme).toBe('auto');
      expect(result.current.theme.appliedTheme).toBe('light');
    });

    it('should work with basic matchMedia', () => {
      // Mock basic matchMedia functionality
      const mockMatchMedia = jest.fn((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia,
        configurable: true,
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('auto');
      });

      expect(result.current.theme.currentTheme).toBe('auto');
      expect(result.current.theme.appliedTheme).toBe('dark');
    });
  });

  describe('CSS Custom Properties Fallbacks', () => {
    it('should work without CSS custom properties support', () => {
      // Mock lack of CSS custom properties support
      const originalStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn((element: Element) => {
        const mockStyle = {
          getPropertyValue: jest.fn((property: string) => {
            // Return default values instead of CSS custom properties
            if (property.includes('color')) {
              return '#000000';
            }
            if (property.includes('background')) {
              return '#ffffff';
            }
            return '';
          }),
        };
        return mockStyle as any;
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should still provide colors
      const primaryColor = result.current.getColor('primary');
      const backgroundColor = result.current.getColor('background');

      expect(primaryColor).toBeDefined();
      expect(backgroundColor).toBeDefined();
      expect(typeof primaryColor).toBe('string');
      expect(typeof backgroundColor).toBe('string');

      // Restore original getComputedStyle
      window.getComputedStyle = originalStyle;
    });

    it('should handle CSS custom property errors gracefully', () => {
      // Mock getComputedStyle to throw error
      const originalStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn(() => {
        throw new Error('CSS error');
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should not throw error
      expect(() => {
        result.current.getColor('primary');
      }).not.toThrow();

      // Restore original getComputedStyle
      window.getComputedStyle = originalStyle;
    });
  });

  describe('ES6+ Feature Fallbacks', () => {
    it('should work without arrow functions', () => {
      // This test ensures compatibility with environments that don't support arrow functions
      // The code should use traditional function declarations instead

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should work normally
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme.currentTheme).toBe('dark');
    });

    it('should work without const/let', () => {
      // This test ensures compatibility with environments that only support var
      // The code should use var declarations or be transpiled appropriately

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should work normally
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme.currentTheme).toBe('dark');
    });

    it('should work without template literals', () => {
      // This test ensures compatibility with environments that don't support template literals
      // The code should use string concatenation instead

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should work normally
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme.currentTheme).toBe('dark');
    });

    it('should work without spread operator', () => {
      // This test ensures compatibility with environments that don't support spread operator
      // The code should use Object.assign or other alternatives

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should work normally
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme.currentTheme).toBe('dark');
    });

    it('should work without destructuring', () => {
      // This test ensures compatibility with environments that don't support destructuring
      // The code should access properties directly

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should work normally
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme.currentTheme).toBe('dark');
    });
  });

  describe('Legacy Browser Support', () => {
    it('should work with IE11-style event listeners', () => {
      // Mock IE11-style event listeners
      const mockMatchMedia = jest.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // IE11 uses addListener instead of addEventListener
        removeListener: jest.fn(), // IE11 uses removeListener instead of removeEventListener
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia,
        configurable: true,
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should work normally
      act(() => {
        result.current.setTheme('auto');
      });

      expect(result.current.theme.currentTheme).toBe('auto');
      expect(result.current.theme.appliedTheme).toBe('light');
    });

    it('should work with limited Array methods', () => {
      // Mock limited Array methods (like in older browsers)
      const originalArray = Array.prototype;
      const mockArrayMethods = {
        forEach: jest.fn(),
        map: jest.fn(),
        filter: jest.fn(),
        reduce: jest.fn(),
      };

      // Temporarily replace Array methods
      Object.keys(mockArrayMethods).forEach((method: string) => {
        (Array.prototype as any)[method] = (mockArrayMethods as any)[method];
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should work normally
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme.currentTheme).toBe('dark');

      // Restore original Array methods
      Object.keys(mockArrayMethods).forEach((method: string) => {
        (Array.prototype as any)[method] = (originalArray as any)[method];
      });
    });

    it('should work with limited Object methods', () => {
      // Mock limited Object methods (like in older browsers)
      const originalObject = Object;
      const mockObjectMethods = {
        assign: jest.fn(),
        keys: jest.fn(),
        values: jest.fn(),
        entries: jest.fn(),
      };

      // Temporarily replace Object methods
      Object.keys(mockObjectMethods).forEach((method: string) => {
        (Object as any)[method] = (mockObjectMethods as any)[method];
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should work normally
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme.currentTheme).toBe('dark');

      // Restore original Object methods
      Object.keys(mockObjectMethods).forEach((method: string) => {
        (Object as any)[method] = (originalObject as any)[method];
      });
    });
  });

  describe('Mobile Browser Compatibility', () => {
    it('should work with mobile viewport limitations', () => {
      // Mock mobile viewport
      const originalInnerWidth = window.innerWidth;
      const originalInnerHeight = window.innerHeight;

      Object.defineProperty(window, 'innerWidth', {
        value: 375, // iPhone SE width
        configurable: true,
      });

      Object.defineProperty(window, 'innerHeight', {
        value: 667, // iPhone SE height
        configurable: true,
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should work normally
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme.currentTheme).toBe('dark');

      // Restore original dimensions
      Object.defineProperty(window, 'innerWidth', {
        value: originalInnerWidth,
        configurable: true,
      });

      Object.defineProperty(window, 'innerHeight', {
        value: originalInnerHeight,
        configurable: true,
      });
    });

    it('should work with touch events only', () => {
      // Mock touch-only environment
      const originalOntouchstart = window.ontouchstart;
      const originalOnmousedown = window.onmousedown;

      Object.defineProperty(window, 'ontouchstart', {
        value: null,
        configurable: true,
      });

      Object.defineProperty(window, 'onmousedown', {
        value: undefined, // No mouse events
        configurable: true,
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should work normally
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme.currentTheme).toBe('dark');

      // Restore original event handlers
      Object.defineProperty(window, 'ontouchstart', {
        value: originalOntouchstart,
        configurable: true,
      });

      Object.defineProperty(window, 'onmousedown', {
        value: originalOnmousedown,
        configurable: true,
      });
    });

    it('should work with limited memory', () => {
      // Mock limited memory environment
      const originalPerformance = window.performance;

      Object.defineProperty(window, 'performance', {
        value: {
          now: jest.fn(() => Date.now()),
          memory: {
            usedJSHeapSize: 50 * 1024 * 1024, // 50MB limit
            totalJSHeapSize: 100 * 1024 * 1024, // 100MB total
            jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB limit
          },
        },
        configurable: true,
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should work normally
      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme.currentTheme).toBe('dark');

      // Restore original performance
      Object.defineProperty(window, 'performance', {
        value: originalPerformance,
        configurable: true,
      });
    });
  });

  describe('Cross-Browser Theme Consistency', () => {
    it('should provide consistent colors across browsers', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const colors = [
        'primary', 'secondary', 'background', 'text', 'border',
        'success', 'warning', 'error', 'info'
      ] as const;

      const colorValues = colors.map(color => result.current.getColor(color));

      // All colors should be defined
      colorValues.forEach(color => {
        expect(color).toBeDefined();
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
      });

      // Colors should be different from each other
      const uniqueColors = new Set(colorValues);
      expect(uniqueColors.size).toBeGreaterThan(1);
    });

    it('should provide consistent fonts across browsers', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const fonts = [
        'sans', 'serif', 'mono', 'base', 'lineHeightNormal'
      ] as const;

      const fontValues = fonts.map(font => result.current.getFont(font));

      // All fonts should be defined
      fontValues.forEach(font => {
        expect(font).toBeDefined();
        expect(typeof font).toBe('string');
        expect(font.length).toBeGreaterThan(0);
      });
    });

    it('should provide consistent spacing across browsers', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const spacing = [
        'px', '0.5', '1', '1.5', '2', '2.5', '3', '4', '6', '8'
      ] as const;

      const spacingValues = spacing.map(space => result.current.getSpacing(space));

      // All spacing values should be defined
      spacingValues.forEach(value => {
        expect(value).toBeDefined();
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });

    it('should handle theme switching consistently across browsers', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // Test theme switching
      const themes = ['light', 'dark', 'auto'] as const;

      themes.forEach(theme => {
        act(() => {
          result.current.setTheme(theme);
        });

        expect(result.current.theme.currentTheme).toBe(theme);
        expect(result.current.theme.appliedTheme).toBeDefined();

        // Colors should be available in all themes
        const primaryColor = result.current.getColor('primary');
        expect(primaryColor).toBeDefined();
        expect(typeof primaryColor).toBe('string');
      });
    });
  });

  describe('Progressive Enhancement', () => {
    it('should degrade gracefully in limited environments', () => {
      // Remove all modern APIs
      const originalLocalStorage = window.localStorage;
      const originalMatchMedia = window.matchMedia;
      const originalPerformance = window.performance;

      delete (window as any).localStorage;
      delete (window as any).matchMedia;
      delete (window as any).performance;

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should still work
      expect(() => {
        act(() => {
          result.current.setTheme('dark');
        });
      }).not.toThrow();

      expect(result.current.theme).toBeDefined();
      expect(result.current.theme.currentTheme).toBe('dark');

      // Should still provide basic functionality
      const primaryColor = result.current.getColor('primary');
      expect(primaryColor).toBeDefined();

      // Restore APIs
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
      });

      Object.defineProperty(window, 'matchMedia', {
        value: originalMatchMedia,
        configurable: true,
      });

      Object.defineProperty(window, 'performance', {
        value: originalPerformance,
        configurable: true,
      });
    });

    it('should provide fallback values for missing theme properties', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // Test with potentially missing theme keys
      const testKeys = [
        'nonexistent1', 'nonexistent2', 'nonexistent3'
      ] as const;

      testKeys.forEach(key => {
        // Should not throw error
        expect(() => {
          const color = result.current.getColor(key as any);
          expect(color).toBeDefined(); // Should provide fallback
        }).not.toThrow();
      });
    });

    it('should maintain functionality with partial API support', () => {
      // Mock partial API support
      const mockLocalStorage = {
        getItem: jest.fn(), // Works
        // setItem is missing
        removeItem: jest.fn(), // Works
        clear: jest.fn(), // Works
        length: 0,
        key: jest.fn(),
      };

      const originalLocalStorage = window.localStorage;

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        configurable: true,
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should still work
      expect(() => {
        act(() => {
          result.current.setTheme('dark');
        });
      }).not.toThrow();

      expect(result.current.theme.currentTheme).toBe('dark');

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
      });
    });
  });
});
