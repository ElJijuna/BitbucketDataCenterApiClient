import { Security } from './security/Security';
import { ProjectResource, type RequestFn } from './resources/ProjectResource';
import type { BitbucketProject, ProjectsParams } from './domain/Project';
import type { PagedResponse } from './domain/Pagination';

/**
 * Constructor options for {@link BitbucketClient}.
 */
export interface BitbucketClientOptions {
  /** The base URL of the Bitbucket Data Center instance (e.g., `https://bitbucket.example.com`) */
  apiUrl: string;
  /** The username to authenticate with */
  user: string;
  /** The personal access token or password to authenticate with */
  token: string;
}

/**
 * Main entry point for the Bitbucket Data Center REST API client.
 *
 * @example
 * ```typescript
 * const bbClient = new BitbucketClient({
 *   apiUrl: 'https://bitbucket.example.com',
 *   user: 'john.doe',
 *   token: 'my-token',
 * });
 *
 * const projects = await bbClient.projects({ limit: 50 });
 * const project  = await bbClient.project('PROJ');
 * const repos    = await bbClient.project('PROJ').repos({ limit: 25, name: 'api' });
 * ```
 */
export class BitbucketClient {
  private readonly security: Security;

  /**
   * @param options - Connection and authentication options
   * @throws {TypeError} If `apiUrl` is not a valid URL
   */
  constructor({ apiUrl, user, token }: BitbucketClientOptions) {
    this.security = new Security(apiUrl, user, token);
  }

  /**
   * Performs an authenticated GET request to the Bitbucket REST API.
   *
   * @param path - API path relative to `/rest/api/latest` (e.g., `'/projects'`)
   * @param params - Optional query parameters to append to the URL
   * @throws {Error} If the HTTP response is not OK
   * @internal
   */
  private async request<T>(
    path: string,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const base = `${this.security.getApiUrl()}/rest/api/latest${path}`;
    const url = buildUrl(base, params);
    const response = await fetch(url, { headers: this.security.getHeaders() });
    if (!response.ok) {
      throw new Error(`Bitbucket API error: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  /**
   * Fetches all projects accessible to the authenticated user.
   *
   * `GET /rest/api/latest/projects`
   *
   * @param params - Optional filters: `limit`, `start`, `name`, `permission`
   * @returns An array of projects
   */
  async projects(params?: ProjectsParams): Promise<BitbucketProject[]> {
    const data = await this.request<PagedResponse<BitbucketProject>>(
      '/projects',
      params as Record<string, string | number>,
    );
    return data.values;
  }

  /**
   * Returns a {@link ProjectResource} for a given project key, providing access
   * to project-level data and sub-resources.
   *
   * The returned resource can be awaited directly to fetch project info,
   * or chained to access nested resources.
   *
   * @param projectKey - The project key (e.g., `'PROJ'`)
   * @returns A chainable project resource
   *
   * @example
   * ```typescript
   * const project = await bbClient.project('PROJ');
   * const repos   = await bbClient.project('PROJ').repos({ limit: 10 });
   * ```
   */
  project(projectKey: string): ProjectResource {
    const request: RequestFn = <T>(path: string, params?: Record<string, string | number>) =>
      this.request<T>(path, params);
    return new ProjectResource(request, projectKey);
  }
}

/**
 * Appends query parameters to a URL string using URLSearchParams.
 * @internal
 */
function buildUrl(base: string, params?: Record<string, string | number>): string {
  if (!params) return base;
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return base;
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `${base}?${search.toString()}`;
}
