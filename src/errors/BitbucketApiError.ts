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
 *   }
 * }
 * ```
 */
export class BitbucketApiError extends Error {
  /** HTTP status code (e.g. `404`, `401`, `403`) */
  readonly status: number;
  /** HTTP status text (e.g. `'Not Found'`, `'Unauthorized'`) */
  readonly statusText: string;

  constructor(status: number, statusText: string) {
    super(`Bitbucket API error: ${status} ${statusText}`);
    this.name = 'BitbucketApiError';
    this.status = status;
    this.statusText = statusText;
  }
}
