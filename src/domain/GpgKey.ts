import type { PaginationParams } from './Pagination';

/**
 * A sub-key of a GPG key.
 */
export interface BitbucketGpgSubKey {
  fingerprint?: string;
  expiryDate?: number;
}

/**
 * Represents a GPG key associated with a Bitbucket user.
 *
 * Returned by `GET /rest/gpg/latest/keys?user={slug}`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-authentication/#api-gpg-latest-keys-get}
 */
export interface BitbucketGpgKey {
  id?: string;
  fingerprint?: string;
  emailAddress?: string;
  expiryDate?: number;
  /** The ASCII-armored key material */
  text?: string;
  subKeys?: BitbucketGpgSubKey[];
}

/**
 * Payload for `POST /rest/gpg/latest/keys`.
 */
export interface AddGpgKeyData {
  /** The ASCII-armored public key, including begin/end markers */
  text: string;
}

/**
 * Query parameters accepted by `GET /rest/gpg/latest/keys`.
 */
export type GpgKeysParams = PaginationParams;
