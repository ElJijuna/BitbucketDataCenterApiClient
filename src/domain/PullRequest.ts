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

/** A user participating in a pull request (creator, author, reviewer, or participant). */
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
  role: 'AUTHOR' | 'REVIEWER' | 'PARTICIPANT' | 'CREATOR';
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
  /** The original creator (returned by 10.4; optional for compatibility with 10.3 responses). */
  creator?: BitbucketParticipant;
  reviewers: BitbucketParticipant[];
  participants: BitbucketParticipant[];
  links: Record<string, unknown>;
}

/**
 * Payload for `PUT /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/participants/{userSlug}`,
 * used to approve, unapprove, or request changes on behalf of a participant.
 */
export interface SetParticipantStatusData {
  user: { name: string };
  approved: boolean;
  status: 'APPROVED' | 'UNAPPROVED' | 'NEEDS_WORK';
}

/**
 * Payload for `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/participants`.
 */
export interface AddReviewerData {
  user: { name: string };
}

/**
 * Payload for `PUT /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}`.
 *
 * `version` must match the pull request's current version (optimistic locking);
 * Bitbucket rejects the request with a `409 Conflict` otherwise.
 */
export interface UpdatePullRequestData {
  version: number;
  title?: string;
  description?: string;
  /** Assigns a new pull request author (Bitbucket Data Center 10.4+). */
  author?: { user: { name: string } };
  toRef?: { id: string };
  reviewers?: { user: { name: string } }[];
}

/**
 * Payload for `DELETE /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}`.
 */
export interface DeletePullRequestData {
  version: number;
}

/**
 * Payload for `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/merge`.
 */
export interface MergePullRequestData {
  version: number;
  message?: string;
  strategyId?: string;
  autoSubject?: boolean;
}

/**
 * Payload for `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/decline`
 * and `POST …/pull-requests/{id}/reopen`.
 */
export interface TransitionPullRequestData {
  version: number;
}

/** A reason the pull request currently cannot be merged. */
export interface MergeVeto {
  summaryMessage: string;
  detailedMessage: string;
}

/**
 * Response for `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/merge`.
 */
export interface CanMergeResult {
  canMerge: boolean;
  conflicted: boolean;
  vetoes: MergeVeto[];
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

/**
 * A ref reference used when creating a pull request. `repository` is only
 * needed for cross-fork pull requests; it defaults to the repository the
 * pull request is created in.
 */
export interface PullRequestRefInput {
  /** Full ref id (e.g. `'refs/heads/feature/x'`) */
  id: string;
  repository?: {
    slug: string;
    project: { key: string };
  };
}

/**
 * Payload for `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-pull-requests/#api-api-latest-projects-projectkey-repos-repositoryslug-pull-requests-post}
 */
export interface CreatePullRequestData {
  title: string;
  description?: string;
  fromRef: PullRequestRefInput;
  toRef: PullRequestRefInput;
  /** Reviewers to add, identified by username */
  reviewers?: Array<{ user: { name: string } }>;
  /** Create the pull request as a draft */
  draft?: boolean;
}
