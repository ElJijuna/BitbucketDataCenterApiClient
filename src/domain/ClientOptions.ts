import type { AuthType } from '../security/Security';

/**
 * Configures adaptive retry/backoff behaviour for `429 Too Many Requests` responses.
 */
export interface RetryOptions {
  /** Maximum number of retry attempts on `429` responses. Defaults to `0` (retries disabled). */
  maxRetries?: number;
  /** Upper bound, in milliseconds, applied to the delay derived from the `Retry-After` header. Defaults to `30000`. */
  maxDelayMs?: number;
}

/**
 * Constructor options for {@link BitbucketClient}.
 */
export interface BitbucketClientOptions {
  /** The host URL of the Bitbucket Data Center instance (e.g., `https://bitbucket.example.com`) */
  apiUrl: string;
  /** The API path to prepend to every request (e.g., `'rest/api/latest'`) */
  apiPath: string;
  /** The username to authenticate with. Required when `authType` is `'basic'` (the default). */
  user?: string;
  /** The personal access token or password to authenticate with */
  token: string;
  /** The authentication scheme to use. Defaults to `'basic'`; use `'bearer'` for HTTP access tokens. */
  authType?: AuthType;
  /** Retry/backoff behaviour applied when the API responds with `429 Too Many Requests`. */
  retry?: RetryOptions;
}
