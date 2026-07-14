# Roadmap

Coverage target: [Bitbucket Data Center REST API v10.3](https://developer.atlassian.com/server/bitbucket/rest/v1003/) (366 paths, 566 operations).
Unless stated otherwise, endpoint paths below are relative to `/rest/api/latest`. Endpoints from other API modules (`/rest/git`, `/rest/insights`, `/rest/ssh`, …) are written in full.

## Legend

- ✅ Implemented
- ⬜ Pending
- ⚠️ Implemented against an **unofficial** endpoint (not present in the official REST documentation; may break between Bitbucket versions)
- 🚫 Out of scope (see [Out of scope](#out-of-scope))

---

## Client infrastructure (cross-cutting)

Prerequisites for most pending write operations.

| Task | Notes | Status |
|------|-------|--------|
| `DELETE` support in the HTTP layer | `requestPost` only accepts `POST`/`PUT` | ⬜ |
| Handle `204 No Content` / `202 Accepted` responses | `request()` always calls `response.json()`, which throws on empty bodies | ⬜ |
| Parse Bitbucket error bodies | `{ errors: [{ context, message, exceptionName }] }` should be surfaced on `BitbucketApiError` | ⬜ |
| Rate-limit handling | Respond to `429` + `Retry-After` (adaptive throttling) with configurable retry/backoff | ⬜ |
| Auto-pagination helper | `for await…of` iterator over `isLastPage`/`nextPageStart` | ⬜ |
| Bearer authentication | HTTP access tokens recommend `Authorization: Bearer <token>`; only Basic is supported today | ⬜ |
| Document API version coverage in README | v10.3, auth modes, error/pagination behaviour | ⬜ |

---

## Unofficial endpoints in use

Endpoints kept deliberately even though they are not part of the official REST documentation. They are marked with `@remarks` in the TSDoc.

| Method | Endpoint | Reason |
|--------|----------|--------|
| `RepositoryResource.size()` | `GET /projects/{key}/repos/{slug}/sizes` | Well-known UI endpoint; no official equivalent exists |

All other previously unofficial endpoints were migrated to documented ones in v1.14 (see `tasks()`, `issues()`, `reports()`, `buildSummaries()`, `sshKeys()`, `repos()` on users, and `currentUser()`).

---

## BitbucketClient (entry point)

| Method | Endpoint | Status |
|--------|----------|--------|
| `projects(params?)` | `GET /projects` | ✅ |
| `project(key)` | — chainable | ✅ |
| `createProject(data)` | `POST /projects` | ⬜ |
| `search(params?)` | `GET /repos` | ✅ |
| `users(params?)` | `GET /users` | ✅ |
| `user(slug)` | — chainable | ✅ |
| `currentUser()` | `X-AUSERNAME` header + `GET /users?filter={name}` (no official whoami endpoint exists) | ✅ |
| `dashboardPullRequests(params?)` | `GET /dashboard/pull-requests` | ⬜ |
| `pullRequestSuggestions(params?)` | `GET /dashboard/pull-request-suggestions` | ⬜ |
| `markupPreview(markdown)` | `POST /markup/preview` | ⬜ |
| `groups(params?)` | `GET /groups` | ⬜ |

---

## ProjectResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /projects/{key}` | ✅ |
| `update(data)` | `PUT /projects/{key}` | ⬜ |
| `delete()` | `DELETE /projects/{key}` | ⬜ |
| `repos(params?)` | `GET /projects/{key}/repos` | ✅ |
| `repo(slug)` | — chainable | ✅ |
| `createRepo(data)` | `POST /projects/{key}/repos` | ⬜ |
| `users(params?)` | `GET /projects/{key}/permissions/users` | ✅ |
| `setUserPermission(slug, permission)` | `PUT /projects/{key}/permissions/users` | ⬜ |
| `removeUserPermission(slug)` | `DELETE /projects/{key}/permissions/users` | ⬜ |
| `groups(params?)` | `GET /projects/{key}/permissions/groups` | ✅ |
| `setGroupPermission(group, permission)` | `PUT /projects/{key}/permissions/groups` | ⬜ |
| `removeGroupPermission(group)` | `DELETE /projects/{key}/permissions/groups` | ⬜ |
| `searchPermissions(params?)` | `GET /projects/{key}/permissions/search` | ⬜ |
| `webhooks(params?)` | `GET /projects/{key}/webhooks` | ✅ |
| `createWebhook(data)` | `POST /projects/{key}/webhooks` | ⬜ |
| `updateWebhook(webhookId, data)` | `PUT /projects/{key}/webhooks/{webhookId}` | ⬜ |
| `deleteWebhook(webhookId)` | `DELETE /projects/{key}/webhooks/{webhookId}` | ⬜ |
| `testWebhook(data)` | `POST /projects/{key}/webhooks/test` | ⬜ |
| `defaultReviewerConditions()` | `GET /rest/default-reviewers/latest/projects/{key}/conditions` | ⬜ |
| `createDefaultReviewerCondition(data)` | `POST /rest/default-reviewers/latest/projects/{key}/condition` | ⬜ |
| `deleteDefaultReviewerCondition(id)` | `DELETE /rest/default-reviewers/latest/projects/{key}/condition/{id}` | ⬜ |
| `branchRestrictions(params?)` | `GET /rest/branch-permissions/latest/projects/{key}/restrictions` | ⬜ |
| `createBranchRestrictions(data)` | `POST /rest/branch-permissions/latest/projects/{key}/restrictions` | ⬜ |
| `reviewerGroups()` / CRUD | `GET/POST/PUT/DELETE /projects/{key}/settings/reviewer-groups[/{id}]` | ⬜ |
| `autoDeclineSettings()` / CRUD | `GET/PUT/DELETE /projects/{key}/settings/auto-decline` | ⬜ |
| `autoMergeSettings()` / CRUD | `GET/PUT/DELETE /projects/{key}/settings/auto-merge` | ⬜ |
| `hooks(params?)` / hook settings | `GET/PUT/DELETE /projects/{key}/settings/hooks[/{hookKey}/…]` | ⬜ |
| `defaultTasks()` / CRUD | `GET/POST/PUT/DELETE /rest/default-tasks/latest/projects/{key}/tasks[/{taskId}]` | ⬜ |

---

## RepositoryResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /projects/{key}/repos/{slug}` | ✅ |
| `update(data)` | `PUT /projects/{key}/repos/{slug}` | ⬜ |
| `delete()` | `DELETE /projects/{key}/repos/{slug}` | ⬜ |
| `fork(data)` | `POST /projects/{key}/repos/{slug}` | ⬜ |
| `forks(params?)` | `GET /projects/{key}/repos/{slug}/forks` | ✅ |
| `pullRequests(params?)` | `GET /projects/{key}/repos/{slug}/pull-requests` | ✅ |
| `pullRequest(id)` | — chainable | ✅ |
| `createPullRequest(data)` | `POST /projects/{key}/repos/{slug}/pull-requests` | ⬜ |
| `commits(params?)` | `GET /projects/{key}/repos/{slug}/commits` | ✅ |
| `commit(commitId)` | — chainable | ✅ |
| `branches(params?)` | `GET /projects/{key}/repos/{slug}/branches` | ✅ |
| `defaultBranch()` | `GET /projects/{key}/repos/{slug}/branches/default` | ✅ |
| `setDefaultBranch(branch)` | `PUT /projects/{key}/repos/{slug}/default-branch` (the `branches/default` variant is **deprecated**) | ⬜ |
| `createBranch(data)` | `POST /projects/{key}/repos/{slug}/branches` | ⬜ |
| `deleteBranch(data)` | `DELETE /rest/branch-utils/latest/projects/{key}/repos/{slug}/branches` | ⬜ |
| `tags(params?)` | `GET /projects/{key}/repos/{slug}/tags` | ✅ |
| `tagsByCommits(commits)` | `POST /projects/{key}/repos/{slug}/tags` | ✅ |
| `createTag(data)` | `POST /rest/git/latest/projects/{key}/repos/{slug}/tags` | ⬜ |
| `deleteTag(tagName)` | `DELETE /rest/git/latest/projects/{key}/repos/{slug}/tags/{name}` | ⬜ |
| `lastModified(params?)` | `GET /projects/{key}/repos/{slug}/last-modified` | ✅ |
| `size()` | `GET /projects/{key}/repos/{slug}/sizes` | ⚠️ |
| `raw(filePath, params?)` | `GET /projects/{key}/repos/{slug}/raw/{path}` | ✅ |
| `browse(srcPath?, params?)` | `GET /projects/{key}/repos/{slug}/browse/{srcPath}` | ✅ |
| `editFile(...)` | `PUT /projects/{key}/repos/{slug}/browse/{path}` | ✅ |
| `webhooks(params?)` | `GET /projects/{key}/repos/{slug}/webhooks/search` | ✅ |
| `createWebhook(data)` | `POST /projects/{key}/repos/{slug}/webhooks` | ⬜ |
| `updateWebhook(webhookId, data)` | `PUT /projects/{key}/repos/{slug}/webhooks/{webhookId}` | ⬜ |
| `deleteWebhook(webhookId)` | `DELETE /projects/{key}/repos/{slug}/webhooks/{webhookId}` | ⬜ |
| `testWebhook(data)` | `POST /projects/{key}/repos/{slug}/webhooks/test` | ⬜ |
| `settings()` | `GET /projects/{key}/repos/{slug}/settings/pull-requests` | ✅ |
| `updateSettings(data)` | `POST /projects/{key}/repos/{slug}/settings/pull-requests` | ⬜ |
| `archive(params?)` | `GET /projects/{key}/repos/{slug}/archive` (tar/zip download) | ⬜ |
| `files(path?, params?)` | `GET /projects/{key}/repos/{slug}/files[/{path}]` | ⬜ |
| `compareChanges(params)` | `GET /projects/{key}/repos/{slug}/compare/changes` | ⬜ |
| `compareCommits(params)` | `GET /projects/{key}/repos/{slug}/compare/commits` | ⬜ |
| `compareDiff(params)` | `GET /projects/{key}/repos/{slug}/compare/diff{path}` | ⬜ |
| `labels()` / add / remove | `GET/POST/DELETE /projects/{key}/repos/{slug}/labels[/{labelName}]` | ⬜ |
| `readme(params?)` / `license()` / `contributing()` | `GET /projects/{key}/repos/{slug}/readme` etc. | ⬜ |
| `watch()` / `unwatch()` | `POST/DELETE /projects/{key}/repos/{slug}/watch` | ⬜ |
| `refChangeActivities(params?)` | `GET /projects/{key}/repos/{slug}/ref-change-activities` | ⬜ |
| `permissions` (users/groups CRUD) | `GET/PUT/DELETE /projects/{key}/repos/{slug}/permissions/…` | ⬜ |
| `branchRestrictions(params?)` / CRUD | `GET/POST/DELETE /rest/branch-permissions/latest/projects/{key}/repos/{slug}/restrictions[/{id}]` | ⬜ |
| `defaultReviewerConditions()` / CRUD | `GET/POST/PUT/DELETE /rest/default-reviewers/latest/projects/{key}/repos/{slug}/condition[s][/{id}]` | ⬜ |
| `requiredBuildConditions()` / CRUD | `GET/POST/PUT/DELETE /rest/required-builds/latest/projects/{key}/repos/{slug}/condition[s][/{id}]` | ⬜ |
| `autoDeclineSettings()` / `autoMergeSettings()` / hooks / default tasks | as in ProjectResource, repo-scoped | ⬜ |
| `syncStatus()` / `synchronize()` | `GET/POST /rest/sync/latest/projects/{key}/repos/{slug}[/synchronize]` | ⬜ |

---

## PullRequestResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET …/pull-requests/{id}` | ✅ |
| `update(data)` | `PUT …/pull-requests/{id}` | ⬜ |
| `delete()` | `DELETE …/pull-requests/{id}` | ⬜ |
| `merge(data?)` | `POST …/pull-requests/{id}/merge` | ⬜ |
| `canMerge()` | `GET …/pull-requests/{id}/merge` | ⬜ |
| `decline(data?)` | `POST …/pull-requests/{id}/decline` | ⬜ |
| `reopen()` | `POST …/pull-requests/{id}/reopen` | ⬜ |
| `approve()` / `unapprove()` | `PUT/DELETE …/pull-requests/{id}/participants/{userSlug}` (the `/approve` endpoints are **deprecated**) | ⬜ |
| `activities(params?)` | `GET …/pull-requests/{id}/activities` | ✅ |
| `tasks(params?)` | `GET …/pull-requests/{id}/blocker-comments` (legacy `/tasks` endpoint was removed in Bitbucket 8.0) | ✅ |
| `createTask(data)` | `POST …/pull-requests/{id}/blocker-comments` | ⬜ |
| `updateTask(taskId, data)` | `PUT …/pull-requests/{id}/blocker-comments/{commentId}` | ⬜ |
| `deleteTask(taskId)` | `DELETE …/pull-requests/{id}/blocker-comments/{commentId}` | ⬜ |
| `commits(params?)` | `GET …/pull-requests/{id}/commits` | ✅ |
| `changes(params?)` | `GET …/pull-requests/{id}/changes` | ✅ |
| `diff(params?)` | `GET …/pull-requests/{id}/diff/{path}` (`path` optional) | ✅ |
| `rawDiff()` / `patch()` | `GET …/pull-requests/{id}.diff` / `.patch` | ⬜ |
| `diffStatsSummary(path)` | `GET …/pull-requests/{id}/diff-stats-summary/{path}` | ⬜ |
| `comments(params?)` | `GET …/pull-requests/{id}/comments` | ✅ |
| `addComment(data)` | `POST …/pull-requests/{id}/comments` | ⬜ |
| `updateComment(commentId, data)` | `PUT …/pull-requests/{id}/comments/{commentId}` | ⬜ |
| `deleteComment(commentId)` | `DELETE …/pull-requests/{id}/comments/{commentId}` | ⬜ |
| `applySuggestion(commentId, data)` | `POST …/pull-requests/{id}/comments/{commentId}/apply-suggestion` | ⬜ |
| `react(commentId, emoticon)` / `unreact(...)` | `PUT/DELETE /rest/comment-likes/latest/…/comments/{commentId}/reactions/{emoticon}` | ⬜ |
| `reviewers(params?)` | `GET …/pull-requests/{id}/participants` | ✅ |
| `addReviewer(data)` | `POST …/pull-requests/{id}/participants` | ⬜ |
| `removeReviewer(userSlug)` | `DELETE …/pull-requests/{id}/participants/{userSlug}` | ⬜ |
| `review()` / `completeReview(data)` / `discardReview()` | `GET/PUT/DELETE …/pull-requests/{id}/review` | ⬜ |
| `autoMerge()` / `requestAutoMerge()` / `cancelAutoMerge()` | `GET/POST/DELETE …/pull-requests/{id}/auto-merge` | ⬜ |
| `watch()` / `unwatch()` | `POST/DELETE …/pull-requests/{id}/watch` | ⬜ |
| `rebase()` / `canRebase()` | `POST/GET /rest/git/latest/…/pull-requests/{id}/rebase` | ⬜ |
| `mergeBase()` | `GET …/pull-requests/{id}/merge-base` | ⬜ |
| `commitMessageSuggestion()` | `GET …/pull-requests/{id}/commit-message-suggestion` | ⬜ |
| `reports(params?)` | `GET /rest/insights/latest/…/commits/{latestCommit}/reports` (resolves the latest source commit first; the PR-level `/reports` endpoint is UI-internal) | ✅ |
| `buildSummaries()` | `GET …/commits` + `POST /rest/build-status/latest/commits/stats` (the PR-level `/build-summaries` endpoint is UI-internal) | ✅ |
| `issues()` | `GET /rest/jira/latest/…/pull-requests/{id}/issues` | ✅ |

---

## CommitResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET …/commits/{id}` | ✅ |
| `changes(params?)` | `GET …/commits/{id}/changes` | ✅ |
| `diff(params?)` | `GET …/commits/{id}/diff/{path}` (`path` optional) | ✅ |
| `diffStatsSummary(path)` | `GET …/commits/{id}/diff-stats-summary/{path}` | ⬜ |
| `comments(params?)` | `GET …/commits/{id}/comments` | ✅ |
| `addComment(data)` | `POST …/commits/{id}/comments` | ✅ |
| `updateComment(commentId, data)` | `PUT …/commits/{id}/comments/{commentId}` | ⬜ |
| `deleteComment(commentId)` | `DELETE …/commits/{id}/comments/{commentId}` | ⬜ |
| `buildStatuses(params?)` | `GET /rest/build-status/latest/commits/{id}` | ✅ |
| `addBuildStatus(data)` | `POST /rest/build-status/latest/commits/{id}` | ✅ |
| `builds(params?)` / `addBuild(data)` / `deleteBuild(key)` | `GET/POST/DELETE …/commits/{id}/builds` (modern replacement for build-status) | ⬜ |
| `deployments(params?)` / `addDeployment(data)` / `deleteDeployment(...)` | `GET/POST/DELETE …/commits/{id}/deployments` | ⬜ |
| `insightReports(params?)` | `GET /rest/insights/latest/…/commits/{id}/reports` | ⬜ |
| `insightReport(key)` / CRUD + annotations | `GET/PUT/DELETE /rest/insights/latest/…/commits/{id}/reports/{key}[/annotations]` | ⬜ |
| `pullRequests(params?)` | `GET …/commits/{id}/pull-requests` | ⬜ |
| `mergeBase(otherCommitId)` | `GET …/commits/{id}/merge-base` | ⬜ |
| `watch()` / `unwatch()` | `POST/DELETE …/commits/{id}/watch` | ⬜ |

---

## UserResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /users/{slug}` | ✅ |
| `repos(params?)` | `GET /projects/~{slug}/repos` (personal project; `/users/{slug}/repos` is undocumented) | ✅ |
| `repo(slug)` | — chainable via `/projects/~{slug}/repos/{repoSlug}` | ✅ |
| `sshKeys(params?)` | `GET /rest/ssh/latest/keys?user={slug}` (`/users/{slug}/ssh` is undocumented) | ✅ |
| `addSshKey(data)` | `POST /rest/ssh/latest/keys?user={slug}` | ⬜ |
| `deleteSshKey(keyId)` | `DELETE /rest/ssh/latest/keys/{keyId}` | ⬜ |
| `settings()` | `GET /users/{slug}/settings` | ✅ |
| `updateSettings(data)` | `PUT /users/{slug}/settings` | ⬜ |
| `accessTokens(params?)` / CRUD | `GET/PUT/POST/DELETE /rest/access-tokens/latest/users/{slug}[/{tokenId}]` | ⬜ |
| `gpgKeys()` / CRUD | `GET/POST/DELETE /rest/gpg/latest/keys[/{fingerprintOrId}]` | ⬜ |

---

## Out of scope

Whole API groups deliberately not planned for this client (admin/ops-oriented; open an issue if you need one of them):

| API group | Ops | Notes |
|-----------|-----|-------|
| System Maintenance | 81 | Logging, rate-limit admin config, cluster, ... |
| Authentication (admin) | ~50 | IdP/SSO config, 2SV enrollment, CAPTCHA. Personal/project/repo access tokens and user SSH/GPG keys **are** in scope (see UserResource) |
| Permission Management (global admin) | 39 | `admin/users`, `admin/groups`, global permissions. Project/repo-level permissions **are** in scope |
| Security | 45 | Secret scanning rules, X.509 signing |
| Mirroring (mirror + upstream) | 42 | Smart mirroring farms |
| Search / indexing admin | 8 | Reindexing, worker threads |
| SAML certificates / CSP / Capabilities / Deprecated | 15 | — |
