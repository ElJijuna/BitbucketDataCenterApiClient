import type { PagedResponse } from '../domain/Pagination';
import type { BitbucketRepository, ReposParams } from '../domain/Repository';
import type { BitbucketSshKey, SshKeysParams } from '../domain/SshKey';
import type { BitbucketUser } from '../domain/User';
import type { BitbucketUserSettings } from '../domain/UserSettings';
import type { RequestBodyFn, RequestFn, RequestTextFn } from './ProjectResource';
import { RepositoryResource } from './RepositoryResource';

/**
 * Represents a Bitbucket user resource.
 *
 * Implements `PromiseLike<BitbucketUser>` so it can be awaited directly
 * to fetch user info.
 *
 * @example
 * ```typescript
 * // Await directly to get user info
 * const user = await bbClient.user('pilmee');
 * ```
 */
export class UserResource implements PromiseLike<BitbucketUser> {
  private readonly basePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestText: RequestTextFn,
    private readonly requestBody: RequestBodyFn,
    readonly slug: string,
  ) {
    this.basePath = `/users/${slug}`;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the user info.
   * Delegates to {@link UserResource.get}.
   */
  // biome-ignore lint/suspicious/noThenProperty: intentional PromiseLike implementation for await support
  then<TResult1 = BitbucketUser, TResult2 = never>(
    onfulfilled?: ((value: BitbucketUser) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    // eslint-disable-next-line no-restricted-syntax -- delegating .then() is required to implement PromiseLike
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the user details.
   *
   * `GET /rest/api/latest/users/{slug}`
   *
   * @returns The user object
   */
  async get(): Promise<BitbucketUser> {
    return this.request<BitbucketUser>(this.basePath);
  }

  /**
   * Fetches repositories belonging to this user.
   *
   * Personal repositories live in the user's personal project (`~{slug}`), so
   * this method queries the documented project repos endpoint.
   *
   * `GET /rest/api/latest/projects/~{slug}/repos`
   *
   * @param params - Optional filters: `limit`, `start`, `name`, `permission`
   * @returns A paged response of repositories
   */
  async repos(params?: ReposParams): Promise<PagedResponse<BitbucketRepository>> {
    return this.request<PagedResponse<BitbucketRepository>>(
      `/projects/~${this.slug}/repos`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Returns a {@link RepositoryResource} for a given repository slug under this user,
   * providing access to all repository sub-resources including `raw`, `commits`, `branches`, etc.
   *
   * @param repoSlug - The repository slug
   * @returns A chainable repository resource
   *
   * @example
   * ```typescript
   * const repo    = await bbClient.user('pilmee').repo('my-repo');
   * const content = await bbClient.user('pilmee').repo('my-repo').raw('src/index.ts');
   * ```
   */
  /**
   * Fetches the SSH keys associated with this user.
   *
   * `GET /rest/ssh/latest/keys?user={slug}`
   *
   * @param params - Optional pagination: `limit`, `start`
   * @returns A paged response of SSH keys
   */
  async sshKeys(params?: SshKeysParams): Promise<PagedResponse<BitbucketSshKey>> {
    return this.request<PagedResponse<BitbucketSshKey>>(
      '/keys',
      { user: this.slug, ...params } as Record<string, string | number | boolean>,
      { apiPath: 'rest/ssh/latest' },
    );
  }

  /**
   * Fetches the settings of this user.
   *
   * `GET /rest/api/latest/users/{slug}/settings`
   *
   * @returns The user settings object
   */
  async settings(): Promise<BitbucketUserSettings> {
    return this.request<BitbucketUserSettings>(`${this.basePath}/settings`);
  }

  repo(repoSlug: string): RepositoryResource {
    return new RepositoryResource(
      this.request,
      this.requestText,
      this.requestBody,
      `/projects/~${this.slug}/repos/${repoSlug}`,
    );
  }
}
