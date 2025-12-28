import { getApiClient } from "../../api/client.js";
import { requireRepoContext } from "../../lib/context.js";
import { getCurrentBranch } from "../../lib/git.js";
import { outputSuccess, outputError, outputJson } from "../../lib/output.js";
import { handleError } from "../../lib/errors.js";
import chalk from "chalk";
import type { GlobalOptions } from "../../types/index.js";

interface CreateOptions extends GlobalOptions {
  title?: string;
  body?: string;
  source?: string;
  destination?: string;
  draft?: boolean;
  closeSourceBranch?: boolean;
}

interface PullRequest {
  id: number;
  title: string;
  links: {
    html: { href: string };
  };
}

export async function create(
  options: CreateOptions,
  command: { parent?: { opts?: () => { json?: boolean } } }
): Promise<void> {
  const parentOpts = command.parent?.opts?.() || {};

  try {
    const context = await requireRepoContext(options);
    const client = await getApiClient();

    // Get source branch (default to current branch)
    const sourceBranch = options.source || (await getCurrentBranch());
    const destinationBranch = options.destination || "main";

    // Title is required
    if (!options.title) {
      outputError("Pull request title is required. Use --title option.");
      process.exit(1);
    }

    const body: Record<string, unknown> = {
      title: options.title,
      source: {
        branch: { name: sourceBranch },
      },
      destination: {
        branch: { name: destinationBranch },
      },
    };

    if (options.body) {
      body.description = options.body;
    }

    if (options.closeSourceBranch) {
      body.close_source_branch = true;
    }

    const pr = await client.post<PullRequest>(
      `/repositories/${context.workspace}/${context.repoSlug}/pullrequests`,
      body
    );

    if (parentOpts.json) {
      outputJson(pr);
      return;
    }

    outputSuccess(`Created pull request #${pr.id}`);
    console.log(`  ${chalk.dim("Title:")} ${pr.title}`);
    console.log(`  ${chalk.dim("URL:")} ${pr.links.html.href}`);
  } catch (error) {
    handleError(error);
  }
}
