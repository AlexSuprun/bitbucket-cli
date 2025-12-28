import { getConfig, setConfig } from "../../lib/config.js";
import { outputSuccess, outputError } from "../../lib/output.js";
import type { BBConfig } from "../../types/index.js";

const ALLOWED_KEYS: (keyof BBConfig)[] = [
  "defaultWorkspace",
];

const PROTECTED_KEYS: (keyof BBConfig)[] = [
  "username",
  "appPassword",
];

export async function set(key: string, value: string): Promise<void> {
  // Check if key is protected
  if (PROTECTED_KEYS.includes(key as keyof BBConfig)) {
    outputError(
      `Cannot set '${key}' directly. Use 'bb auth login' to configure authentication.`
    );
    process.exit(1);
  }

  // Check if key is valid
  if (!ALLOWED_KEYS.includes(key as keyof BBConfig)) {
    outputError(
      `Unknown config key '${key}'. Valid keys: ${ALLOWED_KEYS.join(", ")}`
    );
    process.exit(1);
  }

  const config = await getConfig();
  (config as Record<string, unknown>)[key] = value;
  await setConfig(config);

  outputSuccess(`Set ${key} = ${value}`);
}
