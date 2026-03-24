import type { BitbucketRepository } from '../domain/Repository';
import type { BitbucketPullRequest, PullRequestsParams } from '../domain/PullRequest';
import type { BitbucketCommit, CommitsParams } from '../domain/Commit';
import type { PagedResponse } from '../domain/Pagination';
import type { RequestFn } from './ProjectResource';

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
 * // Get commits
 * const commits = await bbClient.project('PROJ').repo('my-repo').commits({ limit: 10 });
 * ```
 */
export class RepositoryResource implements PromiseLike<BitbucketRepository> {
  private readonly basePath: string;

  /**
   * @param request - Bound HTTP request function from {@link BitbucketClient}
   * @param projectKey - The project key (e.g., `'PROJ'`)
   * @param repoSlug - The repository slug (e.g., `'my-repo'`)
   */
  constructor(
    private readonly request: RequestFn,
    projectKey: string,
    repoSlug: string,
  ) {
    this.basePath = `/projects/${projectKey}/repos/${repoSlug}`;
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
  async pullRequests(params?: PullRequestsParams): Promise<BitbucketPullRequest[]> {
    const data = await this.request<PagedResponse<BitbucketPullRequest>>(
      `${this.basePath}/pull-requests`,
      params as Record<string, string | number | boolean>,
    );
    return data.values;
  }

  /**
   * Fetches commits for this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits`
   *
   * @param params - Optional filters: `limit`, `start`, `until`, `since`, `path`, `merges`, `followRenames`, `ignoreMissing`
   * @returns An array of commits
   */
  async commits(params?: CommitsParams): Promise<BitbucketCommit[]> {
    const data = await this.request<PagedResponse<BitbucketCommit>>(
      `${this.basePath}/commits`,
      params as Record<string, string | number | boolean>,
    );
    return data.values;
  }
}
