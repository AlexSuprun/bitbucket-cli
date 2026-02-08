/**
 * Tests for VersionService
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { VersionService } from '../../src/services/version.service.js';
import { createMockConfigService } from '../setup.js';
import type { BBConfig } from '../../src/types/config.js';

describe('VersionService', () => {
  let service: VersionService;
  let mockConfig: BBConfig;

  beforeEach(() => {
    mockConfig = {};
    service = new VersionService(createMockConfigService(mockConfig), '1.0.0');
    // Clear environment variables
    delete process.env.CI;
    delete process.env.GITHUB_ACTIONS;
  });

  afterEach(() => {
    // Clear environment variables
    delete process.env.CI;
    delete process.env.GITHUB_ACTIONS;
  });

  describe('checkForUpdate', () => {
    it('should return null when skipVersionCheck is true', async () => {
      mockConfig.skipVersionCheck = true;
      service = new VersionService(
        createMockConfigService(mockConfig),
        '1.0.0'
      );

      const result = await service.checkForUpdate();

      expect(result).toBeNull();
    });

    it('should return null when legacy skipVersionCheck is string true', async () => {
      const legacyConfig = {
        skipVersionCheck: 'true',
      } as unknown as BBConfig;

      service = new VersionService(
        createMockConfigService(legacyConfig),
        '1.0.0'
      );

      const result = await service.checkForUpdate();

      expect(result).toBeNull();
    });

    it('should return null in CI environment', async () => {
      process.env.CI = 'true';

      const result = await service.checkForUpdate();

      expect(result).toBeNull();
    });

    it('should return null when check was performed recently', async () => {
      mockConfig.lastVersionCheck = new Date().toISOString();
      service = new VersionService(
        createMockConfigService(mockConfig),
        '1.0.0'
      );

      const result = await service.checkForUpdate();

      expect(result).toBeNull();
    });

    it('should respect custom versionCheckInterval', async () => {
      mockConfig.versionCheckInterval = 7; // 7 days
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 3); // 3 days ago
      mockConfig.lastVersionCheck = oldDate.toISOString();
      service = new VersionService(
        createMockConfigService(mockConfig),
        '1.0.0'
      );

      const result = await service.checkForUpdate();

      // Should not check because 3 days < 7 days
      expect(result).toBeNull();
    });

    it('should respect legacy string versionCheckInterval', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 3); // 3 days ago

      const legacyConfig = {
        versionCheckInterval: '7',
        lastVersionCheck: oldDate.toISOString(),
      } as unknown as BBConfig;

      service = new VersionService(
        createMockConfigService(legacyConfig),
        '1.0.0'
      );

      const result = await service.checkForUpdate();

      // Should not check because 3 days < 7 days
      expect(result).toBeNull();
    });
  });

  describe('getInstallCommand', () => {
    it('should return correct install command', () => {
      const command = service.getInstallCommand();

      expect(command).toBe('bun install -g @pilatos/bitbucket-cli');
    });
  });

  describe('CI environment detection', () => {
    const ciEnvVars = [
      'CI',
      'CONTINUOUS_INTEGRATION',
      'BUILD_ID',
      'BUILD_NUMBER',
      'DRONE',
      'GITHUB_ACTIONS',
      'GITLAB_CI',
      'CIRCLECI',
      'TRAVIS',
      'JENKINS_URL',
      'HUDSON_URL',
    ];

    for (const envVar of ciEnvVars) {
      it(`should detect ${envVar} environment`, async () => {
        process.env[envVar] = 'true';

        const result = await service.checkForUpdate();

        expect(result).toBeNull();

        delete process.env[envVar];
      });
    }
  });
});
