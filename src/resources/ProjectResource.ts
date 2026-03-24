import type { BitbucketProject } from '../domain/Project';
import type { BitbucketRepository, ReposParams } from '../domain/Repository';
import type { BitbucketUserPermission, ProjectUsersParams } from '../domain/User';
import type { BitbucketWebhook, WebhooksParams } from '../domain/Webhook';
import type { PagedResponse } from '../domain/Pagination';
import { RepositoryResource } from './RepositoryResource';

/** @internal */
export type RequestFn = <T>(
  path: string,
  params?: Record<string, string | number | boolean>,
) => Promise<T>;

/** @internal */
export type RequestTextFn = (
  path: string,
  params?: Record<string, string | number | boolean>,
) => Promise<string>;

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
 * // Get repositories with filters
 * const repos = await bbClient.project('PROJ').repos({ limit: 50, name: 'api' });
 *
 * // Navigate into a specific repository
 * const prs = await bbClient.project('PROJ').repo('my-repo').pullRequests();
 *
 * // Get users with access to the project
 * const users = await bbClient.project('PROJ').users({ permission: 'PROJECT_WRITE' });
 * ```
 */
export class ProjectResource implements PromiseLike<BitbucketProject> {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestText: RequestTextFn,
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
  async repos(params?: ReposParams): Promise<PagedResponse<BitbucketRepository>> {
    return this.request<PagedResponse<BitbucketRepository>>(
      `/projects/${this.key}/repos`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Returns a {@link RepositoryResource} for a given repository slug, providing
   * access to repository-level data and sub-resources (pull requests, commits, etc.).
   *
   * The returned resource can be awaited directly to fetch repository info,
   * or chained to access nested resources.
   *
   * @param repoSlug - The repository slug (e.g., `'my-repo'`)
   * @returns A chainable repository resource
   *
   * @example
   * ```typescript
   * const repo    = await bbClient.project('PROJ').repo('my-repo');
   * const prs     = await bbClient.project('PROJ').repo('my-repo').pullRequests({ state: 'OPEN' });
   * const commits = await bbClient.project('PROJ').repo('my-repo').commits({ limit: 10 });
   * ```
   */
  repo(repoSlug: string): RepositoryResource {
    return new RepositoryResource(this.request, this.requestText, this.key, repoSlug);
  }

  /**
   * Fetches users with explicit permissions on this project.
   *
   * `GET /rest/api/latest/projects/{key}/permissions/users`
   *
   * @param params - Optional filters: `limit`, `start`, `filter`, `permission`
   * @returns An array of user–permission pairs
   */
  async users(params?: ProjectUsersParams): Promise<PagedResponse<BitbucketUserPermission>> {
    return this.request<PagedResponse<BitbucketUserPermission>>(
      `/projects/${this.key}/permissions/users`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches webhooks configured on this project.
   *
   * `GET /rest/api/latest/projects/{key}/webhooks`
   *
   * @param params - Optional filters: `limit`, `start`, `event`
   * @returns A paged response of webhooks
   */
  async webhooks(params?: WebhooksParams): Promise<PagedResponse<BitbucketWebhook>> {
    return this.request<PagedResponse<BitbucketWebhook>>(
      `/projects/${this.key}/webhooks`,
      params as Record<string, string | number | boolean>,
    );
  }
}
