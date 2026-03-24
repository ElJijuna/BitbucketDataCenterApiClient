import type { BitbucketUser } from '../domain/User';
import type { RequestFn } from './ProjectResource';

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
    slug: string,
  ) {
    this.basePath = `/users/${slug}`;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the user info.
   * Delegates to {@link UserResource.get}.
   */
  then<TResult1 = BitbucketUser, TResult2 = never>(
    onfulfilled?: ((value: BitbucketUser) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
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
}
