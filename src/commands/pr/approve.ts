import { getApiClient } from "../../api/client.js";
import { requireRepoContext } from "../../lib/context.js";
import { outputSuccess, outputJson } from "../../lib/output.js";
import { handleError } from "../../lib/errors.js";
import type { GlobalOptions } from "../../types/index.js";

interface ApproveOptions extends GlobalOptions {}

interface Approval {
  approved: boolean;
  user: {
    display_name: string;
  };
}

export async function approve(
  id: string,
  options: ApproveOptions,
  command: { parent?: { opts?: () => { json?: boolean } } }
): Promise<void> {
  const parentOpts = command.parent?.opts?.() || {};

  try {
    const context = await requireRepoContext(options);
    const client = await getApiClient();

    const approval = await client.post<Approval>(
      `/repositories/${context.workspace}/${context.repoSlug}/pullrequests/${id}/approve`
    );

    if (parentOpts.json) {
      outputJson(approval);
      return;
    }

    outputSuccess(`Approved pull request #${id}`);
  } catch (error) {
    handleError(error);
  }
}
