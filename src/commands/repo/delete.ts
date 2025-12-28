import { getApiClient } from "../../api/client.js";
import { requireRepoContext } from "../../lib/context.js";
import { outputSuccess, outputError } from "../../lib/output.js";
import { handleError } from "../../lib/errors.js";
import type { GlobalOptions } from "../../types/index.js";

interface DeleteOptions extends GlobalOptions {
  yes?: boolean;
}

export async function deleteRepo(
  repository: string,
  options: DeleteOptions
): Promise<void> {
  try {
    // Parse repository as workspace/repo
    let contextOptions = { ...options };
    const parts = repository.split("/");
    if (parts.length === 2) {
      contextOptions.workspace = parts[0];
      contextOptions.repo = parts[1];
    } else {
      contextOptions.repo = repository;
    }

    const context = await requireRepoContext(contextOptions);

    // Require confirmation unless --yes is provided
    if (!options.yes) {
      outputError(
        `This will permanently delete ${context.workspace}/${context.repoSlug}.\n` +
          "Use --yes to confirm deletion."
      );
      process.exit(1);
    }

    const client = await getApiClient();

    await client.delete(
      `/repositories/${context.workspace}/${context.repoSlug}`
    );

    outputSuccess(`Deleted repository ${context.workspace}/${context.repoSlug}`);
  } catch (error) {
    handleError(error);
  }
}
