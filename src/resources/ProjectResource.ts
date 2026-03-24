import type { BitbucketProject } from '../domain/Project';
import type { BitbucketRepository, ReposParams } from '../domain/Repository';
import type { PagedResponse } from '../domain/Pagination';

/** @internal */
export type RequestFn = <T>(path: string, params?: Record<string, string | number>) => Promise<T>;

/**
 * Represents a Bitbucket project resource with chainable async methods.
 *
 * Implements `PromiseLike<BitbucketProject>` so it can be awaited directly
 * to fetch the project info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get project info
 * const project = await bbClient.project('PROJ');
 *
 * // Chain to get repositories
 * const repos = await bbClient.project('PROJ').repos();
 *
 * // With filters
 * const repos = await bbClient.project('PROJ').repos({ limit: 50, name: 'api' });
 * ```
 */
export class ProjectResource implements PromiseLike<BitbucketProject> {
  /**
   * @param request - Bound HTTP request function from {@link BitbucketClient}
   * @param key - The project key (e.g., `'PROJ'`)
   */
  constructor(
    private readonly request: RequestFn,
    private readonly key: string,
  ) {}

  /**
   * Allows the resource to be awaited directly, resolving with the project info.
   * Delegates to {@link ProjectResource.get}.
   */
  then<TResult1 = BitbucketProject, TResult2 = never>(
    onfulfilled?: ((value: BitbucketProject) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the project details.
   *
   * `GET /rest/api/latest/projects/{key}`
   *
   * @returns The project object
   */
  async get(): Promise<BitbucketProject> {
    return this.request<BitbucketProject>(`/projects/${this.key}`);
  }

  /**
   * Fetches repositories belonging to this project.
   *
   * `GET /rest/api/latest/projects/{key}/repos`
   *
   * @param params - Optional filters: `limit`, `start`, `slug`, `name`, `permission`
   * @returns An array of repositories
   */
  async repos(params?: ReposParams): Promise<BitbucketRepository[]> {
    const data = await this.request<PagedResponse<BitbucketRepository>>(
      `/projects/${this.key}/repos`,
      params as Record<string, string | number>,
    );
    return data.values;
  }
}
