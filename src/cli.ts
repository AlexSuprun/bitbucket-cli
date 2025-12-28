import { Command } from "commander";
import { authCommand } from "./commands/auth/index.js";
import { repoCommand } from "./commands/repo/index.js";
import { prCommand } from "./commands/pr/index.js";
import { configCommand } from "./commands/config/index.js";

export const cli = new Command();

cli
  .name("bb")
  .description("A command-line interface for Bitbucket Cloud")
  .version("0.1.0")
  .option("--json", "Output as JSON")
  .option("-w, --workspace <workspace>", "Specify workspace")
  .option("-r, --repo <repo>", "Specify repository");

// Register command groups
cli.addCommand(authCommand);
cli.addCommand(repoCommand);
cli.addCommand(prCommand);
cli.addCommand(configCommand);
