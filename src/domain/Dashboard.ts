import type { PaginationParams } from './Pagination';

/**
 * Query parameters accepted by `GET /rest/api/latest/dashboard/pull-requests`.
 */
export interface DashboardPullRequestsParams extends PaginationParams {
  /**
   * Filter by state. Defaults to `'OPEN'`.
   * Use `'ALL'` to retrieve pull requests in any state.
   */
  state?: 'OPEN' | 'DECLINED' | 'MERGED' | 'ALL';
  /** Filter by the authenticated user's role on the pull request. */
  role?: 'AUTHOR' | 'REVIEWER';
  /** Filter by the authenticated user's participant status (only meaningful when `role` is `'REVIEWER'`). */
  participantStatus?: 'APPROVED' | 'UNAPPROVED' | 'NEEDS_WORK';
  /** Only return pull requests closed since this time (seconds since the epoch). */
  closedSince?: number;
}

/**
 * Query parameters accepted by `GET /rest/api/latest/inbox/pull-requests`
 * and `GET /rest/api/latest/inbox/pull-requests/count`.
 */
export interface InboxPullRequestsParams extends PaginationParams {
  /** Filter by the authenticated user's role on the pull request. */
  role?: 'AUTHOR' | 'REVIEWER';
  /** Free-text search across the pull request title, description, author, and reviewers. */
  filterText?: string;
}

/**
 * Response for `GET /rest/api/latest/inbox/pull-requests/count`.
 */
export interface InboxPullRequestsCount {
  count: number;
}
