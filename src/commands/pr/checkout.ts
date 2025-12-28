import { getApiClient } from "../../api/client.js";
import { requireRepoContext } from "../../lib/context.js";
import { fetch, checkoutNewBranch, checkout as gitCheckout } from "../../lib/git.js";
import { outputSuccess, outputError } from "../../lib/output.js";
import { handleError } from "../../lib/errors.js";
import type { GlobalOptions } from "../../types/index.js";

interface CheckoutOptions extends GlobalOptions {}

interface PullRequest {
  id: number;
  title: string;
  source: {
    branch: { name: string };
    repository: {
      full_name: string;
    };
  };
}

export async function checkout(
  id: string,
  options: CheckoutOptions
): Promise<void> {
  try {
    const context = await requireRepoContext(options);
    const client = await getApiClient();

    // Get PR details to find the source branch
    const pr = await client.get<PullRequest>(
      `/repositories/${context.workspace}/${context.repoSlug}/pullrequests/${id}`
    );

    const branchName = pr.source.branch.name;
    const localBranchName = `pr-${id}`;

    // Fetch the latest from remote
    await fetch();

    // Try to checkout the branch
    try {
      // First try to checkout if branch exists locally
      await gitCheckout(branchName);
      outputSuccess(`Checked out branch '${branchName}' for PR #${id}`);
    } catch {
      // If branch doesn't exist locally, create a tracking branch
      try {
        await checkoutNewBranch(localBranchName, `origin/${branchName}`);
        outputSuccess(`Checked out PR #${id} as '${localBranchName}'`);
      } catch (error) {
        // If that also fails, the branch might not be fetched yet
        outputError(
          `Could not checkout branch '${branchName}'. ` +
            `Make sure the source branch exists and try fetching first.`
        );
        process.exit(1);
      }
    }

    console.log(`  Title: ${pr.title}`);
    console.log(`  Source: ${branchName}`);
  } catch (error) {
    handleError(error);
  }
}
