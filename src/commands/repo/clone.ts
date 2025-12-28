import { clone as gitClone } from "../../lib/git.js";
import { outputSuccess, outputError } from "../../lib/output.js";
import { getConfig } from "../../lib/config.js";

interface CloneOptions {
  directory?: string;
}

export async function clone(
  repository: string,
  options: CloneOptions
): Promise<void> {
  let repoUrl = repository;

  // If it's a short form (workspace/repo), convert to full URL
  if (!repository.includes("://") && !repository.startsWith("git@")) {
    const config = await getConfig();
    const parts = repository.split("/");

    let workspace: string;
    let repoSlug: string;

    if (parts.length === 1) {
      // Just repo name, use default workspace
      if (!config.defaultWorkspace) {
        outputError(
          "No workspace specified. Use workspace/repo format or set a default workspace."
        );
        process.exit(1);
      }
      workspace = config.defaultWorkspace;
      repoSlug = parts[0];
    } else if (parts.length === 2) {
      workspace = parts[0];
      repoSlug = parts[1];
    } else {
      outputError("Invalid repository format. Use workspace/repo or a full URL.");
      process.exit(1);
    }

    // Use SSH URL by default
    repoUrl = `git@bitbucket.org:${workspace}/${repoSlug}.git`;
  }

  try {
    await gitClone(repoUrl, options.directory);
    const targetDir = options.directory || repository.split("/").pop()?.replace(".git", "");
    outputSuccess(`Cloned ${repository} into ${targetDir}`);
  } catch (error) {
    if (error instanceof Error) {
      outputError(`Failed to clone repository: ${error.message}`);
    } else {
      outputError("Failed to clone repository");
    }
    process.exit(1);
  }
}
