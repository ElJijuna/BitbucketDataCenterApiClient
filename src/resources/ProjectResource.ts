import type { AutoDeclineSettings, AutoDeclineSettingsRequest } from '../domain/AutoDecline';
import type { AutoMergeProjectSettingsRequest, AutoMergeSettings } from '../domain/AutoMerge';
import type {
  BitbucketRefRestriction,
  RefRestrictionRequest,
  RefRestrictionsParams,
} from '../domain/BranchRestriction';
import type {
  BitbucketPullRequestCondition,
  DefaultReviewersRequest,
} from '../domain/DefaultReviewers';
import type {
  BitbucketDefaultTask,
  DefaultTaskRequest,
  DefaultTasksParams,
} from '../domain/DefaultTask';
import type { BitbucketGroupPermission, ProjectGroupsParams } from '../domain/Group';
import type { BitbucketRepositoryHook, HookSettings, HooksParams } from '../domain/Hook';
import type { PagedResponse, PaginationParams } from '../domain/Pagination';
import type { PermissionSearchParams, PermittedEntity } from '../domain/PermissionSearch';
import type { BitbucketProject, UpdateProjectData } from '../domain/Project';
import type { BitbucketRepository, CreateRepositoryData, ReposParams } from '../domain/Repository';
import type { BitbucketReviewerGroup, ReviewerGroupPayload } from '../domain/ReviewerGroup';
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

/** @internal */
export type RequestBinaryFn = (
  path: string,
  params?: Record<string, string | number | boolean>,
) => Promise<ArrayBuffer>;

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
    private readonly requestBinary?: RequestBinaryFn,
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
      this.requestBinary,
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

  /**
   * Creates a repository in this project.
   *
   * `POST /rest/api/latest/projects/{key}/repos`
   *
   * @param data - `name`, plus optional `scmId`, `slug`, `defaultBranch`, `description`,
   * `forkable`, and `public`
   * @returns The created repository
   */
  async createRepo(data: CreateRepositoryData): Promise<BitbucketRepository> {
    return this.requestBody<BitbucketRepository>(`/projects/${this.key}/repos`, data);
  }

  /**
   * Searches direct and implied permissions of users and groups on this project.
   * Returns a superset of the results returned by {@link ProjectResource.users}
   * and {@link ProjectResource.groups}, as it includes entities with implied
   * (e.g. global or admin) permissions.
   *
   * `GET /rest/api/latest/projects/{key}/permissions/search`
   *
   * @remarks Atlassian does not publish a response schema for this endpoint;
   * the entry shape is typed defensively — see {@link PermittedEntity}.
   *
   * @param params - Optional filters: `permission` (one or many), `filterText`, `type`
   * @returns A paged response of permitted users/groups
   */
  async searchPermissions(
    params?: PermissionSearchParams,
  ): Promise<PagedResponse<PermittedEntity>> {
    const query = new URLSearchParams();
    const permissions =
      params?.permission === undefined
        ? []
        : Array.isArray(params.permission)
          ? params.permission
          : [params.permission];

    for (const permission of permissions) {
      query.append('permission', permission);
    }

    if (params?.filterText !== undefined) {
      query.set('filterText', params.filterText);
    }

    if (params?.type !== undefined) {
      query.set('type', params.type);
    }

    const qs = query.toString();

    return this.request<PagedResponse<PermittedEntity>>(
      `/projects/${this.key}/permissions/search${qs ? `?${qs}` : ''}`,
    );
  }

  /**
   * Fetches the default reviewer conditions configured on this project.
   *
   * `GET /rest/default-reviewers/latest/projects/{key}/conditions`
   *
   * @returns An array of conditions (not paged)
   */
  async defaultReviewerConditions(): Promise<BitbucketPullRequestCondition[]> {
    return this.request<BitbucketPullRequestCondition[]>(
      `/projects/${this.key}/conditions`,
      undefined,
      { apiPath: 'rest/default-reviewers/latest' },
    );
  }

  /**
   * Creates a default reviewer condition on this project.
   *
   * `POST /rest/default-reviewers/latest/projects/{key}/condition`
   *
   * @param data - `sourceMatcher`, `targetMatcher`, `reviewers`/`reviewerGroups`, `requiredApprovals`
   * @returns The created condition
   */
  async createDefaultReviewerCondition(
    data: DefaultReviewersRequest,
  ): Promise<BitbucketPullRequestCondition> {
    return this.requestBody<BitbucketPullRequestCondition>(
      `/projects/${this.key}/condition`,
      data,
      {
        apiPath: 'rest/default-reviewers/latest',
      },
    );
  }

  /**
   * Updates a default reviewer condition on this project.
   *
   * `PUT /rest/default-reviewers/latest/projects/{key}/condition/{id}`
   *
   * @param id - The condition's numeric id
   * @param data - The full replacement condition definition
   * @returns The updated condition
   */
  async updateDefaultReviewerCondition(
    id: number,
    data: DefaultReviewersRequest,
  ): Promise<BitbucketPullRequestCondition> {
    return this.requestBody<BitbucketPullRequestCondition>(
      `/projects/${this.key}/condition/${id}`,
      data,
      { apiPath: 'rest/default-reviewers/latest', method: 'PUT' },
    );
  }

  /**
   * Deletes a default reviewer condition from this project.
   *
   * `DELETE /rest/default-reviewers/latest/projects/{key}/condition/{id}`
   *
   * @param id - The condition's numeric id
   */
  async deleteDefaultReviewerCondition(id: number): Promise<void> {
    return this.requestBody<void>(`/projects/${this.key}/condition/${id}`, undefined, {
      apiPath: 'rest/default-reviewers/latest',
      method: 'DELETE',
    });
  }

  /**
   * Fetches the ref restrictions (branch permissions) configured on this project.
   *
   * `GET /rest/branch-permissions/latest/projects/{key}/restrictions`
   *
   * @param params - Optional filters: `limit`, `start`, `matcherType`, `matcherId`, `type`
   * @returns A paged response of restrictions
   */
  async branchRestrictions(
    params?: RefRestrictionsParams,
  ): Promise<PagedResponse<BitbucketRefRestriction>> {
    return this.request<PagedResponse<BitbucketRefRestriction>>(
      `/projects/${this.key}/restrictions`,
      params as Record<string, string | number | boolean>,
      { apiPath: 'rest/branch-permissions/latest' },
    );
  }

  /**
   * Fetches a single ref restriction by id.
   *
   * `GET /rest/branch-permissions/latest/projects/{key}/restrictions/{id}`
   *
   * @param id - The restriction's numeric id
   * @returns The restriction
   */
  async branchRestriction(id: number): Promise<BitbucketRefRestriction> {
    return this.request<BitbucketRefRestriction>(
      `/projects/${this.key}/restrictions/${id}`,
      undefined,
      { apiPath: 'rest/branch-permissions/latest' },
    );
  }

  /**
   * Creates a ref restriction (branch permission) on this project.
   *
   * `POST /rest/branch-permissions/latest/projects/{key}/restrictions`
   *
   * @remarks Sends a single restriction as `application/json`. The endpoint
   * also supports bulk creation of several restrictions in one call with the
   * `application/vnd.atl.bitbucket.bulk+json` media type, which this client
   * does not wrap — issue one call per restriction instead.
   *
   * @param data - `type`, `matcher`, and optional `userSlugs`/`groupNames`/`accessKeyIds` exemptions
   * @returns The created restriction
   */
  async createBranchRestriction(data: RefRestrictionRequest): Promise<BitbucketRefRestriction> {
    return this.requestBody<BitbucketRefRestriction>(`/projects/${this.key}/restrictions`, data, {
      apiPath: 'rest/branch-permissions/latest',
    });
  }

  /**
   * Deletes a ref restriction from this project.
   *
   * `DELETE /rest/branch-permissions/latest/projects/{key}/restrictions/{id}`
   *
   * @param id - The restriction's numeric id
   */
  async deleteBranchRestriction(id: number): Promise<void> {
    return this.requestBody<void>(`/projects/${this.key}/restrictions/${id}`, undefined, {
      apiPath: 'rest/branch-permissions/latest',
      method: 'DELETE',
    });
  }

  /**
   * Fetches the reviewer groups configured on this project.
   *
   * `GET /rest/api/latest/projects/{key}/settings/reviewer-groups`
   *
   * @param params - Optional `limit` and `start`
   * @returns A paged response of reviewer groups
   */
  async reviewerGroups(params?: PaginationParams): Promise<PagedResponse<BitbucketReviewerGroup>> {
    return this.request<PagedResponse<BitbucketReviewerGroup>>(
      `/projects/${this.key}/settings/reviewer-groups`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches a single reviewer group by id.
   *
   * `GET /rest/api/latest/projects/{key}/settings/reviewer-groups/{id}`
   *
   * @param id - The reviewer group's numeric id
   * @returns The reviewer group
   */
  async reviewerGroup(id: number): Promise<BitbucketReviewerGroup> {
    return this.request<BitbucketReviewerGroup>(
      `/projects/${this.key}/settings/reviewer-groups/${id}`,
    );
  }

  /**
   * Creates a reviewer group on this project.
   *
   * `POST /rest/api/latest/projects/{key}/settings/reviewer-groups`
   *
   * @param data - `name`, plus optional `description` and `users`
   * @returns The created reviewer group
   */
  async createReviewerGroup(data: ReviewerGroupPayload): Promise<BitbucketReviewerGroup> {
    return this.requestBody<BitbucketReviewerGroup>(
      `/projects/${this.key}/settings/reviewer-groups`,
      data,
    );
  }

  /**
   * Updates a reviewer group on this project.
   *
   * `PUT /rest/api/latest/projects/{key}/settings/reviewer-groups/{id}`
   *
   * @param id - The reviewer group's numeric id
   * @param data - The full replacement group definition
   * @returns The updated reviewer group
   */
  async updateReviewerGroup(
    id: number,
    data: ReviewerGroupPayload,
  ): Promise<BitbucketReviewerGroup> {
    return this.requestBody<BitbucketReviewerGroup>(
      `/projects/${this.key}/settings/reviewer-groups/${id}`,
      data,
      { method: 'PUT' },
    );
  }

  /**
   * Deletes a reviewer group from this project.
   *
   * `DELETE /rest/api/latest/projects/{key}/settings/reviewer-groups/{id}`
   *
   * @param id - The reviewer group's numeric id
   */
  async deleteReviewerGroup(id: number): Promise<void> {
    return this.requestBody<void>(
      `/projects/${this.key}/settings/reviewer-groups/${id}`,
      undefined,
      {
        method: 'DELETE',
      },
    );
  }

  /**
   * Fetches this project's auto-decline settings (automatic declining of
   * inactive pull requests).
   *
   * `GET /rest/api/latest/projects/{key}/settings/auto-decline`
   *
   * @returns The effective auto-decline settings
   */
  async autoDeclineSettings(): Promise<AutoDeclineSettings> {
    return this.request<AutoDeclineSettings>(`/projects/${this.key}/settings/auto-decline`);
  }

  /**
   * Creates or updates this project's auto-decline settings.
   *
   * `PUT /rest/api/latest/projects/{key}/settings/auto-decline`
   *
   * @param data - `enabled` and/or `inactivityWeeks` (`1`, `2`, `4`, `8`, or `12`)
   * @returns The updated settings
   */
  async updateAutoDeclineSettings(data: AutoDeclineSettingsRequest): Promise<AutoDeclineSettings> {
    return this.requestBody<AutoDeclineSettings>(
      `/projects/${this.key}/settings/auto-decline`,
      data,
      { method: 'PUT' },
    );
  }

  /**
   * Deletes this project's auto-decline settings, falling back to the
   * instance-level default.
   *
   * `DELETE /rest/api/latest/projects/{key}/settings/auto-decline`
   */
  async deleteAutoDeclineSettings(): Promise<void> {
    return this.requestBody<void>(`/projects/${this.key}/settings/auto-decline`, undefined, {
      method: 'DELETE',
    });
  }

  /**
   * Fetches this project's pull request auto-merge settings.
   *
   * `GET /rest/api/latest/projects/{key}/settings/auto-merge`
   *
   * @returns The effective auto-merge settings
   */
  async autoMergeSettings(): Promise<AutoMergeSettings> {
    return this.request<AutoMergeSettings>(`/projects/${this.key}/settings/auto-merge`);
  }

  /**
   * Creates or updates this project's pull request auto-merge settings.
   *
   * `PUT /rest/api/latest/projects/{key}/settings/auto-merge`
   *
   * @param data - `enabled` and/or `restrictionAction`
   * @returns The updated settings
   */
  async updateAutoMergeSettings(data: AutoMergeProjectSettingsRequest): Promise<AutoMergeSettings> {
    return this.requestBody<AutoMergeSettings>(`/projects/${this.key}/settings/auto-merge`, data, {
      method: 'PUT',
    });
  }

  /**
   * Deletes this project's pull request auto-merge settings, falling back to
   * the instance-level default.
   *
   * `DELETE /rest/api/latest/projects/{key}/settings/auto-merge`
   */
  async deleteAutoMergeSettings(): Promise<void> {
    return this.requestBody<void>(`/projects/${this.key}/settings/auto-merge`, undefined, {
      method: 'DELETE',
    });
  }

  /**
   * Fetches the repository hooks available on this project and their state.
   *
   * `GET /rest/api/latest/projects/{key}/settings/hooks`
   *
   * @param params - Optional filters: `limit`, `start`, `type`
   * @returns A paged response of hooks
   */
  async hooks(params?: HooksParams): Promise<PagedResponse<BitbucketRepositoryHook>> {
    return this.request<PagedResponse<BitbucketRepositoryHook>>(
      `/projects/${this.key}/settings/hooks`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches a single repository hook by its module key.
   *
   * `GET /rest/api/latest/projects/{key}/settings/hooks/{hookKey}`
   *
   * @param hookKey - The hook's module key
   * @returns The hook and its state at this project's scope
   */
  async hook(hookKey: string): Promise<BitbucketRepositoryHook> {
    return this.request<BitbucketRepositoryHook>(`/projects/${this.key}/settings/hooks/${hookKey}`);
  }

  /**
   * Enables a repository hook on this project.
   *
   * `PUT /rest/api/latest/projects/{key}/settings/hooks/{hookKey}/enabled`
   *
   * @param hookKey - The hook's module key
   * @returns The updated hook state
   */
  async enableHook(hookKey: string): Promise<BitbucketRepositoryHook> {
    return this.requestBody<BitbucketRepositoryHook>(
      `/projects/${this.key}/settings/hooks/${hookKey}/enabled`,
      undefined,
      { method: 'PUT' },
    );
  }

  /**
   * Disables a repository hook on this project.
   *
   * `DELETE /rest/api/latest/projects/{key}/settings/hooks/{hookKey}/enabled`
   *
   * @param hookKey - The hook's module key
   * @returns The updated hook state
   */
  async disableHook(hookKey: string): Promise<BitbucketRepositoryHook> {
    return this.requestBody<BitbucketRepositoryHook>(
      `/projects/${this.key}/settings/hooks/${hookKey}/enabled`,
      undefined,
      { method: 'DELETE' },
    );
  }

  /**
   * Fetches the settings stored for a repository hook on this project.
   *
   * `GET /rest/api/latest/projects/{key}/settings/hooks/{hookKey}/settings`
   *
   * @param hookKey - The hook's module key
   * @returns The hook's settings (shape defined by the hook itself)
   */
  async hookSettings(hookKey: string): Promise<HookSettings> {
    return this.request<HookSettings>(`/projects/${this.key}/settings/hooks/${hookKey}/settings`);
  }

  /**
   * Replaces the settings stored for a repository hook on this project.
   *
   * `PUT /rest/api/latest/projects/{key}/settings/hooks/{hookKey}/settings`
   *
   * @param hookKey - The hook's module key
   * @param settings - The full replacement settings object
   * @returns The stored settings
   */
  async updateHookSettings(hookKey: string, settings: HookSettings): Promise<HookSettings> {
    return this.requestBody<HookSettings>(
      `/projects/${this.key}/settings/hooks/${hookKey}/settings`,
      settings,
      { method: 'PUT' },
    );
  }

  /**
   * Fetches the default tasks configured on this project.
   *
   * `GET /rest/default-tasks/latest/projects/{key}/tasks`
   *
   * @param params - Optional `limit`, `start`, and `markup` (`'true'` to render HTML)
   * @returns A paged response of default tasks
   */
  async defaultTasks(params?: DefaultTasksParams): Promise<PagedResponse<BitbucketDefaultTask>> {
    return this.request<PagedResponse<BitbucketDefaultTask>>(
      `/projects/${this.key}/tasks`,
      params as Record<string, string | number | boolean>,
      { apiPath: 'rest/default-tasks/latest' },
    );
  }

  /**
   * Creates a default task on this project.
   *
   * `POST /rest/default-tasks/latest/projects/{key}/tasks`
   *
   * @param data - `description`, plus optional `sourceMatcher`/`targetMatcher`
   * @returns The created task
   */
  async createDefaultTask(data: DefaultTaskRequest): Promise<BitbucketDefaultTask> {
    return this.requestBody<BitbucketDefaultTask>(`/projects/${this.key}/tasks`, data, {
      apiPath: 'rest/default-tasks/latest',
    });
  }

  /**
   * Updates a default task on this project.
   *
   * `PUT /rest/default-tasks/latest/projects/{key}/tasks/{taskId}`
   *
   * @param taskId - The task's numeric id
   * @param data - The full replacement task definition
   * @returns The updated task
   */
  async updateDefaultTask(taskId: number, data: DefaultTaskRequest): Promise<BitbucketDefaultTask> {
    return this.requestBody<BitbucketDefaultTask>(`/projects/${this.key}/tasks/${taskId}`, data, {
      apiPath: 'rest/default-tasks/latest',
      method: 'PUT',
    });
  }

  /**
   * Deletes a default task from this project.
   *
   * `DELETE /rest/default-tasks/latest/projects/{key}/tasks/{taskId}`
   *
   * @param taskId - The task's numeric id
   */
  async deleteDefaultTask(taskId: number): Promise<void> {
    return this.requestBody<void>(`/projects/${this.key}/tasks/${taskId}`, undefined, {
      apiPath: 'rest/default-tasks/latest',
      method: 'DELETE',
    });
  }

  /**
   * Deletes **all** default tasks from this project.
   *
   * `DELETE /rest/default-tasks/latest/projects/{key}/tasks`
   */
  async deleteAllDefaultTasks(): Promise<void> {
    return this.requestBody<void>(`/projects/${this.key}/tasks`, undefined, {
      apiPath: 'rest/default-tasks/latest',
      method: 'DELETE',
    });
  }
}
