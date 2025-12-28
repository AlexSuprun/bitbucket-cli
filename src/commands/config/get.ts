import { getConfig } from "../../lib/config.js";
import { outputError } from "../../lib/output.js";
import type { BBConfig } from "../../types/index.js";

const ALLOWED_KEYS: (keyof BBConfig)[] = [
  "username",
  "defaultWorkspace",
];

const HIDDEN_KEYS: (keyof BBConfig)[] = ["appPassword"];

export async function get(key: string): Promise<void> {
  const config = await getConfig();

  // Check if key is valid
  if (HIDDEN_KEYS.includes(key as keyof BBConfig)) {
    outputError(`Cannot display '${key}' - use 'bb auth token' to get authentication credentials`);
    process.exit(1);
  }

  if (!ALLOWED_KEYS.includes(key as keyof BBConfig)) {
    outputError(
      `Unknown config key '${key}'. Valid keys: ${ALLOWED_KEYS.join(", ")}`
    );
    process.exit(1);
  }

  const value = config[key as keyof BBConfig];

  if (value === undefined) {
    console.log("");
  } else {
    console.log(value);
  }
}
