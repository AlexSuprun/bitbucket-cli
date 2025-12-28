import { getApiClient } from "../../api/client.js";
import { getConfig } from "../../lib/config.js";
import { outputTable, outputError, outputJson } from "../../lib/output.js";
import { handleError } from "../../lib/errors.js";

interface ListOptions {
  workspace?: string;
  limit?: string;
}

interface Repository {
  full_name: string;
  description: string;
  is_private: boolean;
  updated_on: string;
}

interface RepositoryList {
  values: Repository[];
  next?: string;
}

export async function list(
  options: ListOptions,
  command: { parent?: { opts?: () => { json?: boolean } } }
): Promise<void> {
  const parentOpts = command.parent?.opts?.() || {};

  try {
    const config = await getConfig();
    const workspace = options.workspace || config.defaultWorkspace;

    if (!workspace) {
      outputError(
        "No workspace specified. Use --workspace option or set a default workspace."
      );
      process.exit(1);
    }

    const client = await getApiClient();
    const limit = parseInt(options.limit || "25", 10);

    const repos = await client.get<RepositoryList>(
      `/repositories/${workspace}?pagelen=${limit}`
    );

    if (parentOpts.json) {
      outputJson(repos.values);
      return;
    }

    if (repos.values.length === 0) {
      console.log("No repositories found");
      return;
    }

    const rows = repos.values.map((repo) => [
      repo.full_name,
      repo.is_private ? "private" : "public",
      repo.description || "",
    ]);

    outputTable(["REPOSITORY", "VISIBILITY", "DESCRIPTION"], rows);
  } catch (error) {
    handleError(error);
  }
}
