import type { PaginationParams } from './Pagination';

/**
 * Represents a git branch in a Bitbucket Data Center repository.
 */
export interface BitbucketBranch {
  /** Full ref name (e.g., `'refs/heads/main'`) */
  id: string;
  /** Short branch name (e.g., `'main'`) */
  displayId: string;
  type: 'BRANCH';
  /** SHA of the latest commit on this branch */
  latestCommit: string;
  latestChangeset: string;
  /** Whether this is the repository's default branch */
  isDefault: boolean;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/branches`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-repository/#api-api-latest-projects-projectkey-repos-repositoryslug-branches-get}
 */
export interface BranchesParams extends PaginationParams {
  /** Filter branches by name (prefix match) */
  filterText?: string;
  /** Sort order of results */
  orderBy?: 'ALPHABETICAL' | 'MODIFICATION';
  /** Include branch metadata such as ahead/behind counts relative to `base` */
  details?: boolean;
  /**
   * Base branch or commit to use for ahead/behind comparisons
   * when `details` is `true`
   */
  base?: string;
  /** Boost exact matches to the top of the results when filtering */
  boostMatches?: boolean;
}
