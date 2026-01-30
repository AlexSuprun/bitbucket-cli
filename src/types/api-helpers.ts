/**
 * Type wrappers and utilities for the generated API
 * Works around limitations in the generated axios client
 */

import type {
  Pullrequest,
  Repository,
  Account,
  PullrequestComment,
  PullrequestMergeParameters,
} from '../generated/api.js';

/**
 * Helper to convert Set to Array
 */
export function toArray<T>(set: Set<T> | T[] | undefined): T[] {
  if (!set) return [];
  if (Array.isArray(set)) return set;
  return Array.from(set);
}

/**
 * Create a Pullrequest object with required type field
 */
export function createPullrequest(
  data: Omit<Pullrequest, 'type'>
): Pullrequest {
  return {
    ...data,
    type: 'pullrequest',
  } as Pullrequest;
}

/**
 * Create a Repository object with required type field
 */
export function createRepository(data: Omit<Repository, 'type'>): Repository {
  return {
    ...data,
    type: 'repository',
  } as Repository;
}

/**
 * Create an Account object with required type field
 */
export function createAccount(data: Omit<Account, 'type'>): Account {
  return {
    ...data,
    type: 'user',
  } as Account;
}

/**
 * Create a PullrequestComment object with required type field
 */
export function createPullrequestComment(
  data: Omit<PullrequestComment, 'type'>
): PullrequestComment {
  return {
    ...data,
    type: 'pullrequest_comment',
  } as PullrequestComment;
}

/**
 * Create a PullrequestMergeParameters object with required type field
 */
export function createPullrequestMergeParameters(
  data: Omit<PullrequestMergeParameters, 'type'>
): PullrequestMergeParameters {
  return {
    ...data,
    type: 'pullrequest_merge_parameters',
  } as PullrequestMergeParameters;
}

/**
 * Type guard for paginated responses
 */
export interface PaginatedResponse<T> {
  values?: T[];
  pagelen?: number;
  size?: number;
  page?: number;
  next?: string;
  previous?: string;
}

/**
 * Safely access link href from object type
 */
export function getLinkHref(
  links: object | undefined,
  key: string
): string | undefined {
  if (!links) return undefined;
  const l = links as Record<string, { href?: string } | undefined>;
  return l[key]?.href;
}

/**
 * Safely access clone links
 */
export function getCloneLinks(
  links: object | undefined
): Array<{ name: string; href: string }> {
  if (!links) return [];
  const l = links as Record<string, unknown>;
  const clone = l.clone;
  if (!clone) return [];
  if (Array.isArray(clone))
    return clone as Array<{ name: string; href: string }>;
  return [];
}

/**
 * Safely access branch name from source/destination
 */
export function getBranchName(
  sourceOrDest: object | undefined
): string | undefined {
  if (!sourceOrDest) return undefined;
  const s = sourceOrDest as Record<string, unknown>;
  const branch = s.branch as Record<string, string> | undefined;
  return branch?.name;
}
