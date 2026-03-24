import type { PaginationParams } from './Pagination';

/**
 * Represents a Bitbucket Data Center project.
 */
export interface BitbucketProject {
  key: string;
  id: number;
  name: string;
  description?: string;
  public: boolean;
  type: 'NORMAL' | 'PERSONAL';
  links: Record<string, unknown>;
}

/**
 * Query parameters accepted by `GET /rest/api/latest/projects`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-project/#api-api-latest-projects-get}
 */
export interface ProjectsParams extends PaginationParams {
  /** Filter by project name (case-insensitive prefix match) */
  name?: string;
  /**
   * Filter by the permission the authenticated user has on the project.
   * e.g. `'PROJECT_READ'`, `'PROJECT_WRITE'`, `'PROJECT_ADMIN'`
   */
  permission?: string;
}
