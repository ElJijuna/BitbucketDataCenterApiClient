import type { PaginationParams, PagedResponse } from './Pagination';

/**
 * Represents the path components of a file or directory returned by the browse endpoint.
 */
export interface BitbucketBrowsePath {
  components: string[];
  parent: string;
  name: string;
  extension: string;
  toString: string;
}

/**
 * A single child entry (file, directory, or submodule) returned by the browse endpoint.
 */
export interface BitbucketBrowseChild {
  path: BitbucketBrowsePath;
  type: 'FILE' | 'DIRECTORY' | 'SUBMODULE';
  /** Size in bytes — only present for FILE entries */
  size?: number;
}

/**
 * Response from `GET /rest/api/latest/.../browse/{path}`.
 */
export interface BitbucketBrowseResponse {
  path: BitbucketBrowsePath;
  revision: string;
  children: PagedResponse<BitbucketBrowseChild>;
}

/**
 * Query parameters accepted by the browse endpoint.
 */
export interface BrowseParams extends PaginationParams {
  /** Branch, tag, or commit SHA to browse at */
  at?: string;
  /** If `true`, only the node type is returned without children */
  type?: boolean;
  /** If `true`, return blame information alongside file content */
  blame?: boolean;
  /** If `true`, suppress file content in the response */
  noContent?: boolean;
}
