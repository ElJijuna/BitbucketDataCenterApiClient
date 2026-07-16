import type { PaginationParams } from './Pagination';

/**
 * Represents a Bitbucket Data Center user.
 */
export interface BitbucketUser {
  name: string;
  emailAddress: string;
  id: number;
  displayName: string;
  active: boolean;
  slug: string;
  type: 'NORMAL' | 'SERVICE';
  links: Record<string, unknown>;
}

/**
 * A user with an explicit permission on a project.
 */
export interface BitbucketUserPermission {
  user: BitbucketUser;
  permission: 'PROJECT_READ' | 'PROJECT_WRITE' | 'PROJECT_ADMIN';
}

/** A repository-level permission grant. */
export type RepositoryPermission = 'REPO_READ' | 'REPO_WRITE' | 'REPO_ADMIN';

/**
 * A user with an explicit permission on a repository.
 */
export interface BitbucketRepositoryUserPermission {
  user: BitbucketUser;
  permission: RepositoryPermission;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/permissions/users`.
 */
export interface RepositoryUsersParams extends PaginationParams {
  /** Filter results by display name or username (prefix match) */
  filter?: string;
}

/**
 * Query parameters accepted by `GET /rest/api/latest/users`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-users/#api-api-latest-users-get}
 */
export interface UsersParams extends PaginationParams {
  /** Filter results by display name or username (prefix match) */
  filter?: string;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/permissions/users`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-project/#api-api-latest-projects-projectkey-permissions-users-get}
 */
export interface ProjectUsersParams extends PaginationParams {
  /** Filter results by display name or username (prefix match) */
  filter?: string;
  /** Filter by the permission level on the project */
  permission?: 'PROJECT_READ' | 'PROJECT_WRITE' | 'PROJECT_ADMIN';
}
