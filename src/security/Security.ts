/**
 * Encodes a string to Base64 in a way that works in both Node.js and browsers.
 * @internal
 */
function toBase64(value: string): string {
  return btoa(value);
}

/** Authentication scheme used to build the `Authorization` header. */
export type AuthType = 'basic' | 'bearer';

/**
 * Handles authentication (Basic or Bearer) for Bitbucket Data Center REST API requests.
 *
 * @example
 * ```typescript
 * const security = new Security(
 *   'https://bitbucket.example.com',
 *   'my-user',
 *   'my-token'
 * );
 *
 * const headers = security.getHeaders();
 * // { Authorization: 'Basic <base64>', 'Content-Type': 'application/json', Accept: 'application/json' }
 *
 * // HTTP access tokens recommend Bearer authentication instead:
 * const bearerSecurity = new Security('https://bitbucket.example.com', '', 'my-token', 'bearer');
 * // { Authorization: 'Bearer my-token', ... }
 * ```
 */
export class Security {
  private readonly apiUrl: string;
  private readonly authorizationHeader: string;

  /**
   * Creates a new Security instance with Basic or Bearer authentication credentials.
   *
   * @param apiUrl - The base URL of the Bitbucket Data Center instance (e.g., `https://bitbucket.example.com`).
   *   Must be a valid URL; throws if it cannot be parsed.
   * @param user - The username to authenticate with. Ignored when `authType` is `'bearer'`.
   * @param token - The personal access token or password to authenticate with
   * @param authType - The authentication scheme to use. Defaults to `'basic'`.
   *
   * @throws {TypeError} If `apiUrl` is not a valid URL
   */
  constructor(apiUrl: string, user: string, token: string, authType: AuthType = 'basic') {
    if (!URL.canParse(apiUrl)) {
      throw new TypeError(`Invalid apiUrl: "${apiUrl}" is not a valid URL`);
    }

    this.apiUrl = apiUrl.replace(/\/$/, '');
    this.authorizationHeader =
      authType === 'bearer' ? `Bearer ${token}` : `Basic ${toBase64(`${user}:${token}`)}`;
  }

  /**
   * Returns the base URL of the Bitbucket Data Center instance, without a trailing slash.
   *
   * @returns The API base URL
   */
  getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Returns the value of the `Authorization` header for Basic Authentication.
   *
   * @returns The Authorization header value in the format `Basic <base64-encoded-credentials>`
   */
  getAuthorizationHeader(): string {
    return this.authorizationHeader;
  }

  /**
   * Returns the full set of HTTP headers required for authenticated API requests.
   *
   * @returns An object containing `Authorization`, `Content-Type`, and `Accept` headers
   */
  getHeaders(): Record<string, string> {
    return {
      Authorization: this.authorizationHeader,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }
}
