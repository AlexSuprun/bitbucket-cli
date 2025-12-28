/**
 * Configuration service implementation
 */

import { join } from "path";
import { homedir } from "os";
import type { IConfigService } from "../core/interfaces/services.js";
import { Result } from "../types/result.js";
import { BBError, ErrorCode } from "../types/errors.js";
import type { BBConfig, AuthCredentials } from "../types/config.js";

export class ConfigService implements IConfigService {
  private readonly configDir: string;
  private readonly configFile: string;
  private configCache: BBConfig | null = null;

  constructor(configDir?: string) {
    this.configDir = configDir ?? join(homedir(), ".config", "bb");
    this.configFile = join(this.configDir, "config.json");
  }

  private async ensureConfigDir(): Promise<Result<void, BBError>> {
    try {
      const fs = await import("fs/promises");
      await fs.mkdir(this.configDir, { recursive: true });
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(
        new BBError({
          code: ErrorCode.CONFIG_WRITE_FAILED,
          message: `Failed to create config directory: ${this.configDir}`,
          cause: error instanceof Error ? error : undefined,
        })
      );
    }
  }

  public async getConfig(): Promise<Result<BBConfig, BBError>> {
    if (this.configCache) {
      return Result.ok(this.configCache);
    }

    try {
      const fs = await import("fs/promises");
      const data = await fs.readFile(this.configFile, "utf-8");
      this.configCache = JSON.parse(data) as BBConfig;
      return Result.ok(this.configCache);
    } catch (error) {
      // File doesn't exist - return empty config
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        this.configCache = {};
        return Result.ok(this.configCache);
      }

      return Result.err(
        new BBError({
          code: ErrorCode.CONFIG_READ_FAILED,
          message: `Failed to read config file: ${this.configFile}`,
          cause: error instanceof Error ? error : undefined,
        })
      );
    }
  }

  public async setConfig(config: BBConfig): Promise<Result<void, BBError>> {
    const ensureResult = await this.ensureConfigDir();
    if (!ensureResult.success) {
      return ensureResult;
    }

    try {
      const fs = await import("fs/promises");
      await fs.writeFile(this.configFile, JSON.stringify(config, null, 2), {
        mode: 0o600, // Secure permissions
      });
      this.configCache = config;
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(
        new BBError({
          code: ErrorCode.CONFIG_WRITE_FAILED,
          message: `Failed to write config file: ${this.configFile}`,
          cause: error instanceof Error ? error : undefined,
        })
      );
    }
  }

  public async getCredentials(): Promise<Result<AuthCredentials, BBError>> {
    const configResult = await this.getConfig();
    if (!configResult.success) {
      return configResult;
    }

    const { username, appPassword } = configResult.value;

    if (!username || !appPassword) {
      return Result.err(
        new BBError({
          code: ErrorCode.AUTH_REQUIRED,
          message: "Authentication required. Run 'bb auth login' to authenticate.",
        })
      );
    }

    return Result.ok({ username, appPassword });
  }

  public async setCredentials(credentials: AuthCredentials): Promise<Result<void, BBError>> {
    const configResult = await this.getConfig();
    if (!configResult.success) {
      return configResult;
    }

    return this.setConfig({
      ...configResult.value,
      username: credentials.username,
      appPassword: credentials.appPassword,
    });
  }

  public async clearConfig(): Promise<Result<void, BBError>> {
    this.configCache = null;
    return this.setConfig({});
  }

  public async getValue<K extends keyof BBConfig>(
    key: K
  ): Promise<Result<BBConfig[K] | undefined, BBError>> {
    const configResult = await this.getConfig();
    if (!configResult.success) {
      return configResult;
    }

    return Result.ok(configResult.value[key]);
  }

  public async setValue<K extends keyof BBConfig>(
    key: K,
    value: BBConfig[K]
  ): Promise<Result<void, BBError>> {
    const configResult = await this.getConfig();
    if (!configResult.success) {
      return configResult;
    }

    return this.setConfig({
      ...configResult.value,
      [key]: value,
    });
  }

  public getConfigPath(): string {
    return this.configFile;
  }

  /**
   * Clear the config cache (useful for testing)
   */
  public clearCache(): void {
    this.configCache = null;
  }
}
