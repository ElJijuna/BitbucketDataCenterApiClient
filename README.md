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

// Webhooks on a project
const hooks = await bb.project('PROJ').webhooks();
const hooks = await bb.project('PROJ').webhooks({ event: 'pr:opened' });

// Users with access to a project
const members = await bb.project('PROJ').users();
const members = await bb.project('PROJ').users({ permission: 'PROJECT_WRITE' });
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
```

### Branches

```typescript
const branches = await bb.project('PROJ').repo('my-repo').branches();
const branches = await bb.project('PROJ').repo('my-repo').branches({
  filterText: 'feature',
  orderBy:    'MODIFICATION',
  details:    true,
});
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

// Pull request sub-resources
const activities = await bb.project('PROJ').repo('my-repo').pullRequest(42).activities();
const tasks      = await bb.project('PROJ').repo('my-repo').pullRequest(42).tasks();
const commits    = await bb.project('PROJ').repo('my-repo').pullRequest(42).commits();
const changes    = await bb.project('PROJ').repo('my-repo').pullRequest(42).changes();
const reports    = await bb.project('PROJ').repo('my-repo').pullRequest(42).reports();
const summaries  = await bb.project('PROJ').repo('my-repo').pullRequest(42).buildSummaries();
const issues     = await bb.project('PROJ').repo('my-repo').pullRequest(42).issues();
```

### Repository search

```typescript
// Search repositories across all projects
const repos = await bb.search();
const repos = await bb.search({ name: 'api' });                  // matches any repo containing 'api'
const repos = await bb.search({ name: 'api', projectkey: 'PROJ' });
const repos = await bb.search({ projectname: 'platform', visibility: 'private', limit: 25 });
const repos = await bb.search({ state: 'AVAILABLE', permission: 'REPO_WRITE' });
```

### Users

```typescript
// List all users
const users = await bb.users();
const users = await bb.users({ filter: 'john', limit: 20 });

// Get a single user
const user = await bb.user('pilmee');

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
  // Projects
  BitbucketProject, ProjectsParams,
  // Repositories
  BitbucketRepository, ReposParams, SearchReposParams,
  BitbucketRepositorySize,
  BitbucketLastModifiedEntry, LastModifiedParams,
  RawFileParams,
  BitbucketBrowseResponse, BitbucketBrowseChild, BitbucketBrowsePath, BrowseParams,
  // Branches & Tags
  BitbucketBranch, BranchesParams,
  BitbucketTag, TagsParams,
  // Commits
  BitbucketCommit, CommitsParams,
  BitbucketDiff, BitbucketDiffEntry, DiffParams, CommitChangesParams,
  // Pull Requests
  BitbucketPullRequest, PullRequestsParams,
  BitbucketPullRequestActivity, ActivitiesParams,
  BitbucketPullRequestTask, TasksParams,
  BitbucketChange, ChangesParams,
  BitbucketReport, ReportsParams,
  BitbucketBuildSummaries,
  BitbucketIssue,
  // Users
  BitbucketUser, UsersParams,
  BitbucketUserPermission, ProjectUsersParams,
  // Webhooks
  BitbucketWebhook, BitbucketWebhookStatistics, BitbucketWebhookDelivery,
  WebhooksParams, WebhookEvent, WebhookScopeType,
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
