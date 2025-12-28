import { getApiClient } from "../../api/client.js";
import { requireRepoContext } from "../../lib/context.js";
import { outputJson, formatDate } from "../../lib/output.js";
import { handleError } from "../../lib/errors.js";
import chalk from "chalk";
import type { GlobalOptions } from "../../types/index.js";

interface ViewOptions extends GlobalOptions {}

interface PullRequest {
  id: number;
  title: string;
  description: string;
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
  updated_on: string;
  comment_count: number;
  task_count: number;
  links: {
    html: { href: string };
  };
  participants: Array<{
    user: { display_name: string };
    approved: boolean;
    role: string;
  }>;
}

function getStateColor(state: string): (text: string) => string {
  switch (state) {
    case "OPEN":
      return chalk.green;
    case "MERGED":
      return chalk.magenta;
    case "DECLINED":
      return chalk.red;
    default:
      return chalk.gray;
  }
}

export async function view(
  id: string,
  options: ViewOptions,
  command: { parent?: { opts?: () => { json?: boolean } } }
): Promise<void> {
  const parentOpts = command.parent?.opts?.() || {};

  try {
    const context = await requireRepoContext(options);
    const client = await getApiClient();

    const pr = await client.get<PullRequest>(
      `/repositories/${context.workspace}/${context.repoSlug}/pullrequests/${id}`
    );

    if (parentOpts.json) {
      outputJson(pr);
      return;
    }

    const stateColor = getStateColor(pr.state);
    console.log(
      `${chalk.bold(`#${pr.id}`)} ${pr.title} ${stateColor(`[${pr.state}]`)}`
    );
    console.log();

    if (pr.description) {
      console.log(pr.description);
      console.log();
    }

    console.log(
      `  ${chalk.dim("Branches:")} ${pr.source.branch.name} → ${pr.destination.branch.name}`
    );
    console.log(`  ${chalk.dim("Author:")} ${pr.author.display_name}`);
    console.log(`  ${chalk.dim("Created:")} ${formatDate(pr.created_on)}`);
    console.log(`  ${chalk.dim("Updated:")} ${formatDate(pr.updated_on)}`);
    console.log(
      `  ${chalk.dim("Comments:")} ${pr.comment_count}  ${chalk.dim("Tasks:")} ${pr.task_count}`
    );

    // Show reviewers/approvals
    const reviewers = pr.participants.filter((p) => p.role === "REVIEWER");
    if (reviewers.length > 0) {
      console.log();
      console.log(`  ${chalk.dim("Reviewers:")}`);
      for (const reviewer of reviewers) {
        const status = reviewer.approved
          ? chalk.green("✓ approved")
          : chalk.yellow("pending");
        console.log(`    ${reviewer.user.display_name} - ${status}`);
      }
    }

    console.log();
    console.log(`  ${chalk.dim("URL:")} ${pr.links.html.href}`);
  } catch (error) {
    handleError(error);
  }
}
