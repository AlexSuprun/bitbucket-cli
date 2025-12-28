import { getApiClient } from "../../api/client.js";
import { requireRepoContext } from "../../lib/context.js";
import { outputSuccess, outputJson } from "../../lib/output.js";
import { handleError } from "../../lib/errors.js";
import type { GlobalOptions } from "../../types/index.js";

interface MergeOptions extends GlobalOptions {
  message?: string;
  closeSourceBranch?: boolean;
  strategy?: string;
}

interface PullRequest {
  id: number;
  title: string;
  state: string;
}

export async function merge(
  id: string,
  options: MergeOptions,
  command: { parent?: { opts?: () => { json?: boolean } } }
): Promise<void> {
  const parentOpts = command.parent?.opts?.() || {};

  try {
    const context = await requireRepoContext(options);
    const client = await getApiClient();

    const body: Record<string, unknown> = {};

    if (options.message) {
      body.message = options.message;
    }

    if (options.closeSourceBranch) {
      body.close_source_branch = true;
    }

    if (options.strategy) {
      body.merge_strategy = options.strategy;
    }

    const pr = await client.post<PullRequest>(
      `/repositories/${context.workspace}/${context.repoSlug}/pullrequests/${id}/merge`,
      body
    );

    if (parentOpts.json) {
      outputJson(pr);
      return;
    }

    outputSuccess(`Merged pull request #${id}: ${pr.title}`);
  } catch (error) {
    handleError(error);
  }
}
