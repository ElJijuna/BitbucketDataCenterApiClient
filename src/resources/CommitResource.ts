import type { AddBuildData, BitbucketBuild } from '../domain/Build';
import type {
  AddBuildStatusData,
  BitbucketBuildStatus,
  BuildStatusesParams,
} from '../domain/BuildStatus';
import type { BitbucketChange } from '../domain/Change';
import type { BitbucketCommit, CommitPullRequestsParams } from '../domain/Commit';
import type {
  AddDeploymentData,
  BitbucketDeployment,
  DeploymentLookupParams,
} from '../domain/Deployment';
import type { BitbucketDiff, CommitChangesParams, DiffParams } from '../domain/Diff';
import type { BitbucketDiffStatsSummary } from '../domain/DiffStatsSummary';
import type { PagedResponse, PaginationParams } from '../domain/Pagination';
import type { BitbucketPullRequest } from '../domain/PullRequest';
import type {
  AddCommitCommentData,
  BitbucketPullRequestComment,
  UpdateCommitCommentData,
} from '../domain/PullRequestActivity';
import type { RequestBodyFn, RequestFn } from './ProjectResource';

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
    private readonly requestBody?: RequestBodyFn,
  ) {
    this.basePath = `${repoBasePath}/commits/${commitId}`;
    this.commitId = commitId;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the commit info.
   * Delegates to {@link CommitResource.get}.
   */
  // biome-ignore lint/suspicious/noThenProperty: intentional PromiseLike implementation for await support
  then<TResult1 = BitbucketCommit, TResult2 = never>(
    onfulfilled?: ((value: BitbucketCommit) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    // eslint-disable-next-line no-restricted-syntax -- delegating .then() is required to implement PromiseLike
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
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/diff/{path}`
   *
   * The `path` param (the file to diff) is optional: when omitted, the diff for
   * the whole commit is returned. `srcPath` is sent as a query parameter and
   * identifies the previous path of a copied, moved or renamed file.
   *
   * @param params - Optional: `path`, `contextLines`, `srcPath`, `since`, `whitespace`
   * @returns The diff object
   */
  async diff(params?: DiffParams): Promise<BitbucketDiff> {
    const { path: filePath, ...queryParams } = params ?? {};
    const path = filePath ? `${this.basePath}/diff/${filePath}` : `${this.basePath}/diff`;

    return this.request<BitbucketDiff>(
      path,
      queryParams as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches a summary of added/removed/modified line counts for a file changed by this commit.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/diff-stats-summary/{path}`
   *
   * @param path - Path to the file
   * @returns The diff stats summary
   */
  async diffStatsSummary(path: string): Promise<BitbucketDiffStatsSummary> {
    return this.request<BitbucketDiffStatsSummary>(`${this.basePath}/diff-stats-summary/${path}`);
  }

  /**
   * Posts a comment on this commit.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/comments`
   *
   * @param data - Comment text and optional anchor/parent
   * @returns The created comment
   */
  async addComment(data: AddCommitCommentData): Promise<BitbucketPullRequestComment> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketPullRequestComment>(`${this.basePath}/comments`, data);
  }

  /**
   * Updates a comment on this commit.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/comments/{commentId}`
   *
   * @param commentId - The comment id
   * @param data - `version` (must match the comment's current version) and the new `text`
   * @returns The updated comment
   */
  async updateComment(
    commentId: number,
    data: UpdateCommitCommentData,
  ): Promise<BitbucketPullRequestComment> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketPullRequestComment>(
      `${this.basePath}/comments/${commentId}`,
      data,
      { method: 'PUT' },
    );
  }

  /**
   * Deletes a comment from this commit.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/comments/{commentId}`
   *
   * @param commentId - The comment id
   * @param version - Must match the comment's current version
   */
  async deleteComment(commentId: number, version: number): Promise<void> {
    const path = `${this.basePath}/comments/${commentId}?${new URLSearchParams({ version: String(version) })}`;

    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<void>(path, undefined, { method: 'DELETE' });
  }

  /**
   * Posts a build status for this commit.
   *
   * `POST /rest/build-status/latest/commits/{id}`
   *
   * @param data - Build state, key, url and optional metadata
   * @returns The created build status
   */
  async addBuildStatus(data: AddBuildStatusData): Promise<BitbucketBuildStatus> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketBuildStatus>(`/commits/${this.commitId}`, data, {
      apiPath: 'rest/build-status/latest',
    });
  }

  /**
   * Fetches a single build status for this commit, identified by its build key.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/builds?key={key}`
   *
   * This is the modern replacement for {@link CommitResource.buildStatuses}; unlike it,
   * this endpoint returns a single build rather than a paged list.
   *
   * @param key - The build key to look up
   * @returns The build status matching the given key
   */
  async getBuild(key: string): Promise<BitbucketBuild> {
    return this.request<BitbucketBuild>(`${this.basePath}/builds`, { key });
  }

  /**
   * Stores a build status for this commit via the modern builds API.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/builds`
   *
   * This is the modern replacement for {@link CommitResource.addBuildStatus}.
   *
   * @param data - Build state, key, url and optional metadata
   */
  async addBuild(data: AddBuildData): Promise<void> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<void>(`${this.basePath}/builds`, data);
  }

  /**
   * Deletes a build status from this commit, identified by its build key.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/builds?key={key}`
   *
   * @param key - The build key to delete
   */
  async deleteBuild(key: string): Promise<void> {
    const path = `${this.basePath}/builds?${new URLSearchParams({ key })}`;

    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<void>(path, undefined, { method: 'DELETE' });
  }

  /**
   * Fetches a single deployment for this commit, identified by key, environment, and sequence number.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/deployments`
   *
   * @param params - `deploymentSequenceNumber`, `key`, and `environmentKey` — together identify one deployment
   * @returns The matching deployment
   */
  async getDeployment(params: DeploymentLookupParams): Promise<BitbucketDeployment> {
    return this.request<BitbucketDeployment>(
      `${this.basePath}/deployments`,
      params as unknown as Record<string, string | number | boolean>,
    );
  }

  /**
   * Creates or updates a deployment for this commit.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/deployments`
   *
   * @param data - Deployment details: `key`, `environment`, `state`, `url`, `displayName`,
   * `description`, `deploymentSequenceNumber`
   * @returns The created or updated deployment
   */
  async addDeployment(data: AddDeploymentData): Promise<BitbucketDeployment> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketDeployment>(`${this.basePath}/deployments`, data);
  }

  /**
   * Deletes a deployment from this commit, identified by key, environment, and sequence number.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/deployments`
   *
   * @param params - `deploymentSequenceNumber`, `key`, and `environmentKey` — together identify one deployment
   */
  async deleteDeployment(params: DeploymentLookupParams): Promise<void> {
    const path = `${this.basePath}/deployments?${new URLSearchParams({
      deploymentSequenceNumber: String(params.deploymentSequenceNumber),
      key: params.key,
      environmentKey: params.environmentKey,
    })}`;

    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<void>(path, undefined, { method: 'DELETE' });
  }

  /**
   * Fetches the pull requests that contain this commit.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/pull-requests`
   *
   * @param params - Optional filters: `limit`, `start`, `withAttributes`, `withProperties`
   * @returns A paged response of pull requests
   */
  async pullRequests(
    params?: CommitPullRequestsParams,
  ): Promise<PagedResponse<BitbucketPullRequest>> {
    return this.request<PagedResponse<BitbucketPullRequest>>(
      `${this.basePath}/pull-requests`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the best common ancestor between this commit and another.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/merge-base/{otherCommitId}`
   *
   * @param otherCommitId - SHA of the commit to compare against
   * @returns The merge-base commit
   */
  async mergeBase(otherCommitId: string): Promise<BitbucketCommit> {
    return this.request<BitbucketCommit>(`${this.basePath}/merge-base/${otherCommitId}`);
  }

  /**
   * Adds the authenticated user as a watcher of this commit.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/watch`
   */
  async watch(): Promise<void> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<void>(`${this.basePath}/watch`, undefined);
  }

  /**
   * Removes the authenticated user as a watcher of this commit.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/watch`
   */
  async unwatch(): Promise<void> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<void>(`${this.basePath}/watch`, undefined, { method: 'DELETE' });
  }
}
