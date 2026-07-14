import type { PaginationParams } from './Pagination';

/**
 * Represents an SSH key associated with a Bitbucket user.
 *
 * Returned by `GET /rest/ssh/latest/keys?user={slug}`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-authentication/#api-ssh-latest-keys-get}
 */
export interface BitbucketSshKey {
  id: number;
  text: string;
  label: string;
  algorithmType?: string;
  bitLength?: number;
  createdDate?: number;
  expiryDays?: number;
  fingerprint?: string;
  lastAuthenticated?: string;
  /** Present only on endpoints that include the key owner */
  bitbucketUser?: {
    name: string;
    emailAddress: string;
    id: number;
    displayName: string;
    active: boolean;
    slug: string;
    type: string;
  };
}

/**
 * Query parameters accepted by `GET /rest/ssh/latest/keys`.
 */
export type SshKeysParams = PaginationParams;
