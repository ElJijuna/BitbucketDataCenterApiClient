import type { AutoMergeRequest, RequestAutoMergeData } from '../domain/AutoMerge';
import type { BitbucketBuildSummaries } from '../domain/BuildSummary';
import type { BitbucketChange, ChangesParams } from '../domain/Change';
import type { BitbucketCommit } from '../domain/Commit';
import type { CommitMessageSuggestion } from '../domain/CommitMessageSuggestion';
import type { BitbucketDiff, DiffParams } from '../domain/Diff';
import type { BitbucketDiffStatsSummary } from '../domain/DiffStatsSummary';
import type { BitbucketIssue } from '../domain/Issue';
import type { PagedResponse, PaginationParams } from '../domain/Pagination';
import type {
  AddReviewerData,
  BitbucketParticipant,
  BitbucketPullRequest,
  CanMergeResult,
  DeletePullRequestData,
  MergePullRequestData,
  SetParticipantStatusData,
  TransitionPullRequestData,
  UpdatePullRequestData,
} from '../domain/PullRequest';
import type {
  ActivitiesParams,
  AddPullRequestCommentData,
  ApplySuggestionData,
  ApplySuggestionResult,
  BitbucketPullRequestActivity,
  BitbucketPullRequestComment,
  UpdatePullRequestCommentData,
} from '../domain/PullRequestActivity';
import type { CompleteReviewData, PullRequestReview } from '../domain/PullRequestReview';
import type {
  BitbucketPullRequestTask,
  CreateTaskData,
  TasksParams,
  UpdateTaskData,
} from '../domain/PullRequestTask';
import type { CanRebaseResult, RebaseResult } from '../domain/Rebase';
import type { BitbucketReport, ReportsParams } from '../domain/Report';
import type { RequestBodyFn, RequestFn, RequestTextFn } from './ProjectResource';

/**
 * Represents a Bitbucket pull request resource with chainable async methods.
 *
 * Implements `PromiseLike<BitbucketPullRequest>` so it can be awaited directly
 * to fetch the pull request info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get pull request info
 * const pr = await bbClient.project('PROJ').repo('my-repo').pullRequest(42);
 *
 * // Get activities
 * const activities = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).activities();
 *
 * // Get tasks
 * const tasks = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).tasks();
 *
 * // Get commits
 * const commits = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).commits();
 *
 * // Get changes
 * const changes = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).changes();
 *
 * // Get reports
 * const reports = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).reports();
 *
 * // Get build summaries
 * const builds = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).buildSummaries();
 *
 * // Get linked Jira issues
 * const issues = await bbClient.project('PROJ').repo('my-repo').pullRequest(42).issues();
 * ```
 */
export class PullRequestResource implements PromiseLike<BitbucketPullRequest> {
  private readonly basePath: string;
  private readonly repoBasePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    repoBasePath: string,
    pullRequestId: number,
    private readonly requestBody?: RequestBodyFn,
    private readonly requestText?: RequestTextFn,
  ) {
    this.repoBasePath = repoBasePath;
    this.basePath = `${repoBasePath}/pull-requests/${pullRequestId}`;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the pull request info.
   * Delegates to {@link PullRequestResource.get}.
   */
  // biome-ignore lint/suspicious/noThenProperty: intentional PromiseLike implementation for await support
  then<TResult1 = BitbucketPullRequest, TResult2 = never>(
    onfulfilled?: ((value: BitbucketPullRequest) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    // eslint-disable-next-line no-restricted-syntax -- delegating .then() is required to implement PromiseLike
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the pull request details.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}`
   *
   * @returns The pull request object
   */
  async get(): Promise<BitbucketPullRequest> {
    return this.request<BitbucketPullRequest>(this.basePath);
  }

  /**
   * Updates the pull request's title, description, target branch, or reviewers.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}`
   *
   * @param data - `version` (must match the pull request's current version) plus any fields to change
   * @returns The updated pull request
   */
  async update(data: UpdatePullRequestData): Promise<BitbucketPullRequest> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketPullRequest>(this.basePath, data, { method: 'PUT' });
  }

  /**
   * Deletes the pull request.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}`
   *
   * @param data - `version` (must match the pull request's current version)
   */
  async delete(data: DeletePullRequestData): Promise<void> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<void>(this.basePath, data, { method: 'DELETE' });
  }

  /**
   * Merges the pull request.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/merge?version={version}`
   *
   * @param data - `version` (must match the pull request's current version) plus optional merge options
   * @returns The merged pull request
   */
  async merge(data: MergePullRequestData): Promise<BitbucketPullRequest> {
    const { version, ...body } = data;
    const path = `${this.basePath}/merge?${new URLSearchParams({ version: String(version) })}`;

    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketPullRequest>(path, body);
  }

  /**
   * Checks whether the pull request can currently be merged.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/merge`
   *
   * @returns Whether the pull request can merge, and any vetoes blocking it
   */
  async canMerge(): Promise<CanMergeResult> {
    return this.request<CanMergeResult>(`${this.basePath}/merge`);
  }

  /**
   * Declines the pull request.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/decline?version={version}`
   *
   * @param data - `version` (must match the pull request's current version)
   * @returns The declined pull request
   */
  async decline(data: TransitionPullRequestData): Promise<BitbucketPullRequest> {
    const path = `${this.basePath}/decline?${new URLSearchParams({ version: String(data.version) })}`;

    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketPullRequest>(path);
  }

  /**
   * Reopens a previously declined pull request.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/reopen?version={version}`
   *
   * @param data - `version` (must match the pull request's current version)
   * @returns The reopened pull request
   */
  async reopen(data: TransitionPullRequestData): Promise<BitbucketPullRequest> {
    const path = `${this.basePath}/reopen?${new URLSearchParams({ version: String(data.version) })}`;

    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketPullRequest>(path);
  }

  /**
   * Approves the pull request on behalf of a participant.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/participants/{userSlug}`
   *
   * @param userSlug - Slug of the user approving (typically the authenticated user)
   * @returns The updated participant
   */
  async approve(userSlug: string): Promise<BitbucketParticipant> {
    return this.setParticipantStatus(userSlug, { approved: true, status: 'APPROVED' });
  }

  /**
   * Withdraws a participant's approval, without removing them as a reviewer.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/participants/{userSlug}`
   *
   * @param userSlug - Slug of the user withdrawing their approval
   * @returns The updated participant
   */
  async unapprove(userSlug: string): Promise<BitbucketParticipant> {
    return this.setParticipantStatus(userSlug, { approved: false, status: 'UNAPPROVED' });
  }

  private async setParticipantStatus(
    userSlug: string,
    status: Pick<SetParticipantStatusData, 'approved' | 'status'>,
  ): Promise<BitbucketParticipant> {
    const data: SetParticipantStatusData = { user: { name: userSlug }, ...status };

    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketParticipant>(
      `${this.basePath}/participants/${userSlug}`,
      data,
      { method: 'PUT' },
    );
  }

  /**
   * Adds a reviewer to the pull request.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/participants`
   *
   * @param data - The user to add as a reviewer
   * @returns The newly added participant
   */
  async addReviewer(data: AddReviewerData): Promise<BitbucketParticipant> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketParticipant>(`${this.basePath}/participants`, data);
  }

  /**
   * Removes a reviewer (or any participant) from the pull request entirely.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/participants/{userSlug}`
   *
   * @param userSlug - Slug of the user to remove
   */
  async removeReviewer(userSlug: string): Promise<void> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<void>(`${this.basePath}/participants/${userSlug}`, undefined, {
      method: 'DELETE',
    });
  }

  /**
   * Fetches the activity feed for this pull request.
   *
   * Activities include comments, approvals, reviews, rescopes, merges, and declines.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/activities`
   *
   * @param params - Optional filters: `limit`, `start`, `fromId`, `fromType`
   * @returns An array of pull request activities, ordered from most recent to oldest
   */
  async activities(
    params?: ActivitiesParams,
  ): Promise<PagedResponse<BitbucketPullRequestActivity>> {
    return this.request<PagedResponse<BitbucketPullRequestActivity>>(
      `${this.basePath}/activities`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the tasks (review to-do items) for this pull request.
   *
   * Since Bitbucket 7.2 tasks are modelled as blocker comments (comments with
   * `severity: 'BLOCKER'`) and the legacy `/tasks` endpoint was removed, so this
   * method queries the blocker-comments endpoint. Tasks can be `OPEN` or `RESOLVED`.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/blocker-comments`
   *
   * @param params - Optional filters: `limit`, `start`, `states`
   * @returns A paged response of pull request tasks (blocker comments)
   */
  async tasks(params?: TasksParams): Promise<PagedResponse<BitbucketPullRequestTask>> {
    return this.request<PagedResponse<BitbucketPullRequestTask>>(
      `${this.basePath}/blocker-comments`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Creates a task (blocker comment) on this pull request.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/blocker-comments`
   *
   * @param data - The task text, and an optional anchor to a specific file/line
   * @returns The created task
   */
  async createTask(data: CreateTaskData): Promise<BitbucketPullRequestTask> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketPullRequestTask>(`${this.basePath}/blocker-comments`, data);
  }

  /**
   * Updates a task's text or resolution state.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/blocker-comments/{commentId}`
   *
   * @param taskId - The task's comment id
   * @param data - `version` (must match the task's current version) plus the fields to change
   * @returns The updated task
   */
  async updateTask(taskId: number, data: UpdateTaskData): Promise<BitbucketPullRequestTask> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketPullRequestTask>(
      `${this.basePath}/blocker-comments/${taskId}`,
      data,
      { method: 'PUT' },
    );
  }

  /**
   * Deletes a task.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/blocker-comments/{commentId}`
   *
   * @param taskId - The task's comment id
   * @param version - Must match the task's current version
   */
  async deleteTask(taskId: number, version: number): Promise<void> {
    const path = `${this.basePath}/blocker-comments/${taskId}?${new URLSearchParams({ version: String(version) })}`;

    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<void>(path, undefined, { method: 'DELETE' });
  }

  /**
   * Fetches the commits included in this pull request.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/commits`
   *
   * @param params - Optional pagination: `limit`, `start`
   * @returns An array of commits
   */
  async commits(params?: PaginationParams): Promise<PagedResponse<BitbucketCommit>> {
    return this.request<PagedResponse<BitbucketCommit>>(
      `${this.basePath}/commits`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the comments on this pull request.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/comments`
   *
   * @param params - Optional pagination: `limit`, `start`
   * @returns A paged response of comments
   */
  async comments(params?: PaginationParams): Promise<PagedResponse<BitbucketPullRequestComment>> {
    return this.request<PagedResponse<BitbucketPullRequestComment>>(
      `${this.basePath}/comments`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Posts a comment on this pull request.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/comments`
   *
   * @param data - The comment text, and an optional anchor or parent for replies
   * @returns The created comment
   */
  async addComment(data: AddPullRequestCommentData): Promise<BitbucketPullRequestComment> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketPullRequestComment>(`${this.basePath}/comments`, data);
  }

  /**
   * Updates an existing comment's text.
   *
   * `PUT /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/comments/{commentId}`
   *
   * @param commentId - The comment id
   * @param data - `version` (must match the comment's current version) and the new text
   * @returns The updated comment
   */
  async updateComment(
    commentId: number,
    data: UpdatePullRequestCommentData,
  ): Promise<BitbucketPullRequestComment> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketPullRequestComment>(
      `${this.basePath}/comments/${commentId}`,
      data,
      { method: 'PUT' },
    );
  }

  /**
   * Deletes a comment.
   *
   * `DELETE /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/comments/{commentId}`
   *
   * @param commentId - The comment id
   * @param version - Must match the comment's current version
   */
  async deleteComment(commentId: number, version: number): Promise<void> {
    const path = `${this.basePath}/comments/${commentId}?${new URLSearchParams({ version: String(version) })}`;

    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<void>(path, undefined, { method: 'DELETE' });
  }

  /**
   * Applies a suggested change from a comment as a new commit.
   *
   * `POST /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/comments/{commentId}/apply-suggestion`
   *
   * @param commentId - The comment id containing the suggestion
   * @param data - The suggestion index to apply, and an optional commit summary/description
   * @returns The commit created by applying the suggestion
   */
  async applySuggestion(
    commentId: number,
    data: ApplySuggestionData,
  ): Promise<ApplySuggestionResult> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<ApplySuggestionResult>(
      `${this.basePath}/comments/${commentId}/apply-suggestion`,
      data,
    );
  }

  /**
   * Reacts to a comment with an emoticon (e.g. `':+1:'`).
   *
   * `PUT /rest/comment-likes/latest/projects/{key}/repos/{slug}/pull-requests/{id}/comments/{commentId}/reactions/{emoticon}`
   *
   * @remarks Implemented against the `comment-likes` API module, which backs the
   * reactions feature in the Bitbucket UI.
   *
   * @param commentId - The comment id
   * @param emoticon - The emoticon identifier (e.g. `'+1'`, `'heart'`)
   */
  async react(commentId: number, emoticon: string): Promise<void> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<void>(
      `${this.basePath}/comments/${commentId}/reactions/${emoticon}`,
      undefined,
      { method: 'PUT', apiPath: 'rest/comment-likes/latest' },
    );
  }

  /**
   * Removes a reaction from a comment.
   *
   * `DELETE /rest/comment-likes/latest/projects/{key}/repos/{slug}/pull-requests/{id}/comments/{commentId}/reactions/{emoticon}`
   *
   * @param commentId - The comment id
   * @param emoticon - The emoticon identifier (e.g. `'+1'`, `'heart'`)
   */
  async unreact(commentId: number, emoticon: string): Promise<void> {
    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<void>(
      `${this.basePath}/comments/${commentId}/reactions/${emoticon}`,
      undefined,
      { method: 'DELETE', apiPath: 'rest/comment-likes/latest' },
    );
  }

  /**
   * Fetches the diff for this pull request.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/diff/{path}`
   *
   * The `path` param (the file to diff) is optional: when omitted, the diff for
   * the whole pull request is returned. `srcPath` is sent as a query parameter
   * and identifies the previous path of a copied, moved or renamed file.
   *
   * @param params - Optional: `path`, `contextLines`, `srcPath`, `whitespace`
   * @returns The diff object
   */
  async diff(params?: DiffParams): Promise<BitbucketDiff> {
    const { path: filePath, ...queryParams } = params ?? {};
    const path = filePath ? `${this.basePath}/diff/${filePath}` : `${this.basePath}/diff`;

    return this.request<BitbucketDiff>(
      path,
      queryParams as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the raw unified diff for this pull request, in `git diff` format.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}.diff`
   *
   * @returns The raw diff as plain text
   */
  async rawDiff(): Promise<string> {
    // biome-ignore lint/style/noNonNullAssertion: requestText is always set when this method is called
    return this.requestText!(`${this.basePath}.diff`);
  }

  /**
   * Fetches this pull request as a `git format-patch`-compatible patch file.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}.patch`
   *
   * @returns The raw patch as plain text
   */
  async patch(): Promise<string> {
    // biome-ignore lint/style/noNonNullAssertion: requestText is always set when this method is called
    return this.requestText!(`${this.basePath}.patch`);
  }

  /**
   * Fetches aggregated line-change counts for a single file's diff.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/diff-stats-summary/{path}`
   *
   * @param path - The file path to summarize
   * @returns Added/removed line counts for the file
   */
  async diffStatsSummary(path: string): Promise<BitbucketDiffStatsSummary> {
    return this.request<BitbucketDiffStatsSummary>(`${this.basePath}/diff-stats-summary/${path}`);
  }

  /**
   * Fetches the file changes included in this pull request.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/changes`
   *
   * @param params - Optional filters: `limit`, `start`, `withComments`
   * @returns An array of file changes
   */
  async changes(params?: ChangesParams): Promise<PagedResponse<BitbucketChange>> {
    return this.request<PagedResponse<BitbucketChange>>(
      `${this.basePath}/changes`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the participants (reviewers) of this pull request.
   *
   * `GET /rest/api/latest/projects/{key}/repos/{slug}/pull-requests/{id}/participants`
   *
   * @param params - Optional pagination: `limit`, `start`
   * @returns A paged response of participants
   */
  async reviewers(params?: PaginationParams): Promise<PagedResponse<BitbucketParticipant>> {
    return this.request<PagedResponse<BitbucketParticipant>>(
      `${this.basePath}/participants`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the Code Insights reports for this pull request.
   *
   * Code Insights reports are attached to commits, so this method first fetches
   * the pull request to resolve the latest commit of its source branch and then
   * queries the official Code Insights API for that commit (two requests).
   *
   * `GET /rest/insights/latest/projects/{key}/repos/{slug}/commits/{commitId}/reports`
   *
   * @param params - Optional pagination: `limit`, `start`
   * @returns A paged response of Code Insights reports for the latest source commit
   */
  async reports(params?: ReportsParams): Promise<PagedResponse<BitbucketReport>> {
    const pullRequest = await this.get();
    const commitId = pullRequest.fromRef.latestCommit;

    return this.request<PagedResponse<BitbucketReport>>(
      `${this.repoBasePath}/commits/${commitId}/reports`,
      params as Record<string, string | number | boolean>,
      { apiPath: 'rest/insights/latest' },
    );
  }

  /**
   * Fetches the aggregated build summaries for this pull request.
   *
   * Returns a map of commit hash → build counts per state
   * (`successful`, `failed`, `inProgress`, `cancelled`, `unknown`).
   *
   * The official API exposes build statistics per commit, so this method first
   * fetches the pull request commits (up to 100) and then requests their build
   * statistics in a single batch call (two requests). Commits without any
   * associated builds are not present in the response.
   *
   * `POST /rest/build-status/latest/commits/stats`
   *
   * @returns A record keyed by commit SHA with aggregated build counts
   */
  async buildSummaries(): Promise<BitbucketBuildSummaries> {
    const commits = await this.commits({ limit: 100 });
    const commitIds = commits.values.map((commit) => commit.id);

    // biome-ignore lint/style/noNonNullAssertion: requestBody is always set when this method is called
    return this.requestBody!<BitbucketBuildSummaries>('/commits/stats', commitIds, {
      apiPath: 'rest/build-status/latest',
    });
  }

  /**
   * Fetches the Jira issues linked to this pull request.
   *
   * `GET /rest/jira/latest/projects/{key}/repos/{slug}/pull-requests/{id}/issues`
   *
   * @returns An array of linked Jira issues
   */
  async issues(): Promise<BitbucketIssue[]> {
    return this.request<BitbucketIssue[]>(`${this.basePath}/issues`, undefined, {
      apiPath: 'rest/jira/latest',
    });
  }
}
