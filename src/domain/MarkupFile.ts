/**
 * Query parameters accepted by the repository markup-file endpoints
 * (`GET /rest/api/latest/projects/{key}/repos/{slug}/readme` and the
 * `license`/`contributing` equivalents).
 */
export interface MarkupFileParams {
  /** Branch, tag, or commit to read the file at; defaults to the default branch */
  at?: string;
  /** Markup implementation used to render the file */
  markup?: string;
  /** Whether HTML in the markup should be escaped */
  htmlEscape?: boolean;
  /** Whether rendered headings get an id attribute */
  includeHeadingId?: boolean;
  /** Whether single newlines are rendered as hard line breaks */
  hardwrap?: boolean;
}

/**
 * A repository markup file (README, LICENSE, or CONTRIBUTING) rendered by
 * Bitbucket.
 *
 * @remarks Atlassian does not publish a response schema for these endpoints;
 * this shape is typed defensively and all fields are optional. Inspect real
 * responses from your Bitbucket version before relying on a specific field.
 */
export interface BitbucketMarkupFile {
  /** Path of the file in the repository (e.g. `'README.md'`) */
  path?: string;
  displayPath?: string;
  /** Raw markup content */
  markup?: string;
  /** HTML-rendered content */
  html?: string;
}
