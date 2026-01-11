/**
 * Application bootstrap - wires up all dependencies
 */

import { Container, ServiceTokens } from "./core/container.js";
import {
  ConfigService,
  GitService,
  ContextService,
  OutputService,
  HttpClient,
} from "./services/index.js";
import {
  UserRepository,
  RepoRepository,
  PullRequestRepository,
} from "./repositories/index.js";

// Auth commands
import { LoginCommand } from "./commands/auth/login.command.js";
import { LogoutCommand } from "./commands/auth/logout.command.js";
import { StatusCommand } from "./commands/auth/status.command.js";
import { TokenCommand } from "./commands/auth/token.command.js";

// Repo commands
import { CloneCommand } from "./commands/repo/clone.command.js";
import { CreateRepoCommand } from "./commands/repo/create.command.js";
import { ListReposCommand } from "./commands/repo/list.command.js";
import { ViewRepoCommand } from "./commands/repo/view.command.js";
import { DeleteRepoCommand } from "./commands/repo/delete.command.js";

// PR commands
import { CreatePRCommand } from "./commands/pr/create.command.js";
import { ListPRsCommand } from "./commands/pr/list.command.js";
import { ViewPRCommand } from "./commands/pr/view.command.js";
import { EditPRCommand } from "./commands/pr/edit.command.js";
import { MergePRCommand } from "./commands/pr/merge.command.js";
import { ApprovePRCommand } from "./commands/pr/approve.command.js";
import { DeclinePRCommand } from "./commands/pr/decline.command.js";
import { CheckoutPRCommand } from "./commands/pr/checkout.command.js";
import { DiffPRCommand } from "./commands/pr/diff.command.js";
import { CommentPRCommand } from "./commands/pr/comment.command.js";
import { ListCommentsPRCommand } from "./commands/pr/comments.list.command.js";
import { EditCommentPRCommand } from "./commands/pr/comments.edit.command.js";
import { DeleteCommentPRCommand } from "./commands/pr/comments.delete.command.js";

// Config commands
import { GetConfigCommand } from "./commands/config/get.command.js";
import { SetConfigCommand } from "./commands/config/set.command.js";
import { ListConfigCommand } from "./commands/config/list.command.js";

// Completion commands
import { InstallCompletionCommand } from "./commands/completion/install.command.js";
import { UninstallCompletionCommand } from "./commands/completion/uninstall.command.js";

export function bootstrap(): Container {
  const container = Container.getInstance();

  // Register core services
  container.register(ServiceTokens.ConfigService, () => new ConfigService());
  container.register(ServiceTokens.GitService, () => new GitService());
  container.register(ServiceTokens.OutputService, () => new OutputService());

  container.register(ServiceTokens.HttpClient, () => {
    const configService = container.resolve<ConfigService>(ServiceTokens.ConfigService);
    return new HttpClient(configService);
  });

  container.register(ServiceTokens.ContextService, () => {
    const gitService = container.resolve<GitService>(ServiceTokens.GitService);
    const configService = container.resolve<ConfigService>(ServiceTokens.ConfigService);
    return new ContextService(gitService, configService);
  });

  // Register repositories
  container.register(ServiceTokens.UserRepository, () => {
    const httpClient = container.resolve<HttpClient>(ServiceTokens.HttpClient);
    return new UserRepository(httpClient);
  });

  container.register(ServiceTokens.RepoRepository, () => {
    const httpClient = container.resolve<HttpClient>(ServiceTokens.HttpClient);
    return new RepoRepository(httpClient);
  });

  container.register(ServiceTokens.PullRequestRepository, () => {
    const httpClient = container.resolve<HttpClient>(ServiceTokens.HttpClient);
    return new PullRequestRepository(httpClient);
  });

  // Register auth commands
  container.register(ServiceTokens.LoginCommand, () => {
    const configService = container.resolve<ConfigService>(ServiceTokens.ConfigService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new LoginCommand(
      configService,
      (cs) => new UserRepository(new HttpClient(cs)),
      output
    );
  });

  container.register(ServiceTokens.LogoutCommand, () => {
    const configService = container.resolve<ConfigService>(ServiceTokens.ConfigService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new LogoutCommand(configService, output);
  });

  container.register(ServiceTokens.StatusCommand, () => {
    const configService = container.resolve<ConfigService>(ServiceTokens.ConfigService);
    const userRepo = container.resolve<UserRepository>(ServiceTokens.UserRepository);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new StatusCommand(configService, userRepo, output);
  });

  container.register(ServiceTokens.TokenCommand, () => {
    const configService = container.resolve<ConfigService>(ServiceTokens.ConfigService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new TokenCommand(configService, output);
  });

  // Register repo commands
  container.register(ServiceTokens.CloneCommand, () => {
    const gitService = container.resolve<GitService>(ServiceTokens.GitService);
    const configService = container.resolve<ConfigService>(ServiceTokens.ConfigService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new CloneCommand(gitService, configService, output);
  });

  container.register(ServiceTokens.CreateRepoCommand, () => {
    const repoRepo = container.resolve<RepoRepository>(ServiceTokens.RepoRepository);
    const configService = container.resolve<ConfigService>(ServiceTokens.ConfigService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new CreateRepoCommand(repoRepo, configService, output);
  });

  container.register(ServiceTokens.ListReposCommand, () => {
    const repoRepo = container.resolve<RepoRepository>(ServiceTokens.RepoRepository);
    const configService = container.resolve<ConfigService>(ServiceTokens.ConfigService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new ListReposCommand(repoRepo, configService, output);
  });

  container.register(ServiceTokens.ViewRepoCommand, () => {
    const repoRepo = container.resolve<RepoRepository>(ServiceTokens.RepoRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new ViewRepoCommand(repoRepo, contextService, output);
  });

  container.register(ServiceTokens.DeleteRepoCommand, () => {
    const repoRepo = container.resolve<RepoRepository>(ServiceTokens.RepoRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new DeleteRepoCommand(repoRepo, contextService, output);
  });

  // Register PR commands
  container.register(ServiceTokens.CreatePRCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const gitService = container.resolve<GitService>(ServiceTokens.GitService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new CreatePRCommand(prRepo, contextService, gitService, output);
  });

  container.register(ServiceTokens.ListPRsCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new ListPRsCommand(prRepo, contextService, output);
  });

  container.register(ServiceTokens.ViewPRCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new ViewPRCommand(prRepo, contextService, output);
  });

  container.register(ServiceTokens.EditPRCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const gitService = container.resolve<GitService>(ServiceTokens.GitService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new EditPRCommand(prRepo, contextService, gitService, output);
  });

  container.register(ServiceTokens.MergePRCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new MergePRCommand(prRepo, contextService, output);
  });

  container.register(ServiceTokens.ApprovePRCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new ApprovePRCommand(prRepo, contextService, output);
  });

  container.register(ServiceTokens.DeclinePRCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new DeclinePRCommand(prRepo, contextService, output);
  });

  container.register(ServiceTokens.CheckoutPRCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const gitService = container.resolve<GitService>(ServiceTokens.GitService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new CheckoutPRCommand(prRepo, contextService, gitService, output);
  });

  container.register(ServiceTokens.DiffPRCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const gitService = container.resolve<GitService>(ServiceTokens.GitService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new DiffPRCommand(prRepo, contextService, gitService, output);
  });

  container.register(ServiceTokens.CommentPRCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new CommentPRCommand(prRepo, contextService, output);
  });

  container.register(ServiceTokens.ListCommentsPRCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new ListCommentsPRCommand(prRepo, contextService, output);
  });

  container.register(ServiceTokens.EditCommentPRCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new EditCommentPRCommand(prRepo, contextService, output);
  });

  container.register(ServiceTokens.DeleteCommentPRCommand, () => {
    const prRepo = container.resolve<PullRequestRepository>(ServiceTokens.PullRequestRepository);
    const contextService = container.resolve<ContextService>(ServiceTokens.ContextService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new DeleteCommentPRCommand(prRepo, contextService, output);
  });

  // Register config commands
  container.register(ServiceTokens.GetConfigCommand, () => {
    const configService = container.resolve<ConfigService>(ServiceTokens.ConfigService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new GetConfigCommand(configService, output);
  });

  container.register(ServiceTokens.SetConfigCommand, () => {
    const configService = container.resolve<ConfigService>(ServiceTokens.ConfigService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new SetConfigCommand(configService, output);
  });

  container.register(ServiceTokens.ListConfigCommand, () => {
    const configService = container.resolve<ConfigService>(ServiceTokens.ConfigService);
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new ListConfigCommand(configService, output);
  });

  // Register completion commands
  container.register(ServiceTokens.InstallCompletionCommand, () => {
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new InstallCompletionCommand(output);
  });

  container.register(ServiceTokens.UninstallCompletionCommand, () => {
    const output = container.resolve<OutputService>(ServiceTokens.OutputService);
    return new UninstallCompletionCommand(output);
  });

  return container;
}
