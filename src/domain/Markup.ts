/**
 * Query parameters accepted by `POST /rest/api/latest/markup/preview`.
 *
 * @see {@link https://developer.atlassian.com/server/bitbucket/rest/v1003/api-group-markup/#api-api-latest-markup-preview-post}
 */
export interface MarkupPreviewParams {
  /**
   * How URLs in the rendered HTML are built (e.g. `'ABSOLUTE'` or `'RELATIVE'`).
   * Defaults to relative URLs.
   */
  urlMode?: string;
  /** Whether HTML in the markup should be escaped */
  htmlEscape?: boolean;
  /** Whether rendered headings get an id attribute */
  includeHeadingId?: boolean;
  /** Whether single newlines are rendered as hard line breaks */
  hardwrap?: boolean;
}

/**
 * Response for `POST /rest/api/latest/markup/preview`.
 */
export interface MarkupPreviewResult {
  /** The markup rendered as HTML */
  html: string;
}
