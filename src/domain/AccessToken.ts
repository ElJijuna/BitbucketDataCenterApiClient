import type { PaginationParams } from './Pagination';

/**
 * Represents an HTTP access token associated with a Bitbucket user.
 *
 * Returned by `GET /rest/access-tokens/latest/users/{slug}`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-authentication/#api-access-tokens-latest-users-userslug-get}
 */
export interface BitbucketAccessToken {
  id: string;
  name: string;
  /** ISO-8601 timestamp indicating when the token was created. */
  createdDate?: string;
}

/**
 * An access token as returned at creation time.
 *
 * The raw `token` secret is only ever returned by the create endpoint —
 * store it immediately, it cannot be retrieved again.
 */
export interface BitbucketCreatedAccessToken extends BitbucketAccessToken {
  /** The raw token secret */
  token: string;
}

/**
 * Payload for `PUT /rest/access-tokens/latest/users/{slug}` (create token).
 */
export interface CreateAccessTokenData {
  name: string;
  /** Permissions to grant (e.g. `['REPO_READ', 'PROJECT_READ']`) */
  permissions: string[];
  /** Days until the token expires; omit for a non-expiring token (if the instance allows it) */
  expiryDays?: number;
}

/**
 * Payload for `POST /rest/access-tokens/latest/users/{slug}/{tokenId}` (update token).
 */
export interface UpdateAccessTokenData {
  name?: string;
  permissions?: string[];
  expiryDays?: number;
}

/**
 * Query parameters accepted by `GET /rest/access-tokens/latest/users/{slug}`.
 */
export type AccessTokensParams = PaginationParams;
