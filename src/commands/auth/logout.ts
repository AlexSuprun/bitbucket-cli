import { clearConfig } from "../../lib/config.js";
import { clearApiClient } from "../../api/client.js";
import { outputSuccess } from "../../lib/output.js";

export async function logout(): Promise<void> {
  await clearConfig();
  clearApiClient();
  outputSuccess("Logged out of Bitbucket");
}
