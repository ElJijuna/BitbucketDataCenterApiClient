import type { BitbucketPullRequest } from '../domain/PullRequest';
import type { BitbucketPullRequestActivity, ActivitiesParams } from '../domain/PullRequestActivity';
import type { BitbucketPullRequestTask, TasksParams } from '../domain/PullRequestTask';
import type { BitbucketCommit } from '../domain/Commit';
import type { BitbucketChange, ChangesParams } from '../domain/Change';
import type { BitbucketReport, ReportsParams } from '../domain/Report';
import type { BitbucketBuildSummaries } from '../domain/BuildSummary';
import type { BitbucketIssue } from '../domain/Issue';
import type { PagedResponse, PaginationParams } from '../domain/Pagination';
import type { RequestFn } from './ProjectResource';

/**
 * Represents a Bitbucket pull request resource with chainable async methods.
 *
 * Implements `PromiseLike<BitbucketPullRequest>` so it can be awaited directly
 * to fetch the pull request info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get pull request info
 * const pr = await bbClient.project('PROJ').repo('my-repo').pullRequest(42);
 *
 * // Get activities
 * const activities = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).activities();
 *
 * // Get tasks
 * const tasks = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).tasks();
 *
 * // Get commits
 * const commits = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).commits();
 *
 * // Get changes
 * const changes = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).changes();
 *
 * // Get reports
 * const reports = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).reports();
 *
 * // Get build summaries
 * const builds = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).buildSummaries();
 *
 * // Get linked Jira issues
 * const issues = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).issues();
 * ```
 */
export class PullRequestResource implements PromiseLike<BitbucketPullRequest> {
  private readonly basePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    projectKey: string,
    repoSlug: string,
    pullRequestId: number,
  ) {
    this.basePath = `/projects/${projectKey}/repos/${repoSlug}/pull-requests/${pullRequestId}`;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the pull request info.
   * Delegates to {@link PullRequestResource.get}.
   */
  then<TResult1 = BitbucketPullRequest, TResult2 = never>(
    onfulfilled?: ((value: BitbucketPullRequest) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the pull request details.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}`
   *
   * @returns The pull request object
   */
  async get(): Promise<BitbucketPullRequest> {
    return this.request<BitbucketPullRequest>(this.basePath);
  }

  /**
   * Fetches the activity feed for this pull request.
   *
   * Activities include comments, approvals, reviews, rescopes, merges, and declines.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/activities`
   *
   * @param params - Optional filters: `limit`, `start`, `fromId`, `fromType`
   * @returns An array of pull request activities, ordered from most recent to oldest
   */
  async activities(params?: ActivitiesParams): Promise<BitbucketPullRequestActivity[]> {
    const data = await this.request<PagedResponse<BitbucketPullRequestActivity>>(
      `${this.basePath}/activities`,
      params as Record<string, string | number | boolean>,
    );
    return data.values;
  }

  /**
   * Fetches the tasks (review to-do items) for this pull request.
   *
   * Tasks are created by reviewers on specific comments and can be `OPEN` or `RESOLVED`.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/tasks`
   *
   * @param params - Optional filters: `limit`, `start`
   * @returns An array of pull request tasks
   */
  async tasks(params?: TasksParams): Promise<BitbucketPullRequestTask[]> {
    const data = await this.request<PagedResponse<BitbucketPullRequestTask>>(
      `${this.basePath}/tasks`,
      params as Record<string, string | number | boolean>,
    );
    return data.values;
  }

  /**
   * Fetches the commits included in this pull request.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/commits`
   *
   * @param params - Optional pagination: `limit`, `start`
   * @returns An array of commits
   */
  async commits(params?: PaginationParams): Promise<BitbucketCommit[]> {
    const data = await this.request<PagedResponse<BitbucketCommit>>(
      `${this.basePath}/commits`,
      params as Record<string, string | number | boolean>,
    );
    return data.values;
  }

  /**
   * Fetches the file changes included in this pull request.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/changes`
   *
   * @param params - Optional filters: `limit`, `start`, `withComments`
   * @returns An array of file changes
   */
  async changes(params?: ChangesParams): Promise<BitbucketChange[]> {
    const data = await this.request<PagedResponse<BitbucketChange>>(
      `${this.basePath}/changes`,
      params as Record<string, string | number | boolean>,
    );
    return data.values;
  }

  /**
   * Fetches the Code Insights reports for this pull request.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/reports`
   *
   * @param params - Optional pagination: `limit`, `start`
   * @returns An array of Code Insights reports
   */
  async reports(params?: ReportsParams): Promise<BitbucketReport[]> {
    const data = await this.request<PagedResponse<BitbucketReport>>(
      `${this.basePath}/reports`,
      params as Record<string, string | number | boolean>,
    );
    return data.values;
  }

  /**
   * Fetches the aggregated build summaries for this pull request.
   *
   * Returns a map of commit hash → build counts per state
   * (`successful`, `failed`, `inProgress`, `cancelled`, `unknown`).
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/build-summaries`
   *
   * @returns A record keyed by commit SHA with aggregated build counts
   */
  async buildSummaries(): Promise<BitbucketBuildSummaries> {
    return this.request<BitbucketBuildSummaries>(`${this.basePath}/build-summaries`);
  }

  /**
   * Fetches the Jira issues linked to this pull request.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/issues`
   *
   * @returns An array of linked Jira issues
   */
  async issues(): Promise<BitbucketIssue[]> {
    return this.request<BitbucketIssue[]>(`${this.basePath}/issues`);
  }
}
