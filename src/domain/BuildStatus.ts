import type { PaginationParams } from './Pagination';

/** Build state for a commit. */
export type BuildState = 'SUCCESSFUL' | 'FAILED' | 'INPROGRESS' | 'CANCELLED' | 'UNKNOWN';

/**
 * Represents a build status associated with a commit.
 *
 * Returned by `GET /rest/build-status/latest/commits/{id}`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-builds-and-deployments/#api-build-status-latest-commits-commitid-get}
 */
export interface BitbucketBuildStatus {
  state: BuildState;
  key: string;
  name?: string;
  url: string;
  description?: string;
  dateAdded: number;
}

/**
 * Query parameters accepted by `GET /rest/build-status/latest/commits/{id}`.
 */
export interface BuildStatusesParams extends PaginationParams {
  /** Filter by build key */
  key?: string;
}
