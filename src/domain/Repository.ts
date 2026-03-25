import type { PaginationParams } from './Pagination';
import type { BitbucketProject } from './Project';

/**
 * Represents a Bitbucket Data Center repository.
 */
export interface BitbucketRepository {
  slug: string;
  id: number;
  name: string;
  description?: string;
  state: string;
  statusMessage: string;
  forkable: boolean;
  project: BitbucketProject;
  public: boolean;
  links: Record<string, unknown>;
}

/**
 * Query parameters accepted by `GET /rest/api/latest/projects/{key}/repos`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-repository/#api-api-latest-projects-projectkey-repos-get}
 */
export interface ReposParams extends PaginationParams {
  /** Filter by repository slug (case-insensitive prefix match) */
  slug?: string;
  /** Filter by repository name (case-insensitive prefix match) */
  name?: string;
  /**
   * Filter by the permission the authenticated user has on the repository.
   * e.g. `'REPO_READ'`, `'REPO_WRITE'`, `'REPO_ADMIN'`
   */
  permission?: string;
}

/**
 * Query parameters accepted by `GET /rest/api/latest/repos` (global repository search).
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-repository/#api-api-latest-repos-get}
 */
export interface SearchReposParams extends PaginationParams {
  /**
   * Filter by repository name. A `%` prefix is automatically prepended to
   * perform a contains-style match (e.g. `'api'` → `'%api'`).
   */
  name?: string;
  /** Filter by project key (exact match) */
  projectkey?: string;
  /** Filter by project name (case-insensitive prefix match) */
  projectname?: string;
  /**
   * Filter by the permission the authenticated user has on the repository.
   * e.g. `'REPO_READ'`, `'REPO_WRITE'`, `'REPO_ADMIN'`
   */
  permission?: string;
  /** Filter by visibility: `'public'` or `'private'` */
  visibility?: 'public' | 'private';
  /** Filter by repository state */
  state?: 'AVAILABLE' | 'INITIALISING' | 'INITIALISATION_FAILED';
}
