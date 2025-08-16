// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { ErrorHandler } from '@/core/ErrorHandler';

describe('ErrorHandler', () => {
  const mockToast = vi.fn();
  ErrorHandler.init(mockToast);

  it('should handle Error objects', () => {
    const error = new Error('Test error');
    ErrorHandler.instance.handle(error, 'Test');

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Erreur',
      description: 'Test : Test error',
      variant: 'destructive'
    });
  });

  it('should handle non-Error objects', () => {
    ErrorHandler.instance.handle('Raw error');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Erreur',
      description: 'Raw error',
      variant: 'destructive'
    });
  });
});
