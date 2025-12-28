import { getApiClient } from "../../api/client.js";
import { getConfig } from "../../lib/config.js";
import { outputSuccess, outputError, outputJson } from "../../lib/output.js";
import { handleError } from "../../lib/errors.js";
import chalk from "chalk";

interface CreateOptions {
  workspace?: string;
  description?: string;
  private?: boolean;
  public?: boolean;
  project?: string;
}

interface Repository {
  full_name: string;
  links: {
    html: { href: string };
    clone: Array<{ name: string; href: string }>;
  };
}

export async function create(
  name: string,
  options: CreateOptions,
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

    const body: Record<string, unknown> = {
      scm: "git",
      name,
      is_private: options.public ? false : true,
    };

    if (options.description) {
      body.description = options.description;
    }

    if (options.project) {
      body.project = { key: options.project };
    }

    const repo = await client.post<Repository>(
      `/repositories/${workspace}/${name.toLowerCase().replace(/\s+/g, "-")}`,
      body
    );

    if (parentOpts.json) {
      outputJson(repo);
      return;
    }

    outputSuccess(`Created repository ${repo.full_name}`);
    console.log(`  ${chalk.dim("URL:")} ${repo.links.html.href}`);

    const sshClone = repo.links.clone.find((c) => c.name === "ssh");
    if (sshClone) {
      console.log(`  ${chalk.dim("Clone:")} git clone ${sshClone.href}`);
    }
  } catch (error) {
    handleError(error);
  }
}
