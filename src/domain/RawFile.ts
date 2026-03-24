/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/raw/{path}`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-repository/#api-api-latest-projects-projectkey-repos-repositoryslug-raw-path-get}
 */
export interface RawFileParams {
  /** Branch, tag, or commit SHA to retrieve the file at */
  at?: string;
}
