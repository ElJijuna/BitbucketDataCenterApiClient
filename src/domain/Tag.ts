import type { PaginationParams } from './Pagination';

/**
 * Represents a git tag in a Bitbucket Data Center repository.
 */
export interface BitbucketTag {
  /** Full ref name (e.g., `'refs/tags/v1.0.0'`) */
  id: string;
  /** Short tag name (e.g., `'v1.0.0'`) */
  displayId: string;
  type: 'TAG';
  /** SHA of the commit this tag points to */
  latestCommit: string;
  latestChangeset: string;
  /** Tag object SHA (only present for annotated tags) */
  hash?: string;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/tags`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-repository/#api-api-latest-projects-projectkey-repos-repositoryslug-tags-get}
 */
export interface TagsParams extends PaginationParams {
  /** Filter tags by name (prefix match) */
  filterText?: string;
  /** Sort order of results */
  orderBy?: 'ALPHABETICAL' | 'MODIFICATION';
}
