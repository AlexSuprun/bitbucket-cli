/**
 * List repositories command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type {
  IRepoRepository,
  IConfigService,
  IOutputService,
} from "../../core/interfaces/services.js";
import { Result } from "../../types/result.js";
import { BBError, ErrorCode } from "../../types/errors.js";
import type { BitbucketRepository, PaginatedResponse } from "../../types/api.js";

export interface ListReposOptions {
  workspace?: string;
  limit?: string;
}

export class ListReposCommand extends BaseCommand<
  ListReposOptions,
  PaginatedResponse<BitbucketRepository>
> {
  public readonly name = "list";
  public readonly description = "List repositories";

  constructor(
    private readonly repoRepository: IRepoRepository,
    private readonly configService: IConfigService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: ListReposOptions,
    context: CommandContext
  ): Promise<Result<PaginatedResponse<BitbucketRepository>, BBError>> {
    // Resolve workspace
    const workspaceResult = await this.resolveWorkspace(options.workspace);
    if (!workspaceResult.success) {
      this.handleResult(workspaceResult, context);
      return workspaceResult;
    }

    const workspace = workspaceResult.value;
    const limit = parseInt(options.limit || "25", 10);

    // List repositories
    const result = await this.repoRepository.list(workspace, limit);

    this.handleResult(result, context, (data) => {
      if (data.values.length === 0) {
        this.output.text("No repositories found");
        return;
      }

      const rows = data.values.map((repo) => [
        repo.full_name,
        repo.is_private ? "private" : "public",
        (repo.description || "").substring(0, 50),
      ]);

      this.output.table(["REPOSITORY", "VISIBILITY", "DESCRIPTION"], rows);
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
