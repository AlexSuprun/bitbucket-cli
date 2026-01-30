import { join } from 'path';
import { homedir } from 'os';
import type { BBConfig } from '../types/index.js';

const CONFIG_DIR = join(homedir(), '.config', 'bb');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

async function ensureConfigDir(): Promise<void> {
  const fs = await import('fs/promises');
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch {
    // Directory exists
  }
}

export async function getConfig(): Promise<BBConfig> {
  const fs = await import('fs/promises');
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data) as BBConfig;
  } catch {
    return {};
  }
}

export async function setConfig(config: BBConfig): Promise<void> {
  const fs = await import('fs/promises');
  await ensureConfigDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function getConfigValue<K extends keyof BBConfig>(
  key: K
): Promise<BBConfig[K] | undefined> {
  const config = await getConfig();
  return config[key];
}

export async function setConfigValue<K extends keyof BBConfig>(
  key: K,
  value: BBConfig[K]
): Promise<void> {
  const config = await getConfig();
  config[key] = value;
  await setConfig(config);
}

export async function clearConfig(): Promise<void> {
  await setConfig({});
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}
