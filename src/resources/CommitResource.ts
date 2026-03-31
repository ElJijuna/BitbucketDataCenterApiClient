import type { BitbucketCommit } from '../domain/Commit';
import type { BitbucketChange } from '../domain/Change';
import type { BitbucketDiff, DiffParams, CommitChangesParams } from '../domain/Diff';
import type { BitbucketPullRequestComment } from '../domain/PullRequestActivity';
import type { BitbucketBuildStatus, BuildStatusesParams } from '../domain/BuildStatus';
import type { PagedResponse, PaginationParams } from '../domain/Pagination';
import type { RequestFn } from './ProjectResource';

/**
 * Represents a Bitbucket commit resource with chainable async methods.
 *
 * Implements `PromiseLike<BitbucketCommit>` so it can be awaited directly
 * to fetch the commit info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get commit info
 * const commit = await bbClient.project('PROJ').repo('my-repo').commit('abc123');
 *
 * // Get file changes introduced by this commit
 * const changes = await bbClient.project('PROJ').repo('my-repo').commit('abc123').changes();
 *
 * // Get the full diff for this commit
 * const diff = await bbClient.project('PROJ').repo('my-repo').commit('abc123').diff();
 * ```
 */
export class CommitResource implements PromiseLike<BitbucketCommit> {
  private readonly basePath: string;
  private readonly commitId: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    repoBasePath: string,
    commitId: string,
  ) {
    this.basePath = `${repoBasePath}/commits/${commitId}`;
    this.commitId = commitId;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the commit info.
   * Delegates to {@link CommitResource.get}.
   */
  then<TResult1 = BitbucketCommit, TResult2 = never>(
    onfulfilled?: ((value: BitbucketCommit) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the commit details.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}`
   *
   * @returns The commit object
   */
  async get(): Promise<BitbucketCommit> {
    return this.request<BitbucketCommit>(this.basePath);
  }

  /**
   * Fetches the file changes introduced by this commit.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/changes`
   *
   * @param params - Optional filters: `limit`, `start`, `since`
   * @returns A paged response of file changes
   */
  async changes(params?: CommitChangesParams): Promise<PagedResponse<BitbucketChange>> {
    return this.request<PagedResponse<BitbucketChange>>(
      `${this.basePath}/changes`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the comments on this commit.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/comments`
   *
   * @param params - Optional pagination: `limit`, `start`
   * @returns A paged response of comments
   */
  async comments(params?: PaginationParams): Promise<PagedResponse<BitbucketPullRequestComment>> {
    return this.request<PagedResponse<BitbucketPullRequestComment>>(
      `${this.basePath}/comments`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the build statuses associated with this commit.
   *
   * `GET /rest/build-status/latest/commits/{id}`
   *
   * @param params - Optional filters: `limit`, `start`, `key`
   * @returns A paged response of build statuses
   */
  async buildStatuses(params?: BuildStatusesParams): Promise<PagedResponse<BitbucketBuildStatus>> {
    return this.request<PagedResponse<BitbucketBuildStatus>>(
      `/commits/${this.commitId}`,
      params as Record<string, string | number | boolean>,
      { apiPath: 'rest/build-status/latest' },
    );
  }

  /**
   * Fetches the full diff for this commit.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/diff`
   *
   * @param params - Optional: `contextLines`, `srcPath`, `whitespace`
   * @returns The diff object
   */
  async diff(params?: DiffParams): Promise<BitbucketDiff> {
    const { srcPath, ...queryParams } = params ?? {};
    const path = srcPath
      ? `${this.basePath}/diff/${encodeURIComponent(srcPath)}`
      : `${this.basePath}/diff`;
    return this.request<BitbucketDiff>(
      path,
      queryParams as Record<string, string | number | boolean>,
    );
  }
}
