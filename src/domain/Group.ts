import type { PaginationParams } from './Pagination';

/**
 * Represents a Bitbucket Data Center group.
 */
export interface BitbucketGroup {
  name: string;
}

/**
 * A group with an explicit permission on a project.
 */
export interface BitbucketGroupPermission {
  group: BitbucketGroup;
  permission: 'PROJECT_READ' | 'PROJECT_WRITE' | 'PROJECT_ADMIN';
}

/**
 * A group with an explicit permission on a repository.
 */
export interface BitbucketRepositoryGroupPermission {
  group: BitbucketGroup;
  permission: 'REPO_READ' | 'REPO_WRITE' | 'REPO_ADMIN';
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/permissions/groups`.
 */
export interface RepositoryGroupsParams extends PaginationParams {
  /** Filter results by group name (prefix match) */
  filter?: string;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/permissions/groups`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-project/#api-api-latest-projects-projectkey-permissions-groups-get}
 */
export interface ProjectGroupsParams extends PaginationParams {
  /** Filter results by group name (prefix match) */
  filter?: string;
  /** Filter by the permission level on the project */
  permission?: 'PROJECT_READ' | 'PROJECT_WRITE' | 'PROJECT_ADMIN';
}
