import { Security } from './security/Security';
import { ProjectResource, type RequestFn, type RequestTextFn, type RequestBodyFn } from './resources/ProjectResource';
import { BitbucketApiError } from './errors/BitbucketApiError';
import { UserResource } from './resources/UserResource';
import type { BitbucketProject, ProjectsParams } from './domain/Project';
import type { BitbucketRepository, SearchReposParams } from './domain/Repository';
import type { BitbucketUser, UsersParams } from './domain/User';
import type { PagedResponse } from './domain/Pagination';

/**
 * Payload emitted on every HTTP request made by {@link BitbucketClient}.
 */
export interface RequestEvent {
  /** Full URL that was requested */
  url: string;
  /** HTTP method used */
  method: 'GET' | 'POST';
  /** Timestamp when the request started */
  startedAt: Date;
  /** Timestamp when the request finished (success or error) */
  finishedAt: Date;
  /** Total duration in milliseconds */
  durationMs: number;
  /** HTTP status code returned by the server, if a response was received */
  statusCode?: number;
  /** Error thrown, if the request failed */
  error?: Error;
}

/** Map of supported client events to their callback signatures */
export interface BitbucketClientEvents {
  request: (event: RequestEvent) => void;
}

/**
 * Constructor options for {@link BitbucketClient}.
 */
export interface BitbucketClientOptions {
  /** The host URL of the Bitbucket Data Center instance (e.g., `https://bitbucket.example.com`) */
  apiUrl: string;
  /** The API path to prepend to every request (e.g., `'rest/api/latest'`) */
  apiPath: string;
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
 *   apiPath: 'rest/api/latest',
 *   user: 'pilmee',
 *   token: 'my-token',
 * });
 *
 * const projects = await bbClient.projects({ limit: 50 });
 * const project  = await bbClient.project('PROJ');
 * const repos    = await bbClient.project('PROJ').repos({ name: 'api' });
 * const repo     = await bbClient.project('PROJ').repo('my-repo');
 * const prs      = await bbClient.project('PROJ').repo('my-repo').pullRequests({ state: 'OPEN' });
 * const commits  = await bbClient.project('PROJ').repo('my-repo').commits({ limit: 10 });
 * const users    = await bbClient.users({ filter: 'john' });
 * const user     = await bbClient.user('pilmee');
 * ```
 */
export class BitbucketClient {
  private readonly security: Security;
  private readonly apiPath: string;
  private readonly listeners: Map<keyof BitbucketClientEvents, BitbucketClientEvents[keyof BitbucketClientEvents][]> = new Map();

  /**
   * @param options - Connection and authentication options
   * @throws {TypeError} If `apiUrl` is not a valid URL
   */
  constructor({ apiUrl, apiPath, user, token }: BitbucketClientOptions) {
    this.security = new Security(apiUrl, user, token);
    this.apiPath = apiPath.replace(/^\/|\/$/g, '');
  }

  /**
   * Subscribes to a client event.
   *
   * @example
   * ```typescript
   * bbClient.on('request', (event) => {
   *   console.log(`${event.method} ${event.url} — ${event.durationMs}ms`);
   *   if (event.error) console.error('Request failed:', event.error);
   * });
   * ```
   */
  on<K extends keyof BitbucketClientEvents>(event: K, callback: BitbucketClientEvents[K]): this {
    const callbacks = this.listeners.get(event) ?? [];
    callbacks.push(callback);
    this.listeners.set(event, callbacks);
    return this;
  }

  private emit<K extends keyof BitbucketClientEvents>(
    event: K,
    payload: Parameters<BitbucketClientEvents[K]>[0],
  ): void {
    const callbacks = this.listeners.get(event) ?? [];
    for (const cb of callbacks) {
      (cb as (p: typeof payload) => void)(payload);
    }
  }

  /**
   * Performs an authenticated GET request to the Bitbucket REST API.
   *
   * @param path - API path appended directly to `apiUrl` (e.g., `'/projects'`)
   * @param params - Optional query parameters to append to the URL
   * @throws {Error} If the HTTP response is not OK
   * @internal
   */
  private async request<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const base = `${this.security.getApiUrl()}/${this.apiPath}${path}`;
    const url = buildUrl(base, params);
    const startedAt = new Date();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, { headers: this.security.getHeaders() });
      statusCode = response.status;
      if (!response.ok) {
        throw new BitbucketApiError(response.status, response.statusText);
      }
      const data = await response.json() as T;
      this.emit('request', { url, method: 'GET', startedAt, finishedAt: new Date(), durationMs: Date.now() - startedAt.getTime(), statusCode });
      return data;
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', { url, method: 'GET', startedAt, finishedAt, durationMs: finishedAt.getTime() - startedAt.getTime(), statusCode, error: err instanceof Error ? err : new Error(String(err)) });
      throw err;
    }
  }

  private async requestPost<T>(path: string, body: unknown, options?: { apiPath?: string }): Promise<T> {
    const apiPath = options?.apiPath ?? this.apiPath;
    const url = `${this.security.getApiUrl()}/${apiPath}${path}`;
    const startedAt = new Date();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.security.getHeaders(),
        body: JSON.stringify(body),
      });
      statusCode = response.status;
      if (!response.ok) {
        throw new BitbucketApiError(response.status, response.statusText);
      }
      const data = await response.json() as T;
      this.emit('request', { url, method: 'POST', startedAt, finishedAt: new Date(), durationMs: Date.now() - startedAt.getTime(), statusCode });
      return data;
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', { url, method: 'POST', startedAt, finishedAt, durationMs: finishedAt.getTime() - startedAt.getTime(), statusCode, error: err instanceof Error ? err : new Error(String(err)) });
      throw err;
    }
  }

  private async requestText(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<string> {
    const base = `${this.security.getApiUrl()}/${this.apiPath}${path}`;
    const url = buildUrl(base, params);
    const startedAt = new Date();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, { headers: this.security.getHeaders() });
      statusCode = response.status;
      if (!response.ok) {
        throw new BitbucketApiError(response.status, response.statusText);
      }
      const text = await response.text();
      this.emit('request', { url, method: 'GET', startedAt, finishedAt: new Date(), durationMs: Date.now() - startedAt.getTime(), statusCode });
      return text;
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', { url, method: 'GET', startedAt, finishedAt, durationMs: finishedAt.getTime() - startedAt.getTime(), statusCode, error: err instanceof Error ? err : new Error(String(err)) });
      throw err;
    }
  }

  /**
   * Fetches all projects accessible to the authenticated user.
   *
   * `GET /rest/api/latest/projects`
   *
   * @param params - Optional filters: `limit`, `start`, `name`, `permission`
   * @returns An array of projects
   */
  async projects(params?: ProjectsParams): Promise<PagedResponse<BitbucketProject>> {
    return this.request<PagedResponse<BitbucketProject>>(
      '/projects',
      params as Record<string, string | number | boolean>,
    );
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
   * const prs     = await bbClient.project('PROJ').repo('my-repo').pullRequests();
   * ```
   */
  project(projectKey: string): ProjectResource {
    const request: RequestFn = <T>(
      path: string,
      params?: Record<string, string | number | boolean>,
    ) => this.request<T>(path, params);
    const requestText: RequestTextFn = (path, params) => this.requestText(path, params);
    const requestBody: RequestBodyFn = <T>(path: string, body: unknown, options?: { apiPath?: string }) => this.requestPost<T>(path, body, options);
    return new ProjectResource(request, requestText, requestBody, projectKey);
  }

  /**
   * Fetches all users accessible to the authenticated user.
   *
   * `GET /rest/api/latest/users`
   *
   * @param params - Optional filters: `limit`, `start`, `filter`
   * @returns An array of users
   */
  async users(params?: UsersParams): Promise<PagedResponse<BitbucketUser>> {
    return this.request<PagedResponse<BitbucketUser>>(
      '/users',
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Returns a {@link UserResource} for a given user slug, providing access
   * to user data.
   *
   * The returned resource can be awaited directly to fetch user info.
   *
   * @param slug - The user slug (e.g., `'pilmee'`)
   * @returns A chainable user resource
   *
   * @example
   * ```typescript
   * const user = await bbClient.user('pilmee');
   * ```
   */
  user(slug: string): UserResource {
    const request: RequestFn = <T>(
      path: string,
      params?: Record<string, string | number | boolean>,
    ) => this.request<T>(path, params);
    const requestText: RequestTextFn = (path, params) => this.requestText(path, params);
    const requestBody: RequestBodyFn = <T>(path: string, body: unknown, options?: { apiPath?: string }) => this.requestPost<T>(path, body, options);
    return new UserResource(request, requestText, requestBody, slug);
  }

  /**
   * Searches for repositories across all projects.
   *
   * `GET /rest/api/latest/repos`
   *
   * The `name` parameter is automatically prefixed with `%` to perform a
   * contains-style match rather than a prefix match.
   *
   * @param params - Optional filters: `name`, `projectkey`, `projectname`, `permission`, `visibility`, `state`, `limit`, `start`
   * @returns A paged response of repositories
   *
   * @example
   * ```typescript
   * const repos = await bb.search({ name: 'api', projectkey: 'PROJ' });
   * ```
   */
  async search(params?: SearchReposParams): Promise<PagedResponse<BitbucketRepository>> {
    const { name, ...rest } = params ?? {};
    const query: Record<string, string | number | boolean> = rest as Record<string, string | number | boolean>;
    if (name !== undefined) {
      query['name'] = `%${name}`;
    }
    return this.request<PagedResponse<BitbucketRepository>>('/repos', query);
  }
}

/**
 * Appends query parameters to a URL string, skipping `undefined` values.
 * @internal
 */
function buildUrl(base: string, params?: Record<string, string | number | boolean>): string {
  if (!params) return base;
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return base;
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `${base}?${search.toString()}`;
}
