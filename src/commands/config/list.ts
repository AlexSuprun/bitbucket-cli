import { getConfig, getConfigPath } from "../../lib/config.js";
import { outputTable, outputJson } from "../../lib/output.js";
import chalk from "chalk";

export async function list(
  options: Record<string, unknown>,
  command: { parent?: { opts?: () => { json?: boolean } } }
): Promise<void> {
  const parentOpts = command?.parent?.opts?.() || {};
  const config = await getConfig();

  // Hide sensitive values
  const displayConfig: Record<string, string> = {
    username: config.username || "",
    defaultWorkspace: config.defaultWorkspace || "",
    appPassword: config.appPassword ? "********" : "",
  };

  if (parentOpts.json) {
    outputJson(displayConfig);
    return;
  }

  console.log(chalk.dim(`Config file: ${getConfigPath()}`));
  console.log();

  const rows = Object.entries(displayConfig)
    .filter(([, value]) => value !== "")
    .map(([key, value]) => [key, value]);

  if (rows.length === 0) {
    console.log("No configuration set");
    return;
  }

  outputTable(["KEY", "VALUE"], rows);
}
