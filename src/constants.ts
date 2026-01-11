/**
 * Application constants
 */

/**
 * Bitbucket Cloud API pagination limits
 *
 * Reference: https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/
 *
 * Different endpoints have different maximum pagelen values:
 * - Pull requests: maximum 50
 * - Repositories: maximum 100
 *
 * These limits are enforced by Bitbucket API and will return
 * "Invalid pagelen" error if exceeded.
 */
export const API_PAGELEN_LIMITS = {
  PULL_REQUESTS: 50,
  REPOSITORIES: 100,
} as const;

export const DEFAULT_PAGELEN = {
  PULL_REQUESTS: 25,
  REPOSITORIES: 25,
} as const;
