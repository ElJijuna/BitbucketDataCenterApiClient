import type { PaginationParams } from './Pagination';
import type { RefMatcher } from './RefMatcher';

/**
 * A default task: automatically added to pull requests whose source and target
 * refs match the configured matchers.
 */
export interface BitbucketDefaultTask {
  id: number;
  description: string;
  /** HTML-rendered form of `description`; present when requested with `markup: 'true'` */
  html?: string;
  sourceMatcher?: RefMatcher;
  targetMatcher?: RefMatcher;
}

/**
 * Payload shared by `POST …/tasks` (create) and `PUT …/tasks/{taskId}` (update)
 * of the default-tasks API.
 */
export interface DefaultTaskRequest {
  description: string;
  /** Defaults to matching any ref when omitted */
  sourceMatcher?: RefMatcher;
  /** Defaults to matching any ref when omitted */
  targetMatcher?: RefMatcher;
}

/**
 * Query parameters accepted by `GET …/tasks` of the default-tasks API.
 */
export interface DefaultTasksParams extends PaginationParams {
  /** Set to `'true'` to include the HTML-rendered `html` field on each task */
  markup?: string;
}
