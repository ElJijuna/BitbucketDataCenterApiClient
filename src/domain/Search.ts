import type { BitbucketRepository } from './Repository';

/**
 * Paging options for the `code` entity of `POST /rest/search/latest/search`.
 */
export interface CodeSearchParams {
  /** Offset of the first code hit to return */
  start?: number;
  /** Maximum number of code hits to return */
  limit?: number;
}

/**
 * A single matching line of a code search hit, with surrounding context.
 */
export interface CodeSearchHitContextLine {
  /** 1-based line number in the file */
  line: number;
  /** The line's text, with matches wrapped in `<em>` tags */
  text: string;
}

/**
 * A file matching a code search query.
 */
export interface CodeSearchCodeHit {
  repository: BitbucketRepository;
  /** Path of the matching file in the repository */
  file: string;
  /** Groups of contiguous matching lines (one group per hit region) */
  hitContexts?: CodeSearchHitContextLine[][];
  /** Number of matches in the file */
  hitCount?: number;
}

/**
 * The `code` entity page of a code search response.
 *
 * Paging works like {@link PagedResponse} but with `count`/`nextStart`
 * instead of `size`/`nextPageStart`.
 */
export interface CodeSearchCodePage {
  category?: string;
  isLastPage: boolean;
  /** Total number of matching files */
  count: number;
  start: number;
  nextStart?: number;
  values: CodeSearchCodeHit[];
}

/**
 * Response for `POST /rest/search/latest/search`.
 *
 * @remarks Atlassian publishes only a sparse schema for the Search API; this
 * shape is typed defensively and most fields are optional. Inspect real
 * responses from your Bitbucket version before relying on a specific field.
 */
export interface CodeSearchResult {
  scope?: { type?: string };
  code?: CodeSearchCodePage;
  query?: { substituted?: boolean };
}
