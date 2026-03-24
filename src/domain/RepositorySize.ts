/**
 * Size information for a Bitbucket repository.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-repository/#api-api-latest-projects-projectkey-repos-repositoryslug-sizes-get}
 */
export interface BitbucketRepositorySize {
  /** Size of the repository in bytes */
  repository: number;
  /** Size of attachments in bytes */
  attachments: number;
}
