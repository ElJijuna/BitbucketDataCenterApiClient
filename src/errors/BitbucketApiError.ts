/**
 * A single error entry from a Bitbucket error response body:
 * `{ errors: [{ context, message, exceptionName }] }`.
 */
export interface BitbucketErrorDetail {
  context: string | null;
  message: string;
  exceptionName?: string;
}

/**
 * Thrown when the Bitbucket Data Center API returns a non-2xx response.
 *
 * @example
 * ```typescript
 * import { BitbucketApiError } from 'bitbucket-datacenter-api-client';
 *
 * try {
 *   await bb.project('NONEXISTENT');
 * } catch (err) {
 *   if (err instanceof BitbucketApiError) {
 *     console.log(err.status);     // 404
 *     console.log(err.statusText); // 'Not Found'
 *     console.log(err.message);    // 'Bitbucket API error: 404 Not Found'
 *     console.log(err.errors);     // [{ context: null, message: '...', exceptionName: '...' }]
 *   }
 * }
 * ```
 */
export class BitbucketApiError extends Error {
  /** HTTP status code (e.g. `404`, `401`, `403`) */
  readonly status: number;
  /** HTTP status text (e.g. `'Not Found'`, `'Unauthorized'`) */
  readonly statusText: string;
  /** Structured error details parsed from the response body, if any were present */
  readonly errors: BitbucketErrorDetail[];

  constructor(status: number, statusText: string, errors: BitbucketErrorDetail[] = []) {
    const detail = errors[0]?.message;

    super(
      detail
        ? `Bitbucket API error: ${status} ${statusText} - ${detail}`
        : `Bitbucket API error: ${status} ${statusText}`,
    );
    this.name = 'BitbucketApiError';
    this.status = status;
    this.statusText = statusText;
    this.errors = errors;
  }
}
