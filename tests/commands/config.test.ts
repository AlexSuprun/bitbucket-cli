/**
 * Config command tests
 */

import { describe, it, expect } from 'bun:test';
import { GetConfigCommand } from '../../src/commands/config/get.command.js';
import { SetConfigCommand } from '../../src/commands/config/set.command.js';
import { ListConfigCommand } from '../../src/commands/config/list.command.js';
import { createMockConfigService, createMockOutputService } from '../setup.js';

describe('GetConfigCommand', () => {
  it('should get defaultWorkspace value', async () => {
    const configService = createMockConfigService({
      defaultWorkspace: 'my-workspace',
    });
    const output = createMockOutputService();

    const command = new GetConfigCommand(configService, output);
    await command.execute({ key: 'defaultWorkspace' }, { globalOptions: {} });

    expect(output.logs).toContain('text:my-workspace');
  });

  it('should output empty string for unset value', async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new GetConfigCommand(configService, output);
    await command.execute({ key: 'defaultWorkspace' }, { globalOptions: {} });

    expect(output.logs).toContain('text:');
  });

  it('should reject hidden keys like apiToken', async () => {
    const configService = createMockConfigService({
      apiToken: 'secret',
    });
    const output = createMockOutputService();

    const command = new GetConfigCommand(configService, output);

    await expect(
      command.run({ key: 'apiToken' }, { globalOptions: {} })
    ).rejects.toBeDefined();

    expect(output.logs.some((log) => log.includes('Cannot display'))).toBe(
      true
    );
  });

  it('should reject invalid keys', async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new GetConfigCommand(configService, output);

    await expect(
      command.run({ key: 'invalidKey' }, { globalOptions: {} })
    ).rejects.toBeDefined();

    expect(output.logs.some((log) => log.includes('Unknown config key'))).toBe(
      true
    );
  });
});

describe('SetConfigCommand', () => {
  it('should set defaultWorkspace value', async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new SetConfigCommand(configService, output);
    await command.execute(
      { key: 'defaultWorkspace', value: 'new-workspace' },
      { globalOptions: {} }
    );

    // Verify value was set
    const config = await configService.getConfig();
    expect(config.defaultWorkspace).toBe('new-workspace');

    expect(output.logs).toContain(
      'success:Set defaultWorkspace = new-workspace'
    );
  });

  it('should reject protected keys like username', async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new SetConfigCommand(configService, output);

    await expect(
      command.run({ key: 'username', value: 'newuser' }, { globalOptions: {} })
    ).rejects.toBeDefined();

    expect(output.logs.some((log) => log.includes('Cannot set'))).toBe(true);
  });

  it('should reject protected keys like apiToken', async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new SetConfigCommand(configService, output);

    await expect(
      command.run({ key: 'apiToken', value: 'newpass' }, { globalOptions: {} })
    ).rejects.toBeDefined();

    expect(output.logs.some((log) => log.includes('Cannot set'))).toBe(true);
  });

  it('should reject invalid keys', async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new SetConfigCommand(configService, output);

    await expect(
      command.execute(
        { key: 'invalidKey', value: 'value' },
        { globalOptions: {} }
      )
    ).rejects.toBeDefined();
  });
});

describe('ListConfigCommand', () => {
  it('should list all config values', async () => {
    const configService = createMockConfigService({
      username: 'testuser',
      apiToken: 'testpass',
      defaultWorkspace: 'myworkspace',
    });
    const output = createMockOutputService();

    const command = new ListConfigCommand(configService, output);
    await command.execute(undefined, { globalOptions: {} });

    expect(output.logs.some((log) => log.includes('testuser'))).toBe(true);
    expect(output.logs.some((log) => log.includes('myworkspace'))).toBe(true);
    expect(output.logs.some((log) => log.includes('********'))).toBe(true);
  });

  it('should output table format', async () => {
    const configService = createMockConfigService({
      username: 'testuser',
      defaultWorkspace: 'myworkspace',
    });
    const output = createMockOutputService();

    const command = new ListConfigCommand(configService, output);
    await command.execute(undefined, { globalOptions: {} });

    expect(output.logs.some((log) => log.startsWith('table:'))).toBe(true);
  });

  it('should show message when no config is set', async () => {
    const configService = createMockConfigService();
    const output = createMockOutputService();

    const command = new ListConfigCommand(configService, output);
    await command.execute(undefined, { globalOptions: {} });

    expect(
      output.logs.some((log) => log.includes('No configuration set'))
    ).toBe(true);
  });
});
