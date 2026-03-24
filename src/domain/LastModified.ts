import type { PaginationParams } from './Pagination';
import type { BitbucketChangePath } from './Change';
import type { BitbucketCommit } from './Commit';

/**
 * Represents a file entry returned by the last-modified endpoint,
 * showing the path and the commit that last touched it.
 */
export interface BitbucketLastModifiedEntry {
  /** The file path */
  path: BitbucketChangePath;
  /** The commit that last modified this file */
  latestCommit: BitbucketCommit;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/last-modified`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-repository/#api-api-latest-projects-projectkey-repos-repositoryslug-last-modified-get}
 */
export interface LastModifiedParams extends PaginationParams {
  /** Branch, tag, or commit SHA to use as the base ref */
  at?: string;
}
