import type { BitbucketRepository } from '../domain/Repository';
import type { BitbucketPullRequest, PullRequestsParams } from '../domain/PullRequest';
import type { BitbucketCommit, CommitsParams } from '../domain/Commit';
import type { BitbucketBranch, BranchesParams } from '../domain/Branch';
import type { BitbucketTag, TagsParams } from '../domain/Tag';
import type { BitbucketRepositorySize } from '../domain/RepositorySize';
import type { BitbucketLastModifiedEntry, LastModifiedParams } from '../domain/LastModified';
import type { RawFileParams } from '../domain/RawFile';
import type { BitbucketWebhook, WebhooksParams } from '../domain/Webhook';
import type { PagedResponse, PaginationParams } from '../domain/Pagination';
import type { RequestFn, RequestTextFn, RequestBodyFn } from './ProjectResource';
import { PullRequestResource } from './PullRequestResource';
import { CommitResource } from './CommitResource';

/**
 * Represents a Bitbucket repository resource with chainable async methods.
 *
 * Implements `PromiseLike<BitbucketRepository>` so it can be awaited directly
 * to fetch repository info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get repository info
 * const repo = await bbClient.project('PROJ').repo('my-repo');
 *
 * // Get pull requests
 * const prs = await bbClient.project('PROJ').repo('my-repo').pullRequests({ state: 'OPEN' });
 *
 * // Navigate into a specific pull request
 * const activities = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).activities();
 *
 * // Get commits
 * const commits = await bbClient.project('PROJ').repo('my-repo').commits({ limit: 10 });
 * ```
 */
export class RepositoryResource implements PromiseLike<BitbucketRepository> {
  private readonly basePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestText: RequestTextFn,
    private readonly requestBody: RequestBodyFn,
    basePath: string,
  ) {
    this.basePath = basePath;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the repository info.
   * Delegates to {@link RepositoryResource.get}.
   */
  then<TResult1 = BitbucketRepository, TResult2 = never>(
    onfulfilled?: ((value: BitbucketRepository) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the repository details.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}`
   *
   * @returns The repository object
   */
  async get(): Promise<BitbucketRepository> {
    return this.request<BitbucketRepository>(this.basePath);
  }

  /**
   * Fetches pull requests for this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests`
   *
   * @param params - Optional filters: `limit`, `start`, `state`, `direction`, `at`, `order`
   * @returns An array of pull requests
   */
  async pullRequests(params?: PullRequestsParams): Promise<PagedResponse<BitbucketPullRequest>> {
    return this.request<PagedResponse<BitbucketPullRequest>>(
      `${this.basePath}/pull-requests`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches commits for this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits`
   *
   * @param params - Optional filters: `limit`, `start`, `until`, `since`, `path`, `merges`, `followRenames`, `ignoreMissing`
   * @returns An array of commits
   */
  async commits(params?: CommitsParams): Promise<PagedResponse<BitbucketCommit>> {
    return this.request<PagedResponse<BitbucketCommit>>(
      `${this.basePath}/commits`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the files last modified in this repository along with the commit that last touched each.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/last-modified`
   *
   * @param params - Optional filters: `limit`, `start`, `at`
   * @returns An array of last-modified entries
   */
  async lastModified(params?: LastModifiedParams): Promise<PagedResponse<BitbucketLastModifiedEntry>> {
    return this.request<PagedResponse<BitbucketLastModifiedEntry>>(
      `${this.basePath}/last-modified`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the size of this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/sizes`
   *
   * @returns The repository size object
   */
  async size(): Promise<BitbucketRepositorySize> {
    return this.request<BitbucketRepositorySize>(`${this.basePath}/sizes`);
  }

  /**
   * Fetches branches for this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/branches`
   *
   * @param params - Optional filters: `limit`, `start`, `filterText`, `orderBy`, `details`, `base`, `boostMatches`
   * @returns An array of branches
   */
  async branches(params?: BranchesParams): Promise<PagedResponse<BitbucketBranch>> {
    return this.request<PagedResponse<BitbucketBranch>>(
      `${this.basePath}/branches`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the forks of this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/forks`
   *
   * @param params - Optional pagination: `limit`, `start`
   * @returns A paged response of forked repositories
   */
  async forks(params?: PaginationParams): Promise<PagedResponse<BitbucketRepository>> {
    return this.request<PagedResponse<BitbucketRepository>>(
      `${this.basePath}/forks`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches tags associated with a list of commits.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/tags`
   *
   * @param commits - Array of commit SHAs to look up tags for
   * @param options - Optional overrides (e.g. `apiPath` to target a different API version)
   * @returns A paged response of tags
   */
  async tagsByCommits(commits: string[], options?: { apiPath?: string }): Promise<PagedResponse<BitbucketTag>> {
    return this.requestBody<PagedResponse<BitbucketTag>>(`${this.basePath}/tags`, commits, options);
  }

  /**
   * Fetches tags for this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/tags`
   *
   * @param params - Optional filters: `limit`, `start`, `filterText`, `orderBy`
   * @returns A paged response of tags
   */
  async tags(params?: TagsParams): Promise<PagedResponse<BitbucketTag>> {
    return this.request<PagedResponse<BitbucketTag>>(
      `${this.basePath}/tags`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Returns a {@link PullRequestResource} for a given pull request ID, providing
   * access to pull request data and sub-resources (activities, etc.).
   *
   * The returned resource can be awaited directly to fetch pull request info,
   * or chained to access nested resources.
   *
   * @param pullRequestId - The numeric pull request ID
   * @returns A chainable pull request resource
   *
   * @example
   * ```typescript
   * const pr         = await bbClient.project('PROJ').repo('my-repo').pullRequest(42);
   * const activities = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).activities();
   * ```
   */
  /**
   * Fetches webhooks configured on this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/webhooks/search`
   *
   * @param params - Optional filters: `limit`, `start`, `event`
   * @returns A paged response of webhooks
   */
  async webhooks(params?: WebhooksParams): Promise<PagedResponse<BitbucketWebhook>> {
    return this.request<PagedResponse<BitbucketWebhook>>(
      `${this.basePath}/webhooks/search`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the raw content of a file in this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/raw/{path}`
   *
   * @param filePath - Path to the file (e.g., `'src/index.ts'`)
   * @param params - Optional: `at` (branch, tag, or commit SHA)
   * @returns The raw file content as a string
   */
  async raw(filePath: string, params?: RawFileParams): Promise<string> {
    return this.requestText(
      `${this.basePath}/raw/${filePath}`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Returns a {@link CommitResource} for a given commit SHA, providing access
   * to commit data and sub-resources (changes, diff).
   *
   * The returned resource can be awaited directly to fetch commit info,
   * or chained to access nested resources.
   *
   * @param commitId - The commit SHA (e.g., `'abc123def456'`)
   * @returns A chainable commit resource
   *
   * @example
   * ```typescript
   * const commit  = await bbClient.project('PROJ').repo('my-repo').commit('abc123');
   * const changes = await bbClient.project('PROJ').repo('my-repo').commit('abc123').changes();
   * const diff    = await bbClient.project('PROJ').repo('my-repo').commit('abc123').diff();
   * ```
   */
  commit(commitId: string): CommitResource {
    return new CommitResource(this.request, this.basePath, commitId);
  }

  pullRequest(pullRequestId: number): PullRequestResource {
    return new PullRequestResource(this.request, this.basePath, pullRequestId);
  }
}
