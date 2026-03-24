import type { PaginationParams } from './Pagination';

/** Author/committer identity on a git commit. */
export interface BitbucketCommitAuthor {
  name: string;
  emailAddress: string;
}

/**
 * Represents a git commit in a Bitbucket Data Center repository.
 */
export interface BitbucketCommit {
  /** Full commit SHA */
  id: string;
  /** Abbreviated commit SHA */
  displayId: string;
  author: BitbucketCommitAuthor;
  /** Unix timestamp (ms) of the author date */
  authorTimestamp: number;
  committer: BitbucketCommitAuthor;
  /** Unix timestamp (ms) of the committer date */
  committerTimestamp: number;
  message: string;
  parents: Array<{ id: string; displayId: string }>;
}

/**
 * Query parameters accepted by `GET /rest/api/latest/projects/{key}/repos/{slug}/commits`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-repository/#api-api-latest-projects-projectkey-repos-repositoryslug-commits-get}
 */
export interface CommitsParams extends PaginationParams {
  /**
   * The commit ID or ref to list commits reachable from.
   * Defaults to the repository's default branch.
   */
  until?: string;
  /** Exclude commits reachable from this commit ID or ref */
  since?: string;
  /** Filter commits that touch this file path */
  path?: string;
  /** How to handle merge commits */
  merges?: 'include' | 'exclude' | 'only';
  /** Follow file renames when filtering by `path` */
  followRenames?: boolean;
  /** Silently ignore missing commits referenced by `since` or `until` */
  ignoreMissing?: boolean;
}
