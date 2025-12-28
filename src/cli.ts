/**
 * CLI setup with Commander.js
 */

import { Command } from "commander";
import { createRequire } from "module";
import { bootstrap } from "./bootstrap.js";
import { Container, ServiceTokens } from "./core/container.js";
import type { CommandContext } from "./core/interfaces/commands.js";
import type { GlobalOptions } from "./types/config.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

// Command types
import type { LoginCommand } from "./commands/auth/login.command.js";
import type { LogoutCommand } from "./commands/auth/logout.command.js";
import type { StatusCommand } from "./commands/auth/status.command.js";
import type { TokenCommand } from "./commands/auth/token.command.js";
import type { CloneCommand } from "./commands/repo/clone.command.js";
import type { CreateRepoCommand } from "./commands/repo/create.command.js";
import type { ListReposCommand } from "./commands/repo/list.command.js";
import type { ViewRepoCommand } from "./commands/repo/view.command.js";
import type { DeleteRepoCommand } from "./commands/repo/delete.command.js";
import type { CreatePRCommand } from "./commands/pr/create.command.js";
import type { ListPRsCommand } from "./commands/pr/list.command.js";
import type { ViewPRCommand } from "./commands/pr/view.command.js";
import type { MergePRCommand } from "./commands/pr/merge.command.js";
import type { ApprovePRCommand } from "./commands/pr/approve.command.js";
import type { DeclinePRCommand } from "./commands/pr/decline.command.js";
import type { CheckoutPRCommand } from "./commands/pr/checkout.command.js";
import type { GetConfigCommand } from "./commands/config/get.command.js";
import type { SetConfigCommand } from "./commands/config/set.command.js";
import type { ListConfigCommand } from "./commands/config/list.command.js";

// Bootstrap the container
const container = bootstrap();

// Helper to create command context
function createContext(program: Command): CommandContext {
  const opts = program.opts() as GlobalOptions;
  return {
    globalOptions: {
      json: opts.json,
      workspace: opts.workspace,
      repo: opts.repo,
    },
  };
}

// Create CLI
export const cli = new Command();

cli
  .name("bb")
  .description("A command-line interface for Bitbucket Cloud")
  .version(pkg.version)
  .option("--json", "Output as JSON")
  .option("-w, --workspace <workspace>", "Specify workspace")
  .option("-r, --repo <repo>", "Specify repository");

// Auth commands
const authCmd = new Command("auth").description("Authenticate with Bitbucket");

authCmd
  .command("login")
  .description("Authenticate with Bitbucket using an app password")
  .option("-u, --username <username>", "Bitbucket username")
  .option("-p, --password <password>", "Bitbucket app password")
  .action(async (options) => {
    const cmd = container.resolve<LoginCommand>(ServiceTokens.LoginCommand);
    await cmd.execute(options, createContext(cli));
  });

authCmd
  .command("logout")
  .description("Log out of Bitbucket")
  .action(async () => {
    const cmd = container.resolve<LogoutCommand>(ServiceTokens.LogoutCommand);
    await cmd.execute(undefined, createContext(cli));
  });

authCmd
  .command("status")
  .description("Show authentication status")
  .action(async () => {
    const cmd = container.resolve<StatusCommand>(ServiceTokens.StatusCommand);
    await cmd.execute(undefined, createContext(cli));
  });

authCmd
  .command("token")
  .description("Print the current access token")
  .action(async () => {
    const cmd = container.resolve<TokenCommand>(ServiceTokens.TokenCommand);
    await cmd.execute(undefined, createContext(cli));
  });

cli.addCommand(authCmd);

// Repo commands
const repoCmd = new Command("repo").description("Manage repositories");

repoCmd
  .command("clone <repository>")
  .description("Clone a Bitbucket repository")
  .option("-d, --directory <dir>", "Directory to clone into")
  .action(async (repository, options) => {
    const cmd = container.resolve<CloneCommand>(ServiceTokens.CloneCommand);
    await cmd.execute({ repository, ...options }, createContext(cli));
  });

repoCmd
  .command("create <name>")
  .description("Create a new repository")
  .option("-w, --workspace <workspace>", "Workspace to create repository in")
  .option("-d, --description <description>", "Repository description")
  .option("--private", "Create a private repository (default)")
  .option("--public", "Create a public repository")
  .option("-p, --project <project>", "Project key")
  .action(async (name, options) => {
    const cmd = container.resolve<CreateRepoCommand>(ServiceTokens.CreateRepoCommand);
    await cmd.execute({ name, ...options }, createContext(cli));
  });

repoCmd
  .command("list")
  .description("List repositories")
  .option("-w, --workspace <workspace>", "Workspace to list repositories from")
  .option("--limit <number>", "Maximum number of repositories to list", "25")
  .action(async (options) => {
    const cmd = container.resolve<ListReposCommand>(ServiceTokens.ListReposCommand);
    await cmd.execute(options, createContext(cli));
  });

repoCmd
  .command("view [repository]")
  .description("View repository details")
  .option("-w, --workspace <workspace>", "Workspace")
  .action(async (repository, options) => {
    const cmd = container.resolve<ViewRepoCommand>(ServiceTokens.ViewRepoCommand);
    await cmd.execute({ repository, ...options }, createContext(cli));
  });

repoCmd
  .command("delete <repository>")
  .description("Delete a repository")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-y, --yes", "Skip confirmation prompt")
  .action(async (repository, options) => {
    const cmd = container.resolve<DeleteRepoCommand>(ServiceTokens.DeleteRepoCommand);
    await cmd.execute({ repository, ...options }, createContext(cli));
  });

cli.addCommand(repoCmd);

// PR commands
const prCmd = new Command("pr").description("Manage pull requests");

prCmd
  .command("create")
  .description("Create a pull request")
  .option("-t, --title <title>", "Pull request title")
  .option("-b, --body <body>", "Pull request description")
  .option("-s, --source <branch>", "Source branch (default: current branch)")
  .option("-d, --destination <branch>", "Destination branch (default: main)")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .option("--close-source-branch", "Close source branch after merge")
  .action(async (options) => {
    const cmd = container.resolve<CreatePRCommand>(ServiceTokens.CreatePRCommand);
    await cmd.execute(options, createContext(cli));
  });

prCmd
  .command("list")
  .description("List pull requests")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .option("-s, --state <state>", "Filter by state (OPEN, MERGED, DECLINED, SUPERSEDED)", "OPEN")
  .option("--limit <number>", "Maximum number of PRs to list", "25")
  .action(async (options) => {
    const cmd = container.resolve<ListPRsCommand>(ServiceTokens.ListPRsCommand);
    await cmd.execute(options, createContext(cli));
  });

prCmd
  .command("view <id>")
  .description("View pull request details")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .action(async (id, options) => {
    const cmd = container.resolve<ViewPRCommand>(ServiceTokens.ViewPRCommand);
    await cmd.execute({ id, ...options }, createContext(cli));
  });

prCmd
  .command("merge <id>")
  .description("Merge a pull request")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .option("-m, --message <message>", "Merge commit message")
  .option("--close-source-branch", "Delete the source branch after merging")
  .option("--strategy <strategy>", "Merge strategy (merge_commit, squash, fast_forward)")
  .action(async (id, options) => {
    const cmd = container.resolve<MergePRCommand>(ServiceTokens.MergePRCommand);
    await cmd.execute({ id, ...options }, createContext(cli));
  });

prCmd
  .command("approve <id>")
  .description("Approve a pull request")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .action(async (id, options) => {
    const cmd = container.resolve<ApprovePRCommand>(ServiceTokens.ApprovePRCommand);
    await cmd.execute({ id, ...options }, createContext(cli));
  });

prCmd
  .command("decline <id>")
  .description("Decline a pull request")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .action(async (id, options) => {
    const cmd = container.resolve<DeclinePRCommand>(ServiceTokens.DeclinePRCommand);
    await cmd.execute({ id, ...options }, createContext(cli));
  });

prCmd
  .command("checkout <id>")
  .description("Checkout a pull request locally")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-r, --repo <repo>", "Repository")
  .action(async (id, options) => {
    const cmd = container.resolve<CheckoutPRCommand>(ServiceTokens.CheckoutPRCommand);
    await cmd.execute({ id, ...options }, createContext(cli));
  });

cli.addCommand(prCmd);

// Config commands
const configCmd = new Command("config").description("Manage configuration");

configCmd
  .command("get <key>")
  .description("Get a configuration value")
  .action(async (key) => {
    const cmd = container.resolve<GetConfigCommand>(ServiceTokens.GetConfigCommand);
    await cmd.execute({ key }, createContext(cli));
  });

configCmd
  .command("set <key> <value>")
  .description("Set a configuration value")
  .action(async (key, value) => {
    const cmd = container.resolve<SetConfigCommand>(ServiceTokens.SetConfigCommand);
    await cmd.execute({ key, value }, createContext(cli));
  });

configCmd
  .command("list")
  .description("List all configuration values")
  .action(async () => {
    const cmd = container.resolve<ListConfigCommand>(ServiceTokens.ListConfigCommand);
    await cmd.execute(undefined, createContext(cli));
  });

cli.addCommand(configCmd);
