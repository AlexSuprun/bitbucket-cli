import { getApiClient } from "../../api/client.js";
import { requireRepoContext } from "../../lib/context.js";
import { outputSuccess, outputJson } from "../../lib/output.js";
import { handleError } from "../../lib/errors.js";
import type { GlobalOptions } from "../../types/index.js";

interface DeclineOptions extends GlobalOptions {}

interface PullRequest {
  id: number;
  title: string;
  state: string;
}

export async function decline(
  id: string,
  options: DeclineOptions,
  command: { parent?: { opts?: () => { json?: boolean } } }
): Promise<void> {
  const parentOpts = command.parent?.opts?.() || {};

  try {
    const context = await requireRepoContext(options);
    const client = await getApiClient();

    const pr = await client.post<PullRequest>(
      `/repositories/${context.workspace}/${context.repoSlug}/pullrequests/${id}/decline`
    );

    if (parentOpts.json) {
      outputJson(pr);
      return;
    }

    outputSuccess(`Declined pull request #${id}: ${pr.title}`);
  } catch (error) {
    handleError(error);
  }
}
