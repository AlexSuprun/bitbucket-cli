import { Command } from "commander";
import { get } from "./get.js";
import { set } from "./set.js";
import { list } from "./list.js";

export const configCommand = new Command("config")
  .description("Manage configuration");

configCommand
  .command("get <key>")
  .description("Get a configuration value")
  .action(get);

configCommand
  .command("set <key> <value>")
  .description("Set a configuration value")
  .action(set);

configCommand
  .command("list")
  .description("List all configuration values")
  .action(list);
