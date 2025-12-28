import { setConfig, getConfig } from "../../lib/config.js";
import { createApiClient } from "../../api/client.js";
import { outputSuccess, outputError } from "../../lib/output.js";

interface LoginOptions {
  username?: string;
  password?: string;
}

interface User {
  display_name: string;
  username: string;
}

export async function login(options: LoginOptions): Promise<void> {
  let { username, password } = options;

  // If not provided via options, check environment variables
  if (!username) {
    username = process.env.BB_USERNAME;
  }
  if (!password) {
    password = process.env.BB_APP_PASSWORD;
  }

  // If still not provided, prompt user
  if (!username || !password) {
    outputError(
      "Username and password are required.\n" +
        "Provide via --username and --password flags, or set BB_USERNAME and BB_APP_PASSWORD environment variables."
    );
    process.exit(1);
  }

  // Verify credentials by making a test API call
  try {
    const client = createApiClient({ username, appPassword: password });
    const user = await client.get<User>("/user");

    // Store credentials
    const config = await getConfig();
    await setConfig({
      ...config,
      username,
      appPassword: password,
    });

    outputSuccess(`Logged in as ${user.display_name} (${user.username})`);
  } catch (error) {
    if (error instanceof Error) {
      outputError(`Authentication failed: ${error.message}`);
    } else {
      outputError("Authentication failed");
    }
    process.exit(1);
  }
}
