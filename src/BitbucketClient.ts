import type { BitbucketClientEvents } from './domain/ClientEvents';
import type { BitbucketClientOptions } from './domain/ClientOptions';
import type {
  DashboardPullRequestsParams,
  InboxPullRequestsCount,
  InboxPullRequestsParams,
} from './domain/Dashboard';
import type { PagedResponse } from './domain/Pagination';
import type { BitbucketProject, ProjectsParams } from './domain/Project';
import type { BitbucketPullRequest } from './domain/PullRequest';
import type {
  BitbucketRepository,
  GlobalReposParams,
  SearchReposParams,
} from './domain/Repository';
import type { BitbucketUser, UsersParams } from './domain/User';
import { BitbucketApiError, type BitbucketErrorDetail } from './errors/BitbucketApiError';
import {
  ProjectResource,
  type RequestBodyFn,
  type RequestFn,
  type RequestTextFn,
} from './resources/ProjectResource';
import { UserResource } from './resources/UserResource';
import { Security } from './security/Security';

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
  private readonly maxRetries: number;
  private readonly maxDelayMs: number;
  private readonly listeners: Map<
    keyof BitbucketClientEvents,
    BitbucketClientEvents[keyof BitbucketClientEvents][]
  > = new Map();

  /**
   * @param options - Connection and authentication options
   * @throws {TypeError} If `apiUrl` is not a valid URL, or if `user` is missing while `authType` is `'basic'`
   */
  constructor({ apiUrl, apiPath, user, token, authType = 'basic', retry }: BitbucketClientOptions) {
    if (authType === 'basic' && !user) {
      throw new TypeError('"user" is required when authType is "basic"');
    }

    this.security = new Security(apiUrl, user ?? '', token, authType);
    this.apiPath = apiPath.replace(/^\/|\/$/g, '');
    this.maxRetries = retry?.maxRetries ?? 0;
    this.maxDelayMs = retry?.maxDelayMs ?? 30000;
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
   * Performs a `fetch()` call, transparently retrying on `429 Too Many Requests`
   * responses according to the configured {@link RetryOptions}. Any other status
   * (including non-2xx) is returned as-is for the caller to handle.
   * @internal
   */
  private async fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
    let attempt = 0;

    while (true) {
      const response = await fetch(url, init);

      if (response.status !== 429 || attempt >= this.maxRetries) {
        return response;
      }

      await sleep(Math.min(retryAfterMs(response), this.maxDelayMs));
      attempt += 1;
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
    options?: { apiPath?: string },
  ): Promise<T> {
    const apiPath = options?.apiPath ?? this.apiPath;
    const base = `${this.security.getApiUrl()}/${apiPath}${path}`;
    const url = buildUrl(base, params);
    const startedAt = new Date();

    let statusCode: number | undefined;

    try {
      const response = await this.fetchWithRetry(url, { headers: this.security.getHeaders() });

      statusCode = response.status;

      if (!response.ok) {
        throw new BitbucketApiError(
          response.status,
          response.statusText,
          await parseErrorBody(response),
        );
      }

      const data = await parseJsonBody<T>(response);

      this.emit('request', {
        url,
        method: 'GET',
        startedAt,
        finishedAt: new Date(),
        durationMs: Date.now() - startedAt.getTime(),
        statusCode,
      });

      return data;
    } catch (err) {
      const finishedAt = new Date();

      this.emit('request', {
        url,
        method: 'GET',
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        statusCode,
        error: err instanceof Error ? err : new Error(String(err)),
      });

      throw err;
    }
  }

  private async requestPost<T>(
    path: string,
    body?: unknown,
    options?: { apiPath?: string; method?: 'POST' | 'PUT' | 'DELETE'; form?: boolean },
  ): Promise<T> {
    const method = options?.method ?? 'POST';
    const apiPath = options?.apiPath ?? this.apiPath;
    const url = `${this.security.getApiUrl()}/${apiPath}${path}`;
    const startedAt = new Date();

    let statusCode: number | undefined;

    const { Authorization, Accept } = this.security.getHeaders();
    const [headers, fetchBody]: [HeadersInit, BodyInit | undefined] = options?.form
      ? [
          { Authorization, Accept },
          new URLSearchParams(
            Object.entries(body as Record<string, unknown>)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => [k, String(v)]),
          ),
        ]
      : [this.security.getHeaders(), body === undefined ? undefined : JSON.stringify(body)];

    try {
      const response = await this.fetchWithRetry(url, { method, headers, body: fetchBody });

      statusCode = response.status;

      if (!response.ok) {
        throw new BitbucketApiError(
          response.status,
          response.statusText,
          await parseErrorBody(response),
        );
      }

      const data = await parseJsonBody<T>(response);

      this.emit('request', {
        url,
        method,
        startedAt,
        finishedAt: new Date(),
        durationMs: Date.now() - startedAt.getTime(),
        statusCode,
      });

      return data;
    } catch (err) {
      const finishedAt = new Date();

      this.emit('request', {
        url,
        method,
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        statusCode,
        error: err instanceof Error ? err : new Error(String(err)),
      });

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
      const response = await this.fetchWithRetry(url, { headers: this.security.getHeaders() });

      statusCode = response.status;

      if (!response.ok) {
        throw new BitbucketApiError(
          response.status,
          response.statusText,
          await parseErrorBody(response),
        );
      }

      const text = await response.text();

      this.emit('request', {
        url,
        method: 'GET',
        startedAt,
        finishedAt: new Date(),
        durationMs: Date.now() - startedAt.getTime(),
        statusCode,
      });

      return text;
    } catch (err) {
      const finishedAt = new Date();

      this.emit('request', {
        url,
        method: 'GET',
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        statusCode,
        error: err instanceof Error ? err : new Error(String(err)),
      });

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
      options?: { apiPath?: string },
    ) => this.request<T>(path, params, options);
    const requestText: RequestTextFn = (path, params) => this.requestText(path, params);
    const requestBody: RequestBodyFn = <T>(
      path: string,
      body?: unknown,
      options?: { apiPath?: string; method?: 'POST' | 'PUT' | 'DELETE'; form?: boolean },
    ) => this.requestPost<T>(path, body, options);

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
      options?: { apiPath?: string },
    ) => this.request<T>(path, params, options);
    const requestText: RequestTextFn = (path, params) => this.requestText(path, params);
    const requestBody: RequestBodyFn = <T>(
      path: string,
      body?: unknown,
      options?: { apiPath?: string; method?: 'POST' | 'PUT' | 'DELETE'; form?: boolean },
    ) => this.requestPost<T>(path, body, options);

    return new UserResource(request, requestText, requestBody, slug);
  }

  /**
   * Fetches the currently authenticated user.
   *
   * Bitbucket Data Center has no documented "whoami" endpoint, so this method
   * resolves the username from the `X-AUSERNAME` header that Bitbucket attaches
   * to every authenticated response, and then looks the user up via
   * `GET /rest/api/latest/users?filter={username}` (two requests).
   *
   * @returns The authenticated user object
   * @throws {Error} If the authenticated user cannot be determined
   *
   * @example
   * ```typescript
   * const me = await bbClient.currentUser();
   * ```
   */
  async currentUser(): Promise<BitbucketUser> {
    const username = await this.whoami();
    const users = await this.request<PagedResponse<BitbucketUser>>('/users', {
      filter: username,
    });
    const user =
      users.values.find((u) => u.name.toLowerCase() === username.toLowerCase()) ?? users.values[0];

    if (!user) {
      throw new Error(`Unable to find the authenticated user "${username}"`);
    }

    return user;
  }

  /**
   * Resolves the username of the authenticated user from the `X-AUSERNAME`
   * response header, which Bitbucket attaches to every authenticated response.
   * @internal
   */
  private async whoami(): Promise<string> {
    const url = `${this.security.getApiUrl()}/${this.apiPath}/application-properties`;
    const startedAt = new Date();

    let statusCode: number | undefined;

    try {
      const response = await this.fetchWithRetry(url, { headers: this.security.getHeaders() });

      statusCode = response.status;

      if (!response.ok) {
        throw new BitbucketApiError(
          response.status,
          response.statusText,
          await parseErrorBody(response),
        );
      }

      const username = response.headers.get('X-AUSERNAME');

      if (!username) {
        throw new Error(
          'Unable to determine the authenticated user: the X-AUSERNAME response header is missing',
        );
      }

      this.emit('request', {
        url,
        method: 'GET',
        startedAt,
        finishedAt: new Date(),
        durationMs: Date.now() - startedAt.getTime(),
        statusCode,
      });

      return decodeURIComponent(username);
    } catch (err) {
      const finishedAt = new Date();

      this.emit('request', {
        url,
        method: 'GET',
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        statusCode,
        error: err instanceof Error ? err : new Error(String(err)),
      });

      throw err;
    }
  }

  /**
   * Fetches repositories across all projects, mapping the documented
   * `GET /rest/api/latest/repos` parameters 1:1 (no transformation is applied).
   *
   * The response is paginated (`isLastPage`, `nextPageStart`, `values[]`) and
   * every repository embeds its `project`, so results spanning several projects
   * can be filtered or grouped client-side by `project.key`.
   *
   * Note that `projectname` matches the project *name* partially and
   * case-insensitively (not its key); when syncing across projects prefer
   * `projectkey` or validate `project.key` on each result.
   *
   * @param params - Optional filters: `name`, `projectkey`, `projectname`, `permission`, `visibility`, `state`, `archived`, `limit`, `start`
   * @returns A paged response of repositories
   *
   * @example
   * ```typescript
   * const page = await bb.repos({ name: 'orchestrator', permission: 'REPO_READ', limit: 100 });
   * const byProject = Object.groupBy(page.values, (repo) => repo.project.key);
   * ```
   */
  async repos(params?: GlobalReposParams): Promise<PagedResponse<BitbucketRepository>> {
    return this.request<PagedResponse<BitbucketRepository>>(
      '/repos',
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Searches for repositories across all projects.
   *
   * `GET /rest/api/latest/repos`
   *
   * The `name` parameter is automatically prefixed with `%` to perform a
   * contains-style match rather than a prefix match. For a 1:1 mapping of the
   * documented endpoint parameters use {@link BitbucketClient.repos} instead.
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
    const query: Record<string, string | number | boolean> = rest as Record<
      string,
      string | number | boolean
    >;

    if (name !== undefined) {
      query.name = `%${name}`;
    }

    return this.request<PagedResponse<BitbucketRepository>>('/repos', query);
  }

  /**
   * Fetches pull requests across all repositories where the authenticated user
   * participates (as author, reviewer, etc.).
   *
   * `GET /rest/api/latest/dashboard/pull-requests`
   *
   * @param params - Optional filters: `state`, `role`, `participantStatus`, `closedSince`, `limit`, `start`
   * @returns A paged response of pull requests
   *
   * @example
   * ```typescript
   * const mine = await bb.dashboardPullRequests({ role: 'REVIEWER', state: 'OPEN' });
   * ```
   */
  async dashboardPullRequests(
    params?: DashboardPullRequestsParams,
  ): Promise<PagedResponse<BitbucketPullRequest>> {
    return this.request<PagedResponse<BitbucketPullRequest>>(
      '/dashboard/pull-requests',
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches pull requests that require the authenticated user's attention
   * (e.g. awaiting their review, or theirs and blocked/needing changes).
   *
   * `GET /rest/api/latest/inbox/pull-requests`
   *
   * @param params - Optional filters: `role`, `filterText`, `limit`, `start`
   * @returns A paged response of pull requests
   */
  async inboxPullRequests(
    params?: InboxPullRequestsParams,
  ): Promise<PagedResponse<BitbucketPullRequest>> {
    return this.request<PagedResponse<BitbucketPullRequest>>(
      '/inbox/pull-requests',
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the count of pull requests in the authenticated user's inbox.
   *
   * `GET /rest/api/latest/inbox/pull-requests/count`
   *
   * @param params - Optional filters: `role`, `filterText`
   * @returns The inbox pull request count
   */
  async inboxPullRequestsCount(
    params?: Pick<InboxPullRequestsParams, 'role' | 'filterText'>,
  ): Promise<InboxPullRequestsCount> {
    return this.request<InboxPullRequestsCount>(
      '/inbox/pull-requests/count',
      params as Record<string, string | number | boolean>,
    );
  }
}

/**
 * Appends query parameters to a URL string, skipping `undefined` values.
 * @internal
 */
function buildUrl(base: string, params?: Record<string, string | number | boolean>): string {
  if (!params) {
    return base;
  }

  const entries = Object.entries(params).filter(([, v]) => v !== undefined);

  if (entries.length === 0) {
    return base;
  }

  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));

  return `${base}?${search.toString()}`;
}

/**
 * Parses a JSON response body, tolerating empty bodies (`204 No Content`, or a
 * `202 Accepted` with no payload) by resolving to `undefined` instead of throwing.
 * @internal
 */
async function parseJsonBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof SyntaxError) {
      return undefined as T;
    }

    throw err;
  }
}

/**
 * Parses the structured `{ errors: [{ context, message, exceptionName }] }` body
 * Bitbucket returns on error responses. Returns an empty array if the body is
 * missing, empty, or not in the expected shape.
 * @internal
 */
async function parseErrorBody(response: Response): Promise<BitbucketErrorDetail[]> {
  try {
    const data = (await response.json()) as { errors?: BitbucketErrorDetail[] };

    return Array.isArray(data?.errors) ? data.errors : [];
  } catch {
    return [];
  }
}

/**
 * Computes the delay, in milliseconds, indicated by a `429` response's `Retry-After`
 * header (either delta-seconds or an HTTP date). Falls back to `1000` if the header
 * is missing or unparseable.
 * @internal
 */
function retryAfterMs(response: Response): number {
  const header = response.headers.get('Retry-After');

  if (!header) {
    return 1000;
  }

  const seconds = Number(header);

  if (!Number.isNaN(seconds)) {
    return seconds * 1000;
  }

  const date = Date.parse(header);

  return Number.isNaN(date) ? 1000 : Math.max(0, date - Date.now());
}

/** @internal */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
