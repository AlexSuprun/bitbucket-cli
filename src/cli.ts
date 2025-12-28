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
import type { InstallCompletionCommand } from "./commands/completion/install.command.js";
import type { UninstallCompletionCommand } from "./commands/completion/uninstall.command.js";
import tabtab from "tabtab";

// Handle tabtab completion
if (process.argv.includes("--get-yargs-completions") || process.env.COMP_LINE) {
  const env = tabtab.parseEnv(process.env);
  if (env.complete) {
    const completions = [
      "auth",
      "repo",
      "pr",
      "config",
      "completion",
      "--help",
      "--version",
      "--json",
      "--workspace",
      "--repo",
    ];

    // Add subcommands based on current command
    if (env.prev === "auth") {
      completions.push("login", "logout", "status", "token");
    } else if (env.prev === "repo") {
      completions.push("clone", "create", "list", "view", "delete");
    } else if (env.prev === "pr") {
      completions.push("create", "list", "view", "merge", "approve", "decline", "checkout");
    } else if (env.prev === "config") {
      completions.push("get", "set", "list");
    } else if (env.prev === "completion") {
      completions.push("install", "uninstall");
    }

    tabtab.log(completions);
    process.exit(0);
  }
}

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

// Helper to merge global options with local options
export function withGlobalOptions<T extends Record<string, unknown>>(options: T, context: CommandContext): T & { workspace?: string; repo?: string } {
  return {
    ...options,
    workspace: options.workspace ?? context.globalOptions.workspace,
    repo: options.repo ?? context.globalOptions.repo,
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
  .option("-d, --description <description>", "Repository description")
  .option("--private", "Create a private repository (default)")
  .option("--public", "Create a public repository")
  .option("-p, --project <project>", "Project key")
  .action(async (name, options) => {
    const cmd = container.resolve<CreateRepoCommand>(ServiceTokens.CreateRepoCommand);
    const context = createContext(cli);
    await cmd.execute(withGlobalOptions({ name, ...options }, context), context);
  });

repoCmd
  .command("list")
  .description("List repositories")
  .option("--limit <number>", "Maximum number of repositories to list", "25")
  .action(async (options) => {
    const cmd = container.resolve<ListReposCommand>(ServiceTokens.ListReposCommand);
    const context = createContext(cli);
    await cmd.execute(withGlobalOptions(options, context), context);
  });

repoCmd
  .command("view [repository]")
  .description("View repository details")
  .action(async (repository, options) => {
    const cmd = container.resolve<ViewRepoCommand>(ServiceTokens.ViewRepoCommand);
    const context = createContext(cli);
    await cmd.execute(withGlobalOptions({ repository, ...options }, context), context);
  });

repoCmd
  .command("delete <repository>")
  .description("Delete a repository")
  .option("-y, --yes", "Skip confirmation prompt")
  .action(async (repository, options) => {
    const cmd = container.resolve<DeleteRepoCommand>(ServiceTokens.DeleteRepoCommand);
    const context = createContext(cli);
    await cmd.execute(withGlobalOptions({ repository, ...options }, context), context);
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
  .option("--close-source-branch", "Close source branch after merge")
  .action(async (options) => {
    const cmd = container.resolve<CreatePRCommand>(ServiceTokens.CreatePRCommand);
    const context = createContext(cli);
    await cmd.execute(withGlobalOptions(options, context), context);
  });

prCmd
  .command("list")
  .description("List pull requests")
  .option("-s, --state <state>", "Filter by state (OPEN, MERGED, DECLINED, SUPERSEDED)", "OPEN")
  .option("--limit <number>", "Maximum number of PRs to list", "25")
  .action(async (options) => {
    const cmd = container.resolve<ListPRsCommand>(ServiceTokens.ListPRsCommand);
    const context = createContext(cli);
    await cmd.execute(withGlobalOptions(options, context), context);
  });

prCmd
  .command("view <id>")
  .description("View pull request details")
  .action(async (id, options) => {
    const cmd = container.resolve<ViewPRCommand>(ServiceTokens.ViewPRCommand);
    const context = createContext(cli);
    await cmd.execute(withGlobalOptions({ id, ...options }, context), context);
  });

prCmd
  .command("merge <id>")
  .description("Merge a pull request")
  .option("-m, --message <message>", "Merge commit message")
  .option("--close-source-branch", "Delete the source branch after merging")
  .option("--strategy <strategy>", "Merge strategy (merge_commit, squash, fast_forward)")
  .action(async (id, options) => {
    const cmd = container.resolve<MergePRCommand>(ServiceTokens.MergePRCommand);
    const context = createContext(cli);
    await cmd.execute(withGlobalOptions({ id, ...options }, context), context);
  });

prCmd
  .command("approve <id>")
  .description("Approve a pull request")
  .action(async (id, options) => {
    const cmd = container.resolve<ApprovePRCommand>(ServiceTokens.ApprovePRCommand);
    const context = createContext(cli);
    await cmd.execute(withGlobalOptions({ id, ...options }, context), context);
  });

prCmd
  .command("decline <id>")
  .description("Decline a pull request")
  .action(async (id, options) => {
    const cmd = container.resolve<DeclinePRCommand>(ServiceTokens.DeclinePRCommand);
    const context = createContext(cli);
    await cmd.execute(withGlobalOptions({ id, ...options }, context), context);
  });

prCmd
  .command("checkout <id>")
  .description("Checkout a pull request locally")
  .action(async (id, options) => {
    const cmd = container.resolve<CheckoutPRCommand>(ServiceTokens.CheckoutPRCommand);
    const context = createContext(cli);
    await cmd.execute(withGlobalOptions({ id, ...options }, context), context);
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

// Completion commands
const completionCmd = new Command("completion").description("Shell completion utilities");

completionCmd
  .command("install")
  .description("Install shell completions for bash, zsh, or fish")
  .action(async () => {
    const cmd = container.resolve<InstallCompletionCommand>(ServiceTokens.InstallCompletionCommand);
    await cmd.execute(undefined, createContext(cli));
  });

completionCmd
  .command("uninstall")
  .description("Uninstall shell completions")
  .action(async () => {
    const cmd = container.resolve<UninstallCompletionCommand>(ServiceTokens.UninstallCompletionCommand);
    await cmd.execute(undefined, createContext(cli));
  });

cli.addCommand(completionCmd);
