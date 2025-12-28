import { getConfig } from "../../lib/config.js";
import { createApiClient } from "../../api/client.js";
import { outputSuccess, outputError, outputInfo } from "../../lib/output.js";
import chalk from "chalk";

interface User {
  display_name: string;
  username: string;
  account_id: string;
}

export async function status(): Promise<void> {
  const config = await getConfig();

  if (!config.username || !config.appPassword) {
    outputInfo("Not logged in");
    console.log(`Run ${chalk.cyan("bb auth login")} to authenticate.`);
    return;
  }

  try {
    const client = createApiClient({
      username: config.username,
      appPassword: config.appPassword,
    });
    const user = await client.get<User>("/user");

    outputSuccess("Logged in to Bitbucket");
    console.log(`  Username: ${chalk.cyan(user.username)}`);
    console.log(`  Display name: ${user.display_name}`);
    console.log(`  Account ID: ${user.account_id}`);

    if (config.defaultWorkspace) {
      console.log(`  Default workspace: ${chalk.cyan(config.defaultWorkspace)}`);
    }
  } catch (error) {
    outputError("Authentication is invalid or expired");
    console.log(`Run ${chalk.cyan("bb auth login")} to re-authenticate.`);
    process.exit(1);
  }
}
