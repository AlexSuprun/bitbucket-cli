import { getApiClient } from "../../api/client.js";
import { requireRepoContext } from "../../lib/context.js";
import { outputJson, outputError, formatDate } from "../../lib/output.js";
import { handleError } from "../../lib/errors.js";
import chalk from "chalk";
import type { GlobalOptions } from "../../types/index.js";

interface ViewOptions extends GlobalOptions {}

interface Repository {
  full_name: string;
  name: string;
  description: string;
  is_private: boolean;
  created_on: string;
  updated_on: string;
  size: number;
  language: string;
  mainbranch?: { name: string };
  links: {
    html: { href: string };
    clone: Array<{ name: string; href: string }>;
  };
  owner: {
    display_name: string;
  };
}

export async function view(
  repository: string | undefined,
  options: ViewOptions,
  command: { parent?: { opts?: () => { json?: boolean } } }
): Promise<void> {
  const parentOpts = command.parent?.opts?.() || {};

  try {
    // If repository is provided as workspace/repo, parse it
    let contextOptions = { ...options };
    if (repository) {
      const parts = repository.split("/");
      if (parts.length === 2) {
        contextOptions.workspace = parts[0];
        contextOptions.repo = parts[1];
      } else {
        contextOptions.repo = repository;
      }
    }

    const context = await requireRepoContext(contextOptions);
    const client = await getApiClient();

    const repo = await client.get<Repository>(
      `/repositories/${context.workspace}/${context.repoSlug}`
    );

    if (parentOpts.json) {
      outputJson(repo);
      return;
    }

    console.log(chalk.bold(repo.full_name));
    if (repo.description) {
      console.log(chalk.dim(repo.description));
    }
    console.log();

    console.log(`  ${chalk.dim("Visibility:")} ${repo.is_private ? "Private" : "Public"}`);
    console.log(`  ${chalk.dim("Owner:")} ${repo.owner.display_name}`);
    if (repo.language) {
      console.log(`  ${chalk.dim("Language:")} ${repo.language}`);
    }
    if (repo.mainbranch) {
      console.log(`  ${chalk.dim("Default branch:")} ${repo.mainbranch.name}`);
    }
    console.log(`  ${chalk.dim("Created:")} ${formatDate(repo.created_on)}`);
    console.log(`  ${chalk.dim("Updated:")} ${formatDate(repo.updated_on)}`);
    console.log();
    console.log(`  ${chalk.dim("URL:")} ${repo.links.html.href}`);

    const sshClone = repo.links.clone.find((c) => c.name === "ssh");
    if (sshClone) {
      console.log(`  ${chalk.dim("SSH:")} ${sshClone.href}`);
    }
  } catch (error) {
    handleError(error);
  }
}
