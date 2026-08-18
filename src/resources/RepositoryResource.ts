import type { AutoDeclineSettings, AutoDeclineSettingsRequest } from '../domain/AutoDecline';
import type { AutoMergeSettings, AutoMergeSettingsRequest } from '../domain/AutoMerge';
import type {
  BitbucketBranch,
  BranchesParams,
  CreateBranchData,
  DeleteBranchData,
  SetDefaultBranchData,
} from '../domain/Branch';
import type {
  BitbucketRefRestriction,
  RefRestrictionRequest,
  RefRestrictionsParams,
} from '../domain/BranchRestriction';
import type { BitbucketBrowseResponse, BrowseParams } from '../domain/Browse';
import type { BitbucketChange } from '../domain/Change';
import type {
  ChangePullRequestAuthorSettings,
  ChangePullRequestAuthorSettingsRequest,
} from '../domain/ChangePullRequestAuthor';
import type { BitbucketCommit, CommitsParams } from '../domain/Commit';
import type { CompareDiffParams, CompareParams } from '../domain/Compare';
import type {
  BitbucketPullRequestCondition,
  DefaultReviewersRequest,
} from '../domain/DefaultReviewers';
import type {
  BitbucketDefaultTask,
  DefaultTaskRequest,
  DefaultTasksParams,
} from '../domain/DefaultTask';
import type { BitbucketDiff } from '../domain/Diff';
import type { EditFilePayload } from '../domain/EditFile';
import type { BitbucketRepositoryGroupPermission, RepositoryGroupsParams } from '../domain/Group';
import type { BitbucketRepositoryHook, HookSettings, HooksParams } from '../domain/Hook';
import type { BitbucketLabel } from '../domain/Label';
import type { BitbucketLastModifiedEntry, LastModifiedParams } from '../domain/LastModified';
import type { BitbucketMarkupFile, MarkupFileParams } from '../domain/MarkupFile';
import type { PagedResponse, PaginationParams } from '../domain/Pagination';
import type { PermissionSearchParams, PermittedEntity } from '../domain/PermissionSearch';
import type {
  BitbucketPullRequest,
  CreatePullRequestData,
  PullRequestsParams,
} from '../domain/PullRequest';
import type { RawFileParams } from '../domain/RawFile';
import type {
  BitbucketRefChangeActivity,
  RefChangeActivitiesParams,
} from '../domain/RefChangeActivity';
import type {
  ArchiveParams,
  BitbucketRepository,
  FilesParams,
  ForkRepositoryData,
  RelatedRepositoriesParams,
  UpdateRepositoryData,
} from '../domain/Repository';
import type {
  BitbucketRepositorySettings,
  UpdateRepositorySettingsData,
} from '../domain/RepositorySettings';
import type { BitbucketRepositorySize } from '../domain/RepositorySize';
import type {
  BitbucketRequiredBuildCondition,
  RequiredBuildConditionRequest,
} from '../domain/RequiredBuild';
import type { BitbucketReviewerGroup, ReviewerGroupPayload } from '../domain/ReviewerGroup';
import type { RefSyncRequest, RefSyncStatus, SetSyncStatusData, SyncRef } from '../domain/Sync';
import type { BitbucketTag, CreateTagData, TagsParams } from '../domain/Tag';
import type {
  BitbucketRepositoryUserPermission,
  BitbucketUser,
  RepositoryPermission,
  RepositoryUsersParams,
} from '../domain/User';
import type {
  BitbucketWebhook,
  TestWebhookParams,
  WebhookPayload,
  WebhooksParams,
  WebhookTestResult,
} from '../domain/Webhook';
import { CommitResource } from './CommitResource';
import type { RequestBinaryFn, RequestBodyFn, RequestFn, RequestTextFn } from './ProjectResource';
import { PullRequestResource } from './PullRequestResource';

/**
 * Represents a Bitbucket repository resource with chainable async methods.
 *
 * Implements `PromiseLike<BitbucketRepository>` so it can be awaited directly
 * to fetch repository info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get repository info
 * const repo = await bbClient.project('PROJ').repo('my-repo');
 *
 * // Get pull requests
 * const prs = await bbClient.project('PROJ').repo('my-repo').pullRequests({ state: 'OPEN' });
 *
 * // Navigate into a specific pull request
 * const activities = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).activities();
 *
 * // Get commits
 * const commits = await bbClient.project('PROJ').repo('my-repo').commits({ limit: 10 });
 * ```
 */
export class RepositoryResource implements PromiseLike<BitbucketRepository> {
  private readonly basePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestText: RequestTextFn,
    private readonly requestBody: RequestBodyFn,
    basePath: string,
    private readonly requestBinary?: RequestBinaryFn,
  ) {
    this.basePath = basePath;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the repository info.
   * Delegates to {@link RepositoryResource.get}.
   */
  // biome-ignore lint/suspicious/noThenProperty: intentional PromiseLike implementation for await support
  then<TResult1 = BitbucketRepository, TResult2 = never>(
    onfulfilled?: ((value: BitbucketRepository) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    // eslint-disable-next-line no-restricted-syntax -- delegating .then() is required to implement PromiseLike
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the repository details.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}`
   *
   * @returns The repository object
   */
  async get(): Promise<BitbucketRepository> {
    return this.request<BitbucketRepository>(this.basePath);
  }

  /**
   * Updates this repository's name, description, visibility, or moves it to another project.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}`
   *
   * @param data - Fields to change; only supplied fields are updated
   * @returns The updated repository
   */
  async update(data: UpdateRepositoryData): Promise<BitbucketRepository> {
    return this.requestBody<BitbucketRepository>(this.basePath, data, { method: 'PUT' });
  }

  /**
   * Deletes this repository.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}`
   */
  async delete(): Promise<void> {
    return this.requestBody<void>(this.basePath, undefined, { method: 'DELETE' });
  }

  /**
   * Forks this repository.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}`
   *
   * @param data - Optional overrides: target `name`, `project`, or `defaultBranch`. Omit to fork
   * with the same name into the same project.
   * @returns The newly created fork
   */
  async fork(data?: ForkRepositoryData): Promise<BitbucketRepository> {
    return this.requestBody<BitbucketRepository>(this.basePath, data);
  }

  /**
   * Fetches pull requests for this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests`
   *
   * @param params - Optional filters: `limit`, `start`, `state`, `direction`, `at`, `order`
   * @returns A paged response of pull requests
   */
  async pullRequests(params?: PullRequestsParams): Promise<PagedResponse<BitbucketPullRequest>> {
    return this.request<PagedResponse<BitbucketPullRequest>>(
      `${this.basePath}/pull-requests`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches commits for this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/commits`
   *
   * @param params - Optional filters: `limit`, `start`, `until`, `since`, `path`, `merges`, `followRenames`, `ignoreMissing`
   * @returns An array of commits
   */
  async commits(params?: CommitsParams): Promise<PagedResponse<BitbucketCommit>> {
    return this.request<PagedResponse<BitbucketCommit>>(
      `${this.basePath}/commits`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the files last modified in this repository along with the commit that last touched each.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/last-modified`
   *
   * @param params - Optional filters: `limit`, `start`, `at`
   * @returns An array of last-modified entries
   */
  async lastModified(
    params?: LastModifiedParams,
  ): Promise<PagedResponse<BitbucketLastModifiedEntry>> {
    return this.request<PagedResponse<BitbucketLastModifiedEntry>>(
      `${this.basePath}/last-modified`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the size of this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/sizes`
   *
   * @remarks This endpoint is not part of the official Bitbucket Data Center
   * REST API documentation. It is a well-known internal endpoint used by the
   * Bitbucket UI and may change or be removed without notice in future versions.
   *
   * @returns The repository size object
   */
  async size(): Promise<BitbucketRepositorySize> {
    return this.request<BitbucketRepositorySize>(`${this.basePath}/sizes`);
  }

  /**
   * Fetches branches for this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/branches`
   *
   * @param params - Optional filters: `limit`, `start`, `filterText`, `orderBy`, `details`, `base`, `boostMatches`
   * @returns An array of branches
   */
  async branches(params?: BranchesParams): Promise<PagedResponse<BitbucketBranch>> {
    return this.request<PagedResponse<BitbucketBranch>>(
      `${this.basePath}/branches`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the default branch of this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/branches/default`
   *
   * @returns The default branch object
   */
  async defaultBranch(): Promise<BitbucketBranch> {
    return this.request<BitbucketBranch>(`${this.basePath}/branches/default`);
  }

  /**
   * Sets the default branch of this repository.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/default-branch`
   *
   * @param branch - The full ref ID to set as default (e.g., `{ id: 'refs/heads/main' }`)
   */
  async setDefaultBranch(branch: SetDefaultBranchData): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/default-branch`, branch, { method: 'PUT' });
  }

  /**
   * Creates a new branch in this repository.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/branches`
   *
   * @param data - `name` and `startPoint` (commit SHA or ref), plus an optional `message`
   * @returns The created branch
   */
  async createBranch(data: CreateBranchData): Promise<BitbucketBranch> {
    return this.requestBody<BitbucketBranch>(`${this.basePath}/branches`, data);
  }

  /**
   * Deletes a branch from this repository.
   *
   * `DELETE /rest/branch-utils/latest/projects/{key}/repos/{slug}/branches`
   *
   * @param data - `name` of the branch to delete, plus an optional `dryRun` flag
   */
  async deleteBranch(data: DeleteBranchData): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/branches`, data, {
      method: 'DELETE',
      apiPath: 'rest/branch-utils/latest',
    });
  }

  /**
   * Fetches the forks of this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/forks`
   *
   * @param params - Optional pagination: `limit`, `start`
   * @returns A paged response of forked repositories
   */
  async forks(params?: PaginationParams): Promise<PagedResponse<BitbucketRepository>> {
    return this.request<PagedResponse<BitbucketRepository>>(
      `${this.basePath}/forks`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches repositories in the same hierarchy as this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/related`
   *
   * @param params - Optional pagination and permission filter
   * @returns A paged response of related repositories
   */
  async related(params?: RelatedRepositoriesParams): Promise<PagedResponse<BitbucketRepository>> {
    return this.request<PagedResponse<BitbucketRepository>>(
      `${this.basePath}/related`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches tags associated with a list of commits.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/tags`
   *
   * @param commits - Array of commit SHAs to look up tags for
   * @param options - Optional overrides (e.g. `apiPath` to target a different API version)
   * @returns A paged response of tags
   */
  async tagsByCommits(
    commits: string[],
    options?: { apiPath?: string },
  ): Promise<PagedResponse<BitbucketTag>> {
    return this.requestBody<PagedResponse<BitbucketTag>>(`${this.basePath}/tags`, commits, options);
  }

  /**
   * Fetches tags for this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/tags`
   *
   * @param params - Optional filters: `limit`, `start`, `filterText`, `orderBy`
   * @returns A paged response of tags
   */
  async tags(params?: TagsParams): Promise<PagedResponse<BitbucketTag>> {
    return this.request<PagedResponse<BitbucketTag>>(
      `${this.basePath}/tags`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Creates a new tag in this repository.
   *
   * `POST /rest/git/latest/projects/{key}/repos/{slug}/tags`
   *
   * @param data - `name` and `startPoint` (commit SHA or ref); include `message` for an annotated tag
   * @returns The created tag
   */
  async createTag(data: CreateTagData): Promise<BitbucketTag> {
    return this.requestBody<BitbucketTag>(`${this.basePath}/tags`, data, {
      apiPath: 'rest/git/latest',
    });
  }

  /**
   * Deletes a tag from this repository.
   *
   * `DELETE /rest/git/latest/projects/{key}/repos/{slug}/tags/{name}`
   *
   * @param tagName - Short name of the tag to delete (e.g., `'v1.0.0'`)
   */
  async deleteTag(tagName: string): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/tags/${tagName}`, undefined, {
      method: 'DELETE',
      apiPath: 'rest/git/latest',
    });
  }

  /**
   * Returns a {@link PullRequestResource} for a given pull request ID, providing
   * access to pull request data and sub-resources (activities, etc.).
   *
   * The returned resource can be awaited directly to fetch pull request info,
   * or chained to access nested resources.
   *
   * @param pullRequestId - The numeric pull request ID
   * @returns A chainable pull request resource
   *
   * @example
   * ```typescript
   * const pr         = await bbClient.project('PROJ').repo('my-repo').pullRequest(42);
   * const activities = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).activities();
   * ```
   */
  /**
   * Fetches webhooks configured on this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/webhooks/search`
   *
   * @param params - Optional filters: `limit`, `start`, `event`
   * @returns A paged response of webhooks
   */
  async webhooks(params?: WebhooksParams): Promise<PagedResponse<BitbucketWebhook>> {
    return this.request<PagedResponse<BitbucketWebhook>>(
      `${this.basePath}/webhooks/search`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the raw content of a file in this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/raw/{path}`
   *
   * @param filePath - Path to the file (e.g., `'src/index.ts'`)
   * @param params - Optional: `at` (branch, tag, or commit SHA)
   * @returns The raw file content as a string
   */
  async raw(filePath: string, params?: RawFileParams): Promise<string> {
    return this.requestText(
      `${this.basePath}/raw/${filePath}`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Browses the contents of a directory or file in this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/browse/{srcPath}`
   *
   * @param srcPath - Path to browse (e.g., `'src'` or `'src/index.ts'`). Omit to browse the root.
   * @param params - Optional: `at` (branch/tag/commit), `type`, `blame`, `noContent`, `limit`, `start`
   * @returns The browse response with path info and children
   */
  async browse(srcPath?: string, params?: BrowseParams): Promise<BitbucketBrowseResponse> {
    const path = srcPath ? `${this.basePath}/browse/${srcPath}` : `${this.basePath}/browse`;

    return this.request<BitbucketBrowseResponse>(
      path,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Returns a {@link CommitResource} for a given commit SHA, providing access
   * to commit data and sub-resources (changes, diff).
   *
   * The returned resource can be awaited directly to fetch commit info,
   * or chained to access nested resources.
   *
   * @param commitId - The commit SHA (e.g., `'abc123def456'`)
   * @returns A chainable commit resource
   *
   * @example
   * ```typescript
   * const commit  = await bbClient.project('PROJ').repo('my-repo').commit('abc123');
   * const changes = await bbClient.project('PROJ').repo('my-repo').commit('abc123').changes();
   * const diff    = await bbClient.project('PROJ').repo('my-repo').commit('abc123').diff();
   * ```
   */
  /**
   * Fetches the pull-request settings for this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/settings/pull-requests`
   *
   * @returns The repository pull-request settings object
   */
  async settings(): Promise<BitbucketRepositorySettings> {
    return this.request<BitbucketRepositorySettings>(`${this.basePath}/settings/pull-requests`);
  }

  /**
   * Updates the pull-request settings for this repository.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/settings/pull-requests`
   *
   * @param data - Fields to change; only supplied fields are updated
   * @returns The updated repository pull-request settings object
   */
  async updateSettings(data: UpdateRepositorySettingsData): Promise<BitbucketRepositorySettings> {
    return this.requestBody<BitbucketRepositorySettings>(
      `${this.basePath}/settings/pull-requests`,
      data,
    );
  }

  /**
   * Creates or updates a file in this repository.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/browse/{path}`
   *
   * @param filePath - Path to the file (e.g., `'src/index.ts'`)
   * @param payload - File content, commit message, branch, and source commit ID
   * @returns The commit created by this edit
   */
  async editFile(filePath: string, payload: EditFilePayload): Promise<BitbucketCommit> {
    return this.requestBody<BitbucketCommit>(`${this.basePath}/browse/${filePath}`, payload, {
      method: 'PUT',
      form: true,
    });
  }

  /**
   * Creates a pull request in this repository.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests`
   *
   * @param data - `title`, `fromRef`, `toRef`, plus optional `description`, `reviewers`, `draft`
   * @returns The created pull request
   */
  async createPullRequest(data: CreatePullRequestData): Promise<BitbucketPullRequest> {
    return this.requestBody<BitbucketPullRequest>(`${this.basePath}/pull-requests`, data);
  }

  /**
   * Creates a webhook on this repository.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/webhooks`
   *
   * @param data - `name`, `events`, and `url`, plus optional `active`, `sslVerificationRequired`,
   * `configuration`, and `credentials`
   * @returns The created webhook
   */
  async createWebhook(data: WebhookPayload): Promise<BitbucketWebhook> {
    return this.requestBody<BitbucketWebhook>(`${this.basePath}/webhooks`, data);
  }

  /**
   * Updates a webhook on this repository.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/webhooks/{webhookId}`
   *
   * @param webhookId - The webhook's numeric id
   * @param data - The full replacement webhook definition
   * @returns The updated webhook
   */
  async updateWebhook(webhookId: number, data: WebhookPayload): Promise<BitbucketWebhook> {
    return this.requestBody<BitbucketWebhook>(`${this.basePath}/webhooks/${webhookId}`, data, {
      method: 'PUT',
    });
  }

  /**
   * Deletes a webhook from this repository.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/webhooks/{webhookId}`
   *
   * @param webhookId - The webhook's numeric id
   */
  async deleteWebhook(webhookId: number): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/webhooks/${webhookId}`, undefined, {
      method: 'DELETE',
    });
  }

  /**
   * Tests connectivity to a webhook target, either an existing webhook (`webhookId`) or a
   * candidate URL (`url`) before creating one.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/webhooks/test`
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
    const path = `${this.basePath}/webhooks/test${qs ? `?${qs}` : ''}`;

    return this.requestBody<WebhookTestResult>(path, { username, password });
  }

  /**
   * Downloads an archive (zip/tar) of this repository's content at a given ref.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/archive`
   *
   * @param params - Optional: `at`, `format` (`'zip'` default, `'tar'`, `'tar.gz'`, `'tgz'`),
   * `filename`, `path` (one or many, to archive a subset), `prefix`
   * @returns The archive's raw bytes; wrap with `Buffer.from(...)` in Node.js to write it to disk
   *
   * @example
   * ```typescript
   * const archive = await bbClient.project('PROJ').repo('my-repo').archive({ format: 'tgz' });
   * await fs.promises.writeFile('my-repo.tgz', Buffer.from(archive));
   * ```
   */
  async archive(params?: ArchiveParams): Promise<ArrayBuffer> {
    const query = new URLSearchParams();
    const { at, format, filename, path, prefix } = params ?? {};
    const paths = path === undefined ? [] : Array.isArray(path) ? path : [path];

    if (at !== undefined) {
      query.set('at', at);
    }

    if (format !== undefined) {
      query.set('format', format);
    }

    if (filename !== undefined) {
      query.set('filename', filename);
    }

    for (const includedPath of paths) {
      query.append('path', includedPath);
    }

    if (prefix !== undefined) {
      query.set('prefix', prefix);
    }

    const qs = query.toString();

    // biome-ignore lint/style/noNonNullAssertion: requestBinary is always set when this method is called
    return this.requestBinary!(`${this.basePath}/archive${qs ? `?${qs}` : ''}`);
  }

  /**
   * Lists the paths of all files in this repository (recursively) at a given ref.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/files[/{path}]`
   *
   * @param path - Directory to list; omit to list from the repository root
   * @param params - Optional `limit`, `start`, and `at` (branch/tag/commit)
   * @returns A paged response of file paths
   */
  async files(path?: string, params?: FilesParams): Promise<PagedResponse<string>> {
    const requestPath = path ? `${this.basePath}/files/${path}` : `${this.basePath}/files`;

    return this.request<PagedResponse<string>>(
      requestPath,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the file changes between two refs or commits.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/compare/changes`
   *
   * @param params - `from`, `to`, optional `fromRepo` (cross-fork), `limit`, `start`
   * @returns A paged response of file changes
   */
  async compareChanges(params?: CompareParams): Promise<PagedResponse<BitbucketChange>> {
    return this.request<PagedResponse<BitbucketChange>>(
      `${this.basePath}/compare/changes`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the commits reachable from `from` but not from `to`.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/compare/commits`
   *
   * @param params - `from`, `to`, optional `fromRepo` (cross-fork), `limit`, `start`
   * @returns A paged response of commits
   */
  async compareCommits(params?: CompareParams): Promise<PagedResponse<BitbucketCommit>> {
    return this.request<PagedResponse<BitbucketCommit>>(
      `${this.basePath}/compare/commits`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the diff between two refs or commits.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/compare/diff{path}`
   *
   * The `path` param (the file to diff) is optional: when omitted, the diff
   * for the whole comparison is returned.
   *
   * @param params - Optional: `path`, `from`, `to`, `fromRepo`, `contextLines`, `srcPath`, `whitespace`
   * @returns The diff object
   */
  async compareDiff(params?: CompareDiffParams): Promise<BitbucketDiff> {
    const { path: filePath, ...queryParams } = params ?? {};
    const path = filePath
      ? `${this.basePath}/compare/diff/${filePath}`
      : `${this.basePath}/compare/diff`;

    return this.request<BitbucketDiff>(
      path,
      queryParams as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the labels applied to this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/labels`
   *
   * @returns A paged response of labels
   */
  async labels(): Promise<PagedResponse<BitbucketLabel>> {
    return this.request<PagedResponse<BitbucketLabel>>(`${this.basePath}/labels`);
  }

  /**
   * Applies a label to this repository.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/labels`
   *
   * @param name - The label name
   * @returns The applied label
   */
  async addLabel(name: string): Promise<BitbucketLabel> {
    return this.requestBody<BitbucketLabel>(`${this.basePath}/labels`, { name });
  }

  /**
   * Removes a label from this repository.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/labels/{labelName}`
   *
   * @param name - The label name
   */
  async removeLabel(name: string): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/labels/${name}`, undefined, {
      method: 'DELETE',
    });
  }

  /**
   * Fetches this repository's README rendered by Bitbucket.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/readme`
   *
   * @remarks Atlassian does not publish a response schema for this endpoint;
   * the shape is typed defensively — see {@link BitbucketMarkupFile}.
   *
   * @param params - Optional: `at`, `markup`, `htmlEscape`, `includeHeadingId`, `hardwrap`
   * @returns The rendered README
   */
  async readme(params?: MarkupFileParams): Promise<BitbucketMarkupFile> {
    return this.request<BitbucketMarkupFile>(
      `${this.basePath}/readme`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches this repository's LICENSE rendered by Bitbucket.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/license`
   *
   * @remarks Atlassian does not publish a response schema for this endpoint;
   * the shape is typed defensively — see {@link BitbucketMarkupFile}.
   *
   * @param params - Optional: `at`, `markup`, `htmlEscape`, `includeHeadingId`, `hardwrap`
   * @returns The rendered LICENSE
   */
  async license(params?: MarkupFileParams): Promise<BitbucketMarkupFile> {
    return this.request<BitbucketMarkupFile>(
      `${this.basePath}/license`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches this repository's CONTRIBUTING guidelines rendered by Bitbucket.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/contributing`
   *
   * @remarks Atlassian does not publish a response schema for this endpoint;
   * the shape is typed defensively — see {@link BitbucketMarkupFile}.
   *
   * @param params - Optional: `at`, `markup`, `htmlEscape`, `includeHeadingId`, `hardwrap`
   * @returns The rendered CONTRIBUTING file
   */
  async contributing(params?: MarkupFileParams): Promise<BitbucketMarkupFile> {
    return this.request<BitbucketMarkupFile>(
      `${this.basePath}/contributing`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Adds the authenticated user as a watcher of this repository.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/watch`
   */
  async watch(): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/watch`, undefined);
  }

  /**
   * Removes the authenticated user as a watcher of this repository.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/watch`
   */
  async unwatch(): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/watch`, undefined, { method: 'DELETE' });
  }

  /**
   * Fetches this repository's ref change activity log (pushes, branch/tag
   * creations and deletions, etc.).
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/ref-change-activities`
   *
   * @param params - Optional `limit`, `start`, and `ref` (e.g. `'refs/heads/main'`)
   * @returns A paged response of ref change activities
   */
  async refChangeActivities(
    params?: RefChangeActivitiesParams,
  ): Promise<PagedResponse<BitbucketRefChangeActivity>> {
    return this.request<PagedResponse<BitbucketRefChangeActivity>>(
      `${this.basePath}/ref-change-activities`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches users with explicit permissions on this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/permissions/users`
   *
   * @param params - Optional filters: `limit`, `start`, `filter`
   * @returns A paged response of user–permission pairs
   */
  async users(
    params?: RepositoryUsersParams,
  ): Promise<PagedResponse<BitbucketRepositoryUserPermission>> {
    return this.request<PagedResponse<BitbucketRepositoryUserPermission>>(
      `${this.basePath}/permissions/users`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Grants or changes a user's permission level on this repository.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/permissions/users?name={name}&permission={permission}`
   *
   * @param name - The user's username/slug
   * @param permission - `'REPO_READ'`, `'REPO_WRITE'`, or `'REPO_ADMIN'`
   */
  async setUserPermission(name: string, permission: RepositoryPermission): Promise<void> {
    const path = `${this.basePath}/permissions/users?${new URLSearchParams({ name, permission })}`;

    return this.requestBody<void>(path, undefined, { method: 'PUT' });
  }

  /**
   * Revokes all of a user's permissions on this repository.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/permissions/users?name={name}`
   *
   * @param name - The user's username/slug
   */
  async removeUserPermission(name: string): Promise<void> {
    const path = `${this.basePath}/permissions/users?${new URLSearchParams({ name })}`;

    return this.requestBody<void>(path, undefined, { method: 'DELETE' });
  }

  /**
   * Fetches groups with explicit permissions on this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/permissions/groups`
   *
   * @param params - Optional filters: `limit`, `start`, `filter`
   * @returns A paged response of group–permission pairs
   */
  async groups(
    params?: RepositoryGroupsParams,
  ): Promise<PagedResponse<BitbucketRepositoryGroupPermission>> {
    return this.request<PagedResponse<BitbucketRepositoryGroupPermission>>(
      `${this.basePath}/permissions/groups`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Grants or changes a group's permission level on this repository.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/permissions/groups?name={name}&permission={permission}`
   *
   * @param name - The group's name
   * @param permission - `'REPO_READ'`, `'REPO_WRITE'`, or `'REPO_ADMIN'`
   */
  async setGroupPermission(name: string, permission: RepositoryPermission): Promise<void> {
    const path = `${this.basePath}/permissions/groups?${new URLSearchParams({ name, permission })}`;

    return this.requestBody<void>(path, undefined, { method: 'PUT' });
  }

  /**
   * Revokes all of a group's permissions on this repository.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/permissions/groups?name={name}`
   *
   * @param name - The group's name
   */
  async removeGroupPermission(name: string): Promise<void> {
    const path = `${this.basePath}/permissions/groups?${new URLSearchParams({ name })}`;

    return this.requestBody<void>(path, undefined, { method: 'DELETE' });
  }

  /**
   * Searches direct and implied permissions of users and groups on this
   * repository. Returns a superset of the results returned by
   * {@link RepositoryResource.users} and {@link RepositoryResource.groups}.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/permissions/search`
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
      `${this.basePath}/permissions/search${qs ? `?${qs}` : ''}`,
    );
  }

  /**
   * Fetches the default reviewer conditions configured on this repository.
   *
   * `GET /rest/default-reviewers/latest/projects/{key}/repos/{slug}/conditions`
   *
   * @returns An array of conditions (not paged)
   */
  async defaultReviewerConditions(): Promise<BitbucketPullRequestCondition[]> {
    return this.request<BitbucketPullRequestCondition[]>(`${this.basePath}/conditions`, undefined, {
      apiPath: 'rest/default-reviewers/latest',
    });
  }

  /**
   * Creates a default reviewer condition on this repository.
   *
   * `POST /rest/default-reviewers/latest/projects/{key}/repos/{slug}/condition`
   *
   * @param data - `sourceMatcher`, `targetMatcher`, `reviewers`/`reviewerGroups`, `requiredApprovals`
   * @returns The created condition
   */
  async createDefaultReviewerCondition(
    data: DefaultReviewersRequest,
  ): Promise<BitbucketPullRequestCondition> {
    return this.requestBody<BitbucketPullRequestCondition>(`${this.basePath}/condition`, data, {
      apiPath: 'rest/default-reviewers/latest',
    });
  }

  /**
   * Updates a default reviewer condition on this repository.
   *
   * `PUT /rest/default-reviewers/latest/projects/{key}/repos/{slug}/condition/{id}`
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
      `${this.basePath}/condition/${id}`,
      data,
      { apiPath: 'rest/default-reviewers/latest', method: 'PUT' },
    );
  }

  /**
   * Deletes a default reviewer condition from this repository.
   *
   * `DELETE /rest/default-reviewers/latest/projects/{key}/repos/{slug}/condition/{id}`
   *
   * @param id - The condition's numeric id
   */
  async deleteDefaultReviewerCondition(id: number): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/condition/${id}`, undefined, {
      apiPath: 'rest/default-reviewers/latest',
      method: 'DELETE',
    });
  }

  /**
   * Fetches the ref restrictions (branch permissions) configured on this repository.
   *
   * `GET /rest/branch-permissions/latest/projects/{key}/repos/{slug}/restrictions`
   *
   * @param params - Optional filters: `limit`, `start`, `matcherType`, `matcherId`, `type`
   * @returns A paged response of restrictions
   */
  async branchRestrictions(
    params?: RefRestrictionsParams,
  ): Promise<PagedResponse<BitbucketRefRestriction>> {
    return this.request<PagedResponse<BitbucketRefRestriction>>(
      `${this.basePath}/restrictions`,
      params as Record<string, string | number | boolean>,
      { apiPath: 'rest/branch-permissions/latest' },
    );
  }

  /**
   * Fetches a single ref restriction by id.
   *
   * `GET /rest/branch-permissions/latest/projects/{key}/repos/{slug}/restrictions/{id}`
   *
   * @param id - The restriction's numeric id
   * @returns The restriction
   */
  async branchRestriction(id: number): Promise<BitbucketRefRestriction> {
    return this.request<BitbucketRefRestriction>(`${this.basePath}/restrictions/${id}`, undefined, {
      apiPath: 'rest/branch-permissions/latest',
    });
  }

  /**
   * Creates a ref restriction (branch permission) on this repository.
   *
   * `POST /rest/branch-permissions/latest/projects/{key}/repos/{slug}/restrictions`
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
    return this.requestBody<BitbucketRefRestriction>(`${this.basePath}/restrictions`, data, {
      apiPath: 'rest/branch-permissions/latest',
    });
  }

  /**
   * Deletes a ref restriction from this repository.
   *
   * `DELETE /rest/branch-permissions/latest/projects/{key}/repos/{slug}/restrictions/{id}`
   *
   * @param id - The restriction's numeric id
   */
  async deleteBranchRestriction(id: number): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/restrictions/${id}`, undefined, {
      apiPath: 'rest/branch-permissions/latest',
      method: 'DELETE',
    });
  }

  /**
   * Fetches the required-builds merge check conditions configured on this repository.
   *
   * `GET /rest/required-builds/latest/projects/{key}/repos/{slug}/conditions`
   *
   * @param params - Optional `limit` and `start`
   * @returns A paged response of conditions
   */
  async requiredBuildConditions(
    params?: PaginationParams,
  ): Promise<PagedResponse<BitbucketRequiredBuildCondition>> {
    return this.request<PagedResponse<BitbucketRequiredBuildCondition>>(
      `${this.basePath}/conditions`,
      params as Record<string, string | number | boolean>,
      { apiPath: 'rest/required-builds/latest' },
    );
  }

  /**
   * Creates a required-builds merge check condition on this repository.
   *
   * `POST /rest/required-builds/latest/projects/{key}/repos/{slug}/condition`
   *
   * @param data - `buildParentKeys` and `refMatcher`, plus optional `exemptRefMatcher`,
   * `requiredForPullRequest`, `requiredForMergeQueue`
   * @returns The created condition
   */
  async createRequiredBuildCondition(
    data: RequiredBuildConditionRequest,
  ): Promise<BitbucketRequiredBuildCondition> {
    return this.requestBody<BitbucketRequiredBuildCondition>(`${this.basePath}/condition`, data, {
      apiPath: 'rest/required-builds/latest',
    });
  }

  /**
   * Updates a required-builds merge check condition on this repository.
   *
   * `PUT /rest/required-builds/latest/projects/{key}/repos/{slug}/condition/{id}`
   *
   * @param id - The condition's numeric id
   * @param data - The full replacement condition definition
   * @returns The updated condition
   */
  async updateRequiredBuildCondition(
    id: number,
    data: RequiredBuildConditionRequest,
  ): Promise<BitbucketRequiredBuildCondition> {
    return this.requestBody<BitbucketRequiredBuildCondition>(
      `${this.basePath}/condition/${id}`,
      data,
      { apiPath: 'rest/required-builds/latest', method: 'PUT' },
    );
  }

  /**
   * Deletes a required-builds merge check condition from this repository.
   *
   * `DELETE /rest/required-builds/latest/projects/{key}/repos/{slug}/condition/{id}`
   *
   * @param id - The condition's numeric id
   */
  async deleteRequiredBuildCondition(id: number): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/condition/${id}`, undefined, {
      apiPath: 'rest/required-builds/latest',
      method: 'DELETE',
    });
  }

  /**
   * Fetches the reviewer groups configured on this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/settings/reviewer-groups`
   *
   * @param params - Optional `limit` and `start`
   * @returns A paged response of reviewer groups
   */
  async reviewerGroups(params?: PaginationParams): Promise<PagedResponse<BitbucketReviewerGroup>> {
    return this.request<PagedResponse<BitbucketReviewerGroup>>(
      `${this.basePath}/settings/reviewer-groups`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches a single reviewer group by id.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/settings/reviewer-groups/{id}`
   *
   * @param id - The reviewer group's numeric id
   * @returns The reviewer group
   */
  async reviewerGroup(id: number): Promise<BitbucketReviewerGroup> {
    return this.request<BitbucketReviewerGroup>(`${this.basePath}/settings/reviewer-groups/${id}`);
  }

  /**
   * Fetches the members of a reviewer group who are licensed and hold
   * `REPO_READ` permission on this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/settings/reviewer-groups/{id}/users`
   *
   * @param id - The reviewer group's numeric id
   * @returns An array of users (not paged)
   */
  async reviewerGroupUsers(id: number): Promise<BitbucketUser[]> {
    return this.request<BitbucketUser[]>(`${this.basePath}/settings/reviewer-groups/${id}/users`);
  }

  /**
   * Creates a reviewer group on this repository.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/settings/reviewer-groups`
   *
   * @param data - `name`, plus optional `description` and `users`
   * @returns The created reviewer group
   */
  async createReviewerGroup(data: ReviewerGroupPayload): Promise<BitbucketReviewerGroup> {
    return this.requestBody<BitbucketReviewerGroup>(
      `${this.basePath}/settings/reviewer-groups`,
      data,
    );
  }

  /**
   * Updates a reviewer group on this repository.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/settings/reviewer-groups/{id}`
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
      `${this.basePath}/settings/reviewer-groups/${id}`,
      data,
      { method: 'PUT' },
    );
  }

  /**
   * Deletes a reviewer group from this repository.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/settings/reviewer-groups/{id}`
   *
   * @param id - The reviewer group's numeric id
   */
  async deleteReviewerGroup(id: number): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/settings/reviewer-groups/${id}`, undefined, {
      method: 'DELETE',
    });
  }

  /**
   * Fetches this repository's auto-decline settings (automatic declining of
   * inactive pull requests).
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/settings/auto-decline`
   *
   * @returns The effective auto-decline settings
   */
  async autoDeclineSettings(): Promise<AutoDeclineSettings> {
    return this.request<AutoDeclineSettings>(`${this.basePath}/settings/auto-decline`);
  }

  /**
   * Creates or updates this repository's auto-decline settings.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/settings/auto-decline`
   *
   * @param data - `enabled` and/or `inactivityWeeks` (`1`, `2`, `4`, `8`, or `12`)
   * @returns The updated settings
   */
  async updateAutoDeclineSettings(data: AutoDeclineSettingsRequest): Promise<AutoDeclineSettings> {
    return this.requestBody<AutoDeclineSettings>(`${this.basePath}/settings/auto-decline`, data, {
      method: 'PUT',
    });
  }

  /**
   * Deletes this repository's auto-decline settings, falling back to the
   * project-level (or instance-level) setting.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/settings/auto-decline`
   */
  async deleteAutoDeclineSettings(): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/settings/auto-decline`, undefined, {
      method: 'DELETE',
    });
  }

  /**
   * Fetches this repository's pull request auto-merge settings.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/settings/auto-merge`
   *
   * @returns The effective auto-merge settings
   */
  async autoMergeSettings(): Promise<AutoMergeSettings> {
    return this.request<AutoMergeSettings>(`${this.basePath}/settings/auto-merge`);
  }

  /**
   * Creates or updates this repository's pull request auto-merge settings.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/settings/auto-merge`
   *
   * @param data - `enabled`
   * @returns The updated settings
   */
  async updateAutoMergeSettings(data: AutoMergeSettingsRequest): Promise<AutoMergeSettings> {
    return this.requestBody<AutoMergeSettings>(`${this.basePath}/settings/auto-merge`, data, {
      method: 'PUT',
    });
  }

  /**
   * Deletes this repository's pull request auto-merge settings, falling back
   * to the project-level (or instance-level) setting.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/settings/auto-merge`
   */
  async deleteAutoMergeSettings(): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/settings/auto-merge`, undefined, {
      method: 'DELETE',
    });
  }

  /**
   * Fetches this repository's pull request change-author settings.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/settings/change-author`
   *
   * @returns The effective change-author settings
   */
  async changeAuthorSettings(): Promise<ChangePullRequestAuthorSettings> {
    return this.request<ChangePullRequestAuthorSettings>(`${this.basePath}/settings/change-author`);
  }

  /**
   * Creates or updates this repository's pull request change-author settings.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/settings/change-author`
   *
   * @param data - `enabled`
   * @returns The updated settings
   */
  async updateChangeAuthorSettings(
    data: ChangePullRequestAuthorSettingsRequest,
  ): Promise<ChangePullRequestAuthorSettings> {
    return this.requestBody<ChangePullRequestAuthorSettings>(
      `${this.basePath}/settings/change-author`,
      data,
      { method: 'PUT' },
    );
  }

  /**
   * Deletes this repository's pull request change-author settings.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/settings/change-author`
   */
  async deleteChangeAuthorSettings(): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/settings/change-author`, undefined, {
      method: 'DELETE',
    });
  }

  /**
   * Fetches the repository hooks available on this repository and their state.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/settings/hooks`
   *
   * @param params - Optional filters: `limit`, `start`, `type`
   * @returns A paged response of hooks
   */
  async hooks(params?: HooksParams): Promise<PagedResponse<BitbucketRepositoryHook>> {
    return this.request<PagedResponse<BitbucketRepositoryHook>>(
      `${this.basePath}/settings/hooks`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches a single repository hook by its module key.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/settings/hooks/{hookKey}`
   *
   * @param hookKey - The hook's module key
   * @returns The hook and its state at this repository's scope
   */
  async hook(hookKey: string): Promise<BitbucketRepositoryHook> {
    return this.request<BitbucketRepositoryHook>(`${this.basePath}/settings/hooks/${hookKey}`);
  }

  /**
   * Enables a repository hook on this repository.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/settings/hooks/{hookKey}/enabled`
   *
   * @param hookKey - The hook's module key
   * @returns The updated hook state
   */
  async enableHook(hookKey: string): Promise<BitbucketRepositoryHook> {
    return this.requestBody<BitbucketRepositoryHook>(
      `${this.basePath}/settings/hooks/${hookKey}/enabled`,
      undefined,
      { method: 'PUT' },
    );
  }

  /**
   * Disables a repository hook on this repository.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/settings/hooks/{hookKey}/enabled`
   *
   * @param hookKey - The hook's module key
   * @returns The updated hook state
   */
  async disableHook(hookKey: string): Promise<BitbucketRepositoryHook> {
    return this.requestBody<BitbucketRepositoryHook>(
      `${this.basePath}/settings/hooks/${hookKey}/enabled`,
      undefined,
      { method: 'DELETE' },
    );
  }

  /**
   * Fetches the settings stored for a repository hook on this repository.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/settings/hooks/{hookKey}/settings`
   *
   * @param hookKey - The hook's module key
   * @returns The hook's settings (shape defined by the hook itself)
   */
  async hookSettings(hookKey: string): Promise<HookSettings> {
    return this.request<HookSettings>(`${this.basePath}/settings/hooks/${hookKey}/settings`);
  }

  /**
   * Replaces the settings stored for a repository hook on this repository.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/settings/hooks/{hookKey}/settings`
   *
   * @param hookKey - The hook's module key
   * @param settings - The full replacement settings object
   * @returns The stored settings
   */
  async updateHookSettings(hookKey: string, settings: HookSettings): Promise<HookSettings> {
    return this.requestBody<HookSettings>(
      `${this.basePath}/settings/hooks/${hookKey}/settings`,
      settings,
      { method: 'PUT' },
    );
  }

  /**
   * Fetches the default tasks configured on this repository.
   *
   * `GET /rest/default-tasks/latest/projects/{key}/repos/{slug}/tasks`
   *
   * @param params - Optional `limit`, `start`, and `markup` (`'true'` to render HTML)
   * @returns A paged response of default tasks
   */
  async defaultTasks(params?: DefaultTasksParams): Promise<PagedResponse<BitbucketDefaultTask>> {
    return this.request<PagedResponse<BitbucketDefaultTask>>(
      `${this.basePath}/tasks`,
      params as Record<string, string | number | boolean>,
      { apiPath: 'rest/default-tasks/latest' },
    );
  }

  /**
   * Creates a default task on this repository.
   *
   * `POST /rest/default-tasks/latest/projects/{key}/repos/{slug}/tasks`
   *
   * @param data - `description`, plus optional `sourceMatcher`/`targetMatcher`
   * @returns The created task
   */
  async createDefaultTask(data: DefaultTaskRequest): Promise<BitbucketDefaultTask> {
    return this.requestBody<BitbucketDefaultTask>(`${this.basePath}/tasks`, data, {
      apiPath: 'rest/default-tasks/latest',
    });
  }

  /**
   * Updates a default task on this repository.
   *
   * `PUT /rest/default-tasks/latest/projects/{key}/repos/{slug}/tasks/{taskId}`
   *
   * @param taskId - The task's numeric id
   * @param data - The full replacement task definition
   * @returns The updated task
   */
  async updateDefaultTask(taskId: number, data: DefaultTaskRequest): Promise<BitbucketDefaultTask> {
    return this.requestBody<BitbucketDefaultTask>(`${this.basePath}/tasks/${taskId}`, data, {
      apiPath: 'rest/default-tasks/latest',
      method: 'PUT',
    });
  }

  /**
   * Deletes a default task from this repository.
   *
   * `DELETE /rest/default-tasks/latest/projects/{key}/repos/{slug}/tasks/{taskId}`
   *
   * @param taskId - The task's numeric id
   */
  async deleteDefaultTask(taskId: number): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/tasks/${taskId}`, undefined, {
      apiPath: 'rest/default-tasks/latest',
      method: 'DELETE',
    });
  }

  /**
   * Deletes **all** default tasks from this repository.
   *
   * `DELETE /rest/default-tasks/latest/projects/{key}/repos/{slug}/tasks`
   */
  async deleteAllDefaultTasks(): Promise<void> {
    return this.requestBody<void>(`${this.basePath}/tasks`, undefined, {
      apiPath: 'rest/default-tasks/latest',
      method: 'DELETE',
    });
  }

  /**
   * Fetches the fork synchronization status of this repository.
   *
   * `GET /rest/sync/latest/projects/{key}/repos/{slug}`
   *
   * @param at - Optional ref id to restrict the status to (e.g. `'refs/heads/main'`)
   * @returns The synchronization status
   */
  async syncStatus(at?: string): Promise<RefSyncStatus> {
    return this.request<RefSyncStatus>(this.basePath, at === undefined ? undefined : { at }, {
      apiPath: 'rest/sync/latest',
    });
  }

  /**
   * Enables or disables fork synchronization for this repository.
   *
   * `POST /rest/sync/latest/projects/{key}/repos/{slug}`
   *
   * @param data - `enabled`
   * @returns The new synchronization status, or `undefined` when sync was disabled
   */
  async setSyncStatus(data: SetSyncStatusData): Promise<RefSyncStatus | undefined> {
    return this.requestBody<RefSyncStatus | undefined>(this.basePath, data, {
      apiPath: 'rest/sync/latest',
    });
  }

  /**
   * Manually synchronizes a ref of this fork with upstream, resolving a
   * diverged or orphaned state with the given `action`.
   *
   * `POST /rest/sync/latest/projects/{key}/repos/{slug}/synchronize`
   *
   * @param data - `refId` and `action` (`'MERGE'`, `'REBASE'`, or `'DISCARD'`),
   * plus optional `context.commitMessage` for merges
   * @returns The ref if it could not be synchronized cleanly, or `undefined` on success
   */
  async synchronize(data: RefSyncRequest): Promise<SyncRef | undefined> {
    return this.requestBody<SyncRef | undefined>(`${this.basePath}/synchronize`, data, {
      apiPath: 'rest/sync/latest',
    });
  }

  commit(commitId: string): CommitResource {
    return new CommitResource(this.request, this.basePath, commitId, this.requestBody);
  }

  pullRequest(pullRequestId: number): PullRequestResource {
    return new PullRequestResource(
      this.request,
      this.basePath,
      pullRequestId,
      this.requestBody,
      this.requestText,
    );
  }
}
