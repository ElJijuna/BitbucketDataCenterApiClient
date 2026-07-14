import type { BitbucketChangePath } from './Change';
import type { PaginationParams } from './Pagination';

export type DiffSegmentType = 'CONTEXT' | 'ADDED' | 'REMOVED';

/** A single line within a diff segment */
export interface BitbucketDiffLine {
  /** Line number in the source file */
  source?: number;
  /** Line number in the destination file */
  destination?: number;
  /** Line content */
  line: string;
  truncated: boolean;
}

/** A segment (block of CONTEXT, ADDED, or REMOVED lines) within a hunk */
export interface BitbucketDiffSegment {
  type: DiffSegmentType;
  lines: BitbucketDiffLine[];
  truncated: boolean;
}

/** A hunk (contiguous changed region) within a file diff */
export interface BitbucketDiffHunk {
  sourceLine: number;
  sourceSpan: number;
  destinationLine: number;
  destinationSpan: number;
  segments: BitbucketDiffSegment[];
  truncated: boolean;
}

/** Diff for a single file */
export interface BitbucketDiffEntry {
  source?: BitbucketChangePath;
  destination?: BitbucketChangePath;
  hunks: BitbucketDiffHunk[];
  truncated: boolean;
}

/**
 * Full diff response returned by commit and pull-request diff endpoints.
 */
export interface BitbucketDiff {
  diffs: BitbucketDiffEntry[];
  truncated: boolean;
  contextLines: number;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/diff/{path}` and
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/diff/{path}`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-repository/#api-api-latest-projects-projectkey-repos-repositoryslug-commits-commitid-diff-path-get}
 */
export interface DiffParams {
  /**
   * Limit the diff to a specific file. When provided it is appended to the URL
   * as a path segment: `.../diff/{path}`. Omit to diff all files.
   */
  path?: string;
  /** Number of context lines to include around each change (default: 10) */
  contextLines?: number;
  /**
   * The previous path of the file, if the file has been copied, moved or
   * renamed. Sent as a query parameter.
   */
  srcPath?: string;
  /** Only include changes introduced after this commit SHA */
  since?: string;
  /** Whitespace handling: `'ignore-all'` */
  whitespace?: 'ignore-all';
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/changes`.
 */
export interface CommitChangesParams extends PaginationParams {
  /** Only include changes after this commit SHA */
  since?: string;
}
