import type { PaginationParams } from './Pagination';
import type { BitbucketActivityUser } from './PullRequestActivity';

/** The state of a pull request task. */
export type PullRequestTaskState = 'OPEN' | 'RESOLVED';

/** Operations the authenticated user is permitted to perform on a task. */
export interface PullRequestTaskPermittedOperations {
  editable: boolean;
  deletable: boolean;
  transitionable: boolean;
}

/**
 * The comment anchor to which a legacy task was attached.
 *
 * @deprecated Tasks are blocker comments since Bitbucket 7.2 and are no longer
 * anchored to a separate comment. Kept for backwards compatibility.
 */
export interface PullRequestTaskAnchor {
  id: number;
  type: {
    id: 'COMMENT';
  };
}

/**
 * Represents a task (review to-do item) on a Bitbucket Data Center pull request.
 *
 * Since Bitbucket 7.2 tasks are modelled as blocker comments: comments with
 * `severity: 'BLOCKER'` whose `state` can be `OPEN` or `RESOLVED`.
 */
export interface BitbucketPullRequestTask {
  id: number;
  version?: number;
  createdDate: number;
  updatedDate?: number;
  author: BitbucketActivityUser;
  text: string;
  /** Blocker comments (tasks) always have `BLOCKER` severity */
  severity: 'BLOCKER';
  state: PullRequestTaskState;
  permittedOperations: PullRequestTaskPermittedOperations;
  /** Timestamp of resolution, present when `state` is `RESOLVED` */
  resolvedDate?: number;
  /** The user who resolved the task, present when `state` is `RESOLVED` */
  resolver?: BitbucketActivityUser;
  /** @deprecated Legacy field from the removed `/tasks` endpoint */
  anchor?: PullRequestTaskAnchor;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/blocker-comments`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-pull-requests/#api-api-latest-projects-projectkey-repos-repositoryslug-pull-requests-pullrequestid-blocker-comments-get}
 */
export interface TasksParams extends PaginationParams {
  /** Only return tasks in the given states (e.g. `'OPEN'`, `'RESOLVED'`) */
  states?: string;
  /** If `true`, only the count of tasks by state is returned */
  count?: boolean;
}
