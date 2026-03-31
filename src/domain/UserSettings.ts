/**
 * Represents the settings of a Bitbucket Data Center user.
 *
 * Returned by `GET /rest/api/latest/users/{slug}/settings`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-users/#api-api-latest-users-userslug-settings-get}
 */
export interface BitbucketUserSettings {
  [key: string]: unknown;
}
