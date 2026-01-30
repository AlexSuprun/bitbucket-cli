/**
 * List PR activity command implementation
 */

import { BaseCommand } from "../../core/base-command.js";
import type { CommandContext } from "../../core/interfaces/commands.js";
import type { IContextService, IOutputService } from "../../core/interfaces/services.js";
import type { PullrequestsApi } from "../../generated/api.js";
import type { GlobalOptions } from "../../types/config.js";

export interface ActivityPROptions extends GlobalOptions {
  limit?: string;
  type?: string;
}

export class ActivityPRCommand extends BaseCommand<{ id: string } & ActivityPROptions, void> {
  public readonly name = "activity";
  public readonly description = "Show pull request activity history";

  constructor(
    private readonly pullrequestsApi: PullrequestsApi,
    private readonly contextService: IContextService,
    output: IOutputService
  ) {
    super(output);
  }

  public async execute(
    options: { id: string } & ActivityPROptions,
    context: CommandContext
  ): Promise<void> {
    const repoContext = await this.contextService.requireRepoContext({
      ...context.globalOptions,
      ...options,
    });

    const prId = parseInt(options.id, 10);
    const limit = options.limit ? parseInt(options.limit, 10) : 25;

    try {
      const response = await this.pullrequestsApi.repositoriesWorkspaceRepoSlugPullrequestsPullRequestIdActivityGet({
        workspace: repoContext.workspace,
        repoSlug: repoContext.repoSlug,
        pullRequestId: prId,
        pagelen: limit,
      });

      const data = response.data;

      const filterTypes = this.parseTypeFilter(options.type);
      const activities = filterTypes.length > 0
        ? (data.values ?? []).filter((activity) => filterTypes.includes(this.getActivityType(activity)))
        : (data.values ?? []);

      if (activities.length === 0) {
        if (filterTypes.length > 0) {
          this.output.info("No activity entries matched the requested filter");
        } else {
          this.output.info("No activity found on this pull request");
        }
        return;
      }

      const rows = activities.map((activity) => {
        const activityType = this.getActivityType(activity);
        return [
          activityType.toUpperCase(),
          this.getActorName(activity),
          this.formatActivityDate(activity),
          this.buildActivityDetails(activity, activityType),
        ];
      });

      this.output.table(["TYPE", "ACTOR", "DATE", "DETAILS"], rows);
    } catch (error) {
      this.handleError(error, context);
      throw error;
    }
  }

  private parseTypeFilter(typeOption?: string): string[] {
    if (!typeOption) {
      return [];
    }

    return typeOption
      .split(",")
      .map((type) => type.trim().toLowerCase())
      .filter((type) => type.length > 0);
  }

  private getActivityType(activity: {
    comment?: unknown;
    approval?: unknown;
    changes_requested?: unknown;
    merge?: unknown;
    decline?: unknown;
    commit?: unknown;
    update?: unknown;
    type?: string;
  }): string {
    if (activity.comment) {
      return "comment";
    }

    if (activity.approval) {
      return "approval";
    }

    if (activity.changes_requested) {
      return "changes_requested";
    }

    if (activity.merge) {
      return "merge";
    }

    if (activity.decline) {
      return "decline";
    }

    if (activity.commit) {
      return "commit";
    }

    if (activity.update) {
      return "update";
    }

    return activity.type ? activity.type.toLowerCase() : "activity";
  }

  private getActorName(activity: {
    comment?: { user?: { display_name?: string; username?: string }; author?: { display_name?: string; username?: string } };
    approval?: { user?: { display_name?: string; username?: string } };
    update?: { author?: { display_name?: string; username?: string } };
    changes_requested?: { user?: { display_name?: string; username?: string } };
    merge?: { user?: { display_name?: string; username?: string } };
    decline?: { user?: { display_name?: string; username?: string } };
    commit?: { author?: { user?: { display_name?: string; username?: string } } };
    user?: { display_name?: string; username?: string };
  }): string {
    const user =
      activity.comment?.user ??
      activity.comment?.author ??
      activity.approval?.user ??
      activity.update?.author ??
      activity.changes_requested?.user ??
      activity.merge?.user ??
      activity.decline?.user ??
      activity.commit?.author?.user ??
      activity.user;

    if (!user) {
      return "Unknown";
    }

    return user.display_name || user.username || "Unknown";
  }

  private formatActivityDate(activity: {
    comment?: { created_on?: string };
    approval?: { date?: string };
    update?: { date?: string };
    changes_requested?: { date?: string };
    merge?: { date?: string };
    decline?: { date?: string };
    commit?: { date?: string };
  }): string {
    const date =
      activity.comment?.created_on ??
      activity.approval?.date ??
      activity.update?.date ??
      activity.changes_requested?.date ??
      activity.merge?.date ??
      activity.decline?.date ??
      activity.commit?.date;

    if (!date) {
      return "-";
    }

    return this.output.formatDate(date);
  }

  private buildActivityDetails(activity: {
    comment?: { content?: { raw?: string }; id?: number };
    changes_requested?: { reason?: string };
    merge?: { commit?: { hash?: string } };
    commit?: { hash?: string };
    update?: { state?: string; title?: string; description?: string };
  }, type: string): string {
    switch (type) {
      case "comment": {
        const content = activity.comment?.content?.raw ?? "";
        const id = activity.comment?.id ? `#${activity.comment.id}` : "";
        const snippet = this.truncate(content, 80);
        return [id, snippet].filter(Boolean).join(" ");
      }
      case "approval":
        return "approved";
      case "changes_requested": {
        const reason = activity.changes_requested?.reason;
        return reason ? this.truncate(reason, 80) : "changes requested";
      }
      case "merge":
        return this.formatCommitDetail(activity.merge?.commit?.hash, "merged");
      case "decline":
        return "declined";
      case "commit":
        return this.formatCommitDetail(activity.commit?.hash, "commit");
      case "update": {
        if (activity.update?.state) {
          return `state: ${activity.update.state}`;
        }
        if (activity.update?.title) {
          return `title: ${this.truncate(activity.update.title, 60)}`;
        }
        if (activity.update?.description) {
          return "description updated";
        }
        return "updated";
      }
      default:
        return "";
    }
  }

  private formatCommitDetail(hash?: string, label?: string): string {
    if (!hash) {
      return label ?? "";
    }

    const shortHash = hash.slice(0, 7);
    return label ? `${label} ${shortHash}` : shortHash;
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 3) + "...";
  }
}
