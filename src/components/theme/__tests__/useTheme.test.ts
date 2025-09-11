import { renderHook, act } from '@testing-library/react';
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

describe('useTheme Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    React.createElement(ThemeProvider, null, children)
  );

  describe('Initialization', () => {
    it('should initialize with default theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBeDefined();
      expect(result.current.theme.currentTheme).toBe('light');
      expect(result.current.theme.appliedTheme).toBe('light');
    });

    it('should initialize with theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme.currentTheme).toBe('dark');
      expect(result.current.theme.appliedTheme).toBe('dark');
    });

    it('should initialize with system preference when theme is auto', () => {
      localStorageMock.getItem.mockReturnValue('auto');

      // Mock system preference for dark theme
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })) as any,
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme.currentTheme).toBe('auto');
      expect(result.current.theme.appliedTheme).toBe('dark');
    });
  });

  describe('Theme Switching', () => {
    it('should switch to dark theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme.currentTheme).toBe('dark');
      expect(result.current.theme.appliedTheme).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should switch to light theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme.currentTheme).toBe('light');
      expect(result.current.theme.appliedTheme).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('should switch to auto theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('auto');
      });

      expect(result.current.theme.currentTheme).toBe('auto');
      expect(result.current.theme.appliedTheme).toBe('light'); // Default to light
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'auto');
    });

    it('should handle invalid theme values gracefully', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // @ts-ignore - Testing invalid input
      act(() => {
        result.current.setTheme('invalid' as any);
      });

      // Should remain on current theme
      expect(result.current.theme.currentTheme).toBe('light');
    });
  });

  describe('Theme Persistence', () => {
    it('should save theme to localStorage', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should remove theme from localStorage when needed', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');

      act(() => {
        // @ts-ignore - Testing clearTheme method
        result.current.clearTheme();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('theme');
    });
  });

  describe('System Preference Detection', () => {
    it('should detect system preference changes', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('auto');
      });

      // Simulate system preference change
      const mockCallback = vi.fn();
      const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

      // @ts-ignore - Simulating media query event
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', mockCallback);
      }

      // Trigger change event
      const event = new MediaQueryListEvent('change', {
        matches: true,
        media: '(prefers-color-scheme: dark)'
      });

      // @ts-ignore - Simulating event dispatch
      if (mediaQueryList.dispatchEvent) {
        mediaQueryList.dispatchEvent(event);
      }

      expect(result.current.theme.appliedTheme).toBe('dark');
    });

    it('should handle system preference when matchMedia is not available', () => {
      // Remove matchMedia
      const originalMatchMedia = window.matchMedia;
      delete (window as any).matchMedia;

      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('auto');
      });

      // Should fall back to light theme
      expect(result.current.theme.appliedTheme).toBe('light');

      // Restore matchMedia
      Object.defineProperty(window, 'matchMedia', {
        value: originalMatchMedia,
        configurable: true,
      });
    });
  });

  describe('Color Retrieval', () => {
    it('should retrieve colors correctly', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const primaryColor = result.current.getColor('primary');
      const backgroundColor = result.current.getColor('background');
      const textColor = result.current.getColor('text');

      expect(primaryColor).toBeDefined();
      expect(backgroundColor).toBeDefined();
      expect(textColor).toBeDefined();
      expect(typeof primaryColor).toBe('string');
      expect(typeof backgroundColor).toBe('string');
      expect(typeof textColor).toBe('string');
    });

    it('should update colors when theme changes', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const lightPrimaryColor = result.current.getColor('primary');

      act(() => {
        result.current.setTheme('dark');
      });

      const darkPrimaryColor = result.current.getColor('primary');

      expect(darkPrimaryColor).toBeDefined();
      expect(darkPrimaryColor).not.toBe(lightPrimaryColor);
    });

    it('should provide fallback for invalid color keys', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // @ts-ignore - Testing invalid input
      const invalidColor = result.current.getColor('nonexistent' as any);

      expect(invalidColor).toBeDefined();
    });
  });

  describe('Font Retrieval', () => {
    it('should retrieve fonts correctly', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const sansFont = result.current.getFont('sans');
      const serifFont = result.current.getFont('serif');
      const monoFont = result.current.getFont('mono');

      expect(sansFont).toBeDefined();
      expect(serifFont).toBeDefined();
      expect(monoFont).toBeDefined();
      expect(typeof sansFont).toBe('string');
      expect(typeof serifFont).toBe('string');
      expect(typeof monoFont).toBe('string');
    });

    it('should provide fallback for invalid font keys', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // @ts-ignore - Testing invalid input
      const invalidFont = result.current.getFont('nonexistent' as any);

      expect(invalidFont).toBeDefined();
    });
  });

  describe('Spacing Retrieval', () => {
    it('should retrieve spacing values correctly', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const smallSpacing = result.current.getSpacing('sm' as any);
      const mediumSpacing = result.current.getSpacing('md' as any);
      const largeSpacing = result.current.getSpacing('lg' as any);

      expect(smallSpacing).toBeDefined();
      expect(mediumSpacing).toBeDefined();
      expect(largeSpacing).toBeDefined();
      expect(typeof smallSpacing).toBe('string');
      expect(typeof mediumSpacing).toBe('string');
      expect(typeof largeSpacing).toBe('string');
    });

    it('should provide fallback for invalid spacing keys', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // @ts-ignore - Testing invalid input
      const invalidSpacing = result.current.getSpacing('nonexistent' as any);

      expect(invalidSpacing).toBeDefined();
    });
  });

  describe('Theme Object Structure', () => {
    it('should maintain consistent theme object structure', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const theme = result.current.theme;

      expect(theme).toHaveProperty('currentTheme');
      expect(theme).toHaveProperty('appliedTheme');
      expect(theme).toHaveProperty('colors');
      expect(theme).toHaveProperty('fonts');
      expect(theme).toHaveProperty('spacing');
      expect(typeof theme.currentTheme).toBe('string');
      expect(typeof theme.appliedTheme).toBe('string');
    });

    it('should provide consistent theme object across renders', () => {
      const { result, rerender } = renderHook(() => useTheme(), { wrapper });

      const initialTheme = result.current.theme;

      rerender();

      const updatedTheme = result.current.theme;

      // Should be the same object reference if theme hasn't changed
      expect(updatedTheme).toBe(initialTheme);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const mockLocalStorage = {
        getItem: vi.fn(() => {
          throw new Error('localStorage error');
        }),
        setItem: vi.fn(() => {
          throw new Error('localStorage error');
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        configurable: true,
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.setTheme('dark');
        });
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        configurable: true,
      });
    });

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
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        const { theme } = useTheme();
        return React.createElement('div', { 'data-theme': theme.currentTheme }, theme.currentTheme);
      };

      const { result } = renderHook(() => useTheme(), { wrapper });

      const initialRenderCount = renderCount;

      // Change theme
      act(() => {
        result.current.setTheme('dark');
      });

      // Should have re-rendered
      expect(renderCount).toBeGreaterThan(initialRenderCount);

      const afterChangeRenderCount = renderCount;

      // Get theme without changing it
      act(() => {
        result.current.theme;
      });

      // Should not have re-rendered
      expect(renderCount).toBe(afterChangeRenderCount);
    });

    it('should provide stable theme object when theme doesn\'t change', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      const theme1 = result.current.theme;
      const theme2 = result.current.theme;

      expect(theme1).toBe(theme2);

      // Change theme
      act(() => {
        result.current.setTheme('dark');
      });

      const theme3 = result.current.theme;

      expect(theme3).not.toBe(theme1);

      // Get theme again without changing
      const theme4 = result.current.theme;

      expect(theme4).toBe(theme3);
    });
  });
});
