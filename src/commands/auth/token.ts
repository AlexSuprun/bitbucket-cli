import { getConfig } from "../../lib/config.js";
import { outputError } from "../../lib/output.js";

export async function token(): Promise<void> {
  const config = await getConfig();

  if (!config.username || !config.appPassword) {
    outputError("Not logged in. Run 'bb auth login' to authenticate.");
    process.exit(1);
  }

  // Output the base64 encoded credentials (same format used in Authorization header)
  const credentials = Buffer.from(
    `${config.username}:${config.appPassword}`
  ).toString("base64");

  console.log(credentials);
}
