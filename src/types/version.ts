/**
 * Version checking types
 */

export interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
}

export interface VersionInfo {
  version: string;
}

export const DEFAULT_VERSION_CHECK_INTERVAL_DAYS = 1;
export const VERSION_CHECK_INTERVAL_MS = DEFAULT_VERSION_CHECK_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
