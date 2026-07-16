import type { BitbucketUser } from './User';

/**
 * Query parameters accepted by `GET /rest/api/latest/projects/{key}/permissions/search`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-project/#api-api-latest-projects-projectkey-permissions-search-get}
 */
export interface PermissionSearchParams {
  /**
   * Permission to filter by (global or project-level, e.g. `'PROJECT_READ'`).
   * Pass an array to filter by more than one permission.
   */
  permission?: string | string[];
  /** Filter by user or group name */
  filterText?: string;
  /** Filter by entity type */
  type?: 'USER' | 'GROUP';
}

/**
 * A user or group holding direct or implied permissions on a project.
 *
 * @remarks Atlassian does not publish a response schema for the
 * `permissions/search` endpoint; this shape is typed defensively and all
 * fields are optional. Inspect real responses from your Bitbucket version
 * before relying on a specific field.
 */
export interface PermittedEntity {
  /** Whether the entry is a user or a group */
  type?: 'USER' | 'GROUP';
  /** Name of the user or group */
  name?: string;
  /** The full user object, when the entry is a user */
  user?: BitbucketUser;
  /** Permissions the entity holds (directly or implied) */
  permissions?: string[];
  /** Single permission, on Bitbucket versions that report one entry per grant */
  permission?: string;
}
