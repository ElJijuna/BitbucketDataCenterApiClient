import type { PaginationParams } from './Pagination';

/** The type of change applied to a file in a pull request. */
export type ChangeType = 'ADD' | 'COPY' | 'DELETE' | 'MODIFY' | 'MOVE' | 'RENAME' | 'UNKNOWN';

/** The node type of the changed entry. */
export type ChangeNodeType = 'FILE' | 'DIRECTORY' | 'SUBMODULE';

/** Represents a file path in a Bitbucket change entry. */
export interface BitbucketChangePath {
  /** Path segments (e.g., `['src', 'index.ts']`) */
  components: string[];
  /** Parent directory (e.g., `'src'`) */
  parent: string;
  /** File name (e.g., `'index.ts'`) */
  name: string;
  /** File extension (e.g., `'ts'`) */
  extension: string;
  /** Full path string (e.g., `'src/index.ts'`) */
  toString: string;
}

/**
 * Represents a single file change within a Bitbucket Data Center pull request.
 */
export interface BitbucketChange {
  /** Content ID (SHA) of the file in the destination ref */
  contentId?: string;
  /** Content ID (SHA) of the file in the source ref */
  fromContentId?: string;
  /** Path of the changed file in the destination ref */
  path: BitbucketChangePath;
  /** Original path before a rename or move (only present for `RENAME` and `MOVE`) */
  srcPath?: BitbucketChangePath;
  /** Whether the file has the executable bit set in the destination ref */
  executable: boolean;
  /** Whether the file had the executable bit set in the source ref */
  srcExecutable: boolean;
  percentUnchanged: number;
  type: ChangeType;
  nodeType: ChangeNodeType;
  links: Record<string, unknown>;
}

/**
 * Query parameters accepted by
 * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/changes`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v819/api-group-pull-requests/#api-api-latest-projects-projectkey-repos-repositoryslug-pull-requests-pullrequestid-changes-get}
 */
export interface ChangesParams extends PaginationParams {
  /**
   * When `true`, includes the number of comments for each changed file.
   * @default false
   */
  withComments?: boolean;
}
