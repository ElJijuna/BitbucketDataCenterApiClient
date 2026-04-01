# Roadmap

## Legend
- ✅ Implemented
- ⬜ Pending

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
| `currentUser()` | `GET /users/credentials` | ✅ |

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
| `webhooks(params?)` | `GET /projects/{key}/webhooks` | ✅ |
| `createWebhook(data)` | `POST /projects/{key}/webhooks` | ⬜ |
| `updateWebhook(webhookId, data)` | `PUT /projects/{key}/webhooks/{webhookId}` | ⬜ |
| `deleteWebhook(webhookId)` | `DELETE /projects/{key}/webhooks/{webhookId}` | ⬜ |

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
| `setDefaultBranch(branch)` | `PUT /projects/{key}/repos/{slug}/branches/default` | ⬜ |
| `createBranch(data)` | `POST /projects/{key}/repos/{slug}/branches` | ⬜ |
| `deleteBranch(branchName)` | `DELETE /projects/{key}/repos/{slug}/branches` | ⬜ |
| `tags(params?)` | `GET /projects/{key}/repos/{slug}/tags` | ✅ |
| `tagsByCommits(commits)` | `POST /projects/{key}/repos/{slug}/tags` | ✅ |
| `createTag(data)` | `POST /projects/{key}/repos/{slug}/tags` | ⬜ |
| `deleteTag(tagName)` | `DELETE /projects/{key}/repos/{slug}/tags/{name}` | ⬜ |
| `lastModified(params?)` | `GET /projects/{key}/repos/{slug}/last-modified` | ✅ |
| `size()` | `GET /projects/{key}/repos/{slug}/sizes` | ✅ |
| `raw(filePath, params?)` | `GET /projects/{key}/repos/{slug}/raw/{path}` | ✅ |
| `browse(srcPath?, params?)` | `GET /projects/{key}/repos/{slug}/browse/{srcPath}` | ✅ |
| `webhooks(params?)` | `GET /projects/{key}/repos/{slug}/webhooks/search` | ✅ |
| `createWebhook(data)` | `POST /projects/{key}/repos/{slug}/webhooks` | ⬜ |
| `updateWebhook(webhookId, data)` | `PUT /projects/{key}/repos/{slug}/webhooks/{webhookId}` | ⬜ |
| `deleteWebhook(webhookId)` | `DELETE /projects/{key}/repos/{slug}/webhooks/{webhookId}` | ⬜ |
| `settings()` | `GET /projects/{key}/repos/{slug}/settings/pull-requests` | ✅ |
| `updateSettings(data)` | `PUT /projects/{key}/repos/{slug}/settings/pull-requests` | ⬜ |

---

## PullRequestResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /projects/{key}/repos/{slug}/pull-requests/{id}` | ✅ |
| `update(data)` | `PUT /projects/{key}/repos/{slug}/pull-requests/{id}` | ⬜ |
| `merge(data?)` | `POST /projects/{key}/repos/{slug}/pull-requests/{id}/merge` | ⬜ |
| `decline(data?)` | `POST /projects/{key}/repos/{slug}/pull-requests/{id}/decline` | ⬜ |
| `reopen()` | `POST /projects/{key}/repos/{slug}/pull-requests/{id}/reopen` | ⬜ |
| `approve()` | `POST /projects/{key}/repos/{slug}/pull-requests/{id}/approve` | ⬜ |
| `unapprove()` | `DELETE /projects/{key}/repos/{slug}/pull-requests/{id}/approve` | ⬜ |
| `requestChanges()` | `POST /projects/{key}/repos/{slug}/pull-requests/{id}/requests-changes` | ⬜ |
| `activities(params?)` | `GET /projects/{key}/repos/{slug}/pull-requests/{id}/activities` | ✅ |
| `tasks(params?)` | `GET /projects/{key}/repos/{slug}/pull-requests/{id}/tasks` | ✅ |
| `createTask(data)` | `POST /rest/api/latest/tasks` | ⬜ |
| `updateTask(taskId, data)` | `PUT /rest/api/latest/tasks/{taskId}` | ⬜ |
| `deleteTask(taskId)` | `DELETE /rest/api/latest/tasks/{taskId}` | ⬜ |
| `commits(params?)` | `GET /projects/{key}/repos/{slug}/pull-requests/{id}/commits` | ✅ |
| `changes(params?)` | `GET /projects/{key}/repos/{slug}/pull-requests/{id}/changes` | ✅ |
| `diff(params?)` | `GET /projects/{key}/repos/{slug}/pull-requests/{id}/diff` | ✅ |
| `comments(params?)` | `GET /projects/{key}/repos/{slug}/pull-requests/{id}/comments` | ✅ |
| `addComment(data)` | `POST /projects/{key}/repos/{slug}/pull-requests/{id}/comments` | ⬜ |
| `updateComment(commentId, data)` | `PUT /projects/{key}/repos/{slug}/pull-requests/{id}/comments/{commentId}` | ⬜ |
| `deleteComment(commentId)` | `DELETE /projects/{key}/repos/{slug}/pull-requests/{id}/comments/{commentId}` | ⬜ |
| `reviewers(params?)` | `GET /projects/{key}/repos/{slug}/pull-requests/{id}/participants` | ✅ |
| `addReviewer(data)` | `POST /projects/{key}/repos/{slug}/pull-requests/{id}/participants` | ⬜ |
| `removeReviewer(userSlug)` | `DELETE /projects/{key}/repos/{slug}/pull-requests/{id}/participants/{userSlug}` | ⬜ |
| `reports(params?)` | `GET /projects/{key}/repos/{slug}/pull-requests/{id}/reports` | ✅ |
| `buildSummaries()` | `GET /projects/{key}/repos/{slug}/pull-requests/{id}/build-summaries` | ✅ |
| `issues()` | `GET /projects/{key}/repos/{slug}/pull-requests/{id}/issues` | ✅ |

---

## CommitResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /projects/{key}/repos/{slug}/commits/{id}` | ✅ |
| `changes(params?)` | `GET /projects/{key}/repos/{slug}/commits/{id}/changes` | ✅ |
| `diff(params?)` | `GET /projects/{key}/repos/{slug}/commits/{id}/diff` | ✅ |
| `comments(params?)` | `GET /projects/{key}/repos/{slug}/commits/{id}/comments` | ✅ |
| `addComment(data)` | `POST /projects/{key}/repos/{slug}/commits/{id}/comments` | ✅ |
| `buildStatuses(params?)` | `GET /rest/build-status/latest/commits/{id}` | ✅ |
| `addBuildStatus(data)` | `POST /rest/build-status/latest/commits/{id}` | ✅ |

---

## UserResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /users/{slug}` | ✅ |
| `repos(params?)` | `GET /users/{slug}/repos` | ✅ |
| `repo(slug)` | — chainable | ✅ |
| `sshKeys(params?)` | `GET /users/{slug}/ssh` | ✅ |
| `addSshKey(data)` | `POST /users/{slug}/ssh` | ⬜ |
| `deleteSshKey(keyId)` | `DELETE /users/{slug}/ssh/{keyId}` | ⬜ |
| `settings()` | `GET /users/{slug}/settings` | ✅ |
| `updateSettings(data)` | `PUT /users/{slug}/settings` | ⬜ |
