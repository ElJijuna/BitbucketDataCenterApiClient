# bitbucket-datacenter-api-client

[![CI](https://github.com/ElJijuna/BitbucketDataCenterApiClient/actions/workflows/ci.yml/badge.svg)](https://github.com/ElJijuna/BitbucketDataCenterApiClient/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/bitbucket-datacenter-api-client)](https://www.npmjs.com/package/bitbucket-datacenter-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

TypeScript client for the [Bitbucket Data Center REST API v10.3](https://developer.atlassian.com/server/bitbucket/rest/v1003/) (`/rest/api/latest`).
Works in **Node.js** and the **browser** (isomorphic). Fully typed, zero runtime dependencies.

See [ROADMAP.md](ROADMAP.md) for the full list of implemented and pending endpoints.

---

## Installation

```bash
npm install bitbucket-datacenter-api-client
```

---

## Quick start

```typescript
import { BitbucketClient } from 'bitbucket-datacenter-api-client';

const bb = new BitbucketClient({
  apiUrl:  'https://bitbucket.example.com',
  apiPath: 'rest/api/latest',
  user:    'your-username',
  token:   'your-personal-access-token',
});
```

---

## API reference

### Projects

```typescript
// List all accessible projects
const projects = await bb.projects();
const projects = await bb.projects({ limit: 50, name: 'platform' });

// Get a single project
const project = await bb.project('PROJ');

// Create, update, delete
const created = await bb.createProject({ key: 'PROJ', name: 'My Project', description: '...' });
await bb.project('PROJ').update({ avatar: 'data:image/png;base64,...' });
await bb.project('PROJ').delete();

// Create a repository in a project
const repo = await bb.project('PROJ').createRepo({ name: 'my-repo', defaultBranch: 'main' });

// Webhooks on a project
const hooks = await bb.project('PROJ').webhooks();
const hooks = await bb.project('PROJ').webhooks({ event: 'pr:opened' });
const hook  = await bb.project('PROJ').createWebhook({ name: 'CI', events: ['repo:refs_changed'], url: 'https://ci.example.com/hook' });
await bb.project('PROJ').updateWebhook(hook.id, { ...hook, active: false });
await bb.project('PROJ').deleteWebhook(hook.id);
await bb.project('PROJ').testWebhook({ url: 'https://ci.example.com/hook' });

// Users and groups with access to a project
const members = await bb.project('PROJ').users();
const members = await bb.project('PROJ').users({ permission: 'PROJECT_WRITE' });
const groups  = await bb.project('PROJ').groups({ filter: 'dev' });
await bb.project('PROJ').setUserPermission('jdoe', 'PROJECT_WRITE');
await bb.project('PROJ').removeUserPermission('jdoe');
await bb.project('PROJ').setGroupPermission('developers', 'PROJECT_READ');
const permitted = await bb.project('PROJ').searchPermissions({ filterText: 'dev', type: 'GROUP' });

// Project settings: default reviewers, branch restrictions, reviewer groups,
// auto-decline/auto-merge, repository hooks, and default tasks
const conditions   = await bb.project('PROJ').defaultReviewerConditions();
const restrictions = await bb.project('PROJ').branchRestrictions();
const revGroups    = await bb.project('PROJ').reviewerGroups();
const autoMerge    = await bb.project('PROJ').autoMergeSettings();
const hooksList    = await bb.project('PROJ').hooks();
const defaultTasks = await bb.project('PROJ').defaultTasks();
// each of these has the matching create/update/delete (or enable/disable) methods —
// see ROADMAP.md for the full method-to-endpoint matrix
```

### Repositories

```typescript
// List repositories in a project
const repos = await bb.project('PROJ').repos();
const repos = await bb.project('PROJ').repos({ limit: 25, name: 'api' });

// Get a single repository
const repo = await bb.project('PROJ').repo('my-repo');

// Repository size (bytes)
const size = await bb.project('PROJ').repo('my-repo').size();
// { repository: 1048576, attachments: 0 }

// Forks of the repository
const forks = await bb.project('PROJ').repo('my-repo').forks();

// Webhooks on a repository
const hooks = await bb.project('PROJ').repo('my-repo').webhooks();
const hooks = await bb.project('PROJ').repo('my-repo').webhooks({ event: 'repo:push' });

// Files last modified with the commit that touched each
const entries = await bb.project('PROJ').repo('my-repo').lastModified();
const entries = await bb.project('PROJ').repo('my-repo').lastModified({ at: 'main' });

// Raw file content
const content = await bb.project('PROJ').repo('my-repo').raw('src/index.ts');
const content = await bb.project('PROJ').repo('my-repo').raw('src/index.ts', { at: 'feature/my-branch' });

// Browse repository contents
const root    = await bb.project('PROJ').repo('my-repo').browse();
const dir     = await bb.project('PROJ').repo('my-repo').browse('src');
const dir     = await bb.project('PROJ').repo('my-repo').browse('src', { at: 'main' });

// List every file path (recursively)
const files = await bb.project('PROJ').repo('my-repo').files();
const files = await bb.project('PROJ').repo('my-repo').files('src', { at: 'main' });

// Edit a file (sourceCommitId = latest commit on the branch, for conflict detection)
await bb.project('PROJ').repo('my-repo').editFile('docs/note.md', {
  content: '# Hello', message: 'docs: add note', branch: 'main', sourceCommitId: 'abc123',
});

// Update, delete, fork
await bb.project('PROJ').repo('my-repo').update({ description: 'New description' });
await bb.project('PROJ').repo('my-repo').fork({ name: 'my-fork' });
await bb.project('PROJ').repo('my-repo').delete();

// Download an archive (zip/tar) of the repo content
const bytes = await bb.project('PROJ').repo('my-repo').archive({ format: 'tgz', at: 'main' });
await fs.promises.writeFile('my-repo.tgz', Buffer.from(bytes)); // Node.js

// Compare two refs or commits
const changes = await bb.project('PROJ').repo('my-repo').compareChanges({ from: 'feature/x', to: 'main' });
const commits = await bb.project('PROJ').repo('my-repo').compareCommits({ from: 'feature/x', to: 'main' });
const diff    = await bb.project('PROJ').repo('my-repo').compareDiff({ from: 'feature/x', to: 'main' });

// Labels, markup files, and watching
const labels = await bb.project('PROJ').repo('my-repo').labels();
await bb.project('PROJ').repo('my-repo').addLabel('backend');
const readme = await bb.project('PROJ').repo('my-repo').readme({ at: 'main' });
await bb.project('PROJ').repo('my-repo').watch();

// Push/branch/tag activity log
const activity = await bb.project('PROJ').repo('my-repo').refChangeActivities({ ref: 'refs/heads/main' });

// Permissions (same conventions as the project level, with REPO_* permissions)
await bb.project('PROJ').repo('my-repo').setUserPermission('jdoe', 'REPO_WRITE');
const permitted = await bb.project('PROJ').repo('my-repo').searchPermissions({ type: 'USER' });

// Repository settings: pull-request settings, branch restrictions, default reviewers,
// required builds, reviewer groups, auto-decline/auto-merge, hooks, default tasks, sync
const settings = await bb.project('PROJ').repo('my-repo').settings();
await bb.project('PROJ').repo('my-repo').updateSettings({ requiredApprovals: 2 });
const required = await bb.project('PROJ').repo('my-repo').requiredBuildConditions();
const sync     = await bb.project('PROJ').repo('my-repo').syncStatus();
// each area has the matching create/update/delete methods — see ROADMAP.md
```

### Branches

```typescript
const branches = await bb.project('PROJ').repo('my-repo').branches();
const branches = await bb.project('PROJ').repo('my-repo').branches({
  filterText: 'feature',
  orderBy:    'MODIFICATION',
  details:    true,
});

// Default branch (read + write)
const main = await bb.project('PROJ').repo('my-repo').defaultBranch();
await bb.project('PROJ').repo('my-repo').setDefaultBranch({ id: 'refs/heads/develop' });

// Create and delete branches
const branch = await bb.project('PROJ').repo('my-repo').createBranch({ name: 'feature/x', startPoint: 'main' });
await bb.project('PROJ').repo('my-repo').deleteBranch({ name: 'refs/heads/feature/x' });
```

### Tags

```typescript
// List tags
const tags = await bb.project('PROJ').repo('my-repo').tags();
const tags = await bb.project('PROJ').repo('my-repo').tags({ filterText: 'v1', orderBy: 'ALPHABETICAL' });

// Tags associated with specific commits (POST)
const tags = await bb.project('PROJ').repo('my-repo').tagsByCommits(['abc123', 'def456']);

// Override the API path for this call only
const tags = await bb.project('PROJ').repo('my-repo').tagsByCommits(['abc123'], { apiPath: 'rest/api/1.0' });

// Create and delete tags (annotated when `message` is set)
const tag = await bb.project('PROJ').repo('my-repo').createTag({ name: 'v1.0.0', startPoint: 'main', message: 'Release 1.0' });
await bb.project('PROJ').repo('my-repo').deleteTag('v1.0.0');
```

### Commits

```typescript
// List commits in a repository
const commits = await bb.project('PROJ').repo('my-repo').commits();
const commits = await bb.project('PROJ').repo('my-repo').commits({
  limit:         25,
  until:         'main',
  path:          'src/index.ts',
  followRenames: true,
});

// Get a single commit
const commit = await bb.project('PROJ').repo('my-repo').commit('abc123');

// File changes introduced by a commit
const changes = await bb.project('PROJ').repo('my-repo').commit('abc123').changes();
const changes = await bb.project('PROJ').repo('my-repo').commit('abc123').changes({ since: 'def456' });

// Full diff for a commit
const diff = await bb.project('PROJ').repo('my-repo').commit('abc123').diff();
const diff = await bb.project('PROJ').repo('my-repo').commit('abc123').diff({ contextLines: 5 });

// Diff scoped to a single file (srcPath is appended as a URL path segment)
const diff = await bb.project('PROJ').repo('my-repo').commit('abc123').diff({ srcPath: 'src/index.ts' });

// Comments on a commit
const comments = await bb.project('PROJ').repo('my-repo').commit('abc123').comments();
await bb.project('PROJ').repo('my-repo').commit('abc123').addComment({ text: 'Nice fix' });

// Build results (modern builds API + legacy build-status)
await bb.project('PROJ').repo('my-repo').commit('abc123').addBuild({
  key: 'CI', state: 'SUCCESSFUL', url: 'https://ci.example.com/build/1',
});
const build    = await bb.project('PROJ').repo('my-repo').commit('abc123').getBuild('CI');
const statuses = await bb.project('PROJ').repo('my-repo').commit('abc123').buildStatuses();

// Deployments
await bb.project('PROJ').repo('my-repo').commit('abc123').addDeployment({
  deploymentSequenceNumber: 1, key: 'DEPLOY', displayName: 'Deploy to prod',
  state: 'SUCCESSFUL', url: 'https://deploys.example.com/1', description: 'Deploy to prod',
  environment: { key: 'PROD', displayName: 'Production' },
});

// Code Insights reports and annotations
await bb.project('PROJ').repo('my-repo').commit('abc123').setInsightReport('my-linter', {
  title: 'Lint', result: 'PASS',
  data: [{ title: 'Warnings', type: 'NUMBER', value: 0 }],
});
await bb.project('PROJ').repo('my-repo').commit('abc123').addInsightAnnotations('my-linter', [
  { path: 'src/index.ts', line: 10, message: 'Unused variable', severity: 'LOW' },
]);
const reports     = await bb.project('PROJ').repo('my-repo').commit('abc123').insightReports();
const annotations = await bb.project('PROJ').repo('my-repo').commit('abc123').insightAnnotations();

// Pull requests containing the commit, merge-base, and watching
const prs  = await bb.project('PROJ').repo('my-repo').commit('abc123').pullRequests();
const base = await bb.project('PROJ').repo('my-repo').commit('abc123').mergeBase('def456');
await bb.project('PROJ').repo('my-repo').commit('abc123').watch();
```

### Pull requests

```typescript
// List pull requests
const pullRequests = await bb.project('PROJ').repo('my-repo').pullRequests();
const pullRequests = await bb.project('PROJ').repo('my-repo').pullRequests({
  state:  'OPEN',
  order:  'NEWEST',
  limit:  10,
});

// Get a single pull request
const pr = await bb.project('PROJ').repo('my-repo').pullRequest(42);

// Create a pull request
const pr = await bb.project('PROJ').repo('my-repo').createPullRequest({
  title:   'Add feature X',
  fromRef: { id: 'refs/heads/feature/x', repository: { slug: 'my-repo', project: { key: 'PROJ' } } },
  toRef:   { id: 'refs/heads/main',      repository: { slug: 'my-repo', project: { key: 'PROJ' } } },
  reviewers: [{ user: { name: 'jdoe' } }],
});

// Lifecycle: update, approve, merge, decline, reopen, delete
await bb.project('PROJ').repo('my-repo').pullRequest(42).update({ version: 3, title: 'New title' });
await bb.project('PROJ').repo('my-repo').pullRequest(42).approve('jdoe');
const check = await bb.project('PROJ').repo('my-repo').pullRequest(42).canMerge();
await bb.project('PROJ').repo('my-repo').pullRequest(42).merge({ version: 4, strategyId: 'squash' });
await bb.project('PROJ').repo('my-repo').pullRequest(42).decline({ version: 4 });

// Reviewers
await bb.project('PROJ').repo('my-repo').pullRequest(42).addReviewer({ user: { name: 'jdoe' } });
await bb.project('PROJ').repo('my-repo').pullRequest(42).removeReviewer('jdoe');

// Comments (with optional diff anchors), tasks (blocker comments), and reactions
await bb.project('PROJ').repo('my-repo').pullRequest(42).addComment({ text: 'LGTM' });
await bb.project('PROJ').repo('my-repo').pullRequest(42).createTask({ text: 'Fix the typo' });
await bb.project('PROJ').repo('my-repo').pullRequest(42).react(101, 'thumbsup');

// Diffs
const diff  = await bb.project('PROJ').repo('my-repo').pullRequest(42).diff();
const raw   = await bb.project('PROJ').repo('my-repo').pullRequest(42).rawDiff();  // plain text
const patch = await bb.project('PROJ').repo('my-repo').pullRequest(42).patch();    // plain text

// Auto-merge, rebase, review workflow, and watching
await bb.project('PROJ').repo('my-repo').pullRequest(42).requestAutoMerge();
const canRebase = await bb.project('PROJ').repo('my-repo').pullRequest(42).canRebase();
await bb.project('PROJ').repo('my-repo').pullRequest(42).rebase();
await bb.project('PROJ').repo('my-repo').pullRequest(42).watch();

// Pull request sub-resources
const activities = await bb.project('PROJ').repo('my-repo').pullRequest(42).activities();
const tasks      = await bb.project('PROJ').repo('my-repo').pullRequest(42).tasks();
const commits    = await bb.project('PROJ').repo('my-repo').pullRequest(42).commits();
const changes    = await bb.project('PROJ').repo('my-repo').pullRequest(42).changes();
const reports    = await bb.project('PROJ').repo('my-repo').pullRequest(42).reports();
const summaries  = await bb.project('PROJ').repo('my-repo').pullRequest(42).buildSummaries();
const issues     = await bb.project('PROJ').repo('my-repo').pullRequest(42).issues();
const suggestion = await bb.project('PROJ').repo('my-repo').pullRequest(42).commitMessageSuggestion();
```

### Dashboard & inbox

```typescript
// Pull requests where the authenticated user participates, across all repos
const dashboard = await bb.dashboardPullRequests();
const dashboard = await bb.dashboardPullRequests({ role: 'REVIEWER', state: 'OPEN' });

// Pull requests requiring the authenticated user's attention
const inbox = await bb.inboxPullRequests();
const inbox = await bb.inboxPullRequests({ role: 'REVIEWER', filterText: 'feature' });

// Just the count (e.g. for a notification badge)
const { count } = await bb.inboxPullRequestsCount();

// Pull request suggestions, based on the user's recent pushes
const suggestions = await bb.pullRequestSuggestions({ limit: 5 });
```

### Repository search

```typescript
// Repositories across all projects — documented params, mapped 1:1
const repos = await bb.repos({ name: 'api', projectkey: 'PROJ', permission: 'REPO_READ' });

// Legacy contains-match variant (prefixes % to `name`)
const repos = await bb.search();
const repos = await bb.search({ name: 'api' });                  // matches any repo containing 'api'
const repos = await bb.search({ name: 'api', projectkey: 'PROJ' });
const repos = await bb.search({ projectname: 'platform', visibility: 'private', limit: 25 });
const repos = await bb.search({ state: 'AVAILABLE', permission: 'REPO_WRITE' });
```

### Code search

Global code search with Bitbucket's query syntax (`POST /rest/search/latest/search`):

```typescript
const result = await bb.codeSearch('parseWebhookEvent repo:my-repo ext:ts');

for (const hit of result.code?.values ?? []) {
  console.log(`${hit.repository.slug}: ${hit.file} (${hit.hitCount} matches)`);
}

// Paging for code hits
const nextPage = await bb.codeSearch('jwt project:PROJ', { start: 25, limit: 25 });
```

### Markup preview & groups

```typescript
// Render markup (e.g. Markdown) to HTML
const { html } = await bb.markupPreview('I am **bold**');
const { html } = await bb.markupPreview('see [link](/x)', { urlMode: 'ABSOLUTE', hardwrap: true });

// Group names visible to the authenticated user (plain strings)
const groups = await bb.groups({ filter: 'dev' });
console.log(groups.values); // ['developers', 'devops']
```

### Users

```typescript
// List all users
const users = await bb.users();
const users = await bb.users({ filter: 'john', limit: 20 });

// Get a single user
const user = await bb.user('pilmee');

// The authenticated user (two requests; no official whoami endpoint exists)
const me = await bb.currentUser();

// User settings (a plugin-defined key/value map)
const settings = await bb.user('pilmee').settings();
await bb.user('pilmee').updateSettings({ 'my-plugin.setting': true }); // only the given keys change

// SSH keys
const keys = await bb.user('pilmee').sshKeys();
const key  = await bb.user('pilmee').addSshKey({ text: 'ssh-ed25519 AAAA... laptop', expiryDays: 365 });
await bb.user('pilmee').deleteSshKey(key.id);

// GPG keys
const gpgKeys = await bb.user('pilmee').gpgKeys();
await bb.user('pilmee').addGpgKey({ text: '-----BEGIN PGP PUBLIC KEY BLOCK-----...' });
await bb.user('pilmee').deleteGpgKey('A1B2C3D4...'); // fingerprint or id

// HTTP access tokens — note Atlassian's verbs: create is PUT, update is POST.
// The raw `token` secret is ONLY returned at creation time; store it immediately.
const { token, id } = await bb.user('pilmee').createAccessToken({
  name: 'ci-read', permissions: ['REPO_READ'], expiryDays: 90,
});
const tokens = await bb.user('pilmee').accessTokens();
await bb.user('pilmee').updateAccessToken(id, { name: 'ci-read-renamed' });
await bb.user('pilmee').deleteAccessToken(id);

// List repositories belonging to a user
const repos = await bb.user('pilmee').repos();
const repos = await bb.user('pilmee').repos({ name: 'api' });

// Navigate into a user repository — all repo sub-resources are available
const repo    = await bb.user('pilmee').repo('my-repo');
const content = await bb.user('pilmee').repo('my-repo').raw('src/index.ts');
const commits = await bb.user('pilmee').repo('my-repo').commits();
const prs     = await bb.user('pilmee').repo('my-repo').pullRequests();
```

---

## Pagination

Every list method returns a `PagedResponse<T>` with the full Bitbucket pagination envelope:

```typescript
const page = await bb.project('PROJ').repos({ limit: 25 });

page.values        // BitbucketRepository[]  — the items
page.isLastPage    // boolean
page.nextPageStart // number | undefined     — pass as `start` to get the next page
page.size          // number                 — items in this page
page.limit         // number
page.start         // number
```

### Manual paging

Follow `nextPageStart` yourself when you need control over when the next page is fetched:

```typescript
let start: number | undefined;
const allRepos: BitbucketRepository[] = [];

do {
  const page = await bb.project('PROJ').repos({ limit: 100, start });

  allRepos.push(...page.values);
  start = page.nextPageStart;
} while (start !== undefined);
```

### Auto-pagination with `paginate()`

For the common case — iterate over every item across all pages — use the `paginate()` async generator instead:

```typescript
import { paginate } from 'bitbucket-datacenter-api-client';

for await (const repo of paginate((params) => bb.project('PROJ').repos(params), { limit: 100 })) {
  console.log(repo.slug);
}

// Works with any paginated method, including nested resources:
for await (const pr of paginate(
  (params) => bb.project('PROJ').repo('my-repo').pullRequests(params),
  { state: 'OPEN' },
)) {
  console.log(pr.id, pr.title);
}
```

`paginate()` fetches lazily — one page at a time as you iterate — and stops once `isLastPage` is `true` or `nextPageStart` is `undefined`.

---

## Request events

Subscribe to every HTTP request made by the client to get timing and error information. Useful for logging, monitoring, or debugging.

```typescript
bb.on('request', (event) => {
  console.log(`[${event.method}] ${event.url} → ${event.statusCode} (${event.durationMs}ms)`);
  if (event.error) {
    console.error('Request failed:', event.error.message);
  }
});
```

The `event` object contains:

| Field | Type | Description |
|---|---|---|
| `url` | `string` | Full URL that was requested |
| `method` | `'GET' \| 'POST' \| 'PUT' \| 'DELETE'` | HTTP method used |
| `startedAt` | `Date` | When the request started |
| `finishedAt` | `Date` | When the request finished |
| `durationMs` | `number` | Duration in milliseconds |
| `statusCode` | `number \| undefined` | HTTP status code, if a response was received |
| `error` | `Error \| undefined` | Present only if the request failed |

The event is always emitted after the request completes, whether it succeeded or failed. Multiple listeners can be registered.

---

## Error handling

Non-2xx responses throw a `BitbucketApiError` with the HTTP status code, status text, and — when Bitbucket
returns one — the structured error body (`{ errors: [{ context, message, exceptionName }] }`):

```typescript
import { BitbucketApiError } from 'bitbucket-datacenter-api-client';

try {
  await bb.project('NONEXISTENT');
} catch (err) {
  if (err instanceof BitbucketApiError) {
    console.log(err.status);     // 404
    console.log(err.statusText); // 'Not Found'
    console.log(err.message);    // 'Bitbucket API error: 404 Not Found' (or '... - <first error message>')
    console.log(err.errors);     // BitbucketErrorDetail[] — [] if the response had no error body
    console.log(err.stack);      // full stack trace
  }
}
```

`err.errors` is always an array (empty when the response body was missing, empty, or not in the expected shape),
so it's safe to read `err.errors[0]?.message` without a null check on `errors` itself.

### Rate limiting

By default, a `429 Too Many Requests` response is thrown as a regular `BitbucketApiError`. Opt into automatic
retries with the `retry` option — the client honours the `Retry-After` header (seconds or an HTTP date) between
attempts:

```typescript
const bb = new BitbucketClient({
  apiUrl:  'https://bitbucket.example.com',
  apiPath: 'rest/api/latest',
  user:    'your-username',
  token:   'your-personal-access-token',
  retry: {
    maxRetries: 3,     // default: 0 (disabled)
    maxDelayMs: 30000, // ceiling applied to the Retry-After delay, default: 30000
  },
});
```

---

## Webhooks

`parseWebhookEvent()` parses an incoming webhook delivery into a typed, discriminated `{ event, payload }` pair. It detects the event from the `X-Event-Key` header Bitbucket sends with every delivery (falling back to the body's `eventKey` field), so there's no manual `if/else` chain over the payload shape:

```typescript
import { parseWebhookEvent } from 'bitbucket-datacenter-api-client';

app.post('/webhooks/bitbucket', (req, res) => {
  const { event, payload } = parseWebhookEvent(req.headers, req.body);

  switch (event) {
    case 'pr:opened':
      console.log('New PR:', payload.pullRequest.title);
      break;
    case 'repo:refs_changed':
      console.log('Pushed refs:', payload.changes.map((c) => c.ref.displayId));
      break;
    case 'pr:merged':
      console.log('Merged:', payload.pullRequest.id);
      break;
    default:
      console.log('Unhandled event:', event);
  }

  res.sendStatus(204);
});
```

`headers` accepts a Fetch `Headers` instance, a plain object (Express/Node-style, case-insensitive, array values for repeated headers supported), or anything exposing `get(name)`. All 20 documented event keys are typed — `diagnostics:ping`, `repo:refs_changed`, `repo:modified`, `repo:forked`, `repo:comment:added/edited/deleted`, `mirror:repo_synchronized`, `pr:opened`, `pr:from_ref_updated`, `pr:modified`, `pr:reviewer:approved/unapproved/needs_work`, `pr:merged`, `pr:declined`, `pr:deleted`, `pr:comment:added/edited/deleted` — see [ROADMAP.md](ROADMAP.md#webhook-event-parsing) for the full event → payload type table.

`parseWebhookEvent()` performs no signature verification and no runtime schema validation — the payload is trusted as-is, the same way this client trusts JSON REST responses. Verify your webhook's shared secret yourself if you configured one. A future Bitbucket event key not yet known to this client still comes through at runtime (raw `event` string, raw `payload`); use the exported `isWebhookEventKey()` guard if you need to detect that case.

---

## Chainable resource pattern

Every resource that maps to a single entity implements `PromiseLike`, so you can **await it directly** or **chain methods** to access sub-resources:

```typescript
// Await directly → fetches the project
const project = await bb.project('PROJ');

// Chain → fetches the list
const repos = await bb.project('PROJ').repos({ limit: 10 });

// Deep chain
const activities = await bb.project('PROJ').repo('my-repo').pullRequest(42).activities();
const diff       = await bb.project('PROJ').repo('my-repo').commit('abc123').diff();
```

---

## Authentication

Two schemes are supported via the `authType` option:

### Basic (default)

**HTTP Basic Authentication** with a username and a Personal Access Token (PAT) or password.
Generate a PAT in Bitbucket under **Profile → Manage account → Personal access tokens**.

```typescript
const bb = new BitbucketClient({
  apiUrl:   'https://bitbucket.example.com',
  apiPath:  'rest/api/latest',
  user:     'your-username',
  token:    'your-personal-access-token',
  // authType: 'basic', // default, can be omitted
});
```

`user` is required when `authType` is `'basic'`; the constructor throws a `TypeError` if it's missing.

### Bearer

HTTP access tokens are sent as `Authorization: Bearer <token>` and don't require a username:

```typescript
const bb = new BitbucketClient({
  apiUrl:   'https://bitbucket.example.com',
  apiPath:  'rest/api/latest',
  token:    'your-http-access-token',
  authType: 'bearer',
});
```

---

## Migration notes

Endpoint migrations from earlier versions that changed observable behaviour:

| Change | Before | Now |
| --- | --- | --- |
| `pullRequest(id).tasks()` | Read from the legacy `/tasks` endpoint | Reads from `/blocker-comments` (the legacy endpoint was removed in Bitbucket 8.0); the returned shape reflects a blocker comment, not a task |
| `commit(id).diff()` / `pullRequest(id).diff()` path parameter | `srcPath` selected the file | `path` selects the file; `srcPath` is now only used to diff against a *different* source path (e.g. after a rename) |
| Personal repositories | Accessed via an undocumented `/users/{slug}/repos` shape | Accessed via the documented personal-project convention `/projects/~{slug}/repos[/...]` |
| Whitespace-insensitive diffs | — | `diff({ whitespace: 'ignore-all' })` is now a supported param |
| `currentUser()` | — | Issues two requests: resolves the username from the `X-AUSERNAME` header, then looks it up via `GET /users?filter={name}` (no official "whoami" endpoint exists) |
| `pullRequest(id).reports()` | — | Issues two requests: resolves the PR's latest source commit, then calls the Code Insights API for that commit (the PR-level `/reports` endpoint is UI-internal) |
| `pullRequest(id).buildSummaries()` | — | Issues two requests: fetches the PR's commits, then posts their IDs to the build-status stats API (the PR-level `/build-summaries` endpoint is UI-internal) |

---

## TypeScript types

All domain types are exported:

```typescript
import type {
  // Core
  PagedResponse, PaginationParams,
  BitbucketApiError, BitbucketErrorDetail,
  RequestEvent, BitbucketClientEvents,
  BitbucketClientOptions, RetryOptions,
  AuthType,
  DashboardPullRequestsParams, InboxPullRequestsParams, InboxPullRequestsCount,
  BitbucketPullRequestSuggestion, PullRequestSuggestionsParams,
  MarkupPreviewParams, MarkupPreviewResult,
  CodeSearchParams, CodeSearchResult, CodeSearchCodeHit,
  // Projects
  BitbucketProject, ProjectsParams, CreateProjectData, UpdateProjectData,
  BitbucketGroup, GroupsParams, PermittedEntity, PermissionSearchParams,
  // Repositories
  BitbucketRepository, ReposParams, GlobalReposParams, SearchReposParams,
  CreateRepositoryData, UpdateRepositoryData, ForkRepositoryData,
  BitbucketRepositorySize,
  BitbucketLastModifiedEntry, LastModifiedParams,
  RawFileParams, FilesParams, ArchiveParams, CompareParams, CompareDiffParams,
  BitbucketBrowseResponse, BitbucketBrowseChild, BitbucketBrowsePath, BrowseParams,
  EditFilePayload, BitbucketLabel, BitbucketMarkupFile,
  BitbucketRepositorySettings, BitbucketRefChangeActivity,
  BitbucketRefRestriction, BitbucketPullRequestCondition, BitbucketRequiredBuildCondition,
  BitbucketReviewerGroup, AutoDeclineSettings, AutoMergeSettings,
  BitbucketRepositoryHook, HookSettings, BitbucketDefaultTask, RefSyncStatus,
  // Branches & Tags
  BitbucketBranch, BranchesParams,
  BitbucketTag, TagsParams,
  // Commits
  BitbucketCommit, CommitsParams,
  BitbucketDiff, BitbucketDiffEntry, DiffParams, CommitChangesParams,
  BitbucketBuildStatus, BitbucketBuild, BitbucketDeployment,
  BitbucketReport, SetInsightReportData, BitbucketInsightAnnotation, AddInsightAnnotationData,
  // Pull Requests
  BitbucketPullRequest, PullRequestsParams, CreatePullRequestData,
  MergePullRequestData, CanMergeResult, AddReviewerData,
  BitbucketPullRequestActivity, ActivitiesParams,
  BitbucketPullRequestComment, AddPullRequestCommentData,
  BitbucketPullRequestTask, TasksParams,
  BitbucketChange, ChangesParams,
  ReportsParams,
  BitbucketBuildSummaries,
  BitbucketIssue,
  // Users
  BitbucketUser, UsersParams,
  BitbucketUserPermission, ProjectUsersParams,
  BitbucketUserSettings,
  BitbucketSshKey, AddSshKeyData,
  BitbucketGpgKey, AddGpgKeyData,
  BitbucketAccessToken, BitbucketCreatedAccessToken, CreateAccessTokenData,
  // Webhooks
  BitbucketWebhook, BitbucketWebhookStatistics, BitbucketWebhookDelivery,
  WebhooksParams, WebhookEvent, WebhookScopeType,
  // Webhook event parsing
  BitbucketWebhookEvent, WebhookEventKey, WebhookEventPayloadMap, WebhookActor,
  PrOpenedPayload, PrMergedPayload, PrDeclinedPayload, PrDeletedPayload,
  PrFromRefUpdatedPayload, PrModifiedPayload, PreviousPullRequestTarget,
  PrReviewerApprovedPayload, PrReviewerUnapprovedPayload, PrReviewerNeedsWorkPayload,
  WebhookReviewerParticipant,
  PrCommentAddedPayload, PrCommentEditedPayload, PrCommentDeletedPayload,
  RepoRefsChangedPayload, WebhookRef, WebhookRefChange,
  RepoModifiedPayload, RepoForkedPayload,
  RepoCommentAddedPayload, RepoCommentEditedPayload, RepoCommentDeletedPayload,
  MirrorRepoSynchronizedPayload, DiagnosticsPingPayload, WebhookHeadersInput,
} from 'bitbucket-datacenter-api-client';
```

---

## Documentation

Full API documentation is published at:
**[https://eljijuna.github.io/BitbucketDataCenterApiClient](https://eljijuna.github.io/BitbucketDataCenterApiClient)**

---

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md).

---

## License

[MIT](LICENSE)
