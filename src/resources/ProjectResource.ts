import type { BitbucketGroupPermission, ProjectGroupsParams } from '../domain/Group';
import type { PagedResponse } from '../domain/Pagination';
import type { BitbucketProject, UpdateProjectData } from '../domain/Project';
import type { BitbucketRepository, ReposParams } from '../domain/Repository';
import type { BitbucketUserPermission, ProjectUsersParams } from '../domain/User';
import type {
  BitbucketWebhook,
  TestWebhookParams,
  WebhookPayload,
  WebhooksParams,
  WebhookTestResult,
} from '../domain/Webhook';
import { RepositoryResource } from './RepositoryResource';

/** A project-level permission grant. */
export type ProjectPermission = 'PROJECT_READ' | 'PROJECT_WRITE' | 'PROJECT_ADMIN';

/** @internal */
export type RequestFn = <T>(
  path: string,
  params?: Record<string, string | number | boolean>,
  options?: { apiPath?: string },
) => Promise<T>;

/** @internal */
export type RequestTextFn = (
  path: string,
  params?: Record<string, string | number | boolean>,
) => Promise<string>;

/** @internal */
export type RequestBodyFn = <T>(
  path: string,
  body?: unknown,
  options?: { apiPath?: string; method?: 'POST' | 'PUT' | 'DELETE'; form?: boolean },
) => Promise<T>;

/**
 * Represents a Bitbucket project resource with chainable async methods.
 *
 * Implements `PromiseLike<BitbucketProject>` so it can be awaited directly
 * to fetch the project info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get project info
 * const project = await bbClient.project('PROJ');
 *
 * // Get repositories with filters
 * const repos = await bbClient.project('PROJ').repos({ limit: 50, name: 'api' });
 *
 * // Navigate into a specific repository
 * const prs = await bbClient.project('PROJ').repo('my-repo').pullRequests();
 *
 * // Get users with access to the project
 * const users = await bbClient.project('PROJ').users({ permission: 'PROJECT_WRITE' });
 * ```
 */
export class ProjectResource implements PromiseLike<BitbucketProject> {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestText: RequestTextFn,
    private readonly requestBody: RequestBodyFn,
    private readonly key: string,
  ) {}

  /**
   * Allows the resource to be awaited directly, resolving with the project info.
   * Delegates to {@link ProjectResource.get}.
   */
  // biome-ignore lint/suspicious/noThenProperty: intentional PromiseLike implementation for await support
  then<TResult1 = BitbucketProject, TResult2 = never>(
    onfulfilled?: ((value: BitbucketProject) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    // eslint-disable-next-line no-restricted-syntax -- delegating .then() is required to implement PromiseLike
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the project details.
   *
   * `GET /rest/api/latest/projects/{key}`
   *
   * @returns The project object
   */
  async get(): Promise<BitbucketProject> {
    return this.request<BitbucketProject>(`/projects/${this.key}`);
  }

  /**
   * Updates this project's avatar (and, nominally, its key).
   *
   * `PUT /rest/api/latest/projects/{key}`
   *
   * @remarks `name`, `public`, and `type` are read-only on this endpoint and
   * cannot be changed here — see {@link UpdateProjectData}.
   *
   * @param data - Fields to change; only supplied fields are updated
   * @returns The updated project
   */
  async update(data: UpdateProjectData): Promise<BitbucketProject> {
    return this.requestBody<BitbucketProject>(`/projects/${this.key}`, data, { method: 'PUT' });
  }

  /**
   * Deletes this project.
   *
   * `DELETE /rest/api/latest/projects/{key}`
   */
  async delete(): Promise<void> {
    return this.requestBody<void>(`/projects/${this.key}`, undefined, { method: 'DELETE' });
  }

  /**
   * Fetches repositories belonging to this project.
   *
   * `GET /rest/api/latest/projects/{key}/repos`
   *
   * @param params - Optional filters: `limit`, `start`, `slug`, `name`, `permission`
   * @returns An array of repositories
   */
  async repos(params?: ReposParams): Promise<PagedResponse<BitbucketRepository>> {
    return this.request<PagedResponse<BitbucketRepository>>(
      `/projects/${this.key}/repos`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Returns a {@link RepositoryResource} for a given repository slug, providing
   * access to repository-level data and sub-resources (pull requests, commits, etc.).
   *
   * The returned resource can be awaited directly to fetch repository info,
   * or chained to access nested resources.
   *
   * @param repoSlug - The repository slug (e.g., `'my-repo'`)
   * @returns A chainable repository resource
   *
   * @example
   * ```typescript
   * const repo    = await bbClient.project('PROJ').repo('my-repo');
   * const prs     = await bbClient.project('PROJ').repo('my-repo').pullRequests({ state: 'OPEN' });
   * const commits = await bbClient.project('PROJ').repo('my-repo').commits({ limit: 10 });
   * ```
   */
  repo(repoSlug: string): RepositoryResource {
    return new RepositoryResource(
      this.request,
      this.requestText,
      this.requestBody,
      `/projects/${this.key}/repos/${repoSlug}`,
    );
  }

  /**
   * Fetches users with explicit permissions on this project.
   *
   * `GET /rest/api/latest/projects/{key}/permissions/users`
   *
   * @param params - Optional filters: `limit`, `start`, `filter`, `permission`
   * @returns An array of user–permission pairs
   */
  async users(params?: ProjectUsersParams): Promise<PagedResponse<BitbucketUserPermission>> {
    return this.request<PagedResponse<BitbucketUserPermission>>(
      `/projects/${this.key}/permissions/users`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Grants or changes a user's permission level on this project.
   *
   * `PUT /rest/api/latest/projects/{key}/permissions/users?name={name}&permission={permission}`
   *
   * @param name - The user's username/slug
   * @param permission - `'PROJECT_READ'`, `'PROJECT_WRITE'`, or `'PROJECT_ADMIN'`
   */
  async setUserPermission(name: string, permission: ProjectPermission): Promise<void> {
    const path = `/projects/${this.key}/permissions/users?${new URLSearchParams({ name, permission })}`;

    return this.requestBody<void>(path, undefined, { method: 'PUT' });
  }

  /**
   * Revokes all of a user's permissions on this project.
   *
   * `DELETE /rest/api/latest/projects/{key}/permissions/users?name={name}`
   *
   * @param name - The user's username/slug
   */
  async removeUserPermission(name: string): Promise<void> {
    const path = `/projects/${this.key}/permissions/users?${new URLSearchParams({ name })}`;

    return this.requestBody<void>(path, undefined, { method: 'DELETE' });
  }

  /**
   * Fetches groups with explicit permissions on this project.
   *
   * `GET /rest/api/latest/projects/{key}/permissions/groups`
   *
   * @param params - Optional filters: `limit`, `start`, `filter`, `permission`
   * @returns A paged response of group–permission pairs
   */
  async groups(params?: ProjectGroupsParams): Promise<PagedResponse<BitbucketGroupPermission>> {
    return this.request<PagedResponse<BitbucketGroupPermission>>(
      `/projects/${this.key}/permissions/groups`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Grants or changes a group's permission level on this project.
   *
   * `PUT /rest/api/latest/projects/{key}/permissions/groups?name={name}&permission={permission}`
   *
   * @param name - The group's name
   * @param permission - `'PROJECT_READ'`, `'PROJECT_WRITE'`, or `'PROJECT_ADMIN'`
   */
  async setGroupPermission(name: string, permission: ProjectPermission): Promise<void> {
    const path = `/projects/${this.key}/permissions/groups?${new URLSearchParams({ name, permission })}`;

    return this.requestBody<void>(path, undefined, { method: 'PUT' });
  }

  /**
   * Revokes all of a group's permissions on this project.
   *
   * `DELETE /rest/api/latest/projects/{key}/permissions/groups?name={name}`
   *
   * @param name - The group's name
   */
  async removeGroupPermission(name: string): Promise<void> {
    const path = `/projects/${this.key}/permissions/groups?${new URLSearchParams({ name })}`;

    return this.requestBody<void>(path, undefined, { method: 'DELETE' });
  }

  /**
   * Fetches webhooks configured on this project.
   *
   * `GET /rest/api/latest/projects/{key}/webhooks`
   *
   * @param params - Optional filters: `limit`, `start`, `event`
   * @returns A paged response of webhooks
   */
  async webhooks(params?: WebhooksParams): Promise<PagedResponse<BitbucketWebhook>> {
    return this.request<PagedResponse<BitbucketWebhook>>(
      `/projects/${this.key}/webhooks`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Creates a webhook on this project.
   *
   * `POST /rest/api/latest/projects/{key}/webhooks`
   *
   * @param data - `name`, `events`, and `url`, plus optional `active`, `sslVerificationRequired`,
   * `configuration`, and `credentials`
   * @returns The created webhook
   */
  async createWebhook(data: WebhookPayload): Promise<BitbucketWebhook> {
    return this.requestBody<BitbucketWebhook>(`/projects/${this.key}/webhooks`, data);
  }

  /**
   * Updates a webhook on this project.
   *
   * `PUT /rest/api/latest/projects/{key}/webhooks/{webhookId}`
   *
   * @param webhookId - The webhook's numeric id
   * @param data - The full replacement webhook definition
   * @returns The updated webhook
   */
  async updateWebhook(webhookId: number, data: WebhookPayload): Promise<BitbucketWebhook> {
    return this.requestBody<BitbucketWebhook>(`/projects/${this.key}/webhooks/${webhookId}`, data, {
      method: 'PUT',
    });
  }

  /**
   * Deletes a webhook from this project.
   *
   * `DELETE /rest/api/latest/projects/{key}/webhooks/{webhookId}`
   *
   * @param webhookId - The webhook's numeric id
   */
  async deleteWebhook(webhookId: number): Promise<void> {
    return this.requestBody<void>(`/projects/${this.key}/webhooks/${webhookId}`, undefined, {
      method: 'DELETE',
    });
  }

  /**
   * Tests connectivity to a webhook target, either an existing webhook (`webhookId`) or a
   * candidate URL (`url`) before creating one.
   *
   * `POST /rest/api/latest/projects/{key}/webhooks/test`
   *
   * @param params - `webhookId` or `url` (query), `sslVerificationRequired` (query), and optional
   * `username`/`password` Basic auth credentials (body)
   * @returns The result of the connectivity test
   */
  async testWebhook(params: TestWebhookParams): Promise<WebhookTestResult> {
    const { webhookId, url, sslVerificationRequired, username, password } = params;
    const query: Record<string, string> = {};

    if (webhookId !== undefined) {
      query.webhookId = String(webhookId);
    }

    if (url !== undefined) {
      query.url = url;
    }

    if (sslVerificationRequired !== undefined) {
      query.sslVerificationRequired = String(sslVerificationRequired);
    }

    const qs = new URLSearchParams(query).toString();
    const path = `/projects/${this.key}/webhooks/test${qs ? `?${qs}` : ''}`;

    return this.requestBody<WebhookTestResult>(path, { username, password });
  }
}
