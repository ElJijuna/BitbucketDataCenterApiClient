import type { PaginationParams } from './Pagination';
import type { RefMatcher } from './RefMatcher';
import type { BitbucketScope } from './Scope';
import type { BitbucketUser } from './User';

/**
 * The kind of action a ref restriction blocks.
 *
 * - `'read-only'` — prevents all pushes to the matched refs
 * - `'no-deletes'` — prevents the matched refs from being deleted
 * - `'fast-forward-only'` — prevents history rewrites (force pushes) on the matched refs
 * - `'pull-request-only'` — prevents direct pushes; changes must come in via pull requests
 */
export type RefRestrictionType =
  | 'read-only'
  | 'no-deletes'
  | 'fast-forward-only'
  | 'pull-request-only';

/** An SSH access key exempted from a ref restriction. */
export interface RefRestrictionAccessKey {
  key?: {
    id?: number;
    text?: string;
    label?: string;
  };
}

/**
 * A ref restriction (branch permission) configured on a project or repository.
 * Users, groups, and access keys listed on the restriction are exempt from it.
 */
export interface BitbucketRefRestriction {
  id: number;
  type: RefRestrictionType;
  matcher: RefMatcher;
  /** The project or repository the restriction is configured on */
  scope?: BitbucketScope;
  /** Users exempt from the restriction */
  users?: BitbucketUser[];
  /** Names of groups exempt from the restriction */
  groups?: string[];
  /** SSH access keys exempt from the restriction */
  accessKeys?: RefRestrictionAccessKey[];
}

/**
 * Payload for creating a ref restriction via the branch-permissions API.
 */
export interface RefRestrictionRequest {
  type: RefRestrictionType;
  matcher: RefMatcher;
  /** Slugs of users to exempt from the restriction */
  userSlugs?: string[];
  /** Names of groups to exempt from the restriction */
  groupNames?: string[];
  /** Ids of SSH access keys to exempt from the restriction */
  accessKeyIds?: number[];
}

/**
 * Query parameters accepted by the branch-permissions restriction list endpoints.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-branch-permissions/}
 */
export interface RefRestrictionsParams extends PaginationParams {
  /** Filter by matcher type (e.g. `'BRANCH'`, `'PATTERN'`) */
  matcherType?: string;
  /** Filter by matcher id (e.g. `'refs/heads/main'`); only used together with `matcherType` */
  matcherId?: string;
  /** Filter by restriction type */
  type?: RefRestrictionType;
}
