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
 * Payload for `POST /rest/api/latest/projects`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-project/#api-api-latest-projects-post}
 */
export interface CreateProjectData {
  /** The project key (e.g. `'PROJ'`) */
  key: string;
  name: string;
  description?: string;
  /** Base64-encoded avatar image as a data URI, e.g. `data:image/png;base64,...` */
  avatar?: string;
}

/**
 * Payload for `PUT /rest/api/latest/projects/{key}`.
 *
 * @remarks Per the official schema, `name`, `public`, `type`, and `id` are
 * **read-only** on this endpoint — attempting to change them has no effect.
 * Only the avatar and (nominally) `key`/`links` are writable.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-project/#api-api-latest-projects-projectkey-put}
 */
export interface UpdateProjectData {
  /** Base64-encoded avatar image as a data URI, e.g. `data:image/png;base64,...` */
  avatar?: string;
  avatarUrl?: string;
  key?: string;
  links?: Record<string, unknown>;
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
