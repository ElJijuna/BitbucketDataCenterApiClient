# bitbucket-datacenter-api-client

[![CI](https://github.com/ElJijuna/BitbucketDataCenterApiClient/actions/workflows/ci.yml/badge.svg)](https://github.com/ElJijuna/BitbucketDataCenterApiClient/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/bitbucket-datacenter-api-client)](https://www.npmjs.com/package/bitbucket-datacenter-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

TypeScript client for the [Bitbucket Data Center REST API](https://developer.atlassian.com/server/bitbucket/rest/v819/intro/).
Works in **Node.js** and the **browser** (isomorphic). Fully typed, zero runtime dependencies.

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

---

## Error handling

Non-2xx responses throw a `BitbucketApiError` with the HTTP status code and status text:

```typescript
import { BitbucketApiError } from 'bitbucket-datacenter-api-client';

try {
  await bb.project('NONEXISTENT');
} catch (err) {
  if (err instanceof BitbucketApiError) {
    console.log(err.status);     // 404
    console.log(err.statusText); // 'Not Found'
    console.log(err.message);    // 'Bitbucket API error: 404 Not Found'
    console.log(err.stack);      // full stack trace
  }
}
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

The client uses **HTTP Basic Authentication** with a Personal Access Token (PAT).
Generate one in Bitbucket under **Profile → Manage account → Personal access tokens**.

```typescript
const bb = new BitbucketClient({
  apiUrl:  'https://bitbucket.example.com',
  apiPath: 'rest/api/latest',
  user:    'your-username',
  token:   'your-personal-access-token',
});
```

---

## TypeScript types

All domain types are exported:

```typescript
import type {
  // Core
  PagedResponse, PaginationParams,
  BitbucketApiError,
  // Projects
  BitbucketProject, ProjectsParams,
  // Repositories
  BitbucketRepository, ReposParams,
  BitbucketRepositorySize,
  BitbucketLastModifiedEntry, LastModifiedParams,
  RawFileParams,
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
