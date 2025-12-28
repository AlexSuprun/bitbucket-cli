import { Command } from "commander";
import { clone } from "./clone.js";
import { create } from "./create.js";
import { list } from "./list.js";
import { view } from "./view.js";
import { deleteRepo } from "./delete.js";

export const repoCommand = new Command("repo")
  .description("Manage repositories");

repoCommand
  .command("clone <repository>")
  .description("Clone a Bitbucket repository")
  .option("-d, --directory <dir>", "Directory to clone into")
  .action(clone);

repoCommand
  .command("create <name>")
  .description("Create a new repository")
  .option("-w, --workspace <workspace>", "Workspace to create repository in")
  .option("-d, --description <description>", "Repository description")
  .option("--private", "Create a private repository (default)")
  .option("--public", "Create a public repository")
  .option("-p, --project <project>", "Project key")
  .action(create);

repoCommand
  .command("list")
  .description("List repositories")
  .option("-w, --workspace <workspace>", "Workspace to list repositories from")
  .option("--limit <number>", "Maximum number of repositories to list", "25")
  .action(list);

repoCommand
  .command("view [repository]")
  .description("View repository details")
  .option("-w, --workspace <workspace>", "Workspace")
  .action(view);

repoCommand
  .command("delete <repository>")
  .description("Delete a repository")
  .option("-w, --workspace <workspace>", "Workspace")
  .option("-y, --yes", "Skip confirmation prompt")
  .action(deleteRepo);
