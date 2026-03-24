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

/** The comment anchor to which a task is attached. */
export interface PullRequestTaskAnchor {
  id: number;
  type: {
    id: 'COMMENT';
  };
}

/**
 * Represents a task (review to-do item) on a Bitbucket Data Center pull request.
 *
 * Tasks are created by reviewers on specific comments and can be either `OPEN` or `RESOLVED`.
 */
export interface BitbucketPullRequestTask {
  id: number;
  createdDate: number;
  author: BitbucketActivityUser;
  text: string;
  state: PullRequestTaskState;
  permittedOperations: PullRequestTaskPermittedOperations;
  /** The comment the task is anchored to */
  anchor: PullRequestTaskAnchor;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/tasks`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-pull-requests/#api-api-latest-projects-projectkey-repos-repositoryslug-pull-requests-pullrequestid-tasks-get}
 */
export interface TasksParams extends PaginationParams {}
