import type { PaginationParams } from './Pagination';
import type { BitbucketChangePath } from './Change';

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
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/diff`.
 */
export interface DiffParams {
  /** Number of context lines to include around each change (default: 10) */
  contextLines?: number;
  /** Source path to diff against (for renames) */
  srcPath?: string;
  /** Whitespace handling: `'IGNORE_ALL'` | `'IGNORE_CHANGE'` */
  whitespace?: 'IGNORE_ALL' | 'IGNORE_CHANGE';
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits/{id}/changes`.
 */
export interface CommitChangesParams extends PaginationParams {
  /** Only include changes after this commit SHA */
  since?: string;
}
