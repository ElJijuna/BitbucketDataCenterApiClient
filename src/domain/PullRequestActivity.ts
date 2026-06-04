import type { BitbucketCommit } from './Commit';
import type { PaginationParams } from './Pagination';
import type { BitbucketParticipant } from './PullRequest';

/** Minimal user shape used inside activity records. */
export interface BitbucketActivityUser {
  name: string;
  emailAddress: string;
  id: number;
  displayName: string;
  active: boolean;
  slug: string;
  type: string;
}

/**
 * Payload for `POST /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/comments`.
 */
export interface AddCommitCommentData {
  text: string;
  /** Anchor the comment to a specific file/line. */
  anchor?: {
    line?: number;
    lineType?: 'CONTEXT' | 'ADDED' | 'REMOVED';
    fileType?: 'FROM' | 'TO';
    path?: string;
    srcPath?: string;
  };
  /** Parent comment id for reply threads. */
  parent?: { id: number };
}

/** A comment posted on a pull request. */
export interface BitbucketPullRequestComment {
  id: number;
  version: number;
  text: string;
  author: BitbucketActivityUser;
  createdDate: number;
  updatedDate: number;
  comments: BitbucketPullRequestComment[];
  tasks: unknown[];
  links: Record<string, unknown>;
}

/**
 * All possible action types for a pull request activity.
 *
 * - `OPENED`     — PR was opened
 * - `APPROVED`   — a reviewer approved
 * - `UNAPPROVED` — a reviewer removed their approval
 * - `NEEDS_WORK` — a reviewer requested changes
 * - `COMMENTED`  — a comment was posted
 * - `RESCOPED`   — commits were added or removed from the PR
 * - `MERGED`     — PR was merged
 * - `DECLINED`   — PR was declined
 * - `REVIEWED`   — PR was reviewed without an explicit vote
 */
export type PullRequestActivityAction =
  | 'OPENED'
  | 'APPROVED'
  | 'UNAPPROVED'
  | 'NEEDS_WORK'
  | 'COMMENTED'
  | 'RESCOPED'
  | 'MERGED'
  | 'DECLINED'
  | 'REVIEWED';

/**
 * Represents a single activity entry on a Bitbucket Data Center pull request.
 *
 * The optional fields are populated depending on `action`:
 * - `COMMENTED`  → `comment` is present
 * - `RESCOPED`   → `addedCommits`, `removedCommits`, `fromHash`, `toHash`, etc. are present
 * - `APPROVED` / `UNAPPROVED` / `NEEDS_WORK` → `participant` is present
 */
export interface BitbucketPullRequestActivity {
  id: number;
  createdDate: number;
  user: BitbucketActivityUser;
  action: PullRequestActivityAction;
  /** Present when `action` is `'COMMENTED'` */
  comment?: BitbucketPullRequestComment;
  /** Present when `action` is `'APPROVED'`, `'UNAPPROVED'`, or `'NEEDS_WORK'` */
  participant?: BitbucketParticipant;
  /** Present when `action` is `'RESCOPED'` — commits added to the PR */
  addedCommits?: BitbucketCommit[];
  /** Present when `action` is `'RESCOPED'` — commits removed from the PR */
  removedCommits?: BitbucketCommit[];
  fromHash?: string;
  previousFromHash?: string;
  previousToHash?: string;
  toHash?: string;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/activities`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-pull-requests/#api-api-latest-projects-projectkey-repos-repositoryslug-pull-requests-pullrequestid-activities-get}
 */
export interface ActivitiesParams extends PaginationParams {
  /**
   * Filter the results to contain only activities with the supplied `id`
   * as the anchor, starting from the supplied activity.
   */
  fromId?: number;
  /**
   * When `fromId` is set, filter by activity type:
   * - `'COMMENT'`  — start from a comment
   * - `'ACTIVITY'` — start from a generic activity
   */
  fromType?: 'COMMENT' | 'ACTIVITY';
}
