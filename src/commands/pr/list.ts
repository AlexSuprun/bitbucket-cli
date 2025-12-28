import { getApiClient } from "../../api/client.js";
import { requireRepoContext } from "../../lib/context.js";
import { outputTable, outputJson } from "../../lib/output.js";
import { handleError } from "../../lib/errors.js";
import type { GlobalOptions } from "../../types/index.js";

interface ListOptions extends GlobalOptions {
  state?: string;
  limit?: string;
}

interface PullRequest {
  id: number;
  title: string;
  state: string;
  author: {
    display_name: string;
  };
  source: {
    branch: { name: string };
  };
  destination: {
    branch: { name: string };
  };
  created_on: string;
}

interface PullRequestList {
  values: PullRequest[];
  next?: string;
}

export async function list(
  options: ListOptions,
  command: { parent?: { opts?: () => { json?: boolean } } }
): Promise<void> {
  const parentOpts = command.parent?.opts?.() || {};

  try {
    const context = await requireRepoContext(options);
    const client = await getApiClient();

    const state = options.state || "OPEN";
    const limit = parseInt(options.limit || "25", 10);

    const prs = await client.get<PullRequestList>(
      `/repositories/${context.workspace}/${context.repoSlug}/pullrequests?state=${state}&pagelen=${limit}`
    );

    if (parentOpts.json) {
      outputJson(prs.values);
      return;
    }

    if (prs.values.length === 0) {
      console.log(`No ${state.toLowerCase()} pull requests found`);
      return;
    }

    const rows = prs.values.map((pr) => [
      `#${pr.id}`,
      pr.title.substring(0, 50) + (pr.title.length > 50 ? "..." : ""),
      pr.author.display_name,
      `${pr.source.branch.name} → ${pr.destination.branch.name}`,
    ]);

    outputTable(["ID", "TITLE", "AUTHOR", "BRANCHES"], rows);
  } catch (error) {
    handleError(error);
  }
}
