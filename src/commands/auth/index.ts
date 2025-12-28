import { Command } from "commander";
import { login } from "./login.js";
import { logout } from "./logout.js";
import { status } from "./status.js";
import { token } from "./token.js";

export const authCommand = new Command("auth")
  .description("Authenticate with Bitbucket");

authCommand
  .command("login")
  .description("Authenticate with Bitbucket using an app password")
  .option("-u, --username <username>", "Bitbucket username")
  .option("-p, --password <password>", "Bitbucket app password")
  .action(login);

authCommand
  .command("logout")
  .description("Log out of Bitbucket")
  .action(logout);

authCommand
  .command("status")
  .description("Show authentication status")
  .action(status);

authCommand
  .command("token")
  .description("Print the current access token")
  .action(token);
