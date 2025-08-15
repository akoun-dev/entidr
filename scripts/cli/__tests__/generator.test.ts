import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAddon } from '../generator.js';
import fs from 'fs-extra';
import inquirer from 'inquirer';

vi.mock('fs-extra');
vi.mock('inquirer');

describe('Addon Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create full module structure', async () => {
    const mockAnswers = {
      type: 'Full Module',
      withTests: true,
      description: 'Test description'
    };

    vi.mocked(inquirer.prompt).mockResolvedValue(mockAnswers);
    
    await generateAddon('test-module');
    
    expect(inquirer.prompt).toHaveBeenCalled();
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining('templates/addon-template'),
      expect.stringContaining('addons/test-module'),
      { overwrite: false }
    );
    expect(fs.remove).not.toHaveBeenCalled();
  });

  it('should exclude tests when requested', async () => {
    const mockAnswers = {
      type: 'Component',
      withTests: false
    };

    vi.mocked(inquirer.prompt).mockResolvedValue(mockAnswers);
    
    await generateAddon('test-component');
    
    expect(fs.remove).toHaveBeenCalledWith(
      expect.stringContaining('tests')
    );
  });

  it('should handle generation errors', async () => {
    const mockAnswers = {
      type: 'Full Module',
      withTests: true
    };

    vi.mocked(inquirer.prompt).mockResolvedValue(mockAnswers);
    vi.mocked(fs.copy).mockRejectedValue(new Error('FS Error'));
    
    await expect(generateAddon('error-module')).rejects.toThrow('FS Error');
  });

  it('should validate module name format', async () => {
    const mockAnswers = {
      type: 'Full Module',
      withTests: true
    };

    vi.mocked(inquirer.prompt).mockResolvedValue(mockAnswers);
    
    await expect(generateAddon('invalid name')).rejects.toThrow(
      'Module name must be kebab-case'
    );
  });
});