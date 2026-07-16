import type { PaginationParams } from './Pagination';

/**
 * Query parameters shared by the compare endpoints
 * (`GET /rest/api/latest/projects/{key}/repos/{slug}/compare/…`).
 *
 * `from`/`to` accept a branch, tag, or commit SHA. When comparing across a
 * fork, `fromRepo` identifies the source repository (its numeric id or
 * `'{projectKey}/{repoSlug}'`).
 */
export interface CompareParams extends PaginationParams {
  /** Source ref or commit of the comparison */
  from?: string;
  /** Target ref or commit of the comparison */
  to?: string;
  /** Source repository when comparing across forks */
  fromRepo?: string;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/compare/diff{path}`.
 */
export interface CompareDiffParams {
  /** Path of a single file to diff; omit to diff the whole comparison */
  path?: string;
  /** Source ref or commit of the comparison */
  from?: string;
  /** Target ref or commit of the comparison */
  to?: string;
  /** Source repository when comparing across forks */
  fromRepo?: string;
  /** Number of context lines to include around changed lines */
  contextLines?: number;
  /** Previous path of a copied, moved, or renamed file */
  srcPath?: string;
  /** Set to `'ignore-all'` to ignore whitespace changes */
  whitespace?: string;
}
