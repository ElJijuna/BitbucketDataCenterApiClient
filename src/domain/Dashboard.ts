import type { PaginationParams } from './Pagination';
import type { RefChangeActivityChange, RefChangeActivityRef } from './RefChangeActivity';
import type { BitbucketRepository } from './Repository';

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

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/dashboard/pull-request-suggestions`.
 *
 * Note that this endpoint does not support a `start` offset — only `limit`.
 */
export interface PullRequestSuggestionsParams {
  /**
   * Restrict suggestions to changes that occurred since this time, in seconds
   * since the epoch. Defaults to `172800` (the last 48 hours).
   */
  changesSince?: number;
  /** Maximum number of suggestions to return */
  limit?: number;
}

/**
 * A pull request suggestion, based on a recent push by the authenticated user
 * to a branch without an open pull request.
 */
export interface BitbucketPullRequestSuggestion {
  /** When the change that produced this suggestion happened (ms since the epoch) */
  changeTime: number;
  /** The ref change (push) the suggestion is based on */
  refChange: RefChangeActivityChange;
  repository: BitbucketRepository;
  /** Suggested source ref for the pull request */
  fromRef: RefChangeActivityRef;
  /** Suggested target ref for the pull request */
  toRef: RefChangeActivityRef;
}
