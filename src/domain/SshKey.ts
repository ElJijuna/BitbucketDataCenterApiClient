import type { PaginationParams } from './Pagination';

/**
 * Represents an SSH key associated with a Bitbucket user.
 *
 * Returned by `GET /rest/api/latest/users/{slug}/ssh`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-ssh/#api-ssh-latest-keys-get}
 */
export interface BitbucketSshKey {
  id: number;
  text: string;
  label: string;
  bitbucketUser: {
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
 * Query parameters accepted by `GET /rest/api/latest/users/{slug}/ssh`.
 */
export type SshKeysParams = PaginationParams;
