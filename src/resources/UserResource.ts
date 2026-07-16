import type {
  AccessTokensParams,
  BitbucketAccessToken,
  BitbucketCreatedAccessToken,
  CreateAccessTokenData,
  UpdateAccessTokenData,
} from '../domain/AccessToken';
import type { AddGpgKeyData, BitbucketGpgKey, GpgKeysParams } from '../domain/GpgKey';
import type { PagedResponse } from '../domain/Pagination';
import type { BitbucketRepository, ReposParams } from '../domain/Repository';
import type { AddSshKeyData, BitbucketSshKey, SshKeysParams } from '../domain/SshKey';
import type { BitbucketUser } from '../domain/User';
import type { BitbucketUserSettings } from '../domain/UserSettings';
import type { RequestBinaryFn, RequestBodyFn, RequestFn, RequestTextFn } from './ProjectResource';
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
    private readonly requestBinary?: RequestBinaryFn,
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
   * Adds an SSH key to this user's account.
   *
   * `POST /rest/ssh/latest/keys?user={slug}`
   *
   * Adding a key to another user's account requires admin permission.
   *
   * @param data - The key to add: `text`, and optionally `label` and `expiryDays`
   * @returns The created SSH key
   *
   * @example
   * ```typescript
   * const key = await bbClient.user('pilmee').addSshKey({ text: 'ssh-ed25519 AAAA... laptop' });
   * ```
   */
  async addSshKey(data: AddSshKeyData): Promise<BitbucketSshKey> {
    return this.requestBody<BitbucketSshKey>(`/keys?user=${encodeURIComponent(this.slug)}`, data, {
      apiPath: 'rest/ssh/latest',
    });
  }

  /**
   * Deletes an SSH key.
   *
   * `DELETE /rest/ssh/latest/keys/{keyId}`
   *
   * @param keyId - The id of the key to delete (see {@link UserResource.sshKeys})
   */
  async deleteSshKey(keyId: number): Promise<void> {
    return this.requestBody<void>(`/keys/${keyId}`, undefined, {
      apiPath: 'rest/ssh/latest',
      method: 'DELETE',
    });
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

  /**
   * Updates entries of this user's settings map. Only the keys present in
   * `settings` are touched; other entries are left as they are.
   *
   * `PUT /rest/api/latest/users/{slug}/settings`
   *
   * @param settings - The setting key/value pairs to update
   */
  async updateSettings(settings: BitbucketUserSettings): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/settings`, settings, { method: 'PUT' });
  }

  /**
   * Fetches the HTTP access tokens associated with this user.
   *
   * `GET /rest/access-tokens/latest/users/{slug}`
   *
   * @param params - Optional pagination: `limit`, `start`
   * @returns A paged response of access tokens (without the raw token secrets)
   */
  async accessTokens(params?: AccessTokensParams): Promise<PagedResponse<BitbucketAccessToken>> {
    return this.request<PagedResponse<BitbucketAccessToken>>(
      `/users/${this.slug}`,
      params as Record<string, string | number | boolean>,
      { apiPath: 'rest/access-tokens/latest' },
    );
  }

  /**
   * Fetches a single HTTP access token by id.
   *
   * `GET /rest/access-tokens/latest/users/{slug}/{tokenId}`
   *
   * @param tokenId - The token id
   * @returns The access token metadata (without the raw token secret)
   */
  async accessToken(tokenId: string): Promise<BitbucketAccessToken> {
    return this.request<BitbucketAccessToken>(`/users/${this.slug}/${tokenId}`, undefined, {
      apiPath: 'rest/access-tokens/latest',
    });
  }

  /**
   * Creates an HTTP access token for this user.
   *
   * `PUT /rest/access-tokens/latest/users/{slug}` — note that, unusually,
   * this endpoint creates with `PUT` (and updates with `POST`).
   *
   * The response is the only place the raw `token` secret is ever returned —
   * store it immediately, it cannot be retrieved again.
   *
   * @param data - The token to create: `name`, `permissions`, and optionally `expiryDays`
   * @returns The created token, including the raw `token` secret
   *
   * @example
   * ```typescript
   * const { token } = await bbClient.user('pilmee').createAccessToken({
   *   name: 'ci-read',
   *   permissions: ['REPO_READ'],
   *   expiryDays: 90,
   * });
   * ```
   */
  async createAccessToken(data: CreateAccessTokenData): Promise<BitbucketCreatedAccessToken> {
    return this.requestBody<BitbucketCreatedAccessToken>(`/users/${this.slug}`, data, {
      apiPath: 'rest/access-tokens/latest',
      method: 'PUT',
    });
  }

  /**
   * Updates an HTTP access token's name, permissions, and/or expiry.
   *
   * `POST /rest/access-tokens/latest/users/{slug}/{tokenId}` — note that,
   * unusually, this endpoint updates with `POST` (and creates with `PUT`).
   *
   * @param tokenId - The token id
   * @param data - The fields to update
   * @returns The updated token metadata (without the raw token secret)
   */
  async updateAccessToken(
    tokenId: string,
    data: UpdateAccessTokenData,
  ): Promise<BitbucketAccessToken> {
    return this.requestBody<BitbucketAccessToken>(`/users/${this.slug}/${tokenId}`, data, {
      apiPath: 'rest/access-tokens/latest',
    });
  }

  /**
   * Revokes an HTTP access token.
   *
   * `DELETE /rest/access-tokens/latest/users/{slug}/{tokenId}`
   *
   * @param tokenId - The token id
   */
  async deleteAccessToken(tokenId: string): Promise<void> {
    return this.requestBody<void>(`/users/${this.slug}/${tokenId}`, undefined, {
      apiPath: 'rest/access-tokens/latest',
      method: 'DELETE',
    });
  }

  /**
   * Fetches the GPG keys associated with this user.
   *
   * `GET /rest/gpg/latest/keys?user={slug}`
   *
   * @param params - Optional pagination: `limit`, `start`
   * @returns A paged response of GPG keys
   */
  async gpgKeys(params?: GpgKeysParams): Promise<PagedResponse<BitbucketGpgKey>> {
    return this.request<PagedResponse<BitbucketGpgKey>>(
      '/keys',
      { user: this.slug, ...params } as Record<string, string | number | boolean>,
      { apiPath: 'rest/gpg/latest' },
    );
  }

  /**
   * Adds a GPG key to this user's account.
   *
   * `POST /rest/gpg/latest/keys?user={slug}`
   *
   * Adding a key to another user's account requires admin permission.
   *
   * @param data - The key to add: `text` (the ASCII-armored public key)
   * @returns The created GPG key
   */
  async addGpgKey(data: AddGpgKeyData): Promise<BitbucketGpgKey> {
    return this.requestBody<BitbucketGpgKey>(`/keys?user=${encodeURIComponent(this.slug)}`, data, {
      apiPath: 'rest/gpg/latest',
    });
  }

  /**
   * Deletes a GPG key.
   *
   * `DELETE /rest/gpg/latest/keys/{fingerprintOrId}`
   *
   * @param fingerprintOrId - The key's fingerprint or id (see {@link UserResource.gpgKeys})
   */
  async deleteGpgKey(fingerprintOrId: string): Promise<void> {
    return this.requestBody<void>(`/keys/${encodeURIComponent(fingerprintOrId)}`, undefined, {
      apiPath: 'rest/gpg/latest',
      method: 'DELETE',
    });
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
  repo(repoSlug: string): RepositoryResource {
    return new RepositoryResource(
      this.request,
      this.requestText,
      this.requestBody,
      `/projects/~${this.slug}/repos/${repoSlug}`,
      this.requestBinary,
    );
  }
}
