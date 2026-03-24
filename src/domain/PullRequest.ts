import type { PaginationParams } from './Pagination';

/** A git ref (branch or tag) as referenced in a pull request. */
export interface BitbucketRef {
  id: string;
  displayId: string;
  latestCommit: string;
  type: 'BRANCH' | 'TAG';
  repository: {
    slug: string;
    id: number;
    name: string;
    links: Record<string, unknown>;
  };
}

/** A user participating in a pull request (author, reviewer, or participant). */
export interface BitbucketParticipant {
  user: {
    name: string;
    emailAddress: string;
    id: number;
    displayName: string;
    active: boolean;
    slug: string;
    type: string;
  };
  role: 'AUTHOR' | 'REVIEWER' | 'PARTICIPANT';
  approved: boolean;
  status: 'APPROVED' | 'UNAPPROVED' | 'NEEDS_WORK';
}

/**
 * Represents a Bitbucket Data Center pull request.
 */
export interface BitbucketPullRequest {
  id: number;
  version: number;
  title: string;
  description?: string;
  state: 'OPEN' | 'DECLINED' | 'MERGED';
  open: boolean;
  closed: boolean;
  createdDate: number;
  updatedDate: number;
  fromRef: BitbucketRef;
  toRef: BitbucketRef;
  locked: boolean;
  author: BitbucketParticipant;
  reviewers: BitbucketParticipant[];
  participants: BitbucketParticipant[];
  links: Record<string, unknown>;
}

/**
 * Query parameters accepted by `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-pull-requests/#api-api-latest-projects-projectkey-repos-repositoryslug-pull-requests-get}
 */
export interface PullRequestsParams extends PaginationParams {
  /**
   * Filter by state. Defaults to `'OPEN'`.
   * Use `'ALL'` to retrieve pull requests in any state.
   */
  state?: 'OPEN' | 'DECLINED' | 'MERGED' | 'ALL';
  /**
   * Filter by direction relative to the current user.
   * - `'INCOMING'` — pull requests targeting a branch the user owns
   * - `'OUTGOING'` — pull requests from branches the user owns
   */
  direction?: 'INCOMING' | 'OUTGOING';
  /** Filter by target branch ref (e.g., `'refs/heads/main'`) */
  at?: string;
  /** Sort order of results */
  order?: 'NEWEST' | 'OLDEST' | 'MODIFIED' | 'CLOSED_DATE';
}
