import { Command } from "commander";
import { create } from "./create.js";
import { list } from "./list.js";
import { view } from "./view.js";
import { merge } from "./merge.js";
import { approve } from "./approve.js";
import { decline } from "./decline.js";
import { checkout } from "./checkout.js";

export const prCommand = new Command("pr")
  .description("Manage pull requests");

prCommand
  .command("create")
  .description("Create a pull request")
  .option("-t, --title <title>", "Pull request title")
  .option("-b, --body <body>", "Pull request description")
  .option("-s, --source <branch>", "Source branch (default: current branch)")
  .option("-d, --destination <branch>", "Destination branch (default: main)")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .option("--draft", "Create as draft pull request")
  .option("--close-source-branch", "Close source branch after merge")
  .action(create);

prCommand
  .command("list")
  .description("List pull requests")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .option("-s, --state <state>", "Filter by state (OPEN, MERGED, DECLINED, SUPERSEDED)", "OPEN")
  .option("--limit <number>", "Maximum number of PRs to list", "25")
  .action(list);

prCommand
  .command("view <id>")
  .description("View pull request details")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .action(view);

prCommand
  .command("merge <id>")
  .description("Merge a pull request")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .option("-m, --message <message>", "Merge commit message")
  .option("--close-source-branch", "Delete the source branch after merging")
  .option("--strategy <strategy>", "Merge strategy (merge_commit, squash, fast_forward)")
  .action(merge);

prCommand
  .command("approve <id>")
  .description("Approve a pull request")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .action(approve);

prCommand
  .command("decline <id>")
  .description("Decline a pull request")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .action(decline);

prCommand
  .command("checkout <id>")
  .description("Checkout a pull request locally")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .action(checkout);
