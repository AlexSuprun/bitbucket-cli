/**
 * Create repository command implementation
 */

import chalk from "chalk";
import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type {
  IRepoRepository,
  IConfigService,
  IOutputService,
} from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import { BBError, ValidationError, ErrorCode } from "../../types/errors.js";
import type { BitbucketRepository, CreateRepositoryRequest } from "../../types/api.js";

export interface CreateRepoOptions {
  workspace?: string;
  description?: string;
  private?: boolean;
  public?: boolean;
  project?: string;
}

export class CreateRepoCommand extends BaseCommand<
  { name: string } & CreateRepoOptions,
  BitbucketRepository
> {
  public readonly name = "create";
  public readonly description = "Create a new repository";

  constructor(
    private readonly repoRepository: IRepoRepository,
    private readonly configService: IConfigService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { name: string } & CreateRepoOptions,
    context: CommandContext
  ): Promise<Result<BitbucketRepository, BBError>> {
    const { name, description, project } = options;
    const isPublic = options.public === true;

    // Resolve workspace
    const workspaceResult = await this.resolveWorkspace(options.workspace);
    if (!workspaceResult.success) {
      this.handleResult(workspaceResult, context);
      return workspaceResult;
    }

    const workspace = workspaceResult.value;

    // Build request
    const request: CreateRepositoryRequest = {
      scm: "git",
      name,
      is_private: !isPublic,
    };

    if (description) {
      request.description = description;
    }

    if (project) {
      request.project = { key: project };
    }

    // Create repository
    const result = await this.repoRepository.create(workspace, request);

    this.handleResult(result, context, (repo) => {
      this.output.success(`Created repository ${repo.full_name}`);
      this.output.text(`  ${chalk.dim("URL:")} ${repo.links.html.href}`);

      const sshClone = repo.links.clone.find((c) => c.name === "ssh");
      if (sshClone) {
        this.output.text(`  ${chalk.dim("Clone:")} git clone ${sshClone.href}`);
      }
    });

    return result;
  }

  private async resolveWorkspace(
    workspace?: string
  ): Promise<Result<string, BBError>> {
    if (workspace) {
      return Result.ok(workspace);
    }

    const configResult = await this.configService.getConfig();
    if (!configResult.success) {
      return configResult;
    }

    if (!configResult.value.defaultWorkspace) {
      return Result.err(
        new BBError({
          code: ErrorCode.CONTEXT_WORKSPACE_NOT_FOUND,
          message: "No workspace specified. Use --workspace option or set a default workspace.",
        })
      );
    }

    return Result.ok(configResult.value.defaultWorkspace);
  }
}
