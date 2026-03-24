import type { BitbucketPullRequest } from '../domain/PullRequest';
import type { BitbucketPullRequestActivity, ActivitiesParams } from '../domain/PullRequestActivity';
import type { PagedResponse } from '../domain/Pagination';
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
 * // With filters
 * const comments = await bbClient
 *   .project('PROJ')
 *   .repo('my-repo')
 *   .pullRequest(42)
 *   .activities({ fromId: 10, fromType: 'COMMENT' });
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
}
