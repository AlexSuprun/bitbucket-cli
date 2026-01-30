/**
 * Version service for checking npm registry for updates
 */

import type { IConfigService } from "../core/interfaces/services.js";
import { Result } from "../types/result.js";
import { BBError, ErrorCode } from "../types/errors.js";
import type { VersionCheckResult } from "../types/version.js";
import { VERSION_CHECK_INTERVAL_MS } from "../types/version.js";

const NPM_REGISTRY_URL = "https://registry.npmjs.org/@pilatos/bitbucket-cli";
const PACKAGE_NAME = "@pilatos/bitbucket-cli";

interface NpmRegistryResponse {
  "dist-tags": {
    latest: string;
  };
}

export class VersionService {
  private readonly configService: IConfigService;
  private readonly currentVersion: string;

  constructor(configService: IConfigService, currentVersion: string) {
    this.configService = configService;
    this.currentVersion = currentVersion;
  }

  /**
   * Check if an update is available, respecting user preferences and caching
   */
  public async checkForUpdate(): Promise<Result<VersionCheckResult | null, BBError>> {
    // Check if user has disabled version checks
    const skipCheckResult = await this.configService.getValue("skipVersionCheck");
    if (!skipCheckResult.success) {
      return skipCheckResult;
    }

    if (skipCheckResult.value === true) {
      return Result.ok(null);
    }

    // Check if we're in a CI environment
    if (this.isCIEnvironment()) {
      return Result.ok(null);
    }

    // Check if enough time has passed since last check
    const shouldCheckResult = await this.shouldCheckVersion();
    if (!shouldCheckResult.success) {
      return shouldCheckResult;
    }

    if (!shouldCheckResult.value) {
      return Result.ok(null);
    }

    // Fetch latest version from npm
    const latestVersionResult = await this.fetchLatestVersion();
    if (!latestVersionResult.success) {
      // Silently fail - don't bother user with network errors
      return Result.ok(null);
    }

    const latestVersion = latestVersionResult.value;

    // Update last check timestamp
    await this.updateLastCheckTimestamp();

    // Compare versions
    const updateAvailable = this.isNewerVersion(latestVersion, this.currentVersion);

    return Result.ok({
      currentVersion: this.currentVersion,
      latestVersion,
      updateAvailable,
    });
  }

  /**
   * Check if we should check for updates based on last check time
   */
  private async shouldCheckVersion(): Promise<Result<boolean, BBError>> {
    const lastCheckResult = await this.configService.getValue("lastVersionCheck");
    if (!lastCheckResult.success) {
      return lastCheckResult;
    }

    const lastCheck = lastCheckResult.value;

    if (!lastCheck) {
      return Result.ok(true);
    }

    const lastCheckDate = new Date(lastCheck);
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - lastCheckDate.getTime();

    // Get custom interval or use default
    const intervalResult = await this.configService.getValue("versionCheckInterval");
    const intervalDays = intervalResult.success && intervalResult.value !== undefined
      ? Number(intervalResult.value)
      : 1;

    const intervalMs = intervalDays * 24 * 60 * 60 * 1000;

    return Result.ok(timeSinceLastCheck >= intervalMs);
  }

  /**
   * Update the last version check timestamp
   */
  private async updateLastCheckTimestamp(): Promise<Result<void, BBError>> {
    return this.configService.setValue("lastVersionCheck", new Date().toISOString());
  }

  /**
   * Fetch the latest version from npm registry
   */
  private async fetchLatestVersion(): Promise<Result<string, BBError>> {
    try {
      const response = await fetch(NPM_REGISTRY_URL, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return Result.err(
          new BBError({
            code: ErrorCode.NETWORK_ERROR,
            message: `Failed to fetch version info: ${response.statusText}`,
          })
        );
      }

      const data = (await response.json()) as NpmRegistryResponse;
      return Result.ok(data["dist-tags"].latest);
    } catch (error) {
      return Result.err(
        new BBError({
          code: ErrorCode.NETWORK_ERROR,
          message: "Failed to fetch version information from npm",
          cause: error instanceof Error ? error : undefined,
        })
      );
    }
  }

  /**
   * Check if we're running in a CI environment
   */
  private isCIEnvironment(): boolean {
    const ciEnvVars = [
      "CI",
      "CONTINUOUS_INTEGRATION",
      "BUILD_ID",
      "BUILD_NUMBER",
      "DRONE",
      "GITHUB_ACTIONS",
      "GITLAB_CI",
      "CIRCLECI",
      "TRAVIS",
      "JENKINS_URL",
      "HUDSON_URL",
    ];

    return ciEnvVars.some((varName) => process.env[varName] !== undefined);
  }

  /**
   * Compare two semver versions
   * Returns true if newVersion is newer than currentVersion
   */
  private isNewerVersion(newVersion: string, currentVersion: string): boolean {
    const parseVersion = (version: string): number[] => {
      // Remove 'v' prefix if present
      const cleanVersion = version.replace(/^v/, "");
      return cleanVersion.split(".").map((part) => {
        // Handle pre-release versions like "1.0.0-beta.1"
        const numPart = part.split("-")[0];
        return parseInt(numPart, 10) || 0;
      });
    };

    const newParts = parseVersion(newVersion);
    const currentParts = parseVersion(currentVersion);

    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
      const newPart = newParts[i] || 0;
      const currentPart = currentParts[i] || 0;

      if (newPart > currentPart) {
        return true;
      }
      if (newPart < currentPart) {
        return false;
      }
    }

    // Versions are equal, check for pre-release
    const newHasPreRelease = newVersion.includes("-");
    const currentHasPreRelease = currentVersion.includes("-");

    // Stable release is newer than pre-release with same version numbers
    if (!newHasPreRelease && currentHasPreRelease) {
      return true;
    }

    return false;
  }

  /**
   * Get the install command for the package
   */
  public getInstallCommand(): string {
    return `bun install -g ${PACKAGE_NAME}`;
  }
}
